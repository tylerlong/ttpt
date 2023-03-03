import { run } from 'shell-commands';
import fs from 'fs';
import path from 'path';

// create the file only if it doesn't exist
const ensure = (filePath: string, content: string) => {
  if (fs.existsSync(filePath)) {
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const main = async () => {
  ensure('package.json', '{"license": "UNLICENSED"}');
  await run(`
    yarn add --dev yarn-upgrade-all typescript 
    yarn add --dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-alloy
    yarn add --dev prettier eslint-plugin-prettier eslint-config-prettier 
  `);
  ensure('README.md', '# ');
  ensure(path.join('src', 'index.ts'), "console.log('Hello world!');\n");
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
