import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

// create the file only if it doesn't exist
export const ensure = (filePath: string, content: string) => {
  if (existsSync(filePath)) {
    return;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content.trim() + '\n');
};

/**
 * Get non-empty trimed lines of the content.
 * @param content the content to be split into lines
 * @returns non-empty trimed lines
 */
const lines = (content: string) => {
  return content
    .split(/\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

/**
 * Adjust the content in the file.
 * Please note that, it will remove the content first, then add the replacement.
 * What's more, it's done line by line, so it's safe to use it with a multi-line content.
 * @param filePath the file path
 * @param content the content to be replaced
 * @param replacement the replacement
 */
export const adjust = (filePath: string, content: string, replacement: string) => {
  let fileContent = readFileSync(filePath, 'utf-8');
  for (const line of lines(content)) {
    fileContent = fileContent.replace(line + '\n', '');
  }
  for (const line of lines(replacement)) {
    if (fileContent.indexOf(line) === -1) {
      fileContent += line + '\n';
    }
  }
  writeFileSync(filePath, fileContent);
};

// overwrite the file content
export const overwrite = (filePath: string, content: string) => {
  writeFileSync(filePath, content.trim() + '\n');
};

// replace the content in the file, it only replaces the first occurrence
export const replace = (filePath: string, content: string, replacement: string) => {
  let fileContent = readFileSync(filePath, 'utf-8');
  fileContent = fileContent.replace(content, replacement);
  writeFileSync(filePath, fileContent);
};
