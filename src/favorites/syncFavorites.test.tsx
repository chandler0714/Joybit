import { syncFavorites, setCloudFavorite } from './syncFavorites';

test('merges guest favorites once with user-owned cloud rows', async () => {
  const rows = new Set(['cloud-game']);
  const remote = {
    async list(userId: string, token: string) { expect([userId, token]).toEqual(['u1', 'token']); return [...rows]; },
    async add(_userId: string, id: string) { rows.add(id); },
    async remove(_userId: string, id: string) { rows.delete(id); },
  };
  expect(await syncFavorites(['steady-drop', 'steady-drop'], 'u1', 'token', remote)).toEqual(['cloud-game', 'steady-drop']);
  expect(await syncFavorites([], 'u1', 'token', remote)).toEqual(['cloud-game', 'steady-drop']);
  await setCloudFavorite('u1', 'cloud-game', false, remote);
  expect([...rows]).toEqual(['steady-drop']);
});

test('a different user only sees their own rows', async () => {
  const rows = new Map([['u1', new Set(['steady-drop'])], ['u2', new Set<string>()]]);
  const remote = {
    async list(userId: string) { return [...(rows.get(userId) ?? [])]; },
    async add(userId: string, id: string) { rows.get(userId)?.add(id); },
    async remove(userId: string, id: string) { rows.get(userId)?.delete(id); },
  };
  expect(await syncFavorites([], 'u2', 'token2', remote)).toEqual([]);
});
