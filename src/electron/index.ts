import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { join } from 'path';
import { run } from 'shell-commands';
import { ensure, overwrite, replace } from '../utils';

export const electron = async () => {
  await run('yarn add --dev electron electron-builder@next nodemon shell-commands');
  const pkgJson = {
    productName: 'Untitled App',
    description: 'An untitled app.',
    author: {
      name: 'Mac Mate',
      email: 'support@macmate.app',
    },
    scripts: {
      watch: 'ts-node scripts/watch.ts',
      start: "nodemon --watch build/electron.js --exec 'electron .'",
      build: 'rm -rf build && parcel build',
      'pack:mac': 'yarn build && rm -rf dist && yarn electron-builder --universal --dir --config electron-builder.ts',
    },
    main: 'build/electron.js',
    targets: {
      electron: {
        source: ['src/electron.ts', 'src/preload.ts'],
        context: 'electron-main',
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

  ensure(
    'electron-builder.ts',
    `
import { Configuration } from 'electron-builder';

const config: Configuration = {
  appId: 'app.macmate.untitled-app',
  files: ['build'],
};

export default config;
  `,
  );

  replace('.gitignore', 'docs/', 'build/\ndist/\n.DS_Store');
  replace('.prettierignore', 'docs/', 'build/\ndist/');
  replace('.eslintignore', 'docs/', 'build/\ndist/');
  replace('.ackrc', '--ignore-dir=docs', '--ignore-dir=build\n--ignore-dir=dist');

  ensure(
    'scripts/watch.ts',
    `
import { run } from 'shell-commands';

const main = async () => {
  await run('rm -rf build');
  run('parcel src/index.html --dist-dir build -p 1234');
  run('parcel watch --target electron -p 1235');
};

main();
  `,
  );

  ensure(
    'src/electron.ts',
    `
import { app, BrowserWindow } from 'electron';
import { join } from 'path';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
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
  `,
  );

  overwrite(
    'src/index.html',
    `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline';" />
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

  ensure(
    'src/preload.ts',
    `
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

  if (!existsSync('icon.png')) {
    copyFileSync(join('node_modules', 'ttpt', 'src', 'electron', 'icon.png'), 'icon.png');
  }
};
