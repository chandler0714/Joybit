import { translate, type LanguageCode } from '../i18n/translations.ts';

export type Game = {
  id: string;
  title: string;
  kind: 'native' | 'h5';
  coverKey: 'steady-drop' | 'reaction' | 'memory' | 'puzzle';
  playedCount: number | null;
  h5Url?: string;
  offlineHtmlKey?: 'reaction' | 'memory' | 'puzzle';
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
];

export function localizedGameTitle(game: Game, locale: LanguageCode): string {
  if (game.id === 'reaction') return translate(locale, 'gameReaction');
  if (game.id === 'memory') return translate(locale, 'gameMemory');
  if (game.id === 'puzzle') return translate(locale, 'gamePuzzle');
  return game.title;
}
