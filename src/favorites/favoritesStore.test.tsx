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
