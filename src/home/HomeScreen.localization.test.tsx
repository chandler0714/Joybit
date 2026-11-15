import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { HomeScreen } from './HomeScreen';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-localization', () => ({ getLocales: jest.fn(() => [{ languageTag: 'en-US', languageCode: 'en' }]) }));

const safeArea = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 59, bottom: 34, left: 0, right: 0 } };

test('settings changes the empty library and menu from device English to French immediately', async () => {
  await AsyncStorage.clear();
  await render(<SafeAreaProvider initialMetrics={safeArea}><LanguageProvider>
    <HomeScreen account={null} />
  </LanguageProvider></SafeAreaProvider>);
  expect(screen.getByText('No games available')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Open menu'));
  await fireEvent.press(screen.getByText('Settings'));
  expect(screen.getByText('Language')).toBeTruthy();
  await fireEvent.press(screen.getByText('Français'));
  await waitFor(() => expect(screen.getByText('Paramètres')).toBeTruthy());
  expect(await AsyncStorage.getItem('joybit.language')).toBe('fr');
  await fireEvent.press(screen.getByLabelText('Retour à l’accueil'));
  expect(screen.getByText('Jeux')).toBeTruthy();
  expect(screen.getByText('Aucun jeu disponible')).toBeTruthy();
});
