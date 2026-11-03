import assert from 'node:assert/strict';
import test from 'node:test';
import { getMiniGameHtml } from './index.ts';
import { mountGame } from './testHarness.mjs';

const cases = [
  ['en', 'Reaction Rush', 'Ready?', 'Wait for green…', 'Ready to flip', 'Find two matching cards', 'Ready to solve', 'Tap a number beside the gap'],
  ['ja', '反応チャレンジ', '準備はいい？', '緑になるまで待って…', 'カードをめくる準備', '同じ絵柄を2枚探そう', 'パズルの準備完了', '空白の隣の数字をタップ'],
  ['ko', '반응 속도 도전', '준비됐나요?', '초록색을 기다리세요…', '카드를 뒤집을 준비', '같은 그림 카드 2장을 찾으세요', '퍼즐 준비 완료', '빈칸 옆 숫자를 탭하세요'],
  ['fr', 'Défi réflexes', 'Prêt ?', 'Attendez le vert…', 'Prêt à retourner les cartes', 'Trouvez deux cartes identiques', 'Prêt à résoudre', 'Touchez un chiffre voisin de la case vide'],
  ['es', 'Reto de reflejos', '¿Listo?', 'Espera al verde…', 'Listo para girar cartas', 'Encuentra dos cartas iguales', 'Listo para resolver', 'Toca un número junto al hueco'],
  ['ru', 'Проверка реакции', 'Готовы?', 'Ждите зелёного…', 'Готовы открыть карты', 'Найдите две одинаковые карты', 'Готовы решить', 'Нажмите на число рядом с пустой клеткой'],
  ['de', 'Reaktionstest', 'Bereit?', 'Warte auf Grün…', 'Bereit zum Aufdecken', 'Finde zwei gleiche Karten', 'Bereit zum Rätseln', 'Tippe auf eine Zahl neben dem Leerfeld'],
];

for (const [locale, reactionTitle, reactionReady, reactionWaiting, memoryReady, memoryFind, puzzleReady, puzzleTap] of cases) {
  test(`${locale} loads all three mini games with localized static and runtime copy`, () => {
    const reaction = mountGame(getMiniGameHtml('reaction', locale));
    assert.equal(reaction.document.documentElement.lang, locale);
    assert.equal(reaction.document.querySelector('h1').textContent, reactionTitle);
    assert.equal(reaction.document.querySelector('#status').textContent, reactionReady);
    reaction.document.querySelector('#action').click();
    assert.equal(reaction.document.querySelector('#status').textContent, reactionWaiting);
    assert.ok(reaction.document.querySelector('#progress').textContent.includes('0'));
    reaction.close();

    const memory = mountGame(getMiniGameHtml('memory', locale));
    assert.equal(memory.document.documentElement.lang, locale);
    assert.equal(memory.document.querySelector('#status').textContent, memoryReady);
    memory.document.querySelector('#start').click();
    assert.equal(memory.document.querySelector('#status').textContent, memoryFind);
    assert.equal(memory.document.querySelectorAll('.card').length, 16);
    assert.ok(memory.document.querySelector('.card').getAttribute('aria-label'));
    memory.close();

    const puzzle = mountGame(getMiniGameHtml('puzzle', locale));
    assert.equal(puzzle.document.documentElement.lang, locale);
    assert.equal(puzzle.document.querySelector('#status').textContent, puzzleReady);
    puzzle.document.querySelector('#start').click();
    assert.equal(puzzle.document.querySelector('#status').textContent, puzzleTap);
    assert.equal(puzzle.document.querySelectorAll('.tile').length, 9);
    assert.ok(puzzle.document.querySelector('.tile').getAttribute('aria-label'));
    puzzle.close();
  });
}
