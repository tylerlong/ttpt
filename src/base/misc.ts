import { ensure } from '../utils';

const step = () => {
  ensure(
    '.gitignore',
    `node_modules/
.env
`,
  );
  ensure(
    '.ackrc',
    `--ignore-dir=node_modules
--ignore-file=match:/^yarn\\.lock$/
  `,
  );
};

export default step;
