import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('./auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ session: null, signOut: jest.fn() }),
}));
jest.mock('./auth/AuthScreen', () => ({ AuthScreen: () => { const { Text } = require('react-native'); return <Text>auth screen</Text>; } }));

test('an empty Joybit library has no game entry and keeps account access', async () => {
  await render(<App />);
  expect(screen.getByText('No games available')).toBeTruthy();
  expect(screen.queryAllByTestId(/^game-card-/)).toHaveLength(0);
  await fireEvent.press(screen.getByLabelText('Open menu'));
  await fireEvent.press(screen.getByText('Account'));
  await fireEvent.press(screen.getByText('Sign in / Register'));
  expect(screen.getByText('auth screen')).toBeTruthy();
});
