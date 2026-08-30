# Pure JavaScript Library Implementation Plan

> Tarihsel plan: Bu plan uygulanmıştır ve güncel public API/yayın adımları
> `2026-08-30-npm-release-hardening.md` tarafından değiştirilmiştir. Aşağıdaki
> eski isimli kod örnekleri yalnızca uygulama geçmişini gösterir.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite demo application with a dependency-free ESM npm library, a separate browser demo, and a correct Turkish-lira converter covered by Node tests.

**Architecture:** `src/index.js` is the package's only public ESM entry point and owns input normalization plus Turkish number rendering. `test/converter.test.js` exercises that public API with Node's built-in test runner. Files under `demo/` import the same source and use a dependency-free Node HTTP server for manual browser testing.

**Tech Stack:** JavaScript ESM, Node.js 18+, `node:test`, `node:assert/strict`, Node built-in HTTP server, HTML, CSS.

**Spec:** `docs/superpowers/specs/2026-08-29-pure-js-library-design.md`

## Global Constraints

- Do not use Vite, Sass, a bundler, or any runtime/development dependency.
- Support ESM only and expose `tryToTextConverter` plus the backward-compatible `TryToTextConverter` alias.
- Accept finite non-negative JavaScript numbers, Turkish-formatted strings, and programmatic dot-decimal strings.
- Reject invalid syntax with `TypeError`; reject negative, over-precision, unsafe, and out-of-range values with `RangeError`.
- Return uppercase, single-line output with normalized whitespace.
- Keep generated spec and plan Markdown files local and never stage or commit them.
- Preserve unrelated user changes in `package-lock.json` and `.idea/` unless a task explicitly replaces package metadata through npm.

---

### Task 1: Dependency-Free Package Shell and Public Import

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/index.js`
- Create: `test/package-entry.test.js`
- Delete: `src/try-to-text-converter.js`

**Interfaces:**
- Produces: `tryToTextConverter(value: number | string): string`
- Produces: `TryToTextConverter`, an alias of `tryToTextConverter`
- Produces: package self-reference import through `turkish-lira-number-to-text-converter`

- [ ] **Step 1: Write the failing package-entry test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TryToTextConverter,
  tryToTextConverter,
} from 'turkish-lira-number-to-text-converter';

test('package self-reference exposes the public converter and legacy alias', () => {
  assert.equal(typeof tryToTextConverter, 'function');
  assert.equal(TryToTextConverter, tryToTextConverter);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test test/package-entry.test.js`

Expected: FAIL because the package has no `exports` entry and `src/index.js` does not exist.

- [ ] **Step 3: Create the minimal public entry and package metadata**

Create `src/index.js`:

```js
const tryToTextConverter = () => '';
const TryToTextConverter = tryToTextConverter;

export { TryToTextConverter, tryToTextConverter };
```

Update `package.json` to contain:

```json
{
  "name": "turkish-lira-number-to-text-converter",
  "description": "Convert Turkish lira amounts to Turkish text",
  "version": "0.1.0-alpha.1",
  "type": "module",
  "exports": {
    ".": "./src/index.js"
  },
  "files": [
    "src",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "test": "node --test",
    "demo": "node demo/server.js"
  },
  "license": "MIT",
  "keywords": ["try", "try-converter", "try-to-text", "turkish", "lira"],
  "author": "Hasan Karademir",
  "repository": {
    "type": "git",
    "url": "https://github.com/hasankarademir/turkish-lira-text-converter.git"
  },
  "bugs": {
    "url": "https://github.com/hasankarademir/turkish-lira-text-converter/issues"
  },
  "homepage": "https://github.com/hasankarademir/turkish-lira-text-converter#readme"
}
```

Regenerate the lock metadata without downloading dependencies:

Run: `npm install --package-lock-only --ignore-scripts --cache /private/tmp/turkish-lira-npm-cache`

