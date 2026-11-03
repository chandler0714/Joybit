import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../i18n/LanguageProvider';

export function AdSlot() {
  const { t } = useLanguage();
  return <View style={s.slot} accessibilityLabel={t('bottomAd')}>
    <Text style={s.badge}>AD</Text><Text style={s.label}>{t('adSlot')}</Text>
    <Text style={s.detail}>{t('adComing')}</Text>
  </View>;
}

const s = StyleSheet.create({
  slot: { height: 58, marginHorizontal: 18, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: '#DDE5EA', backgroundColor: '#F8FBFD', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  badge: { color: '#75848F', fontSize: 9, fontWeight: '800', backgroundColor: '#E5EEF2', padding: 4, borderRadius: 5 },
  label: { color: '#536776', fontSize: 13, fontWeight: '700' },
  detail: { color: '#91A1AB', fontSize: 11, marginLeft: 'auto' },
});
