import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('packed artifact works for ESM, CommonJS, and TypeScript consumers', () => {
  execFileSync(process.execPath, ['scripts/verify-package.js'], {
    cwd: root,
    stdio: 'pipe',
  });
});
