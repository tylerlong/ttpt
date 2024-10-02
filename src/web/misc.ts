import { copyFileSync, existsSync } from 'fs';

import { adjust, ensure, replace } from '../utils';

const step = () => {
  if (!existsSync('src/icon.svg')) {
    copyFileSync('node_modules/ttpt/src/web/icon.svg', 'src/icon.svg');
  }
  adjust(
    '.gitignore',
    '',
    `.parcel-cache/
docs/
  `,
  );
  adjust('.eslintignore', '', 'docs/');
  adjust('.prettierignore', '', 'docs/');
  adjust('.ackrc', '', '--ignore-dir=docs');
  replace(
    '.eslintrc.js',
    "extends: ['alloy', 'alloy/typescript', 'prettier']",
    "extends: ['alloy', 'alloy/react', 'alloy/typescript', 'prettier']",
  );
  replace(
    '.eslintrc.js',
    '};',
    `settings: {
    react: {
      version: 'detect',
    },
  },
};`,
  );
  ensure(
    '.parcelrc',
    `
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.{ts,tsx}": ["@parcel/transformer-typescript-tsc"]
  }
}
    `,
  );
};

export default step;
