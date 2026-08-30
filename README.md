# Turkish Lira Number to Text Converter

Türk lirası tutarlarını büyük harfli Türkçe metne dönüştüren, çalışma zamanı
bağımlılığı olmayan JavaScript paketi. Node.js, CommonJS, TypeScript ve modern
browser bundler'larını destekler.

Dependency-free JavaScript package that converts Turkish lira amounts to
uppercase Turkish text. Supports Node.js, CommonJS, TypeScript, and modern
browser bundlers.

## Kurulum / Installation

Node.js 22 veya üzeri gerekir. / Requires Node.js 22 or later.

```sh
npm install turkish-lira-number-to-text-converter
```

## Kullanım / Usage

### ESM

```js
import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';

convertTurkishLiraToText(1234.56);
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

### CommonJS

```js
const { convertTurkishLiraToText } = require('turkish-lira-number-to-text-converter');

convertTurkishLiraToText('1.234,56');
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

### TypeScript

Paket kendi tip tanımını içerir; ayrıca `@types` paketi kurulmaz.

```ts
import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';

const result: string = convertTurkishLiraToText('1.234,56');
```

### Browser ve bundler / Browser and bundler

Vite, webpack, Rollup veya esbuild kullanan browser projelerinde normal npm
import'u kullanılabilir:

```js
import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';

document.querySelector('#result').textContent = convertTurkishLiraToText('1.234,56');
```

Bundler olmadan, yayınlanan ESM dosyası CDN üzerinden doğrudan yüklenebilir.
Üretimde sürümü URL içinde sabitleyin:

```html
<script type="module">
  import { convertTurkishLiraToText } from 'https://cdn.jsdelivr.net/npm/turkish-lira-number-to-text-converter@0.1.0/src/index.js';

  document.querySelector('#result').textContent = convertTurkishLiraToText('1.234,56');
</script>
```

Browser'lar `turkish-lira-number-to-text-converter` gibi çıplak paket adlarını
tek başına çözmez. Bu biçim için bundler veya import map gerekir.

## API

### `convertTurkishLiraToText(amount)`

Negatif olmayan Türk lirası tutarını tek satırlık, büyük harfli Türkçe metne
dönüştürür. `amount`, `number` veya `string` olabilir; dönüş tipi `string`dir.

Converts a non-negative Turkish lira amount into one uppercase Turkish sentence.
`amount` may be a `number` or `string`; the return type is `string`.

### Girdi biçimleri / Input formats

JavaScript sayıları en fazla iki ondalık basamak içerebilir:

```js
convertTurkishLiraToText(1234);
convertTurkishLiraToText(1234.5); // ... ELLİ KURUŞ
convertTurkishLiraToText(1234.56); // ... ELLİ ALTI KURUŞ
```

String girdiler Türkçe binlik ve kuruş ayraçlarını destekler:

```js
convertTurkishLiraToText('1.234'); // BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI
convertTurkishLiraToText('1.234,56'); // ... ELLİ ALTI KURUŞ
convertTurkishLiraToText('12,3'); // ON İKİ TÜRK LİRASI OTUZ KURUŞ
```

Noktalı programatik ondalık stringler de kabul edilir; ancak üç basamaklı son
gruba sahip `1.234` gibi değerler Türkçe binlik gruplama olarak yorumlanır.

Kuruş sıfırsa sonuçta kuruş bölümü yazılmaz. Tek kuruş basamağı sağdan sıfırla
tamamlanır; `12,3`, 30 kuruş anlamına gelir. Fonksiyon sessizce yuvarlama yapmaz.

JavaScript güvenli tamsayı aralığını aşan kesin değerleri string olarak verin.
Desteklenen tamsayı bölümü en fazla 66 basamaktır; daha büyük değerler reddedilir.

Dot-decimal programmatic strings are also accepted, except values such as
`1.234` with a three-digit final group are interpreted as Turkish thousands
grouping. Zero kuruş is omitted, one decimal digit is padded on the right, and
values are never rounded silently. Use strings for exact values beyond
JavaScript's safe integer range. The integer part may contain at most 66 digits.

## Hatalar / Errors

| Hata / Error | Ne zaman / When                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypeError`  | Desteklenmeyen tip, boş değer, sonlu olmayan sayı veya geçersiz ayraç/işaret biçimi. / Unsupported type, empty value, non-finite number, or malformed separator/sign syntax. |
| `RangeError` | Negatif değer, ikiden fazla ondalık basamak, güvensiz number veya desteklenen ölçeğin aşılması. / Negative, over-precision, unsafe numeric, or out-of-scale value.           |

Hatalar senkron olarak fırlatılır; fonksiyon `undefined` veya kısmi sonuç dönmez.
Errors are thrown synchronously; the function never returns `undefined` or a
partial result.

## Paket özellikleri / Package characteristics

- Tek public export: `convertTurkishLiraToText`
- ESM ve CommonJS girişleri
- Dahili TypeScript tanımı
- Sıfır çalışma zamanı bağımlılığı
- Node.js ve browser-targeted build testleri
- Gerçek npm tarball tüketici doğrulaması

## Geliştirme / Development

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run test:browser
npm run verify:package
```

Yerel demo / Local demo:

```sh
npm run demo
```

## Lisans / License

MIT
