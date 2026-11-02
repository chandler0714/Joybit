import { sessionStorage } from './authClient';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => { throw new Error('Keychain unavailable'); }),
  setItemAsync: jest.fn(async () => { throw new Error('Keychain unavailable'); }),
  deleteItemAsync: jest.fn(async () => {}),
}));

test('unavailable Keychain still allows guest catalog without storing a session insecurely', async () => {
  expect(await sessionStorage.getItem('joybit.auth.session')).toBeNull();
  await expect(sessionStorage.setItem('joybit.auth.session', 'secret')).rejects.toThrow('Keychain unavailable');
});
