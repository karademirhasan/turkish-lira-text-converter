# npm Release Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a dependency-free Turkish-lira converter with one clear API that is verified in Node.js, CommonJS, TypeScript, browser-targeted builds, and the actual npm tarball.

**Architecture:** `src/index.js` remains the canonical ESM implementation and `scripts/build-cjs.js` generates the CommonJS entry. Package-level verification packs the project and installs the tarball into isolated consumers, while a browser-targeted esbuild smoke test rejects Node-only dependencies and executes the bundled API. GitHub Actions runs the same checks before an OIDC-based npm publish.

**Tech Stack:** JavaScript ESM/CommonJS, Node.js 22+, TypeScript, node:test, esbuild, npm pack, GitHub Actions, npm Trusted Publishing

**Spec:** `docs/superpowers/specs/2026-08-30-npm-release-hardening-design.md`

## Global Constraints

- The only public function is `convertTurkishLiraToText(amount: number | string): string`.
- Do not retain `tryToTextConverter` or `TryToTextConverter` aliases.
- Support Node.js `>=22`; CI targets Node.js 22 and 24.
- Keep runtime dependencies empty; browser tooling may be a development dependency only.
- Keep ESM, CommonJS, TypeScript, bundler/browser, and direct CDN usage documented.
- Publish with npm Trusted Publishing/OIDC and no `NPM_TOKEN` secret.
- Preserve the converter's existing accepted inputs, output text, and error classes.

---

### Task 1: Rename the Public API

**Files:**
- Modify: `test/package-entry.test.js`
- Modify: `test/commonjs-entry.test.cjs`
- Modify: `test/cjs-generation.test.cjs`
- Modify: `test/converter.test.js`
- Modify: `type-tests/consumer.ts`
- Modify: `src/index.js`
- Modify: `src/index.d.ts`
- Modify: `scripts/build-cjs.js`
- Generate: `src/index.cjs`
- Modify: `demo/demo.js`

**Interfaces:**
- Produces: `convertTurkishLiraToText(amount: number | string): string`
- Removes: `tryToTextConverter` and `TryToTextConverter`

- [ ] **Step 1: Change the package-entry tests to require the new sole export**

```js
import * as converter from 'turkish-lira-number-to-text-converter';

test('package self-reference exposes only convertTurkishLiraToText', () => {
  assert.deepEqual(Object.keys(converter), ['convertTurkishLiraToText']);
  assert.equal(typeof converter.convertTurkishLiraToText, 'function');
});
```

Use the same literal key assertion in the CommonJS test and replace every test call with `convertTurkishLiraToText`.

- [ ] **Step 2: Run the entry tests and verify RED**

Run: `node --test test/package-entry.test.js test/commonjs-entry.test.cjs`

Expected: FAIL because the package still exports `tryToTextConverter`.

- [ ] **Step 3: Rename the implementation, declarations, generator, demo, and type consumer**

End `src/index.js` with:

```js
function convertTurkishLiraToText(amount) {
  const { liraDigits, cents } = normalizeLiraAmount(amount);
  const resultWords = [...liraIntegerToWords(liraDigits), 'TÜRK', 'LİRASI'];

  if (cents !== 0) resultWords.push(...threeDigitGroupToWords(cents), 'KURUŞ');

  return resultWords.join(' ');
}

export { convertTurkishLiraToText };
```

Declare exactly:

```ts
export declare function convertTurkishLiraToText(amount: number | string): string;
```

Update the CJS generator's export matcher and replacement to
`module.exports = { convertTurkishLiraToText };`, then run `npm run build:cjs`.

- [ ] **Step 4: Run API tests and type checking and verify GREEN**

Run: `npm test && npm run typecheck`

Expected: all tests and type checks PASS with no old public identifier.

- [ ] **Step 5: Confirm the old API is absent and commit**

Run: `rg -n "tryToTextConverter|TryToTextConverter" src test demo scripts type-tests README.md`

Expected: no matches after README is temporarily updated to the new identifier where necessary.

```bash
git add src test demo scripts type-tests README.md
git commit -m "feat: rename Turkish lira converter API"
```

---

