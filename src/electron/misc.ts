import { copyFileSync, existsSync } from 'fs';
import { adjust } from '../utils';

const step = () => {
  if (!existsSync('icon.png')) {
    copyFileSync('node_modules/ttpt/src/electron/icon.png', 'icon.png');
  }
  adjust('.gitignore', 'docs/', 'build/\ndist/\n.DS_Store');
  adjust('.prettierignore', 'docs/', 'build/\ndist/');
  adjust('.eslintignore', 'docs/', 'build/\ndist/');
  adjust('.ackrc', '--ignore-dir=docs', '--ignore-dir=build\n--ignore-dir=dist');
};

export default step;
