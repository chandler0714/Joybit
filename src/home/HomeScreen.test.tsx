import React from 'react';
import { Dimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GAMES } from '../catalog/catalog';
import { HomeScreen } from './HomeScreen';

const safeArea = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 59, bottom: 34, left: 0, right: 0 } };
const renderInSafeArea = (view: React.ReactElement) => render(<SafeAreaProvider initialMetrics={safeArea}>{view}</SafeAreaProvider>);

async function renderHome() {
  const onToggleFavorite = jest.fn();
  const onOpenGame = jest.fn();
  await renderInSafeArea(
    <HomeScreen
      games={GAMES}
      favoriteIds={[]}
      onToggleFavorite={onToggleFavorite}
      onOpenGame={onOpenGame}
      account={null}
    />,
  );
  return { onToggleFavorite, onOpenGame };
}

test('catalog uses two columns and shows four playable games without fake counts', async () => {
  await renderHome();
  const cardWidth = screen.getByTestId('game-card-steady-drop').parent?.props.style.width as number;
  expect(cardWidth).toBeGreaterThan(Dimensions.get('window').width * 0.4);
  expect(cardWidth).toBeLessThan(Dimensions.get('window').width * 0.55);
  expect(screen.getAllByTestId(/^game-card-/)).toHaveLength(4);
  expect(screen.getByText('Hexa Landing')).toBeTruthy();
  expect(screen.getByText('Reaction Rush')).toBeTruthy();
  expect(screen.getByText('Memory Match')).toBeTruthy();
  expect(screen.getByText('Number Puzzle')).toBeTruthy();
  expect(screen.queryByText(/人玩过/)).toBeNull();
});

test('card opens its game and exposes a separate favorite button', async () => {
  const { onOpenGame, onToggleFavorite } = await renderHome();
  await fireEvent.press(screen.getByLabelText('Open Hexa Landing'));
  expect(onOpenGame).toHaveBeenCalledWith('steady-drop');
  await fireEvent.press(screen.getByLabelText('Favorite Hexa Landing'));
  expect(onToggleFavorite).toHaveBeenCalledWith('steady-drop');
});

test('drawer hides and restores the bottom ad slot', async () => {
  await renderHome();
  expect(screen.getByText('Ad space')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Open menu'));
  expect(screen.getByText('Account')).toBeTruthy();
  expect(screen.getByText('Favorites')).toBeTruthy();
  expect(screen.getByText('Settings')).toBeTruthy();
  expect(screen.queryByText('Ad space')).toBeNull();
  await fireEvent.press(screen.getByLabelText('Close menu'));
  expect(screen.getByText('Ad space')).toBeTruthy();
});

test('favorites menu shows the saved game and can return to catalog', async () => {
  await renderInSafeArea(
    <HomeScreen
      games={GAMES}
      favoriteIds={['steady-drop']}
      onToggleFavorite={jest.fn()}
      onOpenGame={jest.fn()}
      account={null}
    />,
  );
  await fireEvent.press(screen.getByLabelText('Open menu'));
  await fireEvent.press(screen.getByText('Favorites'));
  expect(screen.getByText('My favorites')).toBeTruthy();
  expect(screen.getByLabelText('Remove Hexa Landing from favorites')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('Back to games'));
  expect(screen.getByText('Featured games')).toBeTruthy();
});

test('signed-in users can retry a failed favorites sync', async () => {
  const onRetryFavorites = jest.fn();
  await renderInSafeArea(<HomeScreen games={GAMES} favoriteIds={[]} onToggleFavorite={jest.fn()} onOpenGame={jest.fn()}
    account={{ displayName: 'player@example.com' }} favoritesStatus="error" onRetryFavorites={onRetryFavorites} />);
  await fireEvent.press(screen.getByLabelText('Retry favorites sync'));
  expect(onRetryFavorites).toHaveBeenCalledTimes(1);
});
