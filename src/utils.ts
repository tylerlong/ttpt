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

// replace content, assume file exists
export const replace = (filePath: string, content: string, replacement: string) => {
  let fileContent = readFileSync(filePath, 'utf-8');
  if (fileContent.indexOf(replacement) === -1) {
    fileContent = fileContent.replace(content, replacement);
  } else {
    fileContent = fileContent.replace(content + '\n', '');
  }
  writeFileSync(filePath, fileContent);
};

// overwrite the file content
export const overwrite = (filePath: string, content: string) => {
  writeFileSync(filePath, content.trim() + '\n');
};
