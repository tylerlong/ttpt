import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { join } from 'path';
import { run } from 'shell-commands';
import { ensure, overwrite, adjust } from '../utils';

export const electron = async () => {
  await run('yarn add --dev electron electron-builder nodemon shell-commands');
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
      build: 'rm -rf .parcel-cache && rm -rf build && parcel build --no-source-maps',
      mac: 'yarn build && rm -rf dist && yarn electron-builder --dir -c.mac.identity=null',
    },
    main: 'build/electron.js',
    build: {
      files: ['build'],
    },
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
      },
    },
  };
  let originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  delete originalPkg.scripts.serve;
  writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));

  adjust('.gitignore', 'docs/', 'build/\ndist/\n.DS_Store');
  adjust('.prettierignore', 'docs/', 'build/\ndist/');
  adjust('.eslintignore', 'docs/', 'build/\ndist/');
  adjust('.ackrc', '--ignore-dir=docs', '--ignore-dir=build\n--ignore-dir=dist');

  ensure(
    'scripts/watch.ts',
    `
import { run } from 'shell-commands';

const main = async () => {
  await run(\`
    rm -rf .parcel-cache
    rm -rf build
  \`);
  run("nodemon --watch src/preload.ts --exec 'parcel build --target preload'");
  run('parcel src/index.html --dist-dir build -p 1234');
  run('parcel watch --target electron -p 1240');
};

main();
  `,
  );

  ensure(
    'src/electron.ts',
    `
import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

import CONSTS from './constants';

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
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
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

ipcMain.handle(CONSTS.HELLO_TO_ELECTRON, (event, message) => {
  console.log(message);
  event.sender.send(CONSTS.HELLO_TO_WEB, 'Hello from main');
});
  `,
  );

  overwrite(
    'src/index.html',
    `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:;" />
    <title>Untitled App</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <p>
      We are using Node.js <span id="node-version"></span>, Chromium <span id="chrome-version"></span>, and Electron
      <span id="electron-version"></span>.
    </p>
    <script type="module" src="index.tsx"></script>
  </body>
</html>  
  `,
  );

  overwrite(
    'src/app.tsx',
    `
import React, { useEffect } from 'react';
import { Button, Space, Typography } from 'antd';
import { auto } from 'manate/react';

import { Store } from './store';
import CONSTS from './constants';

const { Text, Title } = Typography;

const App = (props: { store: Store }) => {
  useEffect(() => {
    const removeListner = global.ipc.on(CONSTS.HELLO_TO_WEB, (event: any, args: any) => {
      console.log(args);
    });
    return () => {
      removeListner();
    };
  }, []);
  const render = () => {
    const { store } = props;
    return (
      <>
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
          <Button onClick={() => global.ipc.invoke(CONSTS.HELLO_TO_ELECTRON, 'Hello from renderer')}>Hello</Button>
        </Space>
      </>
    );
  };
  return auto(render, props);
};

export default App;
  `,
  );

  ensure(
    'src/preload.ts',
    `
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(\`\${type}-version\`, process.versions[type]);
  }
});
  `,
  );

  ensure(
    'src/constants.ts',
    `
const CONSTS = {
  HELLO_TO_ELECTRON: 'HELLO_TO_ELECTRON',
  HELLO_TO_WEB: 'HELLO_TO_WEB',
};

export default CONSTS;
`,
  );

  ensure(
    'src/types.d.ts',
    `
declare namespace ipc {
  function invoke(channel: string, ...args: any[]): Promise<any>;
  function on(channel: string, listener: (...args: any[]) => void): () => void;
}
  `,
  );

  if (!existsSync('icon.png')) {
    copyFileSync(join('node_modules', 'ttpt', 'src', 'electron', 'icon.png'), 'icon.png');
  }
};
