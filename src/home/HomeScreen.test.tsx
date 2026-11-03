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
  expect(screen.getByText('反应挑战')).toBeTruthy();
  expect(screen.getByText('记忆翻牌')).toBeTruthy();
  expect(screen.getByText('数字拼图')).toBeTruthy();
  expect(screen.queryByText(/人玩过/)).toBeNull();
});

test('card opens its game and exposes a separate favorite button', async () => {
  const { onOpenGame, onToggleFavorite } = await renderHome();
  await fireEvent.press(screen.getByLabelText('打开 Hexa Landing'));
  expect(onOpenGame).toHaveBeenCalledWith('steady-drop');
  await fireEvent.press(screen.getByLabelText('收藏 Hexa Landing'));
  expect(onToggleFavorite).toHaveBeenCalledWith('steady-drop');
});

test('drawer hides and restores the bottom ad slot', async () => {
  await renderHome();
  expect(screen.getByText('广告位')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('打开菜单'));
  expect(screen.getByText('用户信息')).toBeTruthy();
  expect(screen.getByText('收藏')).toBeTruthy();
  expect(screen.getByText('设置')).toBeTruthy();
  expect(screen.queryByText('广告位')).toBeNull();
  await fireEvent.press(screen.getByLabelText('关闭菜单'));
  expect(screen.getByText('广告位')).toBeTruthy();
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
  await fireEvent.press(screen.getByLabelText('打开菜单'));
  await fireEvent.press(screen.getByText('收藏'));
  expect(screen.getByText('我的收藏')).toBeTruthy();
  expect(screen.getByLabelText('取消收藏 Hexa Landing')).toBeTruthy();
  await fireEvent.press(screen.getByLabelText('返回游戏列表'));
  expect(screen.getByText('精选游戏')).toBeTruthy();
});

test('signed-in users can retry a failed favorites sync', async () => {
  const onRetryFavorites = jest.fn();
  await renderInSafeArea(<HomeScreen games={GAMES} favoriteIds={[]} onToggleFavorite={jest.fn()} onOpenGame={jest.fn()}
    account={{ displayName: 'player@example.com' }} favoritesStatus="error" onRetryFavorites={onRetryFavorites} />);
  await fireEvent.press(screen.getByLabelText('重试收藏同步'));
  expect(onRetryFavorites).toHaveBeenCalledTimes(1);
});
