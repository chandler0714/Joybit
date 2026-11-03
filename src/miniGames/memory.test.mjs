import assert from 'node:assert/strict';
import test from 'node:test';
import { getMiniGameHtml } from './index.ts';
import { mountGame } from './testHarness.mjs';

test('memory game has eight pairs and locks a mismatch until hidden', () => {
  const game = mountGame(getMiniGameHtml('memory'));
  const { document } = game;
  const start = document.querySelector('#start');
  assert.ok(start);
  start.click();
  const cards = [...document.querySelectorAll('.card')];
  assert.equal(cards.length, 16);
  const counts = new Map();
  cards.forEach(card => counts.set(card.dataset.symbol, (counts.get(card.dataset.symbol) ?? 0) + 1));
  assert.deepEqual([...counts.values()].sort(), Array(8).fill(2));
  const first = cards[0];
  const second = cards.find(card => card.dataset.symbol !== first.dataset.symbol);
  const third = cards.find(card => card !== first && card !== second);
  first.click(); second.click(); third.click();
  assert.equal(third.classList.contains('open'), false);
  game.fireNextTimeout();
  assert.equal(first.classList.contains('open'), false);
  third.click();
  assert.equal(third.classList.contains('open'), true);
  game.close();
});

test('memory game completes all pairs and can restart', () => {
  const game = mountGame(getMiniGameHtml('memory'));
  const { document } = game;
  document.querySelector('#start').click();
  const groups = new Map();
  [...document.querySelectorAll('.card')].forEach(card => groups.set(card.dataset.symbol, [...(groups.get(card.dataset.symbol) ?? []), card]));
  for (const pair of groups.values()) { pair[0].click(); pair[1].click(); }
  assert.match(document.querySelector('#status').textContent, /全部配对完成/);
  assert.match(document.querySelector('#result').textContent, /8 次/);
  document.querySelector('#start').click();
  assert.equal(document.querySelector('#moves').textContent, '翻牌 0 次');
  assert.equal(document.querySelectorAll('.card').length, 16);
  game.close();
});
