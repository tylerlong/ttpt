import { existsSync, readFileSync, writeFileSync } from 'fs';
import { merge } from 'lodash';
import { join } from 'path';
import { run } from 'shell-commands';

import { ensure } from './utils';

export const base = async (inputs: Set<string>) => {
  const pkgJson = {
    name: 'untitled-app',
    license: 'UNLICENSED',
    version: '0.1.0',
    private: true,
    scripts: {
      lint: "eslint --fix '**/*.{ts,tsx,js,jsx}' && prettier --write . && sort-package-json",
      test: 'ts-node -r dotenv-override-true/config src/index.ts',
    },
  };
  let originalPkg = {};
  if (existsSync('package.json')) {
    originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
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
  // eslint-disable-next-line no-template-curly-in-string
  ensure(join('src', 'index.ts'), 'console.log(`Hello ${process.env.NAME}!`);');
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
    quotes: ['error', 'single', { avoidEscape: true }],
    'prefer-const': ['error'],
  },
};
  `,
  );
  ensure(
    '.gitignore',
    `
node_modules/
.env
`,
  );
  ensure(
    '.ackrc',
    `
--ignore-dir=node_modules
--ignore-file=match:/^yarn\\.lock$/
  `,
  );
  ensure('.eslintignore', 'node_modules/');
  ensure('.prettierignore', 'node_modules/');
  ensure('.env', 'NAME=Tyler Liu');
};
