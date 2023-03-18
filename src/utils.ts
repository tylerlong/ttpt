import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

// create the file only if it doesn't exist
export const ensure = (filePath: string, content: string) => {
  if (existsSync(filePath)) {
    return;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content.trim() + '\n');
};

// append content to file, assume file exists
export const append = (filePath: string, content: string) => {
  const fileContent = readFileSync(filePath, 'utf-8');
  if (fileContent.indexOf(content.trim()) === -1) {
    appendFileSync(filePath, content.trim() + '\n');
  }
};
