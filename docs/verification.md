# Joybit verification — updated 2026-11-04

## Five new numbered games — 2026-11-04

Hex Garden, Star Trail, Lane Glow, Little Corner Kitchen, and Hidden Nook are now bundled offline games in the catalog. Their generators produce repeatable numbered content through level 100 and beyond. Focused tests check levels 1–100 plus higher examples, puzzle routes or feasible orders, pause/retry, and completion messages. Joybit stores highest unlocked levels per account and game on the device; the WebView receives no account token. All five have seven-language game titles and key controls.

`npm test` passed: 54 unit/DOM tests and 50 React Native UI tests across 14 suites. `npm run typecheck` and `git diff --check` passed. Regression tests cover background auto-pause for Star Trail and Hidden Nook. A local browser preview loaded all five game screens and showed the portrait layouts; this was a visual inspection of generated HTML at a desktop browser viewport, not an iOS simulator or signed-device test. The new games have not been built or played on an iPhone in this round. The earlier iOS build evidence below applies to the previous four-game baseline.

## Previous four-game baseline verified locally on 2026-11-03

| Area | Result |
| --- | --- |
| Catalog | Four playable entries in the two-column scrolling grid: Hexa Landing and three bundled mini games. No invented player counts. |
| Drawer and ad | The ad placeholder disappears with the left drawer and returns when the drawer closes; React Native UI tests and iPhone 17 simulator inspection confirmed this. The drawer now respects the top and bottom safe areas. |
| Guest entry | The iPhone 17 simulator confirmed that a guest tapping Hexa Landing reaches the Joybit email login page and can return to the catalog. |
| Account logic | Jest tests cover guest state, session restore, sign-in, sign-out, expired-session gate, and Keychain failure behavior. The app never stores tokens in plain AsyncStorage on iOS. |
| Shared email flow | Tests cover Hexa-compatible input rules, no-session signup, unconfirmed-account continuation, verification and resend, the 60-second cooldown, recovery code and password reset, and isolation of a failed recovery update. All added labels have seven translations. No live email was sent. |
| Favorites | Jest tests cover guest merge, concurrent taps, delayed cloud responses, account switching, failed sync and retry. The next account's pending view clears the previous account's favorites. SQL policies restrict select/insert/delete to `auth.uid() = user_id`. No production database was changed. |
| Game routing | Jest tests cover native and H5 selection, signed-out blocking, cached offline login for bundled games, expired-session blocking for the native game, atomic native session updates, top safe-area placement, and return action. The synchronized Swift auth model passes an external-session boundary check; a source contract check covers UIKit child-controller attachment. |
| Bundled mini games | Browser DOM tests exercise reaction false starts and five-round scoring, memory pair matching/mismatch lock and replay, and solvable number-puzzle moves and completion. All game HTML and assets are embedded locally; no account token is passed to WebView. |
| disClick baseline | Core, auth, life rules, life store, and reward callback tests passed from the pinned source snapshot. |
| iOS build | Expo prebuild and CocoaPods resolved the local game module. The updated email-only configuration built successfully for the iPhone 17 simulator with `CODE_SIGNING_ALLOWED=NO`; `simctl install` and `simctl launch` succeeded. |
| Current iOS JavaScript bundle | `EXPO_NO_TELEMETRY=1 npx expo export --platform ios --output-dir /private/tmp/joybit-email-export` bundled the current seven-language email code successfully (720 modules). |
| Seven-language localization | Unit tests cover locale fallback and translation completeness; UI tests cover device default, a saved manual choice, switching settings to French, French email forms, and the native-game return button. DOM tests mount all three bundled games in each of the seven languages and check initial copy, runtime states, scores, HTML language tags, and exact accessible control labels. Hexa Landing's interior remains at its existing language coverage. |

Current localization and account checks: `npm test` (28 unit/DOM and 49 UI tests), `npm run test:disclick`, `npm run typecheck`, and `git diff --check`. The current email-flow code exported to an iOS JavaScript bundle (720 modules), and an unsigned iOS simulator build reported `BUILD SUCCEEDED`. The generated iOS `Info.plist` declares all seven `CFBundleLocalizations`; CocoaPods installed 107 total pods. An unsigned native build does not verify Keychain login or signed-device touch flows.

The 2026-11-03 simulator inspection confirmed the earlier catalog rendering, guest favorites, the drawer/ad interaction, and guest-to-login routing. Regression tests also cover offline sign-out of an expired cached session, a late session read after sign-out, and a single failed native-game validation without repeated retries. The seven-language layout and touch flow have not yet been inspected in a signed iOS build. The local HTML preview in the in-app browser was rejected by its URL security policy, so no alternate browser route was used.

## Not yet verified live

- The supplied test email belongs to an already confirmed account, but a signed Joybit build and test login remain unavailable, so cloud favorites, account deletion, server lives, and authenticated gameplay were not exercised end to end. The favorites migration is prepared but not deployed.
- The local Joybit configuration points to the same Supabase project URL as the pinned Hexa Landing configuration. The shared SMTP sender and signup/recovery email templates could not be inspected in the live dashboard while the Mac was locked. The recovery template must present `{{ .Token }}` as the code for Joybit's in-app reset form. Real registration and recovery delivery remain unverified, including the earlier missing code email.
- Guest flows were visually inspected while the Mac was unlocked. An authenticated game screen, including SwiftUI sheets inside the UIKit host, was not inspected because a signed build and test login remain unavailable.
- A normally signed simulator build in this environment failed while signing a downloaded CocoaPods framework with `resource fork, Finder information, or similar detritus not allowed`. Clearing extended attributes from build products alone did not resolve it: another copied framework regained the attributes from its source. The unsigned build compiled successfully, but its Keychain access returned a missing-entitlement error. Joybit allows guest browsing when Keychain reads fail while keeping secure writes mandatory. Verify login and game presentation using a normally signed development build.
- The catalog ad is a placeholder. No Joybit banner unit, Joybit rewarded ad unit, live played-count data source, or Android native game port has been supplied.

## Release gate

Before distribution, apply the favorites migration, configure email verification and Joybit-specific ad units, complete a developer-signed iOS build, and manually test login, the native game, life changes, account deletion, and sign-out with a test account. The independent disClick app remains maintained; Joybit does not import its on-device level progress.
