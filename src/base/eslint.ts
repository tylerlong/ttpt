import { readFileSync, writeFileSync } from 'fs';
import { ensure } from '../utils';
import { merge } from 'lodash';

const step = () => {
  ensure(
    'prettier.config.mjs',
    `import config from 'eslint-config-tyler/prettier.config.mjs';

export default config;`,
  );
  ensure(
    'eslint.config.mjs',
    `import config from 'eslint-config-tyler/eslint.config.mjs';

export default config;`,
  );
  const pkgJson = {
    scripts: {
      lint: 'tsc --jsx react --skipLibCheck --noEmit --target ESNext --moduleResolution NodeNext --module NodeNext ./src/*.ts && eslint . --fix && prettier --write . && sort-package-json',
    },
  };
  const originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  writeFileSync(
    'package.json',
    JSON.stringify(merge(pkgJson, originalPkg), null, 2),
  );
};

export default step;
