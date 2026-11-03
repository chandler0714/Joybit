import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GAMES } from './src/catalog/catalog';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { AuthScreen } from './src/auth/AuthScreen';
import { FavoritesStore } from './src/favorites/favoritesStore';
import { favoriteRemote } from './src/favorites/syncFavorites';
import { AccountFavorites, type AccountFavoritesState } from './src/favorites/accountFavorites';
import { HomeScreen } from './src/home/HomeScreen';
import { GameHost } from './src/games/GameHost';
import { getAuthClient } from './src/auth/authClient';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageProvider';

function JoybitApp() {
  const auth = useAuth();
  const { t } = useLanguage();
  const favorites = useMemo(() => new FavoritesStore(AsyncStorage), []);
  const [guestIds, setGuestIds] = useState<string[]>([]);
  const [cloudState, setCloudState] = useState<AccountFavoritesState>({ ids: [], status: 'idle' });
  const accountFavorites = useMemo(() => new AccountFavorites(favorites, favoriteRemote, setCloudState), [favorites]);
  const [authMode, setAuthMode] = useState<'signin' | 'delete' | null>(null);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  useEffect(() => { void favorites.load().then(setGuestIds); return favorites.subscribe(setGuestIds); }, [favorites]);
  useEffect(() => {
    void accountFavorites.setSession(auth.session);
  }, [auth.session?.user.id, auth.session?.access_token, accountFavorites]);

  useEffect(() => {
    if (!auth.session) return;
    setAuthMode(null);
    if (!pendingGameId) return;
    const id = pendingGameId;
    setPendingGameId(null);
    void openGame(id);
  }, [auth.session?.user.id, pendingGameId]);

  async function openGame(id: string) {
    const game = GAMES.find(item => item.id === id);
    if (!game) return;
    if (!auth.session?.user?.id) { setPendingGameId(id); setAuthMode('signin'); return; }
    if (game.offlineHtmlKey) {
      setActiveGameId(id); return;
    }
    const session = await auth.requireValidSession();
    if (!session) { Alert.alert(t('nativeNetworkErrorTitle'), t('nativeNetworkErrorBody')); return; }
    setActiveGameId(id);
  }

  async function toggleFavorite(id: string) {
    if (!auth.session) { await favorites.toggle(id); return; }
    try {
      await accountFavorites.toggle(id);
    } catch { Alert.alert(t('favoriteErrorTitle'), t('tryAgain')); }
  }

  if (authMode) return <AuthScreen initialMode={authMode} onClose={() => { setAuthMode(null); setPendingGameId(null); }} />;
  const activeGame = GAMES.find(game => game.id === activeGameId);
  if (activeGame) return <GameHost game={activeGame} session={auth.session} onExit={() => setActiveGameId(null)}
    onSessionRotated={value => {
      if (value.userId !== auth.session?.user.id) { setActiveGameId(null); return; }
      void getAuthClient().auth.setSession({ access_token: value.accessToken, refresh_token: value.refreshToken })
        .then(({ error }) => { if (error) { setActiveGameId(null); Alert.alert(t('sessionExpired'), t('signInAgain')); } });
    }} />;
  return <HomeScreen games={GAMES} favoriteIds={auth.session ? cloudState.ids : guestIds}
    onToggleFavorite={id => { void toggleFavorite(id); }} onOpenGame={id => { void openGame(id); }}
    account={auth.session ? { displayName: auth.session.user.email ?? 'Joybit' } : null}
    favoritesStatus={auth.session ? cloudState.status : 'idle'}
    onRetryFavorites={() => { void accountFavorites.retry(); }}
    onSignIn={() => setAuthMode('signin')}
    onSignOut={() => { void auth.signOut().catch(() => Alert.alert(t('signOutFailed'), t('tryAgain'))); }}
    onDeleteAccount={() => setAuthMode('delete')} />;
}

export default function App() {
  return <SafeAreaProvider><StatusBar style="dark" /><LanguageProvider><AuthProvider><JoybitApp /></AuthProvider></LanguageProvider></SafeAreaProvider>;
}
