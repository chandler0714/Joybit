import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { LanguageProvider, useLanguage } from './LanguageProvider';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-localization', () => ({ getLocales: jest.fn(() => [{ languageTag: 'fr-CA', languageCode: 'fr' }]) }));

function Probe() {
  const { locale, preference, setPreference, t } = useLanguage();
  return <>
    <Text>locale:{locale}</Text><Text>preference:{preference}</Text><Text>{t('settingsTitle')}</Text>
    <Pressable onPress={() => void setPreference('ja')}><Text>choose Japanese</Text></Pressable>
    <Pressable onPress={() => void setPreference('auto')}><Text>choose automatic</Text></Pressable>
  </>;
}

beforeEach(async () => { await AsyncStorage.clear(); });

test('defaults to the device language, remembers manual choice, and returns to automatic', async () => {
  const first = await render(<LanguageProvider><Probe /></LanguageProvider>);
  await waitFor(() => expect(screen.getByText('locale:fr')).toBeTruthy());
  expect(screen.getByText('Paramètres')).toBeTruthy();
  await fireEvent.press(screen.getByText('choose Japanese'));
  await waitFor(() => expect(screen.getByText('locale:ja')).toBeTruthy());
  expect(await AsyncStorage.getItem('joybit.language')).toBe('ja');
  await first.unmount();
  const second = await render(<LanguageProvider><Probe /></LanguageProvider>);
  await waitFor(() => expect(screen.getByText('locale:ja')).toBeTruthy());
  await fireEvent.press(screen.getByText('choose automatic'));
  await waitFor(() => expect(screen.getByText('locale:fr')).toBeTruthy());
  expect(await AsyncStorage.getItem('joybit.language')).toBe('auto');
  await second.unmount();
  (getLocales as jest.Mock).mockReturnValue([{ languageTag: 'zh-CN', languageCode: 'zh' }]);
  await render(<LanguageProvider><Probe /></LanguageProvider>);
  await waitFor(() => expect(screen.getByText('locale:en')).toBeTruthy());
  expect(screen.getByText('Settings')).toBeTruthy();
});
