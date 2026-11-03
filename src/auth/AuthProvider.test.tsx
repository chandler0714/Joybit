import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';
import { AuthProvider, useAuth } from './AuthProvider';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

const session = { access_token: 'valid', refresh_token: 'refresh', expires_at: 2000000000, user: { id: 'u1', email: 'a@b.co' } };

function Probe() {
  const auth = useAuth();
  return <>
    <Text>{auth.session?.user.id ?? (auth.loading ? 'loading' : 'guest')}</Text>
    <Pressable onPress={() => void auth.signIn('a@b.co', 'password')}><Text>sign in</Text></Pressable>
    <Pressable onPress={() => void auth.signOut()}><Text>sign out</Text></Pressable>
    <Pressable onPress={() => void auth.requireValidSession()}><Text>open game</Text></Pressable>
  </>;
}

function mockClient(initial: typeof session | null = null) {
  let current = initial;
  const listeners: Array<(event: string, session: typeof current) => void> = [];
  return {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: current }, error: null })),
      getUser: jest.fn(async () => ({ data: { user: current?.user ?? null }, error: current ? null : new Error('expired') })),
      onAuthStateChange: jest.fn((cb: (event: string, session: typeof current) => void) => { listeners.push(cb); return { data: { subscription: { unsubscribe() {} } } }; }),
      signInWithPassword: jest.fn(async () => { current = session; listeners.forEach(cb => cb('SIGNED_IN', current)); return { data: { session: current }, error: null }; }),
      signUp: jest.fn(),
      signOut: jest.fn(async () => { current = null; listeners.forEach(cb => cb('SIGNED_OUT', null)); return { error: null }; }),
      refreshSession: jest.fn(async () => ({ data: { session: current }, error: current ? null : new Error('expired') })),
    },
    functions: { invoke: jest.fn() },
  };
}

test('restores a session and signs out to guest', async () => {
  const client = mockClient(session);
  await render(<AuthProvider client={client as never}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('u1')).toBeTruthy());
  await fireEvent.press(screen.getByText('sign out'));
  await waitFor(() => expect(screen.getByText('guest')).toBeTruthy());
});

test('guest may stay guest until signing in', async () => {
  const client = mockClient();
  await render(<AuthProvider client={client as never}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('guest')).toBeTruthy());
  await fireEvent.press(screen.getByText('sign in'));
  await waitFor(() => expect(screen.getByText('u1')).toBeTruthy());
});

test('an expired or revoked session cannot enter a game', async () => {
  const expired = { ...session, expires_at: 1 };
  const client = mockClient(expired);
  client.auth.refreshSession.mockResolvedValueOnce({ data: { session: null }, error: new Error('expired') } as never);
  let result: unknown;
  function Gate() {
    const auth = useAuth();
    return <Pressable onPress={() => { void auth.requireValidSession().then(value => { result = value; }); }}><Text>gate</Text></Pressable>;
  }
  await render(<AuthProvider client={client as never}><Gate /></AuthProvider>);
  await fireEvent.press(screen.getByText('gate'));
  await waitFor(() => expect(result).toBeNull());
});

test('a previously signed-in player keeps local game access after an offline restart', async () => {
  const { getItemAsync } = require('expo-secure-store');
  getItemAsync.mockResolvedValueOnce(JSON.stringify({ ...session, expires_at: 1 }));
  const client = mockClient();
  const networkError = Object.assign(new Error('offline'), { name: 'AuthRetryableFetchError' });
  client.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: networkError } as never);
  await render(<AuthProvider client={client as never}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('u1')).toBeTruthy());
  await fireEvent.press(screen.getByText('sign out'));
  await waitFor(() => expect(screen.getByText('guest')).toBeTruthy());
});

test('a temporary network failure on native-game validation keeps the offline login', async () => {
  const client = mockClient({ ...session, expires_at: 1 });
  const networkError = Object.assign(new Error('offline'), { name: 'AuthRetryableFetchError' });
  client.auth.refreshSession.mockResolvedValueOnce({ data: { session: null }, error: networkError } as never);
  await render(<AuthProvider client={client as never}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('u1')).toBeTruthy());
  await fireEvent.press(screen.getByText('open game'));
  await waitFor(() => expect(client.auth.refreshSession).toHaveBeenCalled());
  expect(screen.getByText('u1')).toBeTruthy();
});

test('signing out offline removes an expired cached login before the next launch', async () => {
  const { getItemAsync, deleteItemAsync } = require('expo-secure-store');
  let cached: string | null = JSON.stringify({ ...session, expires_at: 1 });
  getItemAsync.mockImplementation(async () => cached);
  deleteItemAsync.mockImplementation(async () => { cached = null; });
  const client = mockClient(session);
  const networkError = Object.assign(new Error('offline'), { name: 'AuthRetryableFetchError' });
  client.auth.signOut.mockResolvedValueOnce({ error: networkError } as never);
  const view = await render(<AuthProvider client={client as never}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('u1')).toBeTruthy());
  await fireEvent.press(screen.getByText('sign out'));
  await waitFor(() => expect(screen.getByText('guest')).toBeTruthy());
  expect(cached).toBeNull();
  await view.unmount();
  const restarted = mockClient();
  restarted.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: networkError } as never);
  await render(<AuthProvider client={restarted as never}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByText('guest')).toBeTruthy());
});

test('a late startup session read cannot restore an account after sign-out', async () => {
  let release!: (value: { data: { session: typeof session }; error: null }) => void;
  const delayed = new Promise<{ data: { session: typeof session }; error: null }>(resolve => { release = resolve; });
  const client = mockClient();
  client.auth.getSession.mockReturnValueOnce(delayed);
  await render(<AuthProvider client={client as never}><Probe /></AuthProvider>);
  await fireEvent.press(screen.getByText('sign in'));
  await waitFor(() => expect(screen.getByText('u1')).toBeTruthy());
  await fireEvent.press(screen.getByText('sign out'));
  await waitFor(() => expect(screen.getByText('guest')).toBeTruthy());
  await act(async () => { release({ data: { session }, error: null }); await delayed; });
  expect(screen.getByText('guest')).toBeTruthy();
});
