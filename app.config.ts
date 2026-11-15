import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['expo-localization', { supportedLocales: { ios: ['en', 'ja', 'ko', 'fr', 'es', 'ru', 'de'], android: ['en', 'ja', 'ko', 'fr', 'es', 'ru', 'de'] } }],
  ],
  name: config.name ?? 'Joybit',
  slug: config.slug ?? 'joybit',
  ios: {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      SupabaseURL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      SupabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
    },
  },
});
