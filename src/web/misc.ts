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
temp/
  `,
  );
  replace(
    'eslint.config.mjs',
    'export default config;',
    `config[0].ignores = ['docs/', 'temp/'];

export default config;`,
  );
  ensure('.prettierignore', 'docs/\ntemp/');
  adjust('.ackrc', '', '--ignore-dir=docs\n--ignore-dir=temp');
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
