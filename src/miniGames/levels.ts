export const LEVEL_GAME_IDS = ['hex', 'star', 'lane', 'kitchen', 'hidden'] as const;
export type LevelGameId = (typeof LEVEL_GAME_IDS)[number];

type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> };
const keyFor = (userId: string, game: LevelGameId) => `joybit.levels.v1.${encodeURIComponent(userId)}.${game}`;
export const LEVEL_GENERATOR_VERSION = 1;

export async function loadUnlocked(storage: Storage, userId: string, game: LevelGameId): Promise<number> {
  try {
    const raw = await storage.getItem(keyFor(userId, game));
    const saved: unknown = raw ? JSON.parse(raw) : null;
    const value = typeof saved === 'number' ? saved :
      saved && typeof saved === 'object' && (saved as Record<string, unknown>).generatorVersion === LEVEL_GENERATOR_VERSION
        ? (saved as Record<string, unknown>).unlocked : null;
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 ? value : 1;
  } catch { return 1; }
}

export async function recordCompletion(storage: Storage, userId: string, game: LevelGameId, level: number): Promise<number> {
  const current = await loadUnlocked(storage, userId, game);
  if (!Number.isSafeInteger(level) || level < 1 || level > current) return current;
  const next = Math.max(current, level + 1);
  await storage.setItem(keyFor(userId, game), JSON.stringify({ generatorVersion: LEVEL_GENERATOR_VERSION, unlocked: next }));
  return next;
}

export function parseCompletionMessage(raw: string, game: LevelGameId, level: number): { game: LevelGameId; level: number } | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return null;
    const value = data as Record<string, unknown>;
    return value.type === 'levelComplete' && value.game === game && value.level === level && Number.isSafeInteger(value.level) && level >= 1
      ? { game, level } : null;
  } catch { return null; }
}
