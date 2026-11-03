import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RotatedSession } from './GameHost';
import { SteadyDropNativeView } from '../../modules/steady-drop';
import { useLanguage } from '../i18n/LanguageProvider';

type Props = { session: Session; onExit(): void; onSessionRotated(value: RotatedSession): void };

export function SteadyDropScreen({ session, onExit, onSessionRotated }: Props) {
  const { t } = useLanguage();
  const { top } = useSafeAreaInsets();
  if (Platform.OS !== 'ios') return <View style={s.fallback}><Text style={s.text}>{t('nativeOnlyIos')}</Text><Pressable onPress={onExit}><Text style={s.link}>{t('backToGames')}</Text></Pressable></View>;
  return <View style={s.screen}>
    <View testID="native-game-toolbar" style={[s.toolbar, { height: 52 + top, paddingTop: top }]}><Pressable accessibilityLabel={t('backJoybit')} onPress={onExit} style={s.backButton}><Text style={s.backText}>‹  Joybit</Text></Pressable></View>
    <SteadyDropNativeView style={s.game}
      sessionJson={JSON.stringify({ accessToken: session.access_token, refreshToken: session.refresh_token, userId: session.user.id, email: session.user.email ?? '' })}
      onExit={onExit}
      onSessionRotated={event => onSessionRotated(event.nativeEvent)} />
  </View>;
}

const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#12383F' }, toolbar: { height: 52, paddingTop: 4, paddingHorizontal: 12, justifyContent: 'center' }, backButton: { height: 44, justifyContent: 'center' }, backText: { color: '#BAEBD6', fontWeight: '700', fontSize: 16 }, game: { flex: 1 }, fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' }, text: { color: '#1A2C3D', fontSize: 16 }, link: { color: '#26777E', marginTop: 20 } });
