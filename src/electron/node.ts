import { ensure } from '../utils';

const step = () => {
  ensure(
    'src/node/settings-window.ts',
    `import { BrowserWindow, ipcMain, screen, systemPreferences, app } from 'electron';
import path from 'path';

import CONSTS from '../constants';
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
      preload: path.join(__dirname, '..', '..', 'build', 'preload.js'),
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
    'src/node/electron.ts',
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

// for both the main window and the settings window
app.on('browser-window-created', (event, browserWindow) => {
  enableContextMenu(browserWindow);
  if (!app.isPackaged) {
    // for development debugging purpose only
    browserWindow.webContents.openDevTools();
  }
});
  `,
  );

  ensure(
    'src/node/application-menu.ts',
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
    'src/node/preload.ts',
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
    'src/node/dark-mode.ts',
    `import { BrowserWindow, ipcMain, nativeTheme, systemPreferences } from 'electron';

import CONSTS from '../constants';

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
    'src/node/create-window.ts',
    `import { BrowserWindow, app } from 'electron';
import { join } from 'path';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 928,
    webPreferences: {
      preload: join(__dirname, '..', '..', 'build', 'preload.js'),
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
    'src/node/context-menu.ts',
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
};

export default step;
