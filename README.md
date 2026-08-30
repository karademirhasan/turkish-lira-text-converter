> Bu dokümantasyon Türkçe ve İngilizcedir. / This documentation is in Turkish and English.

# Türkçe Lira Sayıdan Metne Dönüştürücü

Türk lirası tutarlarını Türkçe metne dönüştürür.

## Gereksinimler

Bu paket ESM ve CommonJS destekler; Node.js 18 veya üzeri gerektirir.

## Kurulum

```sh
npm install turkish-lira-number-to-text-converter
```

## Kullanım

```js
import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';

convertTurkishLiraToText(1234.56);
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

CommonJS projelerinde:

```js
const { convertTurkishLiraToText } = require('turkish-lira-number-to-text-converter');
```

## API referansı

### `convertTurkishLiraToText(amount)`

Negatif olmayan bir Türk lirası tutarını tek satırlık, büyük harfli Türkçe
metne dönüştürür.

| Parametre | Tip                | Açıklama                     |
| --------- | ------------------ | ---------------------------- |
| `amount`  | `number \| string` | Negatif olmayan lira tutarı. |

Fonksiyon `string` döndürür. Sonuçta yalnızca tekli boşluklar bulunur; başta ve
sonda boşluk olmaz.

## Girdi biçimleri

JavaScript sayıları noktalı ondalık gösterim kullanır ve en fazla iki ondalık
basamak içerebilir:

```js
convertTurkishLiraToText(1234); // BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI
convertTurkishLiraToText(1234.5); // ... ELLİ KURUŞ
convertTurkishLiraToText(1234.56); // ... ELLİ ALTI KURUŞ
```

String değerlerde Türkçe ayraçlar kullanılır. Nokta binlik ayraç, virgül kuruş
ayracıdır. Virgül yoksa kuruş `00` kabul edilir:

```js
convertTurkishLiraToText('1.234'); // ... OTUZ DÖRT TÜRK LİRASI
convertTurkishLiraToText('1.234,56'); // ... OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
convertTurkishLiraToText('12,3'); // ON İKİ TÜRK LİRASI OTUZ KURUŞ
```

JavaScript güvenli tamsayı aralığını aşan değerlerde string kullanın. İkiden
fazla ondalık basamak reddedilir; fonksiyon sessizce yuvarlama yapmaz.

## Hatalar

| Hata         | Ne zaman oluşur                                                                       |
| ------------ | ------------------------------------------------------------------------------------- |
| `TypeError`  | Desteklenmeyen tip, boş değer veya geçersiz ayraç/işaret biçimi.                      |
| `RangeError` | Negatif değer, ikiden fazla ondalık basamak, güvensiz sayı veya desteklenmeyen ölçek. |

Hatalar senkron olarak fırlatılır. Geçersiz girdiler için `undefined` veya
kısmi sonuç döndürülmez.

## Geliştirme

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run demo
```

---

# Turkish Lira Number to Text Converter

Convert Turkish lira amounts into Turkish text.

## Requirements

This package supports ESM and CommonJS and requires Node.js 18 or later.

## Installation

```sh
npm install turkish-lira-number-to-text-converter
```

## Usage

```js
import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';

convertTurkishLiraToText(1234.56);
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ

convertTurkishLiraToText('1.234,56');
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

CommonJS projects can use the same package with `require`:

```js
const { convertTurkishLiraToText } = require('turkish-lira-number-to-text-converter');
```

## API reference

### `convertTurkishLiraToText(amount)`

Converts a Turkish lira amount to one uppercase Turkish sentence.

| Parameter | Type               | Description                 |
| --------- | ------------------ | --------------------------- |
| `amount`  | `number \| string` | A non-negative lira amount. |

Returns `string`. The result always uses single spaces and has no leading or
trailing whitespace.

### Input formats

Numbers use JavaScript's decimal-point notation and may have at most two
decimal digits:

```js
convertTurkishLiraToText(1234); // BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI
convertTurkishLiraToText(1234.5); // ... ELLİ KURUŞ
convertTurkishLiraToText(1234.56); // ... ELLİ ALTI KURUŞ
```

Strings use Turkish separators. A period is a thousands separator and a comma
is the cents separator. If the comma is omitted, cents are `00`:

```js
convertTurkishLiraToText('1.234'); // ... OTUZ DÖRT TÜRK LİRASI
convertTurkishLiraToText('1.234,56'); // ... OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
convertTurkishLiraToText('12,3'); // ON İKİ TÜRK LİRASI OTUZ KURUŞ
```

Use strings for values larger than JavaScript's safe integer range. Values with
more than two decimal digits are rejected; the function never rounds silently.

## Output

The converter returns a normalized, single-line uppercase Turkish string. A
single decimal digit is padded to two digits (`12.3` becomes 12 lira, 30
kuruş). Amounts with more than two decimal digits are rejected.

The converter returns a normalized, single-line uppercase Turkish string, for
example `BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ`.

## Errors

| Error        | Thrown when                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `TypeError`  | The input is not a number/string, is non-finite, empty, or has invalid separator/sign syntax.                           |
| `RangeError` | The amount is negative, has more than two decimal digits, uses an unsafe numeric value, or exceeds the supported scale. |

Errors are thrown synchronously. The function does not return `undefined` or a
partially converted result for invalid input.

## Development

Run the tests with:

```sh
npm test
```

Run the local demo with:

```sh
npm run demo
```
