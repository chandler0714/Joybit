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
  assert.equal(formatPlayedCount(1000), '1千');
  assert.equal(formatPlayedCount(9999), '9千');
  assert.equal(formatPlayedCount(10000), '1万');
  assert.equal(formatPlayedCount(123456789), '1亿');
});

test('catalog contains only the available first game', () => {
  assert.deepEqual(GAMES.map(({ id, kind }) => ({ id, kind })), [
    { id: 'steady-drop', kind: 'native' },
  ]);
  assert.equal(GAMES[0].playedCount, null);
});
