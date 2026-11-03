import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AuthScreen } from './AuthScreen';

const mockSignUp = jest.fn(async () => false);
jest.mock('./AuthProvider', () => ({
  useAuth: () => ({ signUp: mockSignUp, signIn: jest.fn(), verifyEmail: jest.fn(), resendEmail: jest.fn() }),
}));

test('registration offers only email and password, then email verification', async () => {
  await render(<AuthScreen onClose={jest.fn()} />);
  expect(screen.queryByText('Sign in with Apple')).toBeNull();
  await fireEvent.press(screen.getByText('No account? Register'));
  expect(screen.getByLabelText('Email')).toBeTruthy();
  expect(screen.getByLabelText('Password')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Email'), 'player@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'sample-password');
  await fireEvent.press(screen.getByText('Register'));
  expect(mockSignUp).toHaveBeenCalledWith('player@example.com', 'sample-password');
  expect(screen.getByText('Verify email')).toBeTruthy();
  expect(screen.getByText('Check your email. If you already have an account, return to sign in.')).toBeTruthy();
  await fireEvent.press(screen.getByText('Back to email sign-in'));
  expect(screen.getByText('Welcome back')).toBeTruthy();
});
