# Turkish Lira Number to Text Converter

Convert Turkish lira amounts into uppercase Turkish text.

## Requirements

This package supports ESM and CommonJS and requires Node.js 18 or later.

## Installation

```sh
npm install turkish-lira-number-to-text-converter
```

## Usage

```js
import { tryToTextConverter } from 'turkish-lira-number-to-text-converter';

tryToTextConverter(1234.56);
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ

tryToTextConverter('1.234,56');
// BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

CommonJS projects can use the same package with `require`:

```js
const { tryToTextConverter } = require('turkish-lira-number-to-text-converter');
```

## Accepted inputs and output

Pass a non-negative number or string. Strings may use Turkish grouped thousands
with periods, with or without a comma decimal separator, such as `'1.234'` or
`'1.234,56'`. A single
decimal digit is padded to two digits (`12.3` becomes 12 lira, 30 kuruş).
Amounts with more than two decimal digits are rejected.

The converter returns a normalized, single-line uppercase Turkish string, for
example `BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ`.

## Errors

`TypeError` identifies an unsupported input type or invalid amount syntax.
`RangeError` identifies a negative amount, an amount with unsupported precision,
or an amount outside the supported numeric range.

## Development

Run the tests with:

```sh
npm test
```

Run the local demo with:

```sh
npm run demo
```
