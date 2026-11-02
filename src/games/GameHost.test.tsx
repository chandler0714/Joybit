import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { GameHost } from './GameHost';
import { GAMES, type Game } from '../catalog/catalog';

jest.mock('./SteadyDropScreen', () => {
  const { Text, View } = require('react-native');
  return { SteadyDropScreen: ({ onExit }: { onExit(): void }) => <View><Text>native game</Text><Text onPress={onExit}>native exit</Text></View> };
});
jest.mock('react-native-webview', () => {
  const { Text } = require('react-native');
  return { WebView: ({ source }: { source: { uri: string } }) => <Text>{source.uri}</Text> };
});

const session = { access_token: 'token', refresh_token: 'refresh', expires_at: 2000000000, user: { id: 'u1', email: 'a@b.co' } };

test('opens native game and returns to the catalog', async () => {
  const onExit = jest.fn();
  await render(<GameHost game={GAMES[0]} session={session as never} onExit={onExit} onSessionRotated={jest.fn()} />);
  expect(screen.getByText('native game')).toBeTruthy();
  await fireEvent.press(screen.getByText('native exit'));
  expect(onExit).toHaveBeenCalledTimes(1);
});

test('routes H5 games to the internal web view', async () => {
  const game: Game = { ...GAMES[0], id: 'h5', kind: 'h5', h5Url: 'https://example.com/game' };
  await render(<GameHost game={game} session={session as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  expect(screen.getByText('https://example.com/game')).toBeTruthy();
});

test('blocks a missing or expired session before mounting either game', async () => {
  await render(<GameHost game={GAMES[0]} session={{ ...session, expires_at: 1 } as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  expect(screen.getByText('请先登录 Joybit')).toBeTruthy();
  expect(screen.queryByText('native game')).toBeNull();
});
