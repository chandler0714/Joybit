import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Joybit',
  slug: config.slug ?? 'joybit',
  ios: {
    ...config.ios,
    infoPlist: {
      ...config.ios?.infoPlist,
      SupabaseURL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      SupabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
      GADApplicationIdentifier: process.env.EXPO_PUBLIC_JOYBIT_ADMOB_APP_ID ?? 'ca-app-pub-3940256099942544~1458002511',
      RewardedAdUnitID: process.env.EXPO_PUBLIC_JOYBIT_REWARDED_AD_UNIT_ID ?? '',
    },
  },
});