Delete `src/try-to-text-converter.js` only after `src/index.js` exists.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npm test`

Expected: PASS with one package-entry test and no Vite/Sass dependency installation.

- [ ] **Step 5: Inspect the lock file and working tree**

Run: `rg -n 'vite|sass|esbuild' package.json package-lock.json`

Expected: no matches.

Run: `git status --short`

Expected: generated spec/plan Markdown files are absent because `docs/superpowers/` is ignored.

---

### Task 2: Valid Amount Normalization

**Files:**
- Modify: `src/index.js`
- Create: `test/converter.test.js`

**Interfaces:**
- Consumes: `tryToTextConverter(value: number | string): string`
- Produces internally: `normalizeAmount(value): { liraDigits: string, kurus: number }`
- Establishes equivalent handling of `12.3`, `'12.30'`, and `'12,30'`

- [ ] **Step 1: Write failing normalization behavior tests**

```js
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
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test test/converter.test.js`

Expected: FAIL because the placeholder returns an empty string.

- [ ] **Step 3: Implement canonical parsing and minimal number rendering**

In `src/index.js`, add literal word tables for units, tens, and scales. Implement `normalizeAmount` so number inputs use their decimal string form, comma strings use dots only as validated thousands separators, and dot-only strings use the dot as a decimal separator when followed by one or two digits. Strip leading integer zeros while preserving one zero. Return integer digits and numeric kuruş without floating-point multiplication.

Implement `threeDigitsToWords(group)` using hundreds, tens, and units tables. Implement `integerToWords(digits)` by walking right-aligned three-digit groups and applying `BİN`, `MİLYON`, `MİLYAR`, `TRİLYON`, `KATRİLYON`, `KENTİLYON`, `SEKSİLYON`, `SEPTİLYON`, `OKTİLYON`, `NONİLYON`, `DESİLYON`, `UNDESİLYON`, `DODESİLYON`, `TREDESİLYON`, `KATORDESİLYON`, `KENDESİLYON`, `SEKSDESİLYON`, `SEPTENDESİLYON`, `OKTODESİLYON`, `NOVEMDESİLYON`, and `VİGİNTİLYON`. Suppress `BİR` only for the exact thousands group value `1`.

Compose the final result with `TÜRK LİRASI`; append kuruş words and `KURUŞ` only when kuruş is nonzero. Join word arrays with one space rather than formatting with multiline template literals.

- [ ] **Step 4: Run all tests and verify GREEN**

Run: `npm test`

Expected: all package-entry and valid normalization tests PASS.

- [ ] **Step 5: Refactor while green**

Keep `normalizeAmount`, `threeDigitsToWords`, and `integerToWords` private. Replace any repeated whitespace cleanup with word-array composition, then rerun `npm test` and expect all tests to PASS.

---

### Task 3: Turkish Number Grammar and Group Boundaries

**Files:**
- Modify: `test/converter.test.js`
- Modify: `src/index.js`

**Interfaces:**
- Consumes: public `tryToTextConverter`
- Extends: private three-digit and scale rendering without changing public signatures

- [ ] **Step 1: Add failing literal table tests for grammar boundaries**

```js
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
```

- [ ] **Step 2: Run the grammar tests and verify RED**

Run: `node --test --test-name-pattern='grammar|whitespace' test/converter.test.js`

Expected: at least one literal boundary case FAILS against the minimal renderer.

- [ ] **Step 3: Correct three-digit group handling**

Adjust `integerToWords` so zero-valued groups are skipped, exact group `001` at the thousands scale produces only `BİN`, and all other scales retain `BİR`. Ensure kuruş values below ten render their unit without a leading `SIFIR`.

- [ ] **Step 4: Run all tests and verify GREEN**

Run: `npm test`

Expected: all tests PASS with normalized output.

---

### Task 4: Invalid Input and Range Contract

**Files:**
- Modify: `test/converter.test.js`
- Modify: `src/index.js`

**Interfaces:**
- Consumes: public `tryToTextConverter`
- Produces: stable error-class contract (`TypeError` for type/syntax, `RangeError` for numeric range/precision)

- [ ] **Step 1: Add failing invalid-input tests**

```js
test('rejects invalid types and malformed amount syntax with TypeError', () => {
  for (const value of ['', 'abc', '1,2.3', '1.23,45', null, undefined, {}, NaN, Infinity]) {
    assert.throws(() => tryToTextConverter(value), TypeError);
  }
});

test('rejects negative, over-precision, and unsafe numeric amounts with RangeError', () => {
  for (const value of [-1, '-1,00', '12.345', 12.345, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => tryToTextConverter(value), RangeError);
  }
});

