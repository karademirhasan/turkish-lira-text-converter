const assert = require('node:assert/strict');
const test = require('node:test');

test('CommonJS consumers can require the package entry', () => {
  const converter = require('turkish-lira-number-to-text-converter');

  assert.deepEqual(Object.keys(converter), ['tryToTextConverter']);
  assert.equal(typeof converter.tryToTextConverter, 'function');
  assert.equal(
    converter.tryToTextConverter('1.234,56'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ',
  );
});
