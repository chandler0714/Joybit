import assert from 'node:assert/strict';
import test from 'node:test';
import { GAMES } from './catalog.ts';
import { formatPlayedCount } from './formatPlayedCount.ts';

test('unknown and invalid played counts have no label', () => {
  assert.equal(formatPlayedCount(null), null);
  assert.equal(formatPlayedCount(-1), null);
});

test('played counts below one thousand stay exact', () => {
  assert.equal(formatPlayedCount(0), '0');
  assert.equal(formatPlayedCount(999), '999');
});

test('played counts use floored integer units from one thousand', () => {
  assert.equal(formatPlayedCount(1000, 'en'), '1K');
  assert.equal(formatPlayedCount(9999, 'en'), '9K');
  assert.equal(formatPlayedCount(10000, 'ja'), '1万');
  assert.equal(formatPlayedCount(123456789, 'ko'), '1억');
  assert.equal(formatPlayedCount(1500000, 'fr'), '1M');
});

test('catalog contains the native game and three bundled mini games without invented counts', () => {
  assert.deepEqual(GAMES.map(({ id, kind }) => ({ id, kind })), [
    { id: 'steady-drop', kind: 'native' },
    { id: 'reaction', kind: 'h5' },
    { id: 'memory', kind: 'h5' },
    { id: 'puzzle', kind: 'h5' },
  ]);
  assert.ok(GAMES.every(game => game.playedCount === null));
});