### Task 2: Modernize Package Metadata and Node Support

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.github/workflows/ci.yml`
- Test: `test/package-metadata.test.js`

**Interfaces:**
- Produces: ESM `./src/index.js`, CommonJS `./src/index.cjs`, types `./src/index.d.ts`
- Supports: Node.js 22 and 24

- [ ] **Step 1: Add a metadata contract test**

```js
test('package metadata exposes typed ESM and CommonJS entries for Node 22+', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(packageJson.engines.node, '>=22');
  assert.equal(packageJson.main, './src/index.cjs');
  assert.equal(packageJson.module, './src/index.js');
  assert.equal(packageJson.types, './src/index.d.ts');
  assert.deepEqual(packageJson.exports['.'], {
    types: './src/index.d.ts',
    import: './src/index.js',
    require: './src/index.cjs',
  });
  assert.equal(packageJson.dependencies, undefined);
});
```

- [ ] **Step 2: Run the metadata test and verify RED**

Run: `node --test test/package-metadata.test.js`

Expected: FAIL because `engines.node`, `main`, `module`, and the `types` export condition do not match.

- [ ] **Step 3: Update package metadata and lock metadata**

Set:

```json
"description": "Convert Turkish lira amounts to uppercase Turkish text in Node.js and browsers",
"main": "./src/index.cjs",
"module": "./src/index.js",
"types": "./src/index.d.ts",
"exports": {
  ".": {
    "types": "./src/index.d.ts",
    "import": "./src/index.js",
    "require": "./src/index.cjs"
  }
},
"engines": { "node": ">=22" }
```

Replace keywords with `turkish-lira`, `number-to-words`, `currency-to-text`,
`amount-to-words`, `try`, `turkish`, `lira`, `browser`, and `node`. Regenerate
lock metadata with `npm install --package-lock-only --ignore-scripts`.

- [ ] **Step 4: Change the CI Node matrix and verify GREEN**

Set `node-version: [22, 24]`, then run:

```bash
node --test test/package-metadata.test.js
npm ci --ignore-scripts
npm test
```

Expected: all commands PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .github/workflows/ci.yml test/package-metadata.test.js
git commit -m "chore: modernize package entry metadata"
```

---

### Task 3: Expand Financial Boundary Coverage

**Files:**
- Modify: `test/converter.test.js`
- Modify only if a test reveals a defect: `src/index.js`
- Regenerate only if source changes: `src/index.cjs`

**Interfaces:**
- Consumes: `convertTurkishLiraToText(amount: number | string): string`
- Protects: existing parsing, scale, output normalization, and error contracts

- [ ] **Step 1: Add literal boundary tests**

Add table-driven cases for:

```js
[
  ['0,01', 'SIFIR TÜRK LİRASI BİR KURUŞ'],
  ['0,10', 'SIFIR TÜRK LİRASI ON KURUŞ'],
  ['1,01', 'BİR TÜRK LİRASI BİR KURUŞ'],
  ['000012,30', 'ON İKİ TÜRK LİRASI OTUZ KURUŞ'],
  [-0, 'SIFIR TÜRK LİRASI'],
]
```

Assert every scale name by constructing one nonzero three-digit group at each
supported scale and comparing against a hand-written literal list. Assert the
66-digit upper boundary passes and the 67-digit value throws `RangeError`.
Assert malformed grouping (`'12.34.567'`, `'1.23,45'`, `'1 234,56'`), Unicode
spaces, and signed zero string (`'-0'`) throw their existing error classes.

- [ ] **Step 2: Run the focused tests**

Run: `node --test test/converter.test.js`

Expected: PASS if the established behavior already covers every case; any
failure must name a real mismatch in the existing documented contract before
production code is changed.

- [ ] **Step 3: Add output invariant assertions**

For the valid table, assert:

```js
assert.equal(/\d/u.test(result), false);
assert.equal(result.includes('undefined'), false);
assert.equal(result, result.trim());
assert.equal(/\s{2,}|[\r\n\t]/u.test(result), false);
```

- [ ] **Step 4: Run full tests and rebuild when needed**

Run: `npm test && npm run build:cjs`

Expected: PASS and a deterministic CommonJS output.

- [ ] **Step 5: Commit**

```bash
git add test/converter.test.js src/index.js src/index.cjs
git commit -m "test: cover Turkish lira conversion boundaries"
```

---

### Task 4: Verify the Actual npm Tarball in Consumer Projects

**Files:**
- Create: `CHANGELOG.md`
- Create: `scripts/verify-package.js`
- Modify: `package.json`
- Test: `test/package-verification.test.js`

**Interfaces:**
- Produces command: `npm run verify:package`
- Consumes: tarball created by `npm pack --json`

- [ ] **Step 1: Add a test that invokes the missing verifier**

```js
test('packed artifact works for ESM, CommonJS, and TypeScript consumers', () => {
  execFileSync(process.execPath, ['scripts/verify-package.js'], {
    cwd: root,
    stdio: 'pipe',
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test test/package-verification.test.js`

Expected: FAIL with `MODULE_NOT_FOUND` for `scripts/verify-package.js`.

- [ ] **Step 3: Add the initial changelog and implement isolated tarball verification**

Create `CHANGELOG.md` with a `0.1.0` section listing conversion,
ESM/CommonJS, TypeScript, browser compatibility, validation, and a
dependency-free runtime. Add `CHANGELOG.md` to `package.json#files`.

The ESM script must use `mkdtemp`, `rm`, `writeFile`, `execFileSync`, and a
`try/finally` cleanup. Run `npm pack --json --pack-destination <temp>`, parse
the generated filename and file list, and assert the tarball contains exactly:

```js
[
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'package.json',
  'src/index.cjs',
  'src/index.d.ts',
  'src/index.js',
]
```

Create an ESM consumer and a CommonJS consumer, install the absolute tarball
with `npm install --ignore-scripts`, and assert both print:
`BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ`.

