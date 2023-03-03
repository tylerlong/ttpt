#!/usr/bin/env node
import { run } from 'shell-commands';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { merge } from 'lodash';

// create the file only if it doesn't exist
const ensure = (filePath: string, content: string) => {
  if (existsSync(filePath)) {
    return;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
};

const main = async () => {
  const pkgJson = {
    license: 'UNLICENSED',
    version: '0.1.0',
    scripts: {
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
    yarn add --dev yarn-upgrade-all typescript @types/node
    yarn add --dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-alloy
    yarn add --dev prettier eslint-plugin-prettier eslint-config-prettier 
  `);
  ensure('README.md', '# ');
  ensure(join('src', 'index.ts'), "console.log('Hello world!');\n");
  ensure(
    '.prettierrc.js',
    `
module.exports = {
  ...require("eslint-config-alloy/.prettierrc.js")
};
  `.trim() + '\n',
  );
  ensure(
    '.eslintrc.js',
    `
module.exports = {
  extends: ['alloy', 'alloy/typescript', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
};
  `.trim() + '\n',
  );
  ensure('.gitignore', 'node_modules/\n');
  ensure('.ackrc', '--ignore-dir=node_modules\n');
};

main();
