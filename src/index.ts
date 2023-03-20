#!/usr/bin/env node
import { run } from 'shell-commands';

import { base } from './base';
import { web } from './web';
import { electron } from './electron';

const main = async () => {
  await base();

  const inputs = new Set(process.argv);

  if (inputs.has('-w') || inputs.has('--web')) {
    await web();
  }

  if (inputs.has('-e') || inputs.has('--electron')) {
    await electron();
  }

  await run('yarn lint');
};
main();
