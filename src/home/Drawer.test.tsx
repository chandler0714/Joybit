import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Drawer } from './Drawer';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 59, bottom: 34, left: 0, right: 0 }),
}));

test('drawer controls and footer stay inside the device safe areas', async () => {
  await render(<Drawer account={null} onClose={jest.fn()} onSelect={jest.fn()} />);
  const style = StyleSheet.flatten(screen.getByTestId('drawer-surface').props.style);
  expect(style.paddingTop).toBe(77);
  expect(style.paddingBottom).toBe(60);
});
