import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameHost } from './GameHost';
import { GAMES, type Game } from '../catalog/catalog';

jest.mock('./SteadyDropScreen', () => {
  const { Text, View } = require('react-native');
  return { SteadyDropScreen: ({ onExit }: { onExit(): void }) => <View><Text>native game</Text><Text onPress={onExit}>native exit</Text></View> };
});
jest.mock('react-native-webview', () => {
  const { Text } = require('react-native');
  return { WebView: ({ source, onMessage }: { source: { uri?: string; html?: string }; onMessage?: unknown }) => <Text testID="mock-webview" onMessage={onMessage}>{source.uri ?? source.html}</Text> };
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

test('opens a bundled game with a cached expired login and no network token in HTML', async () => {
  const game: Game = { ...GAMES[0], id: 'reaction', kind: 'h5', offlineHtmlKey: 'reaction' };
  const expired = { ...session, expires_at: 1, access_token: 'private-access-token' };
  await render(<GameHost game={game} session={expired as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  expect(screen.getAllByText(/Reaction Rush/).length).toBeGreaterThan(0);
  expect(screen.queryByText(/private-access-token/)).toBeNull();
});

test('requires login before a bundled game mounts', async () => {
  const game: Game = { ...GAMES[0], id: 'reaction', kind: 'h5', offlineHtmlKey: 'reaction' };
  await render(<GameHost game={game} session={null} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  expect(screen.getByText('Sign in to Joybit first')).toBeTruthy();
});

test('blocks a missing or expired session before mounting either game', async () => {
  await render(<GameHost game={GAMES[0]} session={{ ...session, expires_at: 1 } as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  expect(screen.getByText('Sign in to Joybit first')).toBeTruthy();
  expect(screen.queryByText('native game')).toBeNull();
});

test('a completed level unlocks the next level only for the signed-in account', async () => {
  await AsyncStorage.clear();
  const game = GAMES.find(item => item.id === 'hex')!;
  await render(<GameHost game={game} session={session as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  await waitFor(() => expect(screen.getByTestId('mock-webview')).toBeTruthy());
  await fireEvent.press(screen.getByLabelText('Next level'));
  expect(screen.getByText('1')).toBeTruthy();
  await act(async () => {
    fireEvent(screen.getByTestId('mock-webview'), 'message', { nativeEvent: { data: JSON.stringify({ type: 'levelComplete', game: 'hex', level: 1 }) } });
  });
  await waitFor(async () => expect(JSON.parse((await AsyncStorage.getItem('joybit.levels.v1.u1.hex')) ?? 'null')).toEqual({ generatorVersion: 1, unlocked: 2 }));
  await fireEvent.press(screen.getByLabelText('Next level'));
  expect(screen.getByText('2')).toBeTruthy();
});
