#!/usr/bin/env node
import { run } from 'shell-commands';

import { base } from './base';
import { web } from './web';
import { electron } from './electron/index';

const projectTypes = {
  base: [base],
  web: [base, web],
  electron: [base, web, electron],
};

const main = async () => {
  await base();

  const inputs = new Set(process.argv);
  let projectType: 'base' | 'web' | 'electron' = 'base';
  if (inputs.has('-w') || inputs.has('--web')) {
    projectType = 'web';
  } else if (inputs.has('-e') || inputs.has('--electron')) {
    projectType = 'electron';
  }

  for (const step of projectTypes[projectType]) {
    await step();
  }
  await run('yarn lint');
};
main();
