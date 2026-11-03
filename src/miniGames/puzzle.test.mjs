import assert from 'node:assert/strict';
import test from 'node:test';
import { getMiniGameHtml } from './index.ts';
import { mountGame } from './testHarness.mjs';

test('number puzzle starts solvable and only moves tiles beside the empty cell', () => {
  const game = mountGame(getMiniGameHtml('puzzle'));
  const { document } = game;
  const start = document.querySelector('#start');
  assert.ok(start);
  start.click();
  const board = () => [...document.querySelectorAll('.tile')].map(tile => Number(tile.dataset.value));
  const initial = board();
  const originalTile = document.querySelector('.tile');
  game.tickIntervals();
  assert.equal(document.querySelector('.tile'), originalTile);
  assert.equal(initial.length, 9);
  assert.notDeepEqual(initial, [1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const values = initial.filter(Boolean);
  const inversions = values.reduce((total, value, index) => total + values.slice(index + 1).filter(next => next < value).length, 0);
  assert.equal(inversions % 2, 0);
  const empty = initial.indexOf(0);
  const distance = index => Math.abs(Math.floor(index / 3) - Math.floor(empty / 3)) + Math.abs(index % 3 - empty % 3);
  const distant = initial.findIndex((value, index) => value !== 0 && distance(index) > 1);
  document.querySelectorAll('.tile')[distant].click();
  assert.deepEqual(board(), initial);
  const adjacent = initial.findIndex((value, index) => value !== 0 && distance(index) === 1);
  document.querySelectorAll('.tile')[adjacent].click();
  assert.equal(board()[empty], initial[adjacent]);
  game.close();
});

test('number puzzle reports completion and offers a new round', () => {
  const game = mountGame(getMiniGameHtml('puzzle'));
  const { document, window } = game;
  document.querySelector('#start').click();
  window.eval('cells=[1,2,3,4,5,6,7,0,8]; draw();');
  document.querySelectorAll('.tile')[8].click();
  assert.match(document.querySelector('#status').textContent, /Puzzle complete/);
  assert.match(document.querySelector('#result').textContent, /Moves: 1/);
  document.querySelector('#start').click();
  assert.equal(document.querySelector('#steps').textContent, 'Moves: 0');
  game.close();
});
