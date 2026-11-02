import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GAMES } from './src/catalog/catalog';
import { FavoritesStore } from './src/favorites/favoritesStore';
import { HomeScreen } from './src/home/HomeScreen';

export default function App() {
  const favorites = useMemo(() => new FavoritesStore(AsyncStorage), []);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => { favorites.load().then(setFavoriteIds); return favorites.subscribe(setFavoriteIds); }, [favorites]);
  return <SafeAreaProvider>
    <StatusBar style="dark" />
    <HomeScreen games={GAMES} favoriteIds={favoriteIds} onToggleFavorite={(id) => { void favorites.toggle(id); }} onOpenGame={() => Alert.alert('游戏接入中', 'Hexa Landing 即将在 Joybit 中开放。')} account={null} />
  </SafeAreaProvider>;
}
