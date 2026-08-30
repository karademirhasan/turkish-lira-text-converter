import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(projectRoot, 'src/index.js');
const targetPath = resolve(projectRoot, 'src/index.cjs');
const source = await readFile(sourcePath, 'utf8');
const exportStatement = /^export \{\s*TryToTextConverter,\s*tryToTextConverter\s*\};\s*$/mu;

if (!exportStatement.test(source)) {
  throw new Error(`Expected public export statement was not found in ${sourcePath}`);
}

const commonJsSource = source.replace(
  exportStatement,
  'module.exports = { TryToTextConverter, tryToTextConverter };',
);

await writeFile(targetPath, commonJsSource, 'utf8');
