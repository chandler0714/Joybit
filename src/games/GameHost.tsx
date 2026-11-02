import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { Session } from '@supabase/supabase-js';
import type { Game } from '../catalog/catalog';
import { SteadyDropScreen } from './SteadyDropScreen';

export type RotatedSession = { accessToken: string; refreshToken: string; userId: string };
type Props = { game: Game; session: Session | null; onExit(): void; onSessionRotated(value: RotatedSession): void };

export function GameHost({ game, session, onExit, onSessionRotated }: Props) {
  if (!session || !session.access_token || !session.refresh_token || !session.user.id ||
      (session.expires_at != null && session.expires_at <= Math.floor(Date.now() / 1000) + 30)) {
    return <SafeAreaView style={s.blocked}><Text style={s.blockedText}>请先登录 Joybit</Text><Pressable onPress={onExit}><Text style={s.link}>返回游戏列表</Text></Pressable></SafeAreaView>;
  }
  if (game.kind === 'native') {
    return <SteadyDropScreen session={session} onExit={onExit} onSessionRotated={onSessionRotated} />;
  }
  if (!game.h5Url) return <SafeAreaView style={s.blocked}><Text>游戏地址尚未配置</Text><Pressable onPress={onExit}><Text style={s.link}>返回游戏列表</Text></Pressable></SafeAreaView>;
  return <SafeAreaView style={s.webScreen}>
    <View style={s.toolbar}><Pressable accessibilityLabel="返回游戏列表" onPress={onExit}><Text style={s.back}>‹</Text></Pressable><Text style={s.title}>{game.title}</Text></View>
    <WebView source={{ uri: game.h5Url }} style={s.web} />
  </SafeAreaView>;
}

const s = StyleSheet.create({
  blocked: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F7F8' },
  blockedText: { fontSize: 20, fontWeight: '800', color: '#1A2C3D' }, link: { color: '#26777E', fontWeight: '700', marginTop: 20 },
  webScreen: { flex: 1, backgroundColor: '#FFF' }, toolbar: { height: 54, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 18 },
  back: { fontSize: 36, color: '#1A2C3D' }, title: { fontWeight: '800', fontSize: 18, color: '#1A2C3D' }, web: { flex: 1 },
});
