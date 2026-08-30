import test from 'node:test';
import assert from 'node:assert/strict';
import * as converter from 'turkish-lira-number-to-text-converter';

test('package self-reference exposes only tryToTextConverter', () => {
  assert.deepEqual(Object.keys(converter), ['tryToTextConverter']);
  assert.equal(typeof converter.tryToTextConverter, 'function');
});
