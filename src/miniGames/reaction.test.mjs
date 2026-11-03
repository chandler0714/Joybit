import assert from 'node:assert/strict';
import test from 'node:test';
import { getMiniGameHtml } from './index.ts';
import { mountGame } from './testHarness.mjs';

test('reaction game catches false starts and scores five real taps', () => {
  const game = mountGame(getMiniGameHtml('reaction'));
  const { document } = game;
  const action = document.querySelector('#action');
  assert.ok(action);
  action.click();
  action.click();
  assert.match(document.querySelector('#status').textContent, /抢跑/);
  for (let round = 0; round < 5; round++) {
    action.click();
    game.fireNextTimeout();
    game.advance(240 + round * 10);
    action.click();
  }
  assert.match(document.querySelector('#status').textContent, /完成/);
  assert.match(document.querySelector('#result').textContent, /平均/);
  assert.match(document.querySelector('#result').textContent, /最佳/);
  action.click();
  assert.doesNotMatch(document.querySelector('#result').textContent, /平均/);
  game.close();
});
