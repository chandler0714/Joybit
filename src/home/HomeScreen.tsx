import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Drawer, type DrawerPanel } from './Drawer';
import { LANGUAGE_CODES, LANGUAGE_NAMES, type LanguagePreference } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageProvider';

type Panel = 'home' | DrawerPanel;
type Props = { account: { displayName: string } | null; onSignIn?(): void; onSignOut?(): void; onDeleteAccount?(): void };

export function HomeScreen({ account, onSignIn, onSignOut, onDeleteAccount }: Props) {
  const { t, preference, setPreference } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('home');
  const title = panel === 'home' ? t('homeTitle') : panel === 'profile' ? t('profileTitle') : t('settingsTitle');

  function openPanel(next: DrawerPanel) { setPanel(next); setDrawerOpen(false); }

  return <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
    <View style={s.header}>
      {panel === 'home' ? <Pressable style={s.headerButton} onPress={() => setDrawerOpen(true)} accessibilityLabel={t('menuOpen')}>
        <View style={s.menuLine} /><View style={s.menuLine} /><View style={s.menuLineShort} />
      </Pressable> : <Pressable style={s.headerButton} onPress={() => setPanel('home')} accessibilityLabel={t('backToHome')}><Text style={s.backText}>‹</Text></Pressable>}
      <Text style={s.brand}>Joybit<Text style={s.brandDot}>.</Text></Text><View style={s.headerButton} />
    </View>
    <View style={s.content}>
      <Text style={s.eyebrow}>{t('homeEyebrow')}</Text><Text style={s.heading}>{title}</Text>
      {panel === 'profile' ? <View style={s.panelCard}><Text style={s.panelTitle}>{account?.displayName ?? t('guest')}</Text><Text style={s.panelDetail}>{account ? t('welcomeJoybit') : t('loginToAccount')}</Text>
          {account ? <><Pressable onPress={onSignOut} accessibilityLabel={t('signOut')} style={s.action}><Text style={s.actionText}>{t('signOut')}</Text></Pressable><Pressable onPress={onDeleteAccount} accessibilityLabel={t('deleteAccount')} style={s.action}><Text style={s.dangerText}>{t('deleteAccount')}</Text></Pressable></>
            : <Pressable onPress={onSignIn} accessibilityLabel={t('signInJoybit')} style={s.action}><Text style={s.actionText}>{t('loginRegister')}</Text></Pressable>}</View>
        : panel === 'settings' ? <ScrollView contentContainerStyle={s.settingsContent}>
            <View style={s.panelCard}><Text style={s.panelTitle}>{t('language')}</Text>
              {(['auto', ...LANGUAGE_CODES] as LanguagePreference[]).map(option => <Pressable key={option}
                accessibilityRole="radio" accessibilityState={{ selected: preference === option }}
                onPress={() => { void setPreference(option); }} style={s.languageRow}>
                <Text style={s.languageText}>{option === 'auto' ? t('autoLanguage') : LANGUAGE_NAMES[option]}</Text>
                {preference === option && <Text style={s.languageSelected}>✓</Text>}
              </Pressable>)}
            </View>
            <View style={s.panelCard}><Text style={s.panelTitle}>{t('aboutJoybit')}</Text><Text style={s.panelDetail}>{t('aboutDetail')}</Text></View>
          </ScrollView>
        : <View style={s.emptyCard} testID="empty-catalog"><Text style={s.emptyIcon}>◇</Text><Text style={s.emptyTitle}>{t('emptyCatalog')}</Text><Text style={s.emptyDetail}>{t('emptyCatalogHint')}</Text></View>}
    </View>
    {drawerOpen && <Drawer account={account} onClose={() => setDrawerOpen(false)} onSelect={openPanel} />}
  </SafeAreaView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F7F8' },
  header: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17 },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start', gap: 5 },
  menuLine: { width: 21, height: 2, backgroundColor: '#304653', borderRadius: 2 },
  menuLineShort: { width: 15, height: 2, backgroundColor: '#304653', borderRadius: 2 },
  backText: { color: '#304653', fontSize: 36, lineHeight: 40 },
  brand: { color: '#1A2C3D', fontSize: 25, fontWeight: '900', letterSpacing: -1.4 },
  brandDot: { color: '#F6B94F' },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  eyebrow: { color: '#78AEB1', fontSize: 10, fontWeight: '900', letterSpacing: 2.2 },
  heading: { color: '#1C3545', fontSize: 28, fontWeight: '900', marginTop: 5, marginBottom: 20, letterSpacing: -0.8 },
  panelCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, borderWidth: 1, borderColor: '#E9EEF1' },
  settingsContent: { gap: 12, paddingBottom: 24 },
  languageRow: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E9EEF1' },
  languageText: { color: '#273E4D', fontSize: 14, flexShrink: 1, paddingRight: 12 },
  languageSelected: { color: '#25767C', fontSize: 18, fontWeight: '800' },
  panelTitle: { color: '#1C3545', fontSize: 17, fontWeight: '800' },
  panelDetail: { color: '#81939D', fontSize: 13, marginTop: 8 },
  action: { paddingVertical: 14, marginTop: 12 },
  actionText: { color: '#25767C', fontWeight: '800', fontSize: 15 },
  dangerText: { color: '#BF5B59', fontWeight: '700', fontSize: 14 },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E9EEF1', padding: 28, minHeight: 240, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { color: '#78AEB1', fontSize: 48, marginBottom: 10 },
  emptyTitle: { color: '#1C3545', fontSize: 19, fontWeight: '800', textAlign: 'center' },
  emptyDetail: { color: '#81939D', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 21 },
});
