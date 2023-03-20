import { existsSync, readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { join } from 'path';
import { run } from 'shell-commands';

import { ensure } from './utils';

export const base = async () => {
  const pkgJson = {
    name: 'untitled-app',
    license: 'UNLICENSED',
    version: '0.1.0',
    scripts: {
      lint: "eslint --fix '**/*.{ts,tsx,js,jsx}' && prettier --write . && sort-package-json",
      test: 'ts-node src/index.ts',
    },
  };
  let originalPkg = {};
  if (existsSync('package.json')) {
    originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));
  } else {
    writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));
  }
  await run(`
    yarn add --dev yarn-upgrade-all typescript @types/node ts-node
    yarn add --dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-alloy
    yarn add --dev prettier eslint-plugin-prettier eslint-config-prettier sort-package-json
  `);
  ensure('README.md', '# Untitled App');
  ensure(join('src', 'index.ts'), "console.log('Hello world!');");
  ensure(
    '.prettierrc.js',
    `
module.exports = {
  ...require('eslint-config-alloy/.prettierrc.js'),
};
  `,
  );
  ensure(
    '.eslintrc.js',
    `
module.exports = {
  extends: ['alloy', 'alloy/typescript', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    // todo: https://github.com/AlloyTeam/eslint-config-alloy/issues/239
    '@typescript-eslint/no-unused-vars': ['error'],
    // todo: https://github.com/AlloyTeam/eslint-config-alloy/issues/241
    'no-undef': ['off'],
  },
};
  `,
  );
  ensure('.gitignore', 'node_modules/');
  ensure(
    '.ackrc',
    `
--ignore-dir=node_modules
--ignore-file=match:/^yarn\\.lock$/
  `,
  );
  ensure('.eslintignore', 'node_modules/');
  ensure('.prettierignore', 'node_modules/');
};
