import test from 'node:test';
import assert from 'node:assert/strict';
import * as converter from 'turkish-lira-text-converter';

test('package self-reference exposes only convertTurkishLiraToText', () => {
  assert.deepEqual(Object.keys(converter), ['convertTurkishLiraToText']);
  assert.equal(typeof converter.convertTurkishLiraToText, 'function');
});
