import { adjust } from '../utils';

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
};

export default step;
