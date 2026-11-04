import assert from 'node:assert/strict';
import test from 'node:test';
import { generateStarLevel, routeStarLevel, solveStarLevel, starHtml } from './star.ts';
import { mountGame } from './testHarness.mjs';

test('numbered Star Trail boards replay exactly and stay solvable at bounded size', () => {
  for (const number of [...Array(100)].map((_, i) => i + 1).concat([101, 250, 500])) {
    const level = generateStarLevel(number);
    assert.deepEqual(level, generateStarLevel(number));
    assert.ok(level.gates.length >= 3 && level.gates.length <= 7);
    assert.ok(level.stars.length >= 1 && level.stars.length <= 3);
    const solution = solveStarLevel(level);
    assert.ok(solution, `level ${number} has a route`);
    assert.equal(routeStarLevel(level, solution).won, true);
    assert.equal(routeStarLevel(level, solution).collected, level.stars.length);
  }
  assert.notDeepEqual(generateStarLevel(50), generateStarLevel(51));
});

test('changing a gate can miss a star and prevent completion', () => {
  const level = generateStarLevel(50);
  const solution = solveStarLevel(level);
  const missed = solution.map(direction => -direction);
  assert.equal(routeStarLevel(level, missed).won, false);
});

test('Star Trail plays, pauses, restarts, and emits one completion', () => {
  const level = generateStarLevel(1);
  const solution = solveStarLevel(level);
  const game = mountGame(starHtml('en', 1));
  const messages = [];
  game.window.ReactNativeWebView = { postMessage: message => messages.push(JSON.parse(message)) };
  const { document } = game;
  assert.equal(document.querySelectorAll('.gate').length, level.gates.length);
  solution.forEach((direction, row) => { if (direction === -1) document.querySelectorAll('.gate')[row].click(); });
  document.querySelector('#launch').click();
  document.querySelector('#pause').click();
  assert.throws(() => game.fireNextTimeout(), /No pending timeout/);
  document.querySelector('#pause').click();
  for (let row = 0; row < level.gates.length; row++) game.fireNextTimeout();
  assert.deepEqual(messages, [{ type: 'levelComplete', game: 'star', level: 1 }]);
  assert.match(document.querySelector('#status').textContent, /Complete/);
  document.querySelector('#restart').click();
  assert.equal(document.querySelector('#collected').textContent, `0 / ${level.stars.length}`);
  assert.deepEqual(messages, [{ type: 'levelComplete', game: 'star', level: 1 }]);
  game.close();
});

test('hiding the document auto-pauses without advancing the orb', () => {
  const game = mountGame(starHtml('en', 1));
  game.document.querySelector('#launch').click();
  Object.defineProperty(game.document, 'hidden', { configurable: true, value: true });
  game.document.dispatchEvent(new game.window.Event('visibilitychange'));
  assert.throws(() => game.fireNextTimeout(), /No pending timeout/);
  assert.match(game.document.querySelector('#status').textContent, /Paused/);
  Object.defineProperty(game.document, 'hidden', { configurable: true, value: false });
  game.document.querySelector('#pause').click();
  game.fireNextTimeout();
  assert.equal(game.document.querySelector('#collected').textContent, '1 / 1');
  game.close();
});

test('leaving the page clears an active Star Trail timer', () => {
  const game = mountGame(starHtml('en', 1));
  game.document.querySelector('#launch').click();
  game.window.dispatchEvent(new game.window.Event('pagehide'));
  assert.throws(() => game.fireNextTimeout(), /No pending timeout/);
  game.close();
});
