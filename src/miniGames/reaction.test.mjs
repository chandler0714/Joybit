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
  assert.match(document.querySelector('#status').textContent, /Too soon/);
  for (let round = 0; round < 5; round++) {
    action.click();
    game.fireNextTimeout();
    game.advance(240 + round * 10);
    action.click();
  }
  assert.match(document.querySelector('#status').textContent, /complete/);
  assert.match(document.querySelector('#result').textContent, /Average/);
  assert.match(document.querySelector('#result').textContent, /Best/);
  action.click();
  assert.doesNotMatch(document.querySelector('#result').textContent, /Average/);
  game.close();
});
