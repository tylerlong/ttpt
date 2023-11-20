import { existsSync, readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { join } from 'path';
import { run } from 'shell-commands';

import { ensure } from '../utils';
import eslint from './eslint';
import misc from './misc';

export const base = async (inputs: Set<string>) => {
  const pkgJson = {
    name: 'untitled-app',
    license: 'UNLICENSED',
    version: '0.1.0',
    private: true,
    scripts: {
      test: 'ts-node -r dotenv-override-true/config src/index.ts',
    },
  };
  if (existsSync('package.json')) {
    const originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));
  } else {
    writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));
  }

  let workSpaceOption = '';
  if (inputs.has('-W')) {
    workSpaceOption = ' -W';
  }
  await run(`
    yarn add --dev${workSpaceOption} ttpt yarn-upgrade-all typescript @types/node ts-node
    yarn add --dev${workSpaceOption} eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-alloy
    yarn add --dev${workSpaceOption} prettier eslint-plugin-prettier eslint-config-prettier sort-package-json
    yarn add --dev${workSpaceOption} dotenv-override-true
  `);

  ensure('README.md', '# Untitled App');
  ensure('.env', 'NAME=Tyler Liu');
  // eslint-disable-next-line no-template-curly-in-string
  ensure(join('src', 'index.ts'), 'console.log(`Hello ${process.env.NAME}!`);');

  for (const step of [misc, eslint]) {
    step();
  }
};
