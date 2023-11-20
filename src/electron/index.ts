import { readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { run } from 'shell-commands';

import { ensure, overwrite, adjust } from '../utils';
import misc from './misc';

export const electron = async () => {
  await run(`
    yarn add --dev electron electron-builder nodemon shell-commands
    yarn add --dev @types/lodash electron-application-menu-template hyperid
  `);
  const pkgJson = {
    productName: 'Untitled App',
    description: 'An untitled app.',
    author: {
      name: 'MacMate.app',
      email: 'support@macmate.app',
    },
    scripts: {
      watch: 'ts-node scripts/watch.ts',
      start: "nodemon --watch build/electron.js --exec 'electron .'",
      release: 'ts-node -r dotenv-override-true/config scripts/release.ts',
    },
    main: 'build/electron.js',
    targets: {
      electron: {
        source: 'src/electron.ts',
        context: 'electron-main',
        distDir: 'build',
      },
      preload: {
        source: 'src/preload.ts',
        context: 'node',
        distDir: 'build',
      },
      web: {
        source: 'src/index.html',
        context: 'browser',
        distDir: 'build',
        publicUrl: '.',
        engines: {
          browsers: 'last 2 Electron versions',
        },
      },
      settings: {
        source: 'src/settings/settings.html',
        context: 'browser',
        publicUrl: '.',
        distDir: 'build',
        engines: {
          browsers: 'last 2 Electron versions',
        },
      },
    },
  };
  let originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  delete originalPkg.scripts.serve;
  writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));

  ensure(
    'scripts/watch.ts',
    `import { run } from 'shell-commands';

const main = async () => {
  await run(\`
    rm -rf .parcel-cache
    rm -rf build
  \`);
  run("nodemon --watch src/preload.ts --exec 'parcel build --target preload'");
  run('parcel src/index.html --dist-dir build -p 1234');
  run('parcel src/settings/settings.html --dist-dir build -p 1235');
  run('parcel watch --target electron -p 1240');
};

main();
  `,
  );

  ensure(
    'scripts/release.ts',
    `import { build as electronBuild } from 'electron-builder';
  import { run } from 'shell-commands';
  
  const build = async () => {
    await run(\`
      rm -rf .parcel-cache
      rm -rf build
      parcel build --no-source-maps
    \`);
  };
  
  const main = async () => {
    await build();
    await run(\`
      rm -rf dist
    \`);
    const inputs = new Set(process.argv);
    const files = ['build'];
    if (inputs.has('--dir')) {
      await electronBuild({
        config: {
          files,
          mac: {
            identity: null,
            target: ['dir'],
          },
        },
      });
    } else if (inputs.has('--github')) {
      // release macOS versions
      await electronBuild({
        arm64: true,
        x64: true,
        universal: true,
        mac: ['default'],
        config: {
          files,
          // publish: null, // publish or not
          mac: {
            // identity: null, // code sign or not
            notarize: {
              teamId: process.env.APPLE_TEAM_ID,
            },
          },
        },
      });
      // release Windows versions
      await electronBuild({
        arm64: true,
        x64: true,
        win: ['default'],
        config: {
          files,
          // publish: null, // publish or not
        },
      });
    }
  };
  main();
  `,
  );

  adjust(
    '.env',
    '',
    `# Upload to GitHub: https://github.com/settings/tokens
  GH_TOKEN=xxx
  
  # Notarize by Apple server
  # App-Specific Passwords could be found here: https://appleid.apple.com/account/manage
  APPLE_ID=xxx@yyy.com
  APPLE_APP_SPECIFIC_PASSWORD=zzz
  
  # Apple "Developer ID Application" certificate, other certs won't work
  # You need to do it on a laptop which has the private key, so that you can expirt the cert as p12 format
  # Then convert the p12 cert to base64 format
  CSC_LINK=xxx
  CSC_KEY_PASSWORD=yyy
  # team id is the value shown in the certificate's full name, such as "Developer ID Application: FirstName LastName (Team_ID_Here)"
  APPLE_TEAM_ID=zzz
`,
  );

  ensure(
    'src/settings-window.ts',
    `import { BrowserWindow, ipcMain, screen, systemPreferences, app } from 'electron';
import path from 'path';

import CONSTS from './constants';
import { toggleDarkMode } from './dark-mode';

let settingsWindow: BrowserWindow;

export const showSettingsWindow = () => {
  if (!settingsWindow) {
    settingsWindow = new BrowserWindow({
      width: 505,
      height: 714,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, '..', 'build', 'preload.js'),
      },
    });
    settingsWindow.setAlwaysOnTop(true);
    if (app.isPackaged) {
      settingsWindow.loadFile('build/settings.html');
    } else {
      settingsWindow.loadURL('http://localhost:1235');
    }
    settingsWindow.on('closed', () => {
      settingsWindow = undefined;
    });
    settingsWindow.webContents.once('did-finish-load', () => {
      toggleDarkMode(settingsWindow);
    });
  }
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const { width: displayWidth, height: displayHeight } = display.bounds;
  const { width: windowWidth, height: windowHeight } = settingsWindow.getBounds();
  settingsWindow.setPosition(
    Math.round((displayWidth - windowWidth) / 2 + display.workArea.x),
    Math.round((displayHeight - windowHeight) / 2 + display.workArea.y),
  );
  settingsWindow.focus();
};

class Settings {
  public appearance = 'auto';
}
ipcMain.handle(CONSTS.LOAD_SETTINGS, async () => {
  const settings = new Settings();
  settings.appearance = systemPreferences.getUserDefault('appearance', 'string');
  if (settings.appearance === '') {
    settings.appearance = 'auto';
  }
  return settings;
});
ipcMain.handle(CONSTS.SAVE_SETTINGS, async (event, settings: Settings) => {
  systemPreferences.setUserDefault('appearance', 'string', settings.appearance);
  toggleDarkMode();
});
  `,
  );

  ensure(
    'src/settings/index.css',
    `@import '../../node_modules/antd/dist/reset.css';

body {
  padding: 1rem;
}
  `,
  );

  ensure(
    'src/settings/index.tsx',
    `import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { auto } from 'manate/react';
import { ConfigProvider, Form, Radio, theme } from 'antd';
import { autoRun, manage } from 'manate';
import type { Managed } from 'manate/models';
import { debounce } from 'lodash';
import hyperid from 'hyperid';

import CONSTS from '../constants';

const uuid = hyperid();

class Store {
  public appearance: 'auto' | 'dark' | 'light' = 'auto';
  public formKey = uuid();
  public refreshForm() {
    this.formKey = uuid();
  }
}
const store = manage(new Store());

const App = (props: { store: Store }) => {
  const { store } = props;
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    return global.ipc.on(CONSTS.IS_DARK_MODE, (event, payload) => {
      document.body.style.backgroundColor = (payload ? theme.darkAlgorithm : theme.defaultAlgorithm)(
        theme.defaultSeed,
      ).colorBgContainer;
      setIsDark(payload);
    });
  }, []);
  useEffect(() => {
    const { start, stop } = autoRun(
      store as Managed<Store>,
      () => {
        global.ipc.invoke(CONSTS.SAVE_SETTINGS, { appearance: store.appearance });
      },
      (func: () => void) => debounce(func, 100, { leading: true, trailing: true }),
    );
    const init = async () => {
      const settings = await global.ipc.invoke(CONSTS.LOAD_SETTINGS);
      store.appearance = settings.appearance;
      store.refreshForm();
      start();
    };
    init();
    return stop;
  }, []);
  const render = () => {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <Form initialValues={{ appearance: store.appearance }} key={store.formKey}>
          <Form.Item label="Appearance" name="appearance">
            <Radio.Group
              buttonStyle="solid"
              onChange={(event) => {
                store.appearance = event.target.value;
              }}
            >
              <Radio.Button value="light">Light</Radio.Button>
              <Radio.Button value="dark">Dark</Radio.Button>
              <Radio.Button value="auto">Auto</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </ConfigProvider>
    );
  };
  return auto(render, props);
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App store={store} />);
  `,
  );

  ensure(
    'src/settings/settings.html',
    `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; img-src data:;" />
      <title>Settings - Untitled App</title>
      <link rel="stylesheet" href="index.css" />
      <script type="module" src="index.tsx"></script>
    </head>
    <body></body>
  </html>
  `,
  );

  ensure(
    'src/electron.ts',
    `import { app, BrowserWindow } from 'electron';

import createWindow from './create-window';
import { updateApplicationMenu } from './application-menu';
import { enableContextMenu } from './context-menu';

app.whenReady().then(() => {
  updateApplicationMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// include the settings window
app.on('browser-window-created', (event, browserWindow) => {
  enableContextMenu(browserWindow);
  if (!app.isPackaged) {
    // for development debugging purpose only
    browserWindow.webContents.openDevTools();
  }
});
  `,
  );

  overwrite(
    'src/index.html',
    `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:;" />
    <title>Untitled App</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <script type="module" src="index.tsx"></script>
  </body>
</html>  
  `,
  );

  overwrite(
    'src/app.tsx',
    `import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Space, Typography, theme } from 'antd';
import { auto } from 'manate/react';

import type { Store } from './store';
import CONSTS from './constants';

const { Text, Title } = Typography;

const App = (props: { store: Store }) => {
  const { store } = props;
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const disposer = global.ipc.on(CONSTS.IS_DARK_MODE, (event, isDarkMode) => {
      document.body.style.backgroundColor = (isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm)(
        theme.defaultSeed,
      ).colorBgContainer;
      setIsDark(isDarkMode);
    });
    global.ipc.invoke(CONSTS.IS_DARK_MODE);
    return disposer;
  }, []);
  const render = () => {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <Title>Untitled App</Title>
        <Space>
          <Button
            onClick={() => {
              store.count -= 1;
            }}
          >
            -
          </Button>
          <Text>{store.count}</Text>
          <Button
            onClick={() => {
              store.count += 1;
            }}
          >
            +
          </Button>
        </Space>
      </ConfigProvider>
    );
  };
  return auto(render, props);
};

export default App;
  `,
  );

  ensure(
    'src/application-menu.ts',
    `import type { /* MenuItem, */ MenuItemConstructorOptions } from 'electron';
import { /* BrowserWindow, */ Menu, shell, app } from 'electron';
import { newTemplate } from 'electron-application-menu-template';

import createWindow from './create-window';
// import saveFile from './save-file';
// import openFile from './open-file';
// import revertFile from './revert-file';
import { showSettingsWindow } from './settings-window';

export const updateApplicationMenu = () => {
  // const hasWindow = !!BrowserWindow.getFocusedWindow();
  // const hasFile = !!BrowserWindow.getFocusedWindow()?.getRepresentedFilename();
  // const edited = !!BrowserWindow.getFocusedWindow()?.isDocumentEdited();

  const template = newTemplate();
  const appMenu = template.find((item) => item.role === 'appMenu');
  (appMenu.submenu as MenuItemConstructorOptions[]).splice(
    2,
    0,
    {
      label: 'Settings...',
      accelerator: 'CmdOrCtrl+,',
      async click() {
        showSettingsWindow();
      },
    },
    {
      type: 'separator',
    },
  );
  const viewMenu = template.find((item) => item.role === 'viewMenu');
  if (app.isPackaged) {
    viewMenu.submenu = (viewMenu.submenu as MenuItemConstructorOptions[]).filter(
      (item) => ['reload', 'forceReload', 'toggleDevTools'].indexOf(item.role) === -1,
    );
  }
  const helpMenu = template.find((item) => item.role === 'help');
  (helpMenu.submenu as MenuItemConstructorOptions[]).unshift({
    label: 'Customer Support',
    async click() {
      shell.openExternal('https://macmate.app/customer-support/');
    },
  });
  const fileMenu = template.find((item) => item.role === 'fileMenu');
  (fileMenu.submenu as MenuItemConstructorOptions[]).unshift(
    {
      label: 'New',
      accelerator: 'CmdOrCtrl+N',
      async click() {
        createWindow();
      },
    },
    //   {
    //     label: 'Open',
    //     accelerator: 'CmdOrCtrl+O',
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       openFile(browserWindow);
    //     },
    //   },
    //   {
    //     role: 'recentDocuments',
    //     submenu: [
    //       {
    //         role: 'clearRecentDocuments',
    //       },
    //     ],
    //   },
    //   {
    //     type: 'separator',
    //   },
    //   {
    //     label: 'Save',
    //     accelerator: 'CmdOrCtrl+S',
    //     enabled: hasWindow && (edited || !hasFile),
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       saveFile(browserWindow);
    //     },
    //   },
    //   {
    //     label: 'Save As...',
    //     accelerator: 'CmdOrCtrl+Shift+S',
    //     enabled: hasWindow,
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       saveFile(browserWindow, true);
    //     },
    //   },
    //   {
    //     label: 'Revert',
    //     enabled: edited,
    //     async click(menuItem: MenuItem, browserWindow: BrowserWindow | undefined) {
    //       revertFile(browserWindow);
    //     },
    //   },
    //   {
    //     type: 'separator',
    //   },
  );
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
  `,
  );

  ensure(
    'src/preload.ts',
    `import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
  `,
  );

  ensure(
    'src/dark-mode.ts',
    `import { BrowserWindow, ipcMain, nativeTheme, systemPreferences } from 'electron';

import CONSTS from './constants';

export const toggleDarkMode = (browserWindow: BrowserWindow = undefined) => {
  let appearance = systemPreferences.getUserDefault('appearance', 'string');
  if (!['auto', 'light', 'dark'].find((item) => item === appearance)) {
    appearance = 'auto';
  }
  let isDarkMode = false;
  if (appearance === 'auto') {
    isDarkMode = nativeTheme.shouldUseDarkColors;
  } else {
    isDarkMode = appearance === 'dark';
  }
  let windows = [browserWindow];
  if (windows[0] === undefined) {
    windows = BrowserWindow.getAllWindows();
  }
  for (const browserWindow of windows) {
    browserWindow.webContents.send(CONSTS.IS_DARK_MODE, isDarkMode);
  }
};

// a newly created window may request the current dark mode status
ipcMain.handle(CONSTS.IS_DARK_MODE, (event) => {
  toggleDarkMode(BrowserWindow.fromWebContents(event.sender));
});

nativeTheme.on('updated', () => toggleDarkMode());
  `,
  );

  ensure(
    'src/create-window.ts',
    `import { BrowserWindow, app } from 'electron';
import { join } from 'path';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 928,
    webPreferences: {
      preload: join(__dirname, '..', 'build', 'preload.js'),
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(join('build', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:1234');
  }
};

export default createWindow;  
  `,
  );

  ensure(
    'src/context-menu.ts',
    `import type { BrowserWindow } from 'electron';
import { Menu } from 'electron';

export const enableContextMenu = (browserWindow: BrowserWindow) => {
  const selectionMenu = Menu.buildFromTemplate([{ role: 'copy' }, { type: 'separator' }, { role: 'selectAll' }]);
  const inputMenu = Menu.buildFromTemplate([
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]);
  browserWindow.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup({ window: browserWindow });
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup({ window: browserWindow });
    }
  });
};
  `,
  );

  ensure(
    'src/constants.ts',
    `const CONSTS = {
  IS_DARK_MODE: 'IS_DARK_MODE',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  LOAD_SETTINGS: 'LOAD_SETTINGS',
};

export default CONSTS;
`,
  );

  ensure(
    'src/Globals.d.ts',
    `declare namespace ipc {
  function invoke(channel: string, ...args: any[]): Promise<any>;
  function on(channel: string, listener: (...args: any[]) => void): () => void;
}
  `,
  );

  misc();
};
