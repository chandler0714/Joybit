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
  { id: 'reaction', title: '反应挑战', kind: 'h5', coverKey: 'reaction', offlineHtmlKey: 'reaction', playedCount: null },
  { id: 'memory', title: '记忆翻牌', kind: 'h5', coverKey: 'memory', offlineHtmlKey: 'memory', playedCount: null },
  { id: 'puzzle', title: '数字拼图', kind: 'h5', coverKey: 'puzzle', offlineHtmlKey: 'puzzle', playedCount: null },
];
