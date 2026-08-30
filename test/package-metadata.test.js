import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('package metadata exposes typed ESM and CommonJS entries for Node 22+', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));

  assert.equal(packageJson.engines.node, '>=22');
  assert.equal(packageJson.main, './src/index.cjs');
  assert.equal(packageJson.module, './src/index.js');
  assert.equal(packageJson.types, './src/index.d.ts');
  assert.deepEqual(packageJson.exports['.'], {
    types: './src/index.d.ts',
    import: './src/index.js',
    require: './src/index.cjs',
  });
  assert.equal(packageJson.dependencies, undefined);
});
