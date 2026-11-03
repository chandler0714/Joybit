import { LANGUAGE_CODES, type LanguageCode } from '../i18n/translations.ts';

type Seven = readonly [string, string, string, string, string, string, string];

const copy = {
  reactionIntro: ['Wait for green, then tap. Complete 5 rounds to test your reflexes.', '緑になったらすぐタップ。5回の反応速度を測ろう。', '초록색이 되면 바로 탭하세요. 5번의 반응 속도를 확인해 보세요.', 'Attendez le vert, puis touchez vite. Terminez 5 manches pour tester vos réflexes.', 'Espera al verde y toca rápido. Completa 5 rondas para medir tus reflejos.', 'Дождитесь зелёного цвета и нажмите. Пройдите 5 раундов.', 'Warte auf Grün und tippe sofort. Teste deine Reaktion in 5 Runden.'],
  reactionReady: ['Ready?', '準備はいい？', '준비됐나요?', 'Prêt ?', '¿Listo?', 'Готовы?', 'Bereit?'],
  reactionStart: ['Start challenge', 'チャレンジ開始', '도전 시작', 'Commencer', 'Empezar reto', 'Начать', 'Starten'],
  reactionWaiting: ['Wait for green…', '緑になるまで待って…', '초록색을 기다리세요…', 'Attendez le vert…', 'Espera al verde…', 'Ждите зелёного…', 'Warte auf Grün…'],
  reactionBePatient: ['Keep waiting', 'もう少し待って', '조금만 더 기다리세요', 'Patientez', 'Espera un poco', 'Подождите', 'Noch warten'],
  reactionTapNow: ['Tap now!', '今すぐタップ！', '지금 탭하세요!', 'Touchez maintenant !', '¡Toca ahora!', 'Нажмите сейчас!', 'Jetzt tippen!'],
  reactionTap: ['Tap!', 'タップ！', '탭!', 'Touchez !', '¡Toca!', 'Жмите!', 'Tippen!'],
  reactionFalseStart: ['Too soon! Try again.', '早すぎ！もう一度。', '너무 빨라요! 다시 시도하세요.', 'Trop tôt ! Réessayez.', '¡Demasiado pronto! Inténtalo de nuevo.', 'Слишком рано! Попробуйте снова.', 'Zu früh! Versuch es erneut.'],
  reactionRetryRound: ['Retry round', 'この回をやり直す', '이번 라운드 다시 하기', 'Rejouer la manche', 'Repetir ronda', 'Повторить раунд', 'Runde wiederholen'],
  reactionKeepGoing: ['Nice! Keep going.', 'いいね！続けよう。', '좋아요! 계속하세요.', 'Bien joué ! Continuez.', '¡Bien! Sigue así.', 'Отлично! Продолжайте.', 'Gut! Weiter so.'],
  reactionNext: ['Next round', '次へ', '다음 라운드', 'Manche suivante', 'Siguiente ronda', 'Следующий раунд', 'Nächste Runde'],
  reactionDone: ['Challenge complete!', 'チャレンジ完了！', '도전 완료!', 'Défi terminé !', '¡Reto completado!', 'Задание выполнено!', 'Geschafft!'],
  playAgain: ['Play again', 'もう一度遊ぶ', '다시 하기', 'Rejouer', 'Jugar de nuevo', 'Играть снова', 'Nochmal spielen'],
  reactionProgress: ['{count} / 5 rounds', '{count} / 5 回', '{count} / 5회', '{count} / 5 manches', '{count} / 5 rondas', '{count} / 5 раундов', '{count} / 5 Runden'],
  reactionResult: ['Average {average} ms · Best {best} ms', '平均 {average} ミリ秒 · 最速 {best} ミリ秒', '평균 {average}ms · 최고 {best}ms', 'Moyenne {average} ms · Record {best} ms', 'Media {average} ms · Mejor {best} ms', 'Среднее {average} мс · Лучшее {best} мс', 'Ø {average} ms · Bestwert {best} ms'],
  memoryIntro: ['Find 8 matching pairs. Remember each card and finish in fewer moves.', '同じ絵柄を8組見つけよう。位置を覚えて少ない手数でクリア。', '같은 그림 8쌍을 찾으세요. 위치를 기억하고 적은 횟수로 완료하세요.', 'Retrouvez 8 paires. Mémorisez les cartes et terminez en moins de coups.', 'Encuentra 8 parejas. Recuerda las cartas y termina en menos movimientos.', 'Найдите 8 пар. Запоминайте карты и старайтесь делать меньше ходов.', 'Finde 8 Paare. Merke dir die Karten und brauche möglichst wenige Züge.'],
  memoryReady: ['Ready to flip', 'カードをめくる準備', '카드를 뒤집을 준비', 'Prêt à retourner les cartes', 'Listo para girar cartas', 'Готовы открыть карты', 'Bereit zum Aufdecken'],
  memoryBoard: ['Memory card board', '神経衰弱の盤面', '기억력 카드 판', 'Plateau du jeu de mémoire', 'Tablero de memoria', 'Поле с карточками', 'Memory-Spielfeld'],
  memoryHidden: ['Face-down card', '裏向きのカード', '뒷면 카드', 'Carte face cachée', 'Carta boca abajo', 'Закрытая карта', 'Verdeckte Karte'],
  memoryMoves: ['Moves: {count}', 'めくった回数: {count}', '뒤집은 횟수: {count}', 'Coups : {count}', 'Movimientos: {count}', 'Ходы: {count}', 'Züge: {count}'],
  elapsed: ['{count} sec', '{count} 秒', '{count}초', '{count} s', '{count} s', '{count} с', '{count} Sek.'],
  memoryMatched: ['All pairs found!', 'すべてのペアを発見！', '모든 짝을 찾았어요!', 'Toutes les paires trouvées !', '¡Encontraste todas las parejas!', 'Все пары найдены!', 'Alle Paare gefunden!'],
  memoryPair: ['A match!', 'ペアを発見！', '짝을 찾았어요!', 'Une paire !', '¡Una pareja!', 'Пара найдена!', 'Ein Paar!'],
  memoryRemember: ['Remember those cards', 'カードの位置を覚えて', '카드 위치를 기억하세요', 'Mémorisez ces cartes', 'Recuerda esas cartas', 'Запомните эти карты', 'Merk dir diese Karten'],
  memoryContinue: ['Keep looking for pairs', '同じ絵柄を探そう', '같은 그림을 계속 찾으세요', 'Continuez à chercher', 'Sigue buscando parejas', 'Продолжайте искать пары', 'Such weiter nach Paaren'],
  memoryFind: ['Find two matching cards', '同じ絵柄を2枚探そう', '같은 그림 카드 2장을 찾으세요', 'Trouvez deux cartes identiques', 'Encuentra dos cartas iguales', 'Найдите две одинаковые карты', 'Finde zwei gleiche Karten'],
  memoryResult: ['Moves: {moves} · {seconds} sec', 'めくった回数: {moves} · {seconds} 秒', '뒤집은 횟수: {moves} · {seconds}초', 'Coups : {moves} · {seconds} s', 'Movimientos: {moves} · {seconds} s', 'Ходы: {moves} · {seconds} с', 'Züge: {moves} · {seconds} Sek.'],
  puzzleIntro: ['Slide the numbers beside the gap until 1–8 are in order. Every puzzle can be solved.', '空白の隣の数字を動かして1〜8を順番に並べよう。必ず解けるよ。', '빈칸 옆 숫자를 움직여 1부터 8까지 순서대로 맞추세요. 모든 퍼즐을 풀 수 있어요.', 'Déplacez les chiffres voisins de la case vide pour ranger 1 à 8. Chaque grille est résoluble.', 'Mueve los números junto al hueco para ordenar del 1 al 8. Todos los puzles tienen solución.', 'Передвигайте числа рядом с пустой клеткой, чтобы собрать ряд от 1 до 8. Решение есть всегда.', 'Verschiebe Zahlen neben dem Leerfeld, bis 1 bis 8 sortiert sind. Jedes Rätsel ist lösbar.'],
  puzzleReady: ['Ready to solve', 'パズルの準備完了', '퍼즐 준비 완료', 'Prêt à résoudre', 'Listo para resolver', 'Готовы решить', 'Bereit zum Rätseln'],
  puzzleBoard: ['Number puzzle board', '数字パズルの盤面', '숫자 퍼즐 판', 'Grille du puzzle', 'Tablero del puzle', 'Поле головоломки', 'Zahlenpuzzle-Spielfeld'],
  puzzleSteps: ['Moves: {count}', '手数: {count}', '이동 횟수: {count}', 'Coups : {count}', 'Movimientos: {count}', 'Ходы: {count}', 'Züge: {count}'],
  puzzleEmpty: ['Empty space', '空白', '빈칸', 'Case vide', 'Espacio vacío', 'Пустая клетка', 'Leerfeld'],
  puzzleTile: ['Number {value}', '数字 {value}', '숫자 {value}', 'Chiffre {value}', 'Número {value}', 'Число {value}', 'Zahl {value}'],
  puzzleDone: ['Puzzle complete!', 'パズル完成！', '퍼즐 완료!', 'Puzzle terminé !', '¡Puzle completado!', 'Головоломка решена!', 'Rätsel gelöst!'],
  puzzleTap: ['Tap a number beside the gap', '空白の隣の数字をタップ', '빈칸 옆 숫자를 탭하세요', 'Touchez un chiffre voisin de la case vide', 'Toca un número junto al hueco', 'Нажмите на число рядом с пустой клеткой', 'Tippe auf eine Zahl neben dem Leerfeld'],
  puzzleResult: ['Moves: {moves} · {seconds} sec', '手数: {moves} · {seconds} 秒', '이동 횟수: {moves} · {seconds}초', 'Coups : {moves} · {seconds} s', 'Movimientos: {moves} · {seconds} s', 'Ходы: {moves} · {seconds} с', 'Züge: {moves} · {seconds} Sek.'],
  startGame: ['Start game', 'ゲーム開始', '게임 시작', 'Commencer', 'Empezar juego', 'Начать игру', 'Spiel starten'],
} satisfies Record<string, Seven>;

export type MiniCopyKey = keyof typeof copy;
export function miniCopy(locale: LanguageCode, key: MiniCopyKey, values: Record<string, string | number> = {}): string {
  return copy[key][LANGUAGE_CODES.indexOf(locale)].replace(/\{([a-zA-Z]+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

export function miniCopyScript(locale: LanguageCode, keys: readonly MiniCopyKey[]): string {
  const selected = Object.fromEntries(keys.map(key => [key, miniCopy(locale, key)]));
  return `const copy=${JSON.stringify(selected).replace(/</g, '\\u003c')};\nfunction tr(key,values={}){return copy[key].replace(/\\{([a-zA-Z]+)\\}/g,(_,name)=>String(values[name]??'{'+name+'}'));}`;
}
