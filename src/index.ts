#!/usr/bin/env tsx
import { run } from 'shell-commands';

import { base } from './base';
import { web } from './web';
import { electron } from './electron';
import { r3f } from './r3f';

const projectTypes = {
  base: [],
  web: [web],
  electron: [web, electron],
  r3f: [web, r3f],
};

const main = async () => {
  const inputs = new Set(process.argv);
  await base(inputs);
  let projectType: 'base' | 'web' | 'electron' | 'r3f' = 'base';
  if (inputs.has('-w') || inputs.has('--web')) {
    projectType = 'web';
  } else if (inputs.has('-e') || inputs.has('--electron')) {
    projectType = 'electron';
  } else if (inputs.has('-3') || inputs.has('--r3f')) {
    projectType = 'r3f';
  }

  for (const step of projectTypes[projectType]) {
    await step();
  }
  await run('yarn lint');
};
main();
