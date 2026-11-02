export type Game = {
  id: string;
  title: string;
  kind: 'native' | 'h5';
  coverKey: 'steady-drop';
  playedCount: number | null;
  h5Url?: string;
};

export const GAMES: readonly Game[] = [
  {
    id: 'steady-drop',
    title: 'Hexa Landing',
    kind: 'native',
    coverKey: 'steady-drop',
    playedCount: null,
  },
];
