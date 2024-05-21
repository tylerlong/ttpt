import { adjust, replace } from '../utils';

const step = () => {
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
};

export default step;
