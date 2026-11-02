import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { SteadyDropScreen } from './SteadyDropScreen';

jest.mock('../../modules/steady-drop', () => {
  const { View } = require('react-native');
  return { SteadyDropNativeView: (props: unknown) => <View testID="native-steady-drop" {...props as object} /> };
});

test('mounts the native scene with Joybit session and offers an exit', async () => {
  const onExit = jest.fn();
  await render(<SteadyDropScreen session={{ access_token: 'access', refresh_token: 'refresh', user: { id: 'u1', email: 'a@b.co' } } as never}
    onExit={onExit} onSessionRotated={jest.fn()} />);
  const view = screen.getByTestId('native-steady-drop');
  expect([view.props.accessToken, view.props.refreshToken, view.props.userId]).toEqual(['access', 'refresh', 'u1']);
  await fireEvent.press(screen.getByLabelText('返回 Joybit'));
  expect(onExit).toHaveBeenCalledTimes(1);
});
