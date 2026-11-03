import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AuthScreen } from './AuthScreen';

const mockSignUp = jest.fn(async () => false);
jest.mock('./AuthProvider', () => ({
  useAuth: () => ({ signUp: mockSignUp, signIn: jest.fn(), verifyEmail: jest.fn(), resendEmail: jest.fn() }),
}));

test('registration offers only email and password, then email verification', async () => {
  await render(<AuthScreen onClose={jest.fn()} />);
  expect(screen.queryByText('通过 Apple 登录')).toBeNull();
  await fireEvent.press(screen.getByText('没有账号？注册'));
  expect(screen.getByLabelText('邮箱')).toBeTruthy();
  expect(screen.getByLabelText('密码')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('邮箱'), 'player@example.com');
  await fireEvent.changeText(screen.getByLabelText('密码'), 'sample-password');
  await fireEvent.press(screen.getByText('注册'));
  expect(mockSignUp).toHaveBeenCalledWith('player@example.com', 'sample-password');
  expect(screen.getByText('验证邮箱')).toBeTruthy();
});
