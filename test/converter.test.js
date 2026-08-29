import test from 'node:test';
import assert from 'node:assert/strict';
import { tryToTextConverter } from 'turkish-lira-number-to-text-converter';

test('accepts integer, one-decimal, and two-decimal amounts', () => {
  assert.equal(tryToTextConverter(0), 'SIFIR TÜRK LİRASI');
  assert.equal(tryToTextConverter(12.3), 'ON İKİ TÜRK LİRASI OTUZ KURUŞ');
  assert.equal(tryToTextConverter('12.30'), 'ON İKİ TÜRK LİRASI OTUZ KURUŞ');
});

test('accepts Turkish thousands and decimal separators', () => {
  assert.equal(
    tryToTextConverter('1.234,56'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ',
  );
});
