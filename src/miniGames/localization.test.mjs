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

const finished = {
  en: ['Challenge complete!', 'Average ', 'All pairs found!', 'Moves: 8', 'Face-down card', 'Puzzle complete!', 'Moves: 1', 'Empty space'],
  ja: ['チャレンジ完了！', '平均 ', 'すべてのペアを発見！', 'めくった回数: 8', '裏向きのカード', 'パズル完成！', '手数: 1', '空白'],
  ko: ['도전 완료!', '평균 ', '모든 짝을 찾았어요!', '뒤집은 횟수: 8', '뒷면 카드', '퍼즐 완료!', '이동 횟수: 1', '빈칸'],
  fr: ['Défi terminé !', 'Moyenne ', 'Toutes les paires trouvées !', 'Coups : 8', 'Carte face cachée', 'Puzzle terminé !', 'Coups : 1', 'Case vide'],
  es: ['¡Reto completado!', 'Media ', '¡Encontraste todas las parejas!', 'Movimientos: 8', 'Carta boca abajo', '¡Puzle completado!', 'Movimientos: 1', 'Espacio vacío'],
  ru: ['Задание выполнено!', 'Среднее ', 'Все пары найдены!', 'Ходы: 8', 'Закрытая карта', 'Головоломка решена!', 'Ходы: 1', 'Пустая клетка'],
  de: ['Geschafft!', 'Ø ', 'Alle Paare gefunden!', 'Züge: 8', 'Verdeckte Karte', 'Rätsel gelöst!', 'Züge: 1', 'Leerfeld'],
};

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

  test(`${locale} localizes scores and exact screen-reader labels`, () => {
    const [reactionDone, average, memoryDone, memoryResult, hiddenCard, puzzleDone, puzzleResult, emptySpace] = finished[locale];
    const reaction = mountGame(getMiniGameHtml('reaction', locale));
    const action = reaction.document.querySelector('#action');
    for (let round = 0; round < 5; round++) {
      action.click();
      reaction.fireNextTimeout();
      reaction.advance(250);
      action.click();
    }
    assert.equal(reaction.document.querySelector('#status').textContent, reactionDone);
    assert.ok(reaction.document.querySelector('#result').textContent.includes(average));
    reaction.close();

    const memory = mountGame(getMiniGameHtml('memory', locale));
    memory.document.querySelector('#start').click();
    const cards = [...memory.document.querySelectorAll('.card')];
    assert.equal(cards[0].getAttribute('aria-label'), hiddenCard);
    const groups = new Map();
    cards.forEach(card => groups.set(card.dataset.symbol, [...(groups.get(card.dataset.symbol) ?? []), card]));
    for (const pair of groups.values()) { pair[0].click(); pair[1].click(); }
    assert.equal(memory.document.querySelector('#status').textContent, memoryDone);
    assert.ok(memory.document.querySelector('#result').textContent.includes(memoryResult));
    memory.close();

    const puzzle = mountGame(getMiniGameHtml('puzzle', locale));
    puzzle.document.querySelector('#start').click();
    puzzle.window.eval('cells=[1,2,3,4,5,6,7,0,8]; draw();');
    assert.equal(puzzle.document.querySelector('.tile.empty').getAttribute('aria-label'), emptySpace);
    puzzle.document.querySelectorAll('.tile')[8].click();
    assert.equal(puzzle.document.querySelector('#status').textContent, puzzleDone);
    assert.ok(puzzle.document.querySelector('#result').textContent.includes(puzzleResult));
    puzzle.close();
  });
}
