import { ensure } from '../utils';

const step = () => {
  ensure(
    '.gitignore',
    `node_modules/
.env
`,
  );
  ensure('.ackrc', `--ignore-file=match:/^yarn\\.lock$/`);
};

export default step;
