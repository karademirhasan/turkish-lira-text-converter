import test from 'node:test';
import assert from 'node:assert/strict';
import { TryToTextConverter, tryToTextConverter } from 'turkish-lira-number-to-text-converter';

test('package self-reference exposes the public converter and legacy alias', () => {
  assert.equal(typeof tryToTextConverter, 'function');
  assert.equal(TryToTextConverter, tryToTextConverter);
});
