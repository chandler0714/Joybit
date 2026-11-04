import assert from 'node:assert/strict';
import test from 'node:test';
import { loadUnlocked, recordCompletion, parseCompletionMessage } from './levels.ts';

function memoryStore() {
  const values = new Map();
  return { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
}

test('unlock progress belongs to the account and game and never moves backwards', async () => {
  const store = memoryStore();
  assert.equal(await loadUnlocked(store, 'alice', 'hex'), 1);
  assert.equal(await recordCompletion(store, 'alice', 'hex', 1), 2);
  assert.equal(await recordCompletion(store, 'alice', 'hex', 1), 2);
  assert.equal(await loadUnlocked(store, 'bob', 'hex'), 1);
  assert.equal(await loadUnlocked(store, 'alice', 'star'), 1);
  assert.equal(await loadUnlocked(store, 'alice', 'hex'), 2);
});

test('completion bridge accepts only the currently played numbered level', () => {
  assert.deepEqual(parseCompletionMessage('{"type":"levelComplete","game":"hex","level":3}', 'hex', 3), { game: 'hex', level: 3 });
  for (const message of ['bad', '{"type":"levelComplete","game":"star","level":3}', '{"type":"levelComplete","game":"hex","level":4}', '{"type":"levelComplete","game":"hex","level":3.5}']) {
    assert.equal(parseCompletionMessage(message, 'hex', 3), null);
  }
});
