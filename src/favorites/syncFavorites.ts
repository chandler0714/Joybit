export type FavoriteRemote = {
  list(userId: string, token: string): Promise<string[]>;
  add(userId: string, gameId: string, token: string): Promise<void>;
  remove(userId: string, gameId: string, token: string): Promise<void>;
};

export async function syncFavorites(localIds: string[], userId: string, accessToken: string, remote: FavoriteRemote): Promise<string[]> {
  const cloud = await remote.list(userId, accessToken);
  const missing = [...new Set(localIds)].filter(id => !cloud.includes(id));
  await Promise.all(missing.map(id => remote.add(userId, id, accessToken)));
  return [...new Set([...cloud, ...missing])];
}

export async function setCloudFavorite(userId: string, gameId: string, selected: boolean, remote: FavoriteRemote, token = '') {
  if (selected) await remote.add(userId, gameId, token);
  else await remote.remove(userId, gameId, token);
}

async function request(method: string, path: string, token: string, body?: unknown): Promise<unknown> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('缺少 Supabase 公共配置');
  const response = await fetch(`${url}/rest/v1/joybit_favorites${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal,resolution=ignore-duplicates' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`收藏同步失败（${response.status}）`);
  return response.status === 204 || method !== 'GET' ? null : response.json();
}

export const favoriteRemote: FavoriteRemote = {
  async list(userId, token) {
    const rows = await request('GET', `?select=game_id&user_id=eq.${encodeURIComponent(userId)}`, token) as { game_id: string }[];
    return rows.map(row => row.game_id);
  },
  async add(userId, gameId, token) {
    await request('POST', '', token, { user_id: userId, game_id: gameId });
  },
  async remove(userId, gameId, token) {
    await request('DELETE', `?user_id=eq.${encodeURIComponent(userId)}&game_id=eq.${encodeURIComponent(gameId)}`, token);
  },
};
