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
