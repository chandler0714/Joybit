import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const storageKey = 'joybit.auth.session';
export const sessionStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    try { return await SecureStore.getItemAsync(key); }
    catch { return null; }
  },
  setItem: (key: string, value: string) => Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

export async function readCachedOfflineSession(): Promise<Session | null> {
  const raw = await sessionStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const candidate = value as Partial<Session>;
    return typeof candidate.user?.id === 'string' && candidate.user.id.length > 0 &&
      typeof candidate.access_token === 'string' && typeof candidate.refresh_token === 'string'
      ? candidate as Session : null;
  } catch { return null; }
}

let client: SupabaseClient | null = null;
export function getAuthClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('缺少 Supabase 公共配置');
  client = createClient(url, key, {
    auth: { storage: sessionStorage, storageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}

export function authConfiguration() {
  return { url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '', key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '' };
}
