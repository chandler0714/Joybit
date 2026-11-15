import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './HomeScreen';

const safeArea = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 59, bottom: 34, left: 0, right: 0 } };
const renderInSafeArea = (view: React.ReactElement) => render(<SafeAreaProvider initialMetrics={safeArea}>{view}</SafeAreaProvider>);

test('home displays an empty library without game cards or ads', async () => {
  await renderInSafeArea(<HomeScreen account={null} />);
  expect(screen.getByText('Games')).toBeTruthy();
  expect(screen.getByText('No games available')).toBeTruthy();
  expect(screen.getByText('The game library is empty.')).toBeTruthy();
  expect(screen.queryAllByTestId(/^game-card-/)).toHaveLength(0);
  expect(screen.queryByText('Ad space')).toBeNull();
});

test('drawer keeps account and settings accessible', async () => {
  const onSignIn = jest.fn();
  await renderInSafeArea(<HomeScreen account={null} onSignIn={onSignIn} />);
  await fireEvent.press(screen.getByLabelText('Open menu'));
  expect(screen.getByText('Account')).toBeTruthy();
  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.queryByText('Favorites')).toBeNull();
  await fireEvent.press(screen.getByText('Account'));
  await fireEvent.press(screen.getByText('Sign in / Register'));
  expect(onSignIn).toHaveBeenCalledTimes(1);
  await fireEvent.press(screen.getByLabelText('Back to home'));
  expect(screen.getByText('No games available')).toBeTruthy();
});

test('signed-in account can sign out or request deletion', async () => {
  const onSignOut = jest.fn();
  const onDeleteAccount = jest.fn();
  await renderInSafeArea(<HomeScreen account={{ displayName: 'player@example.com' }} onSignOut={onSignOut} onDeleteAccount={onDeleteAccount} />);
  await fireEvent.press(screen.getByLabelText('Open menu'));
  await fireEvent.press(screen.getByText('Account'));
  expect(screen.getByText('player@example.com')).toBeTruthy();
  await fireEvent.press(screen.getByText('Sign out'));
  await fireEvent.press(screen.getByText('Delete account'));
  expect(onSignOut).toHaveBeenCalledTimes(1);
  expect(onDeleteAccount).toHaveBeenCalledTimes(1);
});
