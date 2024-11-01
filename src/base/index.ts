import { existsSync, readFileSync, writeFileSync } from 'fs';

import { merge } from 'lodash';
import { run } from 'shell-commands';

import { ensure } from '../utils';
import eslint from './eslint';
import misc from './misc';

export const base = async (inputs: Set<string>) => {
  const pkgJson = {
    name: 'untitled-app',
    license: 'UNLICENSED',
    version: '0.1.0',
    private: true,
    scripts: {
      demo: 'tsx -r dotenv-override-true/config src/demo.ts',
      test: 'vitest run',
    },
  };
  if (existsSync('package.json')) {
    const originalPkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    writeFileSync(
      'package.json',
      JSON.stringify(merge(pkgJson, originalPkg), null, 2),
    );
  } else {
    writeFileSync('package.json', JSON.stringify(pkgJson, null, 2));
  }

  let workSpaceOption = '';
  if (inputs.has('-W')) {
    workSpaceOption = ' -W';
  }
  await run(`
    yarn add --dev${workSpaceOption} ttpt yarn-upgrade-all typescript @types/node tsx
    yarn add --dev${workSpaceOption} eslint-config-tyler sort-package-json
    yarn add --dev${workSpaceOption} vitest dotenv-override-true
  `);

  ensure('README.md', '# Untitled App');
  ensure('.env', 'NAME=Tyler Liu');
  ensure(
    'src/index.ts',
    `
const add = (a: number, b: number): number => a + b;

export default add;
    `,
  );
  ensure(
    'src/demo.ts',
    `
import add from '.';

console.log(add(1, 2));
console.log(process.env.NAME);
    `,
  );
  ensure(
    'test/index.spec.ts',
    `
import { expect, test } from 'vitest';
import dotenv from 'dotenv-override-true';

import add from '../src/index';

dotenv.config();

test('Addition', () => {
  expect(add(1, 2)).toBe(3);
});

test('Load env vars', () => {
  expect(process.env.NAME).toBe('Tyler Liu');
});
  `,
  );

  for (const step of [misc, eslint]) {
    step();
  }
};
