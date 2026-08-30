const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const test = require('node:test');

const root = resolve(__dirname, '..');

test('build:cjs generates CommonJS from the ESM source', () => {
  execFileSync(process.execPath, ['scripts/build-cjs.js'], { cwd: root });
  const generated = readFileSync(resolve(root, 'src/index.cjs'), 'utf8');

  assert.match(generated, /module\.exports/);
  assert.doesNotMatch(generated, /^export \{/mu);
  assert.equal(
    require(resolve(root, 'src/index.cjs')).tryToTextConverter('1.234,56'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ',
  );
});
