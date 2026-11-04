import { translate, type LanguageCode } from '../i18n/translations.ts';

export type Game = {
  id: string;
  title: string;
  kind: 'native' | 'h5';
  coverKey: 'steady-drop' | 'reaction' | 'memory' | 'puzzle' | 'hex' | 'star' | 'lane' | 'kitchen' | 'hidden';
  playedCount: number | null;
  h5Url?: string;
  offlineHtmlKey?: 'reaction' | 'memory' | 'puzzle' | 'hex' | 'star' | 'lane' | 'kitchen' | 'hidden';
};

export const GAMES: readonly Game[] = [
  {
    id: 'steady-drop',
    title: 'Hexa Landing',
    kind: 'native',
    coverKey: 'steady-drop',
    playedCount: null,
  },
  { id: 'reaction', title: 'Reaction Rush', kind: 'h5', coverKey: 'reaction', offlineHtmlKey: 'reaction', playedCount: null },
  { id: 'memory', title: 'Memory Match', kind: 'h5', coverKey: 'memory', offlineHtmlKey: 'memory', playedCount: null },
  { id: 'puzzle', title: 'Number Puzzle', kind: 'h5', coverKey: 'puzzle', offlineHtmlKey: 'puzzle', playedCount: null },
  { id: 'hex', title: 'Hex Garden', kind: 'h5', coverKey: 'hex', offlineHtmlKey: 'hex', playedCount: null },
  { id: 'star', title: 'Star Trail', kind: 'h5', coverKey: 'star', offlineHtmlKey: 'star', playedCount: null },
  { id: 'lane', title: 'Lane Glow', kind: 'h5', coverKey: 'lane', offlineHtmlKey: 'lane', playedCount: null },
  { id: 'kitchen', title: 'Little Corner Kitchen', kind: 'h5', coverKey: 'kitchen', offlineHtmlKey: 'kitchen', playedCount: null },
  { id: 'hidden', title: 'Hidden Nook', kind: 'h5', coverKey: 'hidden', offlineHtmlKey: 'hidden', playedCount: null },
];

export function localizedGameTitle(game: Game, locale: LanguageCode): string {
  if (game.id === 'reaction') return translate(locale, 'gameReaction');
  if (game.id === 'memory') return translate(locale, 'gameMemory');
  if (game.id === 'puzzle') return translate(locale, 'gamePuzzle');
  if (game.id === 'hex') return translate(locale, 'gameHex');
  if (game.id === 'star') return translate(locale, 'gameStar');
  if (game.id === 'lane') return translate(locale, 'gameLane');
  if (game.id === 'kitchen') return translate(locale, 'gameKitchen');
  if (game.id === 'hidden') return translate(locale, 'gameHidden');
  return game.title;
}