Create a TypeScript consumer importing `convertTurkishLiraToText`, install the
tarball without scripts, and invoke the repository's TypeScript binary with
`--module NodeNext --moduleResolution NodeNext --target ES2022 --strict --noEmit`.

- [ ] **Step 4: Wire and run package verification**

Add:

```json
"verify:package": "node scripts/verify-package.js"
```

Run: `npm run verify:package`

Expected: PASS, with all temporary directories removed.

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md scripts/verify-package.js test/package-verification.test.js package.json package-lock.json
git commit -m "test: verify packed npm consumers"
```

---

### Task 5: Add Browser-Targeted Package Verification

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `test/browser-entry.test.js`

**Interfaces:**
- Produces command: `npm run test:browser`
- Consumes: package self-reference `turkish-lira-number-to-text-converter`

- [ ] **Step 1: Add a browser-platform bundle smoke test before installing esbuild**

The test imports `build` from `esbuild` and supplies an in-memory browser entry
that imports `convertTurkishLiraToText` from the package name, assigns the
conversion result to `globalThis.__conversionResult`, and bundles with the
repository root as `resolveDir`:

```js
await build({
  stdin: {
    contents: `import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';\n` +
      `globalThis.__conversionResult = convertTurkishLiraToText('1.234,56');`,
    resolveDir: root,
  },
  bundle: true,
  platform: 'browser',
  format: 'iife',
  outfile: bundlePath,
});
```

Execute the generated dependency-free IIFE using `vm.runInNewContext`, then
assert the global result equals the known `1.234,56` output. Always remove the
temporary directory in `t.after`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test test/browser-entry.test.js`

Expected: FAIL because the `esbuild` development dependency is absent.

- [ ] **Step 3: Install browser build tooling and add the script**

Run: `npm install --save-dev esbuild`

Add:

```json
"test:browser": "node --test test/browser-entry.test.js"
```

- [ ] **Step 4: Run browser and full verification and verify GREEN**

Run: `npm run test:browser && npm test && npm run verify:package`

Expected: all commands PASS and the packed artifact still has no runtime dependencies.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json test/browser-entry.test.js
git commit -m "test: verify browser package entry"
```

---

### Task 6: Finish Documentation and Trusted Publishing

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/publish.yml`
- Modify: `package.json`
- Modify: `docs/superpowers/specs/2026-08-29-pure-js-library-design.md`
- Modify: `docs/superpowers/plans/2026-08-29-pure-js-library.md`

**Interfaces:**
- Produces: documented Node/browser API and tokenless release workflow
- Requires external setup: npm trusted publisher linked to `.github/workflows/publish.yml`

- [ ] **Step 1: Review changelog and published file metadata**

Confirm `CHANGELOG.md` has a `0.1.0` section listing conversion, ESM/CommonJS,
TypeScript, browser compatibility, validation, and dependency-free runtime;
confirm it remains in `package.json#files`.

- [ ] **Step 2: Rewrite README consumer examples**

Use only `convertTurkishLiraToText`. Include install, Node ESM, CommonJS,
TypeScript, bundler, and direct CDN module examples; explain that bare package
names require a bundler or import map in browsers. Document accepted formats,
errors, the vigintillion boundary, omitted zero-kuruş output, Node `>=22`, and
zero runtime dependencies.

- [ ] **Step 3: Update historical local design documents**

Replace stale public API names and Node/runtime claims in both 2026-08-29
documents while retaining their historical purpose. Mark completed plan
checkboxes as complete where the repository provides evidence.

- [ ] **Step 4: Strengthen CI and publishing workflows**

In CI, run `npm run build:cjs`, `npm run test:browser`, and
`npm run verify:package` after the standard checks.

In publish workflow:

- use Node.js 24,
- retain `permissions: contents: read` and `id-token: write`,
- verify `${GITHUB_REF_NAME#v}` equals `node -p "require('./package.json').version"`,
- run `npm run build:cjs`, tests, typecheck, lint, format, browser, and package verification,
- run `npm publish --access public` without `NODE_AUTH_TOKEN` and without the redundant provenance flag.

- [ ] **Step 5: Run the full release gate**

Run:

```bash
npm ci --ignore-scripts
npm run build:cjs
npm test
npm run typecheck
npm run lint
npm run format:check
npm run test:browser
npm run verify:package
npm pack --dry-run
git diff --check
```

Expected: every command exits 0; the tarball contains only the seven approved files.

- [ ] **Step 6: Commit**

```bash
git add README.md CHANGELOG.md package.json package-lock.json .github/workflows docs/superpowers
git commit -m "docs: prepare package for npm release"
```

## External Release Checklist

- Configure npm Trusted Publishing for the GitHub repository and workflow file `.github/workflows/publish.yml` with publish permission.
- Enable npm account 2FA and restrict or revoke legacy automation tokens after the trusted publisher succeeds.
- Confirm the unscoped package name is available or change `name` to an owned npm scope before tagging.
- Push `main`, confirm CI passes, then create tag `v0.1.0` on the same commit.
