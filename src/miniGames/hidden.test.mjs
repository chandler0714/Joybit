import assert from 'node:assert/strict';
import test from 'node:test';
import { generateHiddenLevel, hiddenHtml } from './hidden.ts';
import { mountGame } from './testHarness.mjs';

test('Hidden Nook levels 1–100, 101 and 500 are deterministic and have separated visible objects', () => {
  for (const number of [...Array(100)].map((_, index) => index + 1).concat([101, 500])) {
    const level = generateHiddenLevel(number);
    assert.deepEqual(level, generateHiddenLevel(number));
    assert.equal(level.number, number);
    assert.ok(level.targets.length >= 3 && level.targets.length <= 6);
    assert.ok(level.objects.length >= 10 && level.objects.length <= 18);
    assert.ok(level.seconds >= 95 && level.seconds <= 180);
    assert.equal(new Set(level.objects.map(object => object.kind)).size, level.objects.length);
    assert.equal(new Set(level.objects.map(object => object.slot)).size, level.objects.length);
    for (const object of level.objects) {
      assert.ok(object.x >= 10 && object.x <= 90);
      assert.ok(object.y >= 8 && object.y <= 92);
      for (const other of level.objects) {
        if (other === object) continue;
        assert.ok(Math.hypot(object.x - other.x, object.y - other.y) >= 14, `level ${number} overlapping objects`);
      }
    }
    assert.ok(level.targets.every(kind => level.objects.some(object => object.kind === kind)));
  }
  assert.ok(generateHiddenLevel(100).objects.length > generateHiddenLevel(1).objects.length);
});

test('Hidden Nook hints, pause, restart and finding targets drive one completion message', () => {
  const level = generateHiddenLevel(1);
  const game = mountGame(hiddenHtml('en', 1));
  const messages = [];
  game.window.ReactNativeWebView = { postMessage: message => messages.push(JSON.parse(message)) };
  const { document } = game;
  assert.equal(document.querySelectorAll('.object').length, level.objects.length);
  document.querySelector('#start').click();
  document.querySelector('#hint').click();
  assert.equal(document.querySelector('#hints-left').textContent, '1');
  document.querySelector('#pause').click();
  const first = document.querySelector(`.object[data-kind="${level.targets[0]}"]`);
  first.click();
  assert.equal(document.querySelector('#found').textContent, `0 / ${level.targets.length}`);
  document.querySelector('#pause').click();
  first.click();
  assert.equal(document.querySelector('#found').textContent, `1 / ${level.targets.length}`);
  document.querySelector('#restart').click();
  assert.equal(document.querySelector('#found').textContent, `0 / ${level.targets.length}`);
  document.querySelector('#start').click();
  for (const kind of level.targets) document.querySelector(`.object[data-kind="${kind}"]`).click();
  assert.deepEqual(messages, [{ type: 'levelComplete', game: 'hidden', level: 1 }]);
  assert.match(document.querySelector('#status').textContent, /found/i);
  game.close();
});

test('Hidden Nook timer stops while paused and can time out', () => {
  const game = mountGame(hiddenHtml('en', 100));
  const { document } = game;
  document.querySelector('#start').click();
  const initial = document.querySelector('#time').textContent;
  document.querySelector('#pause').click();
  game.tickIntervals();
  assert.equal(document.querySelector('#time').textContent, initial);
  document.querySelector('#pause').click();
  for (let i = 0; i < 180; i++) game.tickIntervals();
  assert.match(document.querySelector('#status').textContent, /time/i);
  assert.equal(document.querySelector('.object').disabled, true);
  game.close();
});

test('Hidden Nook auto-pauses when document becomes hidden', () => {
  const game = mountGame(hiddenHtml('en', 100));
  const { document, window } = game;
  document.querySelector('#start').click();
  const beforeHide = document.querySelector('#time').textContent;
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new window.Event('visibilitychange'));
  game.tickIntervals();
  assert.equal(document.querySelector('#time').textContent, beforeHide);
  assert.equal(document.querySelector('#pause').textContent, 'Resume');
  assert.equal(document.querySelector('.object').disabled, true);
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new window.Event('visibilitychange'));
  assert.equal(document.querySelector('#time').textContent, beforeHide);
  document.querySelector('#pause').click();
  game.tickIntervals();
  assert.equal(Number(document.querySelector('#time').textContent), Number(beforeHide) - 1);
  game.close();
});

test('all seven locales render key controls', () => {
  for (const locale of ['en', 'ja', 'ko', 'fr', 'es', 'ru', 'de']) {
    const html = hiddenHtml(locale, 101);
    assert.match(html, /id="start"/);
    assert.match(html, /id="hint"/);
    assert.match(html, /id="pause"/);
    assert.match(html, /id="restart"/);
    assert.ok(!html.includes('undefined'));
  }
});
