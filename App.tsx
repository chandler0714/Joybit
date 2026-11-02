import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GAMES } from './src/catalog/catalog';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { AuthScreen } from './src/auth/AuthScreen';
import { FavoritesStore } from './src/favorites/favoritesStore';
import { favoriteRemote, setCloudFavorite, syncFavorites } from './src/favorites/syncFavorites';
import { HomeScreen } from './src/home/HomeScreen';
import { GameHost } from './src/games/GameHost';
import { getAuthClient } from './src/auth/authClient';

function JoybitApp() {
  const auth = useAuth();
  const favorites = useMemo(() => new FavoritesStore(AsyncStorage), []);
  const [guestIds, setGuestIds] = useState<string[]>([]);
  const [cloudIds, setCloudIds] = useState<string[]>([]);
  const [authMode, setAuthMode] = useState<'signin' | 'delete' | null>(null);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const lastUser = useRef<string | null>(null);

  useEffect(() => { void favorites.load().then(setGuestIds); return favorites.subscribe(setGuestIds); }, [favorites]);
  useEffect(() => {
    const session = auth.session;
    if (!session) { lastUser.current = null; setCloudIds([]); return; }
    if (lastUser.current === session.user.id) return;
    lastUser.current = session.user.id;
    let active = true;
    void favorites.load().then(ids => syncFavorites(ids, session.user.id, session.access_token, favoriteRemote))
      .then(async ids => { if (active) { setCloudIds(ids); await favorites.replace([]); } })
      .catch(error => { if (active) { lastUser.current = null; Alert.alert('收藏同步失败', error.message); } });
    return () => { active = false; };
  }, [auth.session?.user.id, favorites]);

  useEffect(() => {
    if (!auth.session) return;
    setAuthMode(null);
    if (!pendingGameId) return;
    const id = pendingGameId;
    setPendingGameId(null);
    void openGame(id);
  }, [auth.session?.user.id, pendingGameId]);

  async function openGame(id: string) {
    const session = await auth.requireValidSession();
    if (!session) { setPendingGameId(id); setAuthMode('signin'); return; }
    setActiveGameId(id);
  }

  async function toggleFavorite(id: string) {
    if (!auth.session) { await favorites.toggle(id); return; }
    const selected = !cloudIds.includes(id);
    try {
      await setCloudFavorite(auth.session.user.id, id, selected, favoriteRemote, auth.session.access_token);
      setCloudIds(current => selected ? [...new Set([...current, id])] : current.filter(item => item !== id));
    } catch (error) { Alert.alert('收藏更新失败', error instanceof Error ? error.message : '请重试'); }
  }

  if (authMode) return <AuthScreen initialMode={authMode} onClose={() => { setAuthMode(null); setPendingGameId(null); }} />;
  const activeGame = GAMES.find(game => game.id === activeGameId);
  if (activeGame) return <GameHost game={activeGame} session={auth.session} onExit={() => setActiveGameId(null)}
    onSessionRotated={value => {
      if (value.userId !== auth.session?.user.id) { setActiveGameId(null); return; }
      void getAuthClient().auth.setSession({ access_token: value.accessToken, refresh_token: value.refreshToken })
        .then(({ error }) => { if (error) { setActiveGameId(null); Alert.alert('游戏会话已失效', '请重新登录。'); } });
    }} />;
  return <HomeScreen games={GAMES} favoriteIds={auth.session ? cloudIds : guestIds}
    onToggleFavorite={id => { void toggleFavorite(id); }} onOpenGame={id => { void openGame(id); }}
    account={auth.session ? { displayName: auth.session.user.email ?? 'Joybit 玩家' } : null}
    onSignIn={() => setAuthMode('signin')}
    onSignOut={() => { void auth.signOut().catch(error => Alert.alert('退出失败', error.message)); }}
    onDeleteAccount={() => setAuthMode('delete')} />;
}

export default function App() {
  return <SafeAreaProvider><StatusBar style="dark" /><AuthProvider><JoybitApp /></AuthProvider></SafeAreaProvider>;
}
