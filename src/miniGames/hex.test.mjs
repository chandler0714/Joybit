import assert from 'node:assert/strict';
import test from 'node:test';
import { hexHtml } from './hex.ts';
import { mountGame } from './testHarness.mjs';

test('seeded levels reproduce and every wave through level 100 has a legal winning sequence', () => {
  const game = mountGame(hexHtml('en', 1));
  const { generate, solveWave, canPlace, place } = game.window.hexGame;
  for (const level of [...Array.from({length: 100}, (_, i) => i + 1), 101, 256]) {
    const a = generate(level), b = generate(level);
    assert.deepEqual(a, b);
    assert.equal(a.waves.length, a.target);
    for (const wave of a.waves) {
      const solution = solveWave(wave);
      assert.ok(solution?.length, `level ${level} must be winnable`);
      let board = wave.filled.slice();
      for (const move of solution) {
        const piece = wave.pieces[move.piece];
        assert.ok(canPlace(wave, board, piece, move.anchor));
        const outcome = place(wave, board, piece, move.anchor);
        board = outcome.board;
        if (outcome.cleared) break;
      }
      assert.ok(solution.some(move => move.cleared), `level ${level} clears a line`);
    }
  }
  assert.ok(generate(90).target > generate(1).target);
  assert.ok(generate(90).waves[0].blocks.length > generate(1).waves[0].blocks.length);
  game.close();
});

test('invalid placements leave the board unchanged', () => {
  const game = mountGame(hexHtml('en', 12));
  const wave = game.window.hexGame.generate(12).waves[0];
  const board = wave.filled.slice();
  assert.equal(game.window.hexGame.canPlace(wave, board, wave.pieces[0], {q: 99, r: 99}), false);
  assert.deepEqual(board, wave.filled);
  game.close();
});

test('play, pause, restart, and completion bridge work', () => {
  const game = mountGame(hexHtml('en', 1));
  const messages = [];
  game.window.ReactNativeWebView = {postMessage: message => messages.push(JSON.parse(message))};
  const { document } = game;
  document.querySelector('#start').click();
  document.querySelector('#pause').click();
  assert.equal(document.querySelector('#board').classList.contains('paused'), true);
  document.querySelector('#pause').click();
  const level = game.window.hexGame.generate(1);
  for (const move of game.window.hexGame.solveWave(level.waves[0])) {
    document.querySelectorAll('.piece')[move.piece].click();
    document.querySelector(`[data-q="${move.anchor.q}"][data-r="${move.anchor.r}"]`).click();
  }
  assert.deepEqual(messages, [{type:'levelComplete', game:'hex', level:1}]);
  document.querySelector('#restart').click();
  assert.equal(document.querySelector('#score').textContent, '0 / 1');
  game.close();
});

test('all seven locales render key controls', () => {
  for (const locale of ['en','ja','ko','fr','es','ru','de']) {
    const game = mountGame(hexHtml(locale, 3));
    assert.ok(game.document.querySelector('h1').textContent.length);
    assert.ok(game.document.querySelector('#pause').textContent.length);
    assert.ok(game.document.querySelector('#restart').textContent.length);
    game.close();
  }
});

test('a complete line clears along each of the three hex axes', () => {
  const game = mountGame(hexHtml('en', 1));
  const wave = game.window.hexGame.generate(1).waves[0];
  for (const line of [wave.cells.filter(c => c.q === 0), wave.cells.filter(c => c.r === 0), wave.cells.filter(c => c.q + c.r === 0)]) {
    const [last, ...rest] = line;
    const board = rest.map(c => `${c.q},${c.r}`);
    const incomplete = game.window.hexGame.place(wave, board.slice(1), [{q:0,r:0}], last);
    assert.equal(incomplete.cleared, 0);
    const result = game.window.hexGame.place(wave, board, [{q:0,r:0}], last);
    assert.equal(result.cleared, 1);
    assert.ok(line.every(c => !result.board.includes(`${c.q},${c.r}`)));
  }
  game.close();
});
