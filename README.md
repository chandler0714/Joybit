# Joybit

Joybit is an iOS-first mini-game collection. The React Native shell opens on a two-column catalog, with a left drawer for the profile, favorites, and settings. It includes the native SwiftUI/SpriteKit **Hexa Landing / Steady Drop** game from the owner's separately maintained [disClick](https://github.com/chandler0714/disclick) app, plus eight bundled offline mini games: **Reaction Rush**, **Memory Match**, **Number Puzzle**, **Hex Garden**, **Star Trail**, **Lane Glow**, **Little Corner Kitchen**, and **Hidden Nook**.

The Joybit shell and all eight bundled games support English, Japanese, Korean, French, Spanish, Russian, and German. Joybit follows the device language by default and offers a persistent override in Settings. Unsupported device languages fall back to English. Hexa Landing's own game interior still uses its separately maintained English/Japanese/Korean localization; Joybit's game toolbar follows the Joybit language choice.

All nine games require a Joybit login. Once signed in, the eight bundled mini games can run without a network connection, including from a securely cached local session after a temporary network failure. The bundled WebView pages receive no account tokens and load no remote assets. The five newest games generate numbered levels 1–100 and beyond from stable seeds; their highest unlocked level is stored locally per account and game. Hexa Landing still needs online session validation and its backend for lives.

Joybit uses the same Supabase email account as Hexa Landing. Its seven-language account screens support password sign-in, registration with password confirmation and email code, continuation of an unconfirmed registration, a 60-second resend countdown, and code-based password recovery. Recovery verifies the code in a temporary session and adopts it only after the password update succeeds. Joybit still has no Apple sign-in; the standalone Hexa app retains its own login screen and session.

## Run locally

Use Node.js 24, Xcode 26, an iOS 17+ simulator, and CocoaPods. Install JavaScript packages with `npm ci`.

Create an ignored `.env.local` with the **public** Supabase URL and publishable key from the disClick project:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Never put the service-role key in the app. The Joybit and disClick apps must point to the same Supabase project for one account and the same server-side lives.

Run:

```sh
npm run sync:disclick
npx expo prebuild --platform ios
npm run ios
```

Use a **native development build**. Expo Go and the web preview cannot load the Swift game module. `npm run web` is useful for checking the catalog and login interface.

If `xcode-select -p` points to Command Line Tools instead of Xcode, set `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` for Expo commands. For an existing development build, start Metro with `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer npx expo start --dev-client --localhost --port 8081`. If DevTools shows an Expo CLI connection warning after Metro was stopped or restarted, reload the app from that terminal with `r`, then reopen DevTools with `j`.

## Verify

```sh
npm test
npm run test:disclick
npm run typecheck
```

The source snapshot is pinned at `4bc3680f62380a7eb63b0142461c75403d13298b` in `vendor/disclick/`. To update it, replace that snapshot from the owner-maintained repository, run `npm run sync:disclick`, review the generated Swift diff, then rerun the tests and iOS build. The sync excludes the standalone `@main` entry, removes in-game account actions, and adds Joybit's external-session entry. Joybit and the standalone game keep separate local level progress; no existing local progress is migrated.

## Before release

- The owner applied `supabase/migrations/20261102_joybit_favorites.sql` to the shared Supabase project on 2026-11-05. It creates user-owned favorites protected by row-level security. Signed-in simulator checks confirmed that adding and removing a favorite survive app restarts; anonymous REST access is denied. Because the SQL was run manually in the Dashboard, reconcile this migration with Supabase CLI history before using `supabase db push` on this project.
- Joybit's first release uses email login only. Configure the shared Supabase project's SMTP sender and signup/recovery email templates before release. Both email templates must include an in-app numeric code (`{{ .Token }}`), and a change to them also affects the standalone Hexa app. The `delete-account` Edge Function must remain deployed. Mail delivery has not been verified end to end.
- Configure Joybit-specific AdMob app/rewarded units using `EXPO_PUBLIC_JOYBIT_ADMOB_APP_ID` and `EXPO_PUBLIC_JOYBIT_REWARDED_AD_UNIT_ID`, then update the existing reward-verification backend to recognize Joybit's unit. The catalog banner is currently a labeled placeholder. The debug game uses Google's test rewarded unit.
- Connect a real played-count source before showing player counts. Unknown values are intentionally hidden; the formatter displays exact values below 1,000 and floored integer units above that.
- Port Steady Drop to Android before enabling that catalog item there. The React Native shell and H5 host are shared, but the native game is iOS-only today.

See [verification.md](docs/verification.md) for the checks performed and remaining runtime limits. The approved scopes are in the [platform design](docs/superpowers/specs/2026-11-02-joybit-design.md) and [seven-language design](docs/superpowers/specs/2026-11-03-joybit-seven-languages-design.md).
