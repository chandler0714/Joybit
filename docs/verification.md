# Joybit verification — updated 2026-11-06

## Current scope

The catalog contains Hexa Landing and three bundled offline mini games: Reaction Rush, Memory Match, and Number Puzzle. The five experimental video-inspired games were removed at the owner's request. Their source code, catalog covers, level navigation, and design assets are no longer part of the app. Earlier experiments remain available in Git history.

After removal, `npm test` passed 28 unit/DOM tests and 49 React Native UI tests, `npm run typecheck` passed, and `git diff --check` found no whitespace errors. The updated iOS Release build reported `BUILD SUCCEEDED`, passed `codesign --verify --deep --strict`, and installed and launched on the connected iPhone 14 Pro. The updated on-device catalog has not been visually inspected.

## Verified app behavior

| Area | Evidence |
| --- | --- |
| Catalog and guest flow | The iPhone 17 simulator displayed the two-column catalog, drawer, and guest-to-login routing. Catalog tests assert four playable entries and no invented player counts. |
| Account flow | Tests cover session restore, email sign-in and registration, code verification, recovery, password update, and sign-out. The owner confirmed recovery-code delivery, password reset, and sign-in on an iPhone 14 Pro. |
| Favorites | The owner applied `supabase/migrations/20261102_joybit_favorites.sql` in the Supabase SQL Editor. Signed-in simulator checks confirmed that adding and removing a favorite persist across app restarts. Anonymous REST access was denied. The Dashboard execution did not record the migration in Supabase CLI history. |
| Native game | On the signed-in iPhone 17 simulator, Hexa Landing entered level 1, completed it, loaded level 2, persisted progress across restart, and reduced lives after a level 2 failure. Pause and return controls worked. |
| Bundled games | Browser DOM tests cover reaction timing, memory matching, and solvable number puzzles in seven languages. Their WebView pages receive no account token or remote asset. |
| iPhone build | A Release build signed by team `KMY94A6RM7` passed `codesign --verify --deep --strict`, installed, and launched on a connected iPhone 14 Pro. The owner confirmed that game touch input worked in the earlier build. The app has not been distributed through TestFlight. |

## Shared email configuration

The shared Supabase project has custom SMTP enabled with sender `auth@mobpet.com.cn` and Alibaba Direct Mail on port 465. No SMTP credential was viewed or changed. The signup template already contained an in-app numeric code. The recovery template was updated to the code-only HTML tracked in `supabase/templates/recovery.html`, and the owner confirmed that recovery works on iPhone. Registration-code delivery remains unverified.

## Release gaps

Reconcile the manually applied favorites migration with Supabase CLI history before `supabase db push`. Verify account deletion and registration-code delivery on a device. Replace the catalog ad placeholder with Joybit-specific ad units and connect a real played-count source before showing counts. The native Hexa Landing game remains iOS-only.
