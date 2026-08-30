import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('..', import.meta.url));

test('package entry bundles and runs for browsers', async (t) => {
  const outputDirectory = join(tmpdir(), `turkish-lira-browser-${process.pid}-${Date.now()}`);
  const bundlePath = join(outputDirectory, 'bundle.js');
  t.after(() => rm(outputDirectory, { recursive: true, force: true }));

  await build({
    stdin: {
      contents:
        "import { convertTurkishLiraToText } from 'turkish-lira-number-to-text-converter';\n" +
        "globalThis.__conversionResult = convertTurkishLiraToText('1.234,56');",
      resolveDir: root,
    },
    bundle: true,
    platform: 'browser',
    format: 'iife',
    outfile: bundlePath,
  });

  const context = {};
  runInNewContext(await readFile(bundlePath, 'utf8'), context);
  assert.equal(context.__conversionResult, 'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ');
});
