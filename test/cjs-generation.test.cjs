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
    require(resolve(root, 'src/index.cjs')).convertTurkishLiraToText('1.234,56'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ',
  );
});

test('ESM and CommonJS exports produce identical results', async () => {
  const esm = await import('turkish-lira-text-converter');
  const cjs = require('turkish-lira-text-converter');
  const inputs = [0, 12.3, '1.234', '1.234,56', '12,30', '1.000.001'];

  for (const input of inputs) {
    assert.equal(cjs.convertTurkishLiraToText(input), esm.convertTurkishLiraToText(input));
  }

  for (const input of [-1, 'abc', '12.3456']) {
    assert.throws(
      () => cjs.convertTurkishLiraToText(input),
      (cjsError) => {
        assert.throws(() => esm.convertTurkishLiraToText(input), { name: cjsError.name });
        return true;
      },
    );
  }
});
