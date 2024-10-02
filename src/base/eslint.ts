import { readFileSync, writeFileSync } from 'fs';
import { ensure } from '../utils';
import { merge } from 'lodash';

const step = () => {
  ensure(
    '.prettierrc.js',
    `module.exports = {
  ...require('eslint-config-alloy/.prettierrc.js'),
};
  `,
  );
  ensure(
    '.eslintrc.js',
    `module.exports = {
  extends: ['alloy', 'alloy/typescript', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'prefer-const': ['error'],
    '@typescript-eslint/no-invalid-this': 'off',
  },
};
  `,
  );
  ensure('.eslintignore', 'node_modules/');
  ensure('.prettierignore', 'node_modules/');
  const pkgJson = {
    scripts: {
      lint: "tsc --jsx react --skipLibCheck --noEmit --target ESNext --moduleResolution NodeNext --module NodeNext ./src/*.ts && eslint --fix '**/*.{ts,tsx,js,jsx}' && prettier --write . && sort-package-json",
    },
    'yarn-upgrade-all': {
      ignore: ['eslint'],
    },
  };
  const originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  writeFileSync('package.json', JSON.stringify(merge(pkgJson, originalPkg), null, 2));
};

export default step;
