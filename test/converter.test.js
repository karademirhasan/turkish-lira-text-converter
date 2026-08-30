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
    tryToTextConverter('12,30'),
    'ON İKİ TÜRK LİRASI OTUZ KURUŞ',
  );
  assert.equal(
    tryToTextConverter('1.234,56'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ',
  );
  assert.equal(
    tryToTextConverter('1.234'),
    'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI',
  );
});

test('renders Turkish hundreds and thousands grammar', () => {
  const cases = [
    [1, 'BİR TÜRK LİRASI'],
    [10, 'ON TÜRK LİRASI'],
    [100, 'YÜZ TÜRK LİRASI'],
    [101, 'YÜZ BİR TÜRK LİRASI'],
    [1000, 'BİN TÜRK LİRASI'],
    [1001, 'BİN BİR TÜRK LİRASI'],
    [2000, 'İKİ BİN TÜRK LİRASI'],
    [1_000_000, 'BİR MİLYON TÜRK LİRASI'],
    [1_000_001, 'BİR MİLYON BİR TÜRK LİRASI'],
    [1_001_001, 'BİR MİLYON BİN BİR TÜRK LİRASI'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(tryToTextConverter(input), expected);
  }
});

test('returns normalized single-line whitespace', () => {
  const result = tryToTextConverter(1_203_004.05);
  assert.equal(
    result,
    'BİR MİLYON İKİ YÜZ ÜÇ BİN DÖRT TÜRK LİRASI BEŞ KURUŞ',
  );
  assert.equal(result, result.trim());
  assert.equal(/\s{2,}|[\r\n\t]/u.test(result), false);
});

test('rejects invalid types and malformed amount syntax with TypeError', () => {
  for (const value of ['', 'abc', '1,2.3', '1.23,45', null, undefined, {}, NaN, Infinity]) {
    assert.throws(() => tryToTextConverter(value), TypeError);
  }
});

test('rejects negative, over-precision, and unsafe numeric amounts with RangeError', () => {
  for (const value of [-1, '-1,00', '1234.567', 12.345, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => tryToTextConverter(value), RangeError);
  }
});

test('rejects values beyond the supported scale with RangeError', () => {
  const beyondVigintillion = `1${'0'.repeat(66)}`;
  assert.throws(() => tryToTextConverter(beyondVigintillion), RangeError);
});

test('rejects exponent-rendered numeric input with RangeError', () => {
  assert.throws(() => tryToTextConverter(1e-7), RangeError);
});

test('accepts the 66-digit vigintillion boundary', () => {
  const vigintillion = `1${'0'.repeat(65)}`;
  assert.equal(
    tryToTextConverter(vigintillion),
    'YÜZ VİGİNTİLYON TÜRK LİRASI',
  );
});
