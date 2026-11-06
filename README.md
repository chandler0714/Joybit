# Joybit

Joybit is an iOS-first React Native app shell. Its game library is currently empty. The account screen, seven-language settings, email sign-in, registration, password recovery, sign-out, and account deletion remain available.

All games have been removed from this repository at the owner's request, including the bundled WebView games and the embedded Hexa Landing module. The separately maintained [disClick](https://github.com/chandler0714/disclick) app is unaffected. Earlier Joybit game implementations remain available in Git history.

## Run locally

Use Node.js 24, Xcode 26, an iOS 17+ simulator, and CocoaPods. Install JavaScript packages with `npm ci`.

Create an ignored `.env.local` with the shared Supabase project's public URL and publishable key:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Never put the service-role key in the app. Run:

```sh
npx expo prebuild --platform ios
npm run ios
```

If `xcode-select -p` points to Command Line Tools instead of Xcode, set `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` for Expo commands. For an existing development build, start Metro with `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer npx expo start --dev-client --localhost --port 8081`. If DevTools shows an Expo CLI connection warning after Metro was stopped or restarted, reload the app from that terminal with `r`, then reopen DevTools with `j`.

## Verify

```sh
npm test
npm run typecheck
```

## Before release

- The shared Supabase project's custom SMTP is enabled, and its signup and recovery templates contain an in-app numeric code (`{{ .Token }}`). The recovery HTML is tracked in `supabase/templates/recovery.html`. The owner confirmed recovery-code delivery, password reset, and sign-in on an iPhone 14 Pro. Registration-code delivery remains unverified.
- The `delete-account` Edge Function must remain deployed for account deletion. Verify the deletion flow on a test account before release.
- The game-free Release build signed by Apple team `KMY94A6RM7` installed and launched on an iPhone 14 Pro. The empty screen still needs direct visual review on the phone.
- The historical `joybit_favorites` migration was applied manually to the shared Supabase project. Joybit no longer uses favorites; the server table and existing data were not altered by this code change.

See [verification.md](docs/verification.md) for the checks performed and current limits.
