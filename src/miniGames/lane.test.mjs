import assert from 'node:assert/strict';
import test from 'node:test';
import { generateLaneLevel, laneHtml } from './lane.ts';
import { mountGame } from './testHarness.mjs';

test('numbered lane levels replay exactly and have a reachable safe route', () => {
  for (let level = 1; level <= 500; level++) {
    const generated = generateLaneLevel(level);
    assert.deepEqual(generated, generateLaneLevel(level));
    assert.ok(generated.segments.length >= 10 && generated.segments.length <= 30);
    assert.ok(generated.durationMs >= 750 && generated.durationMs <= 1300);
    let previous = 1;
    let lastSwitch = -3;
    let available = 0;
    for (const [index, segment] of generated.segments.entries()) {
      assert.ok(Math.abs(segment.safe - previous) <= 1);
      if (segment.safe !== previous) {
        assert.ok(index - lastSwitch >= 2);
        lastSwitch = index;
      }
      assert.ok(!segment.blocks.includes(segment.safe));
      assert.ok(segment.blocks.every(lane => lane >= 0 && lane <= 2));
      if (segment.glow === segment.safe) available++;
      previous = segment.safe;
    }
    assert.ok(available >= generated.target);
  }
  assert.ok(generateLaneLevel(100).segments.length > generateLaneLevel(1).segments.length);
  assert.ok(generateLaneLevel(100).durationMs < generateLaneLevel(1).durationMs);
});

test('a player can follow the generated safe route and complete the native-selected level once', () => {
  const level = 3;
  const route = generateLaneLevel(level);
  const game = mountGame(laneHtml('en', level));
  const messages = [];
  game.window.ReactNativeWebView = { postMessage: message => messages.push(JSON.parse(message)) };
  const { document } = game;
  document.querySelector('#start').click();
  let lane = 1;
  for (const segment of route.segments) {
    while (lane < segment.safe) { document.querySelector('#right').click(); lane++; }
    while (lane > segment.safe) { document.querySelector('#left').click(); lane--; }
    game.fireNextTimeout();
  }
  assert.deepEqual(messages, [{ type: 'levelComplete', game: 'lane', level }]);
  assert.match(document.querySelector('#status').textContent, /complete/i);
  assert.equal(document.querySelector('#next'), null);
  document.querySelector('#restart').click();
  assert.equal(document.querySelector('#progress').textContent.includes('0'), true);
  game.close();
});

test('hitting a gate fails, and retry restores the same route', () => {
  const route = generateLaneLevel(100);
  const game = mountGame(laneHtml('en', 100));
  const { document } = game;
  document.querySelector('#start').click();
  const blocked = route.segments[0].blocks[0];
  assert.ok(blocked !== undefined);
  document.querySelector(blocked === 0 ? '#left' : '#right').click();
  game.fireNextTimeout();
  assert.match(document.querySelector('#status').textContent, /Gate hit/);
  assert.equal(document.querySelector('#next'), null);
  document.querySelector('#restart').click();
  assert.match(document.querySelector('#progress').textContent, /0/);
  game.close();
});

test('pause freezes progress and restart returns to the same level', () => {
  const game = mountGame(laneHtml('en', 50));
  const { document } = game;
  document.querySelector('#start').click();
  document.querySelector('#pause').click();
  assert.equal(document.querySelector('#status').textContent, 'Paused');
  assert.throws(() => game.fireNextTimeout(), /No pending timeout/);
  document.querySelector('#pause').click();
  game.fireNextTimeout();
  document.querySelector('#restart').click();
  assert.match(document.querySelector('#progress').textContent, /0/);
  game.close();
});
