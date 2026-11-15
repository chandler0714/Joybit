import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageProvider';

export type DrawerPanel = 'profile' | 'settings';
type Props = { account: { displayName: string } | null; onClose(): void; onSelect(panel: DrawerPanel): void };

export function Drawer({ account, onClose, onSelect }: Props) {
  const { t } = useLanguage();
  const { top, bottom } = useSafeAreaInsets();
  const position = useRef(new Animated.Value(-340)).current;
  useEffect(() => { Animated.timing(position, { toValue: 0, duration: 220, useNativeDriver: true }).start(); }, [position]);
  return <View style={s.layer}>
    <Pressable style={s.scrim} onPress={onClose} accessibilityLabel={t('menuScrim')} />
    <Animated.View testID="drawer-surface" style={[s.drawer, { paddingTop: top + 18, paddingBottom: bottom + 26, transform: [{ translateX: position }] }]}>
      <View style={s.top}><Text style={s.brand}>Joybit<Text style={s.dot}>.</Text></Text>
        <Pressable onPress={onClose} accessibilityLabel={t('menuClose')} style={s.close}><Text style={s.closeText}>×</Text></Pressable>
      </View>
      <View style={s.profile}><View style={s.avatar}><Text style={s.avatarText}>J</Text></View><View style={s.profileCopy}>
        <Text style={s.small}>{account ? t('welcomeBack') : t('helloPlayer')}</Text>
        <Text style={s.name} numberOfLines={2}>{account?.displayName ?? t('guest')}</Text>
      </View></View>
      <View style={s.menu}>
        <MenuItem icon="◉" label={t('profileTitle')} onPress={() => onSelect('profile')} />
        <MenuItem icon="⚙" label={t('settingsTitle')} onPress={() => onSelect('settings')} />
      </View>
      <Text style={s.footer}>{t('drawerTagline')}</Text>
    </Animated.View>
  </View>;
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress(): void }) {
  return <Pressable onPress={onPress} style={s.item}><Text style={s.icon}>{icon}</Text><Text style={s.itemText}>{label}</Text><Text style={s.chevron}>›</Text></Pressable>;
}

const s = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, zIndex: 20, flexDirection: 'row' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12,25,42,0.42)' },
  drawer: { width: '82%', maxWidth: 340, height: '100%', backgroundColor: '#FFFFFF', paddingHorizontal: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 27, fontWeight: '900', color: '#1A2C3D', letterSpacing: -1.5 },
  dot: { color: '#FFB94D' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 30, color: '#75848F' },
  profile: { backgroundColor: '#F4F7FA', borderRadius: 22, padding: 18, marginTop: 36, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#FFE0A5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#6B4410', fontSize: 24, fontWeight: '900' },
  profileCopy: { flex: 1 },
  small: { color: '#8A99A4', fontSize: 11 },
  name: { color: '#1A2C3D', fontSize: 17, fontWeight: '800' },
  menu: { marginTop: 28, gap: 4 },
  item: { height: 58, flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 14, paddingHorizontal: 12 },
  icon: { color: '#536776', fontSize: 24, width: 30, textAlign: 'center' },
  itemText: { color: '#273E4D', fontSize: 16, fontWeight: '700' },
  chevron: { color: '#B8C5CC', fontSize: 27, marginLeft: 'auto' },
  footer: { marginTop: 'auto', color: '#B3C0C8', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
});
