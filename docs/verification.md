# Joybit verification — updated 2026-11-03

## Verified locally

| Area | Result |
| --- | --- |
| Catalog | One real Hexa Landing card in a two-column scrolling grid. No placeholder games or invented player count. |
| Drawer and ad | The ad placeholder disappears with the left drawer and returns when the drawer closes; React Native UI tests and iPhone 17 simulator inspection confirmed this. The drawer now respects the top and bottom safe areas. |
| Guest entry | The iPhone 17 simulator confirmed that a guest tapping Hexa Landing reaches the Joybit email login page and can return to the catalog. |
| Account logic | Jest tests cover guest state, session restore, sign-in, sign-out, expired-session gate, and Keychain failure behavior. The app never stores tokens in plain AsyncStorage on iOS. |
| Favorites | Jest tests cover guest merge, concurrent taps, delayed cloud responses, account switching, failed sync and retry. The next account's pending view clears the previous account's favorites. SQL policies restrict select/insert/delete to `auth.uid() = user_id`. No production database was changed. |
| Game routing | Jest tests cover native and H5 selection, expired-session block, atomic native session updates, top safe-area placement, and return action. The synchronized Swift auth model passes an external-session boundary check; a source contract check covers UIKit child-controller attachment. |
| disClick baseline | Core, auth, life rules, life store, and reward callback tests passed from the pinned source snapshot. |
| iOS build | Expo prebuild and CocoaPods resolved the local game module. The updated email-only configuration built successfully for the iPhone 17 simulator with `CODE_SIGNING_ALLOWED=NO`; `simctl install` and `simctl launch` succeeded. |

Commands: `npm test`, `npm run test:disclick`, `npm run typecheck`, `git diff --check`, and `xcodebuild -workspace ios/Joybit.xcworkspace -scheme Joybit -configuration Debug -destination 'platform=iOS Simulator,id=78C682DC-905A-4484-88C7-28EF60C98375' CODE_SIGNING_ALLOWED=NO build`.

The 2026-11-03 simulator inspection confirmed catalog rendering, guest favorites, the drawer/ad interaction, and guest-to-login routing. User clarification restricts Joybit registration to email, so the Apple login entry and Joybit Apple auth dependency/configuration were removed. The email-only form and drawer safe-area fixes passed focused regression tests. After those changes, all 4 catalog checks, 28 UI/state tests in 10 suites, the pinned disClick checks, native boundary/containment checks, TypeScript, and whitespace verification passed. The rebuilt unsigned iOS app installed and launched. The Mac locked again before a screenshot of that rebuilt binary; the pre-rebuild UI inspection used the same updated JavaScript screens.

## Not yet verified live

- No test-account credentials were supplied, so email login against the live Supabase project, cloud favorites, account deletion, server lives, and authenticated gameplay were not exercised end to end. The favorites migration is prepared but not deployed.
- Guest flows were visually inspected while the Mac was unlocked. An authenticated game screen, including SwiftUI sheets inside the UIKit host, was not inspected because a signed build and test login remain unavailable.
- A normally signed simulator build in this environment failed while signing a downloaded CocoaPods framework with `resource fork, Finder information, or similar detritus not allowed`. Clearing extended attributes from build products alone did not resolve it: another copied framework regained the attributes from its source. The unsigned build compiled successfully, but its Keychain access returned a missing-entitlement error. Joybit allows guest browsing when Keychain reads fail while keeping secure writes mandatory. Verify login and game presentation using a normally signed development build.
- The catalog ad is a placeholder. No Joybit banner unit, Joybit rewarded ad unit, live played-count data source, or Android native game port has been supplied.

## Release gate

Before distribution, apply the favorites migration, configure email verification and Joybit-specific ad units, complete a developer-signed iOS build, and manually test login, the native game, life changes, account deletion, and sign-out with a test account. The independent disClick app remains maintained; Joybit does not import its on-device level progress.
