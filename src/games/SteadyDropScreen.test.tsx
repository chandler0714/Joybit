import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SteadyDropScreen } from './SteadyDropScreen';

jest.mock('../../modules/steady-drop', () => {
  const { View } = require('react-native');
  return { SteadyDropNativeView: (props: unknown) => <View testID="native-steady-drop" {...props as object} /> };
});
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 59, bottom: 0, left: 0, right: 0 }) }));

test('mounts the native scene with Joybit session and offers an exit', async () => {
  const onExit = jest.fn();
  await render(<SteadyDropScreen session={{ access_token: 'access', refresh_token: 'refresh', user: { id: 'u1', email: 'a@b.co' } } as never}
    onExit={onExit} onSessionRotated={jest.fn()} />);
  const view = screen.getByTestId('native-steady-drop');
  const payload = JSON.parse(view.props.sessionJson);
  expect([payload.accessToken, payload.refreshToken, payload.userId]).toEqual(['access', 'refresh', 'u1']);
  await fireEvent.press(screen.getByLabelText('Back to Joybit'));
  expect(onExit).toHaveBeenCalledTimes(1);
});

test('updated tokens arrive together', async () => {
  const current = { access_token: 'old-access', refresh_token: 'old-refresh', user: { id: 'u1', email: 'a@b.co' } };
  const result = await render(<SteadyDropScreen session={current as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  await result.rerender(<SteadyDropScreen session={{ ...current, access_token: 'new-access', refresh_token: 'new-refresh' } as never} onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  const payload = JSON.parse(screen.getByTestId('native-steady-drop').props.sessionJson);
  expect([payload.accessToken, payload.refreshToken]).toEqual(['new-access', 'new-refresh']);
});

test('the return button clears the top safe-area inset', async () => {
  await render(<SteadyDropScreen session={{ access_token: 'access', refresh_token: 'refresh', user: { id: 'u1', email: 'a@b.co' } } as never}
    onExit={jest.fn()} onSessionRotated={jest.fn()} />);
  const toolbar = screen.getByTestId('native-game-toolbar');
  expect(StyleSheet.flatten(toolbar.props.style)).toEqual(expect.objectContaining({ paddingTop: 59, height: 111 }));
});
