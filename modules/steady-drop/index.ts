import React from 'react';
import { Platform, type ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';

type Event<T> = { nativeEvent: T };
type Props = ViewProps & {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  onExit(): void;
  onSessionRotated(event: Event<{ accessToken: string; refreshToken: string; userId: string }>): void;
};

export const SteadyDropNativeView = Platform.OS === 'ios' ? requireNativeViewManager<Props>('SteadyDrop') : (() => null) as React.ComponentType<Props>;
