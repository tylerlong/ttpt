#!/usr/bin/env node
import { base } from './base';
import { web } from './web';

base();

const inputs = new Set(process.argv);
if (inputs.has('-w') || inputs.has('--web')) {
  web();
}
