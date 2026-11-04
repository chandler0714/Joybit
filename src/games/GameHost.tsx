import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { Session } from '@supabase/supabase-js';
import { localizedGameTitle, type Game } from '../catalog/catalog';
import { SteadyDropScreen } from './SteadyDropScreen';
import { getMiniGameHtml } from '../miniGames';
import { useLanguage } from '../i18n/LanguageProvider';
import { LEVEL_GAME_IDS, loadUnlocked, parseCompletionMessage, recordCompletion } from '../miniGames/levels';

export type RotatedSession = { accessToken: string; refreshToken: string; userId: string };
type Props = { game: Game; session: Session | null; onExit(): void; onSessionRotated(value: RotatedSession): void };

export function GameHost({ game, session, onExit, onSessionRotated }: Props) {
  const { locale, t } = useLanguage();
  const bundled = Boolean(game.offlineHtmlKey);
  const levelGame = LEVEL_GAME_IDS.find(id => id === game.offlineHtmlKey);
  const userId = session?.user?.id;
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState(1);
  const [progressReady, setProgressReady] = useState(false);
  useEffect(() => {
    if (!levelGame || !userId) { setProgressReady(true); return; }
    let active = true;
    setProgressReady(false);
    void loadUnlocked(AsyncStorage, userId, levelGame).then(value => {
      if (active) { setUnlocked(value); setLevel(value); setProgressReady(true); }
    });
    return () => { active = false; };
  }, [levelGame, userId]);
  if (!session?.user?.id || (!bundled && (!session.access_token || !session.refresh_token ||
      (session.expires_at != null && session.expires_at <= Math.floor(Date.now() / 1000) + 30)))) {
    return <SafeAreaView style={s.blocked}><Text style={s.blockedText}>{t('signInRequired')}</Text><Pressable onPress={onExit}><Text style={s.link}>{t('backToGames')}</Text></Pressable></SafeAreaView>;
  }
  if (game.kind === 'native') {
    return <SteadyDropScreen session={session} onExit={onExit} onSessionRotated={onSessionRotated} />;
  }
  if (!game.offlineHtmlKey && !game.h5Url) return <SafeAreaView style={s.blocked}><Text>{t('gameUrlMissing')}</Text><Pressable onPress={onExit}><Text style={s.link}>{t('backToGames')}</Text></Pressable></SafeAreaView>;
  if (levelGame && !progressReady) return <SafeAreaView style={s.blocked}><Text style={s.blockedText}>{t('levelLabel', { level: 1 })}</Text></SafeAreaView>;
  return <SafeAreaView style={s.webScreen}>
    <View style={s.toolbar}><Pressable accessibilityLabel={t('backToGames')} onPress={onExit}><Text style={s.back}>‹</Text></Pressable><Text style={s.title} numberOfLines={1}>{localizedGameTitle(game, locale)}</Text>
      {levelGame && <View style={s.levelNav}>
        <Pressable accessibilityLabel={t('previousLevel')} disabled={level <= 1} onPress={() => setLevel(level - 1)}><Text style={[s.levelArrow, level <= 1 && s.disabled]}>‹</Text></Pressable>
        <Text style={s.levelText}>{level}</Text>
        <Pressable accessibilityLabel={t('nextLevel')} disabled={level >= unlocked} onPress={() => setLevel(level + 1)}><Text style={[s.levelArrow, level >= unlocked && s.disabled]}>›</Text></Pressable>
      </View>}
    </View>
    <WebView key={`${game.id}:${level}`} source={game.offlineHtmlKey ? { html: getMiniGameHtml(game.offlineHtmlKey, locale, level) } : { uri: game.h5Url! }} originWhitelist={game.offlineHtmlKey ? ['*'] : undefined} style={s.web}
      onMessage={(event: WebViewMessageEvent): void => {
        if (!levelGame || !userId) return;
        if (!parseCompletionMessage(event.nativeEvent.data, levelGame, level)) return;
        void recordCompletion(AsyncStorage, userId, levelGame, level).then(value => setUnlocked(value));
      }} />
  </SafeAreaView>;
}

const s = StyleSheet.create({
  blocked: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F7F8' },
  blockedText: { fontSize: 20, fontWeight: '800', color: '#1A2C3D' }, link: { color: '#26777E', fontWeight: '700', marginTop: 20 },
  webScreen: { flex: 1, backgroundColor: '#FFF' }, toolbar: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18 },
  back: { fontSize: 36, color: '#1A2C3D' }, title: { fontWeight: '800', fontSize: 16, color: '#1A2C3D', flex: 1 }, web: { flex: 1 },
  levelNav: { flexDirection: 'row', alignItems: 'center', gap: 7 }, levelArrow: { color: '#26777E', fontSize: 30, width: 28, textAlign: 'center' }, disabled: { color: '#B9C6CC' }, levelText: { color: '#1A2C3D', fontWeight: '800', minWidth: 22, textAlign: 'center' },
});
