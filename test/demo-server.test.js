import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDemoServer } from '../demo/server.js';

const demoDirectory = fileURLToPath(new URL('../demo/', import.meta.url));

function requestPath(port, path) {
  return new Promise((resolve, reject) => {
    const request = get({ hostname: '127.0.0.1', port, path }, (response) => {
      response.resume();
      response.on('end', () => resolve(response));
    });
    request.on('error', reject);
  });
}

test('demo server serves the demo and library module', async (t) => {
  const server = createDemoServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const page = await fetch(`http://127.0.0.1:${port}/demo/`);
  const library = await fetch(`http://127.0.0.1:${port}/src/index.js`);
  const missing = await fetch(`http://127.0.0.1:${port}/missing.js`);

  assert.equal(page.status, 200);
  assert.match(await page.text(), /Turkish Lira Text Converter/u);
  assert.equal(library.status, 200);
  assert.match(library.headers.get('content-type'), /javascript/u);
  await library.text();
  assert.equal(missing.status, 404);
  await missing.text();
});

test('demo server rejects traversal-form raw request targets', async (t) => {
  const server = createDemoServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const traversalTargets = [
    '/../package.json',
    '/%2e%2e/package.json',
    '/demo/../../package.json',
    '/%2e%2e%2fpackage.json',
    '/demo/%2e%2e/%2e%2e/package.json',
  ];

  for (const target of traversalTargets) {
    const response = await requestPath(port, target);
    assert.equal(response.statusCode, 403, target);
  }
});

test('demo server rejects symlinks to files outside the project root', async (t) => {
  const outsideDirectory = await mkdtemp(join(tmpdir(), 'try-demo-server-'));
  const outsideFile = join(outsideDirectory, 'outside.txt');
  const linkPath = join(demoDirectory, `outside-${process.pid}-${Date.now()}.txt`);
  await writeFile(outsideFile, 'outside project root');

  try {
    await symlink(outsideFile, linkPath);
  } catch (error) {
    await rm(outsideDirectory, { recursive: true, force: true });
    t.skip(`symlinks unavailable: ${error.message}`);
    return;
  }

  t.after(async () => {
    await unlink(linkPath);
    await rm(outsideDirectory, { recursive: true, force: true });
  });

  const server = createDemoServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const { port } = server.address();
  const response = await requestPath(port, `/demo/${basename(linkPath)}`);

  assert.equal(response.statusCode, 403);
});
