const assert = require('node:assert/strict');
const test = require('node:test');

test('CommonJS consumers can require the package entry', () => {
  const converter = require('turkish-lira-text-converter');

  assert.deepEqual(Object.keys(converter), ['convertTurkishLiraToText']);
  assert.equal(typeof converter.convertTurkishLiraToText, 'function');
  assert.equal(
    converter.convertTurkishLiraToText('1.234,56'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ',
  );
});
