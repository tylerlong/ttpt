import { readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { run } from 'shell-commands';

export const electron = async () => {
  await run('yarn add --dev electron electron-builder nodemon shell-commands');
  const pkgJson = {
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
};