test('rejects values beyond the supported scale with RangeError', () => {
  const beyondVigintillion = `1${'0'.repeat(66)}`;
  assert.throws(() => tryToTextConverter(beyondVigintillion), RangeError);
});
```

- [ ] **Step 2: Run invalid-input tests and verify RED**

Run: `node --test --test-name-pattern='rejects' test/converter.test.js`

Expected: FAIL because one or more invalid values are accepted or throw the wrong error class.

- [ ] **Step 3: Implement explicit validation branches**

At the start of `normalizeAmount`, accept only `number` and `string`. For numbers, require `Number.isFinite`, `Number.isSafeInteger(value)` for integers, and reject exponent notation or decimal expansions beyond two digits. For strings, trim outer whitespace, reject empty input, reject signs other than a leading minus, validate Turkish grouping with `^\d{1,3}(?:\.\d{3})*,\d{1,2}$`, dot-decimal with `^\d+(?:\.\d{1,2})?$`, comma-decimal with `^\d+(?:,\d{1,2})?$`, and plain integers with `^\d+$`. Check scale-group count before rendering. Throw `TypeError` for a failed type/syntax rule and `RangeError` for negative, precision, unsafe numeric, or scale violations.

- [ ] **Step 4: Run all tests and verify GREEN**

Run: `npm test`

Expected: all valid and invalid behavior tests PASS.

- [ ] **Step 5: Mutation-check validation**

Temporarily reason through removing each validation branch: the malformed syntax table must catch syntax removal, the negative table must catch sign handling removal, the unsafe-number case must catch safe-range removal, and the scale case must catch range removal. Add a literal case only if a realistic removed branch would otherwise survive. Run `npm test` and expect PASS.

---

### Task 5: Dependency-Free Browser Demo

**Files:**
- Create: `demo/index.html`
- Create: `demo/demo.js`
- Create: `demo/style.css`
- Create: `demo/server.js`
- Create: `test/demo-server.test.js`
- Delete: `index.html`
- Delete: `main.js`
- Delete: `style.scss`
- Delete: `favicon.svg`

**Interfaces:**
- Consumes: `tryToTextConverter` from `../src/index.js`
- Produces: `npm run demo`, serving the project root on `127.0.0.1:4173`
- Produces: `createDemoServer()` for integration testing without starting on import

- [ ] **Step 1: Write a failing real-server integration test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoServer } from '../demo/server.js';

test('demo server serves the demo and library module', async (t) => {
  const server = createDemoServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const page = await fetch(`http://127.0.0.1:${port}/demo/`);
  const library = await fetch(`http://127.0.0.1:${port}/src/index.js`);

  assert.equal(page.status, 200);
  assert.match(await page.text(), /Turkish Lira Text Converter/u);
  assert.equal(library.status, 200);
  assert.match(library.headers.get('content-type'), /javascript/u);
});
```

- [ ] **Step 2: Run the server test and verify RED**

Run: `node --test test/demo-server.test.js`

Expected: FAIL because `demo/server.js` does not exist.

- [ ] **Step 3: Implement the minimal safe static server**

Implement `createDemoServer()` with `node:http`, `node:fs`, `node:path`, and `node:url`. Resolve requests only under the repository root, map `/` and `/demo/` to `/demo/index.html`, return `404` for missing files, reject resolved paths outside the root with `403`, and set explicit HTML/CSS/JavaScript content types. Start port `4173` only when `server.js` is the executed entry module.

- [ ] **Step 4: Create the demo UI using the public source**

`demo/index.html` contains a labeled text input, submit button, formatted result region, and error region. `demo/demo.js` imports `tryToTextConverter` from `../src/index.js`, converts on form submission, writes results with `textContent`, and catches thrown errors into the error region. `demo/style.css` contains plain CSS migrated from the useful visual rules in `style.scss`; no Sass syntax remains.

- [ ] **Step 5: Remove the root Vite demo files and verify GREEN**

Delete the old root `index.html`, `main.js`, `style.scss`, and unused `favicon.svg` after the replacement demo exists.

Run: `npm test`

Expected: all tests PASS, including real HTTP responses.

Run: `rg -n 'vite|sass|style\.scss|/main\.js' --glob '!docs/superpowers/**' --glob '!node_modules/**' .`

Expected: no matches in project code or package metadata.

---

### Task 6: Consumer Documentation, License, and Publish Verification

**Files:**
- Modify: `README.md`
- Create: `LICENSE`
- Modify: `.gitignore`

**Interfaces:**
- Documents: installation, ESM import, accepted inputs, outputs, errors, tests, and demo usage
- Produces: an npm tarball containing only intended consumer files

- [ ] **Step 1: Update consumer-facing documentation**

Write README sections for:

```text
npm install turkish-lira-number-to-text-converter
import { tryToTextConverter } from 'turkish-lira-number-to-text-converter';
tryToTextConverter(1234.56)
tryToTextConverter('1.234,56')
npm test
npm run demo
```

Document that the package is ESM-only, Node 18+ is required, one decimal digit is padded, more than two is rejected, Turkish strings may use grouped thousands plus comma decimals, negative values are rejected, and error classes distinguish syntax/type from range/precision.

- [ ] **Step 2: Add the MIT license text**

Create `LICENSE` with the standard MIT License, copyright year `2026`, and copyright holder `Hasan Karademir`.

- [ ] **Step 3: Preserve local planning-document policy**

Ensure `.gitignore` includes `docs/superpowers/`. Do not stage any file below that directory.

- [ ] **Step 4: Run the full verification suite**

Run: `npm test`

Expected: all tests PASS with no warnings or errors.

Run: `npm pack --dry-run --json --cache /private/tmp/turkish-lira-npm-cache`

Expected: package contains `package.json`, `README.md`, `LICENSE`, and `src/index.js`; it does not contain `demo/`, `test/`, root demo assets, `.idea/`, or `docs/superpowers/`.

Run: `npm install --package-lock-only --ignore-scripts --cache /private/tmp/turkish-lira-npm-cache`

Expected: reports zero vulnerabilities and installs no dependencies.

- [ ] **Step 5: Verify consumer import in a temporary directory**

Create a tarball with `npm pack --cache /private/tmp/turkish-lira-npm-cache`, install that exact tarball into a `mktemp -d` project, and execute:

```js
import { tryToTextConverter } from 'turkish-lira-number-to-text-converter';
console.log(tryToTextConverter('1.234,56'));
```

Expected output:

```text
BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ
```

Remove only the explicitly created temporary directory and generated tarball after verifying their exact paths.

- [ ] **Step 6: Review the final diff without staging local Markdown plans**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; `docs/superpowers/` is absent from status; unrelated `.idea/` files remain untouched.
