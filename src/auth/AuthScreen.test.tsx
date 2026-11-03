import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthScreen } from './AuthScreen';

const mockSignUp = jest.fn(async () => false);
const mockSignIn = jest.fn(async () => {});
const mockVerify = jest.fn(async () => {});
const mockResend = jest.fn(async () => {});
const mockRecover = jest.fn(async () => {});
const mockReset = jest.fn(async () => {});
jest.mock('./AuthProvider', () => ({
  useAuth: () => ({ signUp: mockSignUp, signIn: mockSignIn, verifyEmail: mockVerify, resendEmail: mockResend, requestPasswordReset: mockRecover, resetPasswordWithCode: mockReset }),
}));

beforeEach(() => { jest.clearAllMocks(); });

test('registration confirms password, clears secrets, and freezes verification email', async () => {
  await render(<AuthScreen onClose={jest.fn()} />);
  expect(screen.queryByText('Sign in with Apple')).toBeNull();
  await fireEvent.press(screen.getByText('No account? Register'));
  expect(screen.getByLabelText('Email')).toBeTruthy();
  expect(screen.getByLabelText('Password')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Email'), 'player@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'sample-password');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'different');
  await fireEvent.press(screen.getByText('Register'));
  expect(mockSignUp).not.toHaveBeenCalled();
  expect(screen.getByText('Passwords do not match.')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'sample-password');
  await fireEvent.press(screen.getByText('Register'));
  expect(mockSignUp).toHaveBeenCalledWith('player@example.com', 'sample-password');
  expect(screen.getByText('Verify email')).toBeTruthy();
  expect(screen.queryByLabelText('Password')).toBeNull();
  expect(screen.queryByLabelText('Email')).toBeNull();
  expect(screen.getByText('player@example.com')).toBeTruthy();
  expect(screen.getByText('Check your email. If you already have an account, return to sign in.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Resend code' }).props.accessibilityState?.disabled).toBe(true);
  await fireEvent.press(screen.getByText('Back to email sign-in'));
  expect(screen.getByText('Welcome back')).toBeTruthy();
});

test('deleting an account asks for the current password before confirmation', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await render(<AuthScreen initialMode="delete" onClose={jest.fn()} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }));
  expect(screen.getByText('Enter your current password to delete your account.')).toBeTruthy();
  expect(alert).not.toHaveBeenCalled();
  alert.mockRestore();
});

test('weak registration passwords receive actionable guidance', async () => {
  mockSignUp.mockRejectedValueOnce({ code: 'weak_password' });
  await render(<AuthScreen onClose={jest.fn()} />);
  await fireEvent.press(screen.getByText('No account? Register'));
  await fireEvent.changeText(screen.getByLabelText('Email'), 'player@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'weak');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'weak');
  await fireEvent.press(screen.getByText('Register'));
  await waitFor(() => expect(screen.getByText('Choose a stronger password and try again.')).toBeTruthy());
});

test('unconfirmed sign-in opens verification and can resume after a restart', async () => {
  mockSignIn.mockRejectedValueOnce({ code: 'email_not_confirmed' });
  await render(<AuthScreen onClose={jest.fn()} />);
  await fireEvent.changeText(screen.getByLabelText('Email'), ' Player@EXAMPLE.COM ');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'sample-password');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() => expect(screen.getByText('Verify email')).toBeTruthy());
  expect(screen.getByText('Player@example.com')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Email verification code'), '123456');
  await fireEvent.press(screen.getByRole('button', { name: 'Verify and sign in' }));
  expect(mockVerify).toHaveBeenCalledWith('Player@example.com', '123456');
});

test('changing a pending email clears the previous address and verification code', async () => {
  mockSignIn.mockRejectedValueOnce({ code: 'email_not_confirmed' });
  await render(<AuthScreen onClose={jest.fn()} />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'old@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'sample-password');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  await fireEvent.changeText(screen.getByLabelText('Email verification code'), '123456');
  await fireEvent.press(screen.getByText('Change email'));
  expect(screen.getByLabelText('Email').props.value).toBe('');
  expect(screen.getByLabelText('Password').props.value).toBe('');
  expect(screen.getByText('Create account')).toBeTruthy();
});

test('forgot password requests a code and only resets with matching valid passwords', async () => {
  await render(<AuthScreen onClose={jest.fn()} />);
  await fireEvent.press(screen.getByText('Forgot password?'));
  await fireEvent.changeText(screen.getByLabelText('Email'), 'Player@EXAMPLE.COM');
  await fireEvent.press(screen.getByRole('button', { name: 'Send recovery code' }));
  expect(mockRecover).toHaveBeenCalledWith('Player@example.com');
  expect(screen.getByText('Set a new password')).toBeTruthy();
  await fireEvent.changeText(screen.getByLabelText('Email verification code'), '123456');
  await fireEvent.changeText(screen.getByLabelText('New password'), 'new-password');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'new-password');
  await fireEvent.press(screen.getByRole('button', { name: 'Reset password' }));
  expect(mockReset).toHaveBeenCalledWith('Player@example.com', '123456', 'new-password');
});

test('resend is blocked for sixty seconds and server rate limits restart the cooldown', async () => {
  jest.useFakeTimers();
  try {
    mockSignIn.mockRejectedValueOnce({ code: 'email_not_confirmed' });
    mockResend.mockRejectedValueOnce({ status: 429, code: 'over_email_send_rate_limit' });
    await render(<AuthScreen onClose={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'player@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'sample-password');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    await act(async () => { await Promise.resolve(); });
    await fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
    expect(mockResend).toHaveBeenCalledTimes(1);
    await act(async () => { await Promise.resolve(); });
    expect(screen.getByText('Too many attempts. Please try again later.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
    expect(mockResend).toHaveBeenCalledTimes(1);
    await act(async () => { jest.advanceTimersByTime(60000); });
    await fireEvent.press(screen.getByRole('button', { name: 'Resend code' }));
    expect(mockResend).toHaveBeenCalledTimes(2);
  } finally { jest.useRealTimers(); }
});
