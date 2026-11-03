import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import App from '../App';

const mockRequireValidSession = jest.fn();
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children }));
jest.mock('./auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    session: { access_token: 'token', refresh_token: 'refresh', expires_at: 1, user: { id: 'u1' } },
    requireValidSession: mockRequireValidSession,
  }),
}));
jest.mock('./home/HomeScreen', () => ({
  HomeScreen: ({ onOpenGame }: { onOpenGame(id: string): void }) => {
    const { Pressable, Text } = require('react-native');
    return <Pressable onPress={() => onOpenGame('steady-drop')}><Text>open native</Text></Pressable>;
  },
}));
jest.mock('./auth/AuthScreen', () => ({ AuthScreen: () => { const { Text } = require('react-native'); return <Text>auth screen</Text>; } }));
jest.mock('./games/GameHost', () => ({ GameHost: () => { const { Text } = require('react-native'); return <Text>game host</Text>; } }));
jest.mock('./favorites/favoritesStore', () => ({ FavoritesStore: class {
  load = async () => [];
  subscribe = () => () => {};
} }));
jest.mock('./favorites/accountFavorites', () => ({ AccountFavorites: class {
  setSession = async () => {};
} }));

test('offline native validation stops once and leaves the signed-in catalog usable', async () => {
  mockRequireValidSession.mockReset().mockResolvedValueOnce(null).mockImplementation(() => new Promise(() => {}));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await render(<App />);
  await fireEvent.press(screen.getByText('open native'));
  await waitFor(() => expect(alert).toHaveBeenCalledWith('暂时无法进入游戏', expect.any(String)));
  expect(mockRequireValidSession).toHaveBeenCalledTimes(1);
  expect(screen.getByText('open native')).toBeTruthy();
  expect(screen.queryByText('auth screen')).toBeNull();
  alert.mockRestore();
});
