import { AccountFavorites } from './accountFavorites';
import { FavoritesStore } from './favoritesStore';

function memoryStore() {
  const values = new Map<string, string>();
  return new FavoritesStore({
    async getItem(key: string) { return values.get(key) ?? null; },
    async setItem(key: string, value: string) { values.set(key, value); },
  });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}
const session = (id: string) => ({ user: { id }, access_token: `token-${id}` });

test('toggle during initial merge is applied after the merge result', async () => {
  const list = deferred<string[]>();
  const added: string[] = [];
  const remote = { list: () => list.promise, add: async (_u: string, id: string) => { added.push(id); }, remove: async () => {} };
  const account = new AccountFavorites(memoryStore(), remote as never);
  const syncing = account.setSession(session('u1'));
  const toggling = account.toggle('steady-drop');
  list.resolve([]);
  await Promise.all([syncing, toggling]);
  expect(account.snapshot()).toEqual({ ids: ['steady-drop'], status: 'ready' });
  expect(added).toEqual(['steady-drop']);
});

test('late old-account toggle cannot change the new account view', async () => {
  const add = deferred<void>();
  const remote = { list: async () => [], add: () => add.promise, remove: async () => {} };
  const account = new AccountFavorites(memoryStore(), remote as never);
  await account.setSession(session('u1'));
  const oldToggle = account.toggle('steady-drop');
  await account.setSession(session('u2'));
  add.resolve();
  await oldToggle;
  expect(account.snapshot()).toEqual({ ids: [], status: 'ready' });
});

test('switching accounts hides previous favorites while the next account syncs', async () => {
  const secondList = deferred<string[]>();
  const remote = {
    list: (_user: string, token: string) => token === 'token-u2' ? secondList.promise : Promise.resolve(['steady-drop']),
    add: async () => {}, remove: async () => {},
  };
  const account = new AccountFavorites(memoryStore(), remote as never);
  await account.setSession(session('u1'));
  expect(account.snapshot()).toEqual({ ids: ['steady-drop'], status: 'ready' });
  const next = account.setSession(session('u2'));
  expect(account.snapshot()).toEqual({ ids: [], status: 'syncing' });
  secondList.resolve([]);
  await next;
  expect(account.snapshot()).toEqual({ ids: [], status: 'ready' });
});

test('failed initial sync retains guest favorites and succeeds on retry', async () => {
  const guest = memoryStore();
  await guest.toggle('steady-drop');
  let attempts = 0;
  const remote = {
    async list() { attempts += 1; if (attempts === 1) throw new Error('offline'); return []; },
    async add() {}, async remove() {},
  };
  const account = new AccountFavorites(guest, remote as never);
  await account.setSession(session('u1'));
  expect(account.snapshot()).toEqual({ ids: [], status: 'error' });
  expect(await guest.load()).toEqual(['steady-drop']);
  await account.retry();
  expect(account.snapshot()).toEqual({ ids: ['steady-drop'], status: 'ready' });
  expect(await guest.load()).toEqual([]);
});
