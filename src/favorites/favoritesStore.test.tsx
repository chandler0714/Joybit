import { FavoritesStore } from './favoritesStore';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    async getItem(key: string) { return values.get(key) ?? null; },
    async setItem(key: string, value: string) { values.set(key, value); },
  };
}

test('loads guest favorites and persists a toggle', async () => {
  const storage = memoryStorage();
  const favorites = new FavoritesStore(storage);
  expect(await favorites.load()).toEqual([]);
  expect(await favorites.toggle('steady-drop')).toEqual(['steady-drop']);
  expect(await new FavoritesStore(storage).load()).toEqual(['steady-drop']);
});

test('repeated toggles remove the same favorite without duplicates', async () => {
  const favorites = new FavoritesStore(memoryStorage());
  await favorites.load();
  expect(await favorites.toggle('steady-drop')).toEqual(['steady-drop']);
  expect(await favorites.toggle('steady-drop')).toEqual([]);
});

test('subscribers receive changed favorite IDs', async () => {
  const favorites = new FavoritesStore(memoryStorage());
  const observed: string[][] = [];
  const unsubscribe = favorites.subscribe((ids) => observed.push(ids));
  await favorites.toggle('steady-drop');
  unsubscribe();
  await favorites.toggle('steady-drop');
  expect(observed).toEqual([['steady-drop']]);
});

test('concurrent guest taps serialize, including a delayed storage write', async () => {
  const values = new Map<string, string>();
  let releaseFirst: (() => void) | undefined;
  let writes = 0;
  const storage = {
    async getItem(key: string) { return values.get(key) ?? null; },
    async setItem(key: string, value: string) {
      writes += 1;
      if (writes === 1) await new Promise<void>(resolve => { releaseFirst = resolve; });
      values.set(key, value);
    },
  };
  const favorites = new FavoritesStore(storage);
  const first = favorites.toggle('steady-drop');
  const second = favorites.toggle('steady-drop');
  while (!releaseFirst) await Promise.resolve();
  releaseFirst();
  await Promise.all([first, second]);
  expect(await favorites.load()).toEqual([]);
  expect(await new FavoritesStore(storage).load()).toEqual([]);
});

test('replacing favorites waits for an in-flight initial read', async () => {
  let releaseRead: ((value: string | null) => void) | undefined;
  let wrote = false;
  const storage = {
    getItem: () => new Promise<string | null>(resolve => { releaseRead = resolve; }),
    async setItem() { wrote = true; },
  };
  const favorites = new FavoritesStore(storage);
  const loading = favorites.load();
  while (!releaseRead) await Promise.resolve();
  const replacing = favorites.replace(['steady-drop']);
  await Promise.resolve();
  await Promise.resolve();
  expect(wrote).toBe(false);
  releaseRead('[]');
  await Promise.all([loading, replacing]);
  expect(await favorites.load()).toEqual(['steady-drop']);
});
