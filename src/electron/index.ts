import { readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { run } from 'shell-commands';

import { ensure } from '../utils';
import misc from './misc';
import scripts from './scripts';
import node from './node';
import web from './web';

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
      watch: 'tsx scripts/watch.ts',
      start: "nodemon --watch build/electron.js --exec 'electron .'",
      release: 'tsx -r dotenv-override-true/config scripts/release.ts',
    },
    main: 'build/electron.js',
    targets: {
      electron: {
        source: 'src/node/electron.ts',
        context: 'electron-main',
        distDir: 'build',
      },
      preload: {
        source: 'src/node/preload.ts',
        context: 'node',
        distDir: 'build',
      },
      web: {
        source: 'src/web/index.html',
        context: 'browser',
        distDir: 'build',
        publicUrl: '.',
        engines: {
          browsers: 'last 2 Electron versions',
        },
      },
      settings: {
        source: 'src/web/settings/settings.html',
        context: 'browser',
        publicUrl: '.',
        distDir: 'build',
        engines: {
          browsers: 'last 2 Electron versions',
        },
      },
    },
  };
  const originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  delete originalPkg.scripts.serve;
  writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));

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

  scripts();

  node();

  web();

  misc();
};
