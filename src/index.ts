#!/usr/bin/env node
import { run } from 'shell-commands';

import { base } from './base';
import { web } from './web';
import { electron } from './electron';

const projectTypes = {
  base: [],
  web: [web],
  electron: [web, electron],
};

const main = async () => {
  const inputs = new Set(process.argv);
  await base(inputs);
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
