import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const expectedOutput = 'BİN İKİ YÜZ OTUZ DÖRT TÜRK LİRASI ELLİ ALTI KURUŞ';
const expectedFiles = [
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'package.json',
  'src/index.cjs',
  'src/index.d.ts',
  'src/index.js',
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

async function installTarball(consumerDirectory, tarballPath) {
  run(npmCommand, ['install', '--ignore-scripts', '--no-package-lock', tarballPath], {
    cwd: consumerDirectory,
  });
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'turkish-lira-package-'));

try {
  run(process.execPath, ['scripts/build-cjs.js'], { cwd: projectRoot });
  const packOutput = run(
    npmCommand,
    ['pack', '--json', '--ignore-scripts', '--pack-destination', temporaryRoot],
    { cwd: projectRoot },
  );
  const [packResult] = JSON.parse(packOutput);
  const packedFiles = packResult.files.map(({ path }) => path).sort();
  assert.deepEqual(packedFiles, expectedFiles);

  const tarballPath = join(temporaryRoot, packResult.filename);
  const esmDirectory = join(temporaryRoot, 'esm-consumer');
  const commonJsDirectory = join(temporaryRoot, 'commonjs-consumer');
  const typescriptDirectory = join(temporaryRoot, 'typescript-consumer');

  await Promise.all([mkdir(esmDirectory), mkdir(commonJsDirectory), mkdir(typescriptDirectory)]);

  await writeFile(join(esmDirectory, 'package.json'), '{"type":"module"}\n');
  await writeFile(
    join(esmDirectory, 'index.js'),
    "import { convertTurkishLiraToText } from 'turkish-lira-text-converter';\n" +
      "console.log(convertTurkishLiraToText('1.234,56'));\n",
  );
  await installTarball(esmDirectory, tarballPath);
  assert.equal(run(process.execPath, ['index.js'], { cwd: esmDirectory }).trim(), expectedOutput);

  await writeFile(join(commonJsDirectory, 'package.json'), '{"type":"commonjs"}\n');
  await writeFile(
    join(commonJsDirectory, 'index.cjs'),
    "const { convertTurkishLiraToText } = require('turkish-lira-text-converter');\n" +
      "console.log(convertTurkishLiraToText('1.234,56'));\n",
  );
  await installTarball(commonJsDirectory, tarballPath);
  assert.equal(
    run(process.execPath, ['index.cjs'], { cwd: commonJsDirectory }).trim(),
    expectedOutput,
  );

  await writeFile(join(typescriptDirectory, 'package.json'), '{"type":"module"}\n');
  await writeFile(
    join(typescriptDirectory, 'consumer.ts'),
    "import { convertTurkishLiraToText } from 'turkish-lira-text-converter';\n" +
      "const result: string = convertTurkishLiraToText('1.234,56');\n" +
      'void result;\n',
  );
  await installTarball(typescriptDirectory, tarballPath);
  const typescriptBinary = join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  run(
    process.execPath,
    [
      typescriptBinary,
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      '--strict',
      '--noEmit',
      'consumer.ts',
    ],
    { cwd: typescriptDirectory },
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
