import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { AuthScreen } from './AuthScreen';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-localization', () => ({ getLocales: jest.fn(() => [{ languageTag: 'fr-FR', languageCode: 'fr' }]) }));
jest.mock('./AuthProvider', () => ({ useAuth: () => ({ signUp: jest.fn(), signIn: jest.fn(), verifyEmail: jest.fn(), resendEmail: jest.fn() }) }));

test('email sign-in and registration labels follow the selected language', async () => {
  await AsyncStorage.clear();
  await render(<LanguageProvider><AuthScreen onClose={jest.fn()} /></LanguageProvider>);
  expect(screen.getByText('Bon retour')).toBeTruthy();
  expect(screen.getByLabelText('E-mail')).toBeTruthy();
  await fireEvent.press(screen.getByText('Pas de compte ? Inscrivez-vous'));
  expect(screen.getByText('Créer un compte')).toBeTruthy();
  expect(screen.getByText('S’inscrire')).toBeTruthy();
});
