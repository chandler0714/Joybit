import assert from 'node:assert/strict';
import test from 'node:test';
import { generateKitchenLevel, kitchenHtml } from './kitchen.ts';
import { mountGame } from './testHarness.mjs';

test('numbered kitchen levels are deterministic, bounded, and contain achievable orders', () => {
  for (const level of [...Array.from({ length: 100 }, (_, index) => index + 1), 101, 500]) {
    const config = generateKitchenLevel(level);
    assert.deepEqual(config, generateKitchenLevel(level));
    assert.equal(config.level, level);
    assert.ok(config.orders.length >= 2 && config.orders.length <= 6);
    assert.ok(config.activeSlots >= 1 && config.activeSlots <= 3);
    assert.ok(config.timeLimitSec >= 45 && config.timeLimitSec <= 180);
    assert.ok(config.orders.every(order => order.steps.length >= 2 && order.steps.length <= 4));
    assert.ok(config.orders.every(order => order.steps.every(step => config.actions.includes(step))));
    const minimum = config.orders.reduce((sum, order) => sum + order.steps.length * 5 + 4, 0);
    assert.ok(config.timeLimitSec >= minimum, `level ${level} must allow five seconds per step and delivery`);
  }
  assert.ok(generateKitchenLevel(100).orders.length > generateKitchenLevel(1).orders.length);
  assert.ok(generateKitchenLevel(100).activeSlots > generateKitchenLevel(1).activeSlots);
});

test('player can assemble all recipes and complete once', () => {
  const level = 34;
  const config = generateKitchenLevel(level);
  const game = mountGame(kitchenHtml('en', level));
  const messages = [];
  game.window.ReactNativeWebView = { postMessage: message => messages.push(JSON.parse(message)) };
  const { document } = game;
  document.querySelector('#start').click();
  for (const order of config.orders) {
    document.querySelector(`[data-order="${order.id}"]`).click();
    for (const action of order.steps) document.querySelector(`[data-action="${action}"]`).click();
    document.querySelector('#deliver').click();
  }
  assert.deepEqual(messages, [{ type: 'levelComplete', game: 'kitchen', level }]);
  assert.match(document.querySelector('#status').textContent, /complete/i);
  assert.equal(document.querySelector('#deliver').disabled, true);
  game.close();
});

test('pause blocks cooking and freezes clock; retry restores original orders', () => {
  const level = 50;
  const config = generateKitchenLevel(level);
  const game = mountGame(kitchenHtml('en', level));
  const { document } = game;
  document.querySelector('#start').click();
  const originalClock = document.querySelector('#clock').textContent;
  document.querySelector('#pause').click();
  assert.match(document.querySelector('#status').textContent, /Paused/);
  assert.throws(() => game.fireNextTimeout(), /No pending timeout/);
  document.querySelector(`[data-action="${config.orders[0].steps[0]}"]`).click();
  assert.equal(document.querySelector('#step-progress').textContent, '0 / ' + config.orders[0].steps.length);
  document.querySelector('#pause').click();
  assert.equal(document.querySelector('#clock').textContent, originalClock);
  game.fireNextTimeout();
  assert.notEqual(document.querySelector('#clock').textContent, originalClock);
  document.querySelector('#restart').click();
  assert.equal(document.querySelector('#clock').textContent, originalClock);
  assert.equal(document.querySelector('#done').textContent, `0 / ${config.orders.length}`);
  game.close();
});

test('wrong step cannot fulfil order and expired clock ends the round', () => {
  const config = generateKitchenLevel(1);
  const game = mountGame(kitchenHtml('en', 1));
  const { document } = game;
  document.querySelector('#start').click();
  const wrong = config.actions.find(action => action !== config.orders[0].steps[0]);
  document.querySelector(`[data-action="${wrong}"]`).click();
  assert.equal(document.querySelector('#deliver').disabled, true);
  for (let second = 0; second < config.timeLimitSec; second++) game.fireNextTimeout();
  assert.match(document.querySelector('#status').textContent, /time/i);
  assert.equal(document.querySelector('#deliver').disabled, true);
  document.querySelector('#restart').click();
  assert.equal(document.querySelector('#clock').textContent, String(config.timeLimitSec));
  game.close();
});

test('key UI strings exist in seven languages', () => {
  for (const locale of ['en', 'ja', 'ko', 'fr', 'es', 'ru', 'de']) {
    const html = kitchenHtml(locale, 2);
    assert.match(html, new RegExp(`<html lang="${locale}"`));
    assert.match(html, /id="start"/);
    assert.match(html, /id="pause"/);
    assert.match(html, /id="restart"/);
    assert.match(html, /id="deliver"/);
  }
});
