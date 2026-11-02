# Joybit verification — 2026-11-02

## Verified locally

| Area | Result |
| --- | --- |
| Catalog | One real Hexa Landing card in a two-column scrolling grid. No placeholder games or invented player count. |
| Drawer and ad | The ad placeholder disappears with the left drawer and returns when the drawer closes; React Native UI tests and local web preview confirmed this. |
| Guest entry | Web preview confirmed that a guest tapping Hexa Landing reaches the Joybit login page and can return to the catalog. |
| Account logic | Jest tests cover guest state, session restore, sign-in, sign-out, expired-session gate, and Keychain failure behavior. The app never stores tokens in plain AsyncStorage on iOS. |
| Favorites | Jest tests cover guest merge, concurrent taps, delayed cloud responses, account switching, failed sync and retry. The next account's pending view clears the previous account's favorites. SQL policies restrict select/insert/delete to `auth.uid() = user_id`. No production database was changed. |
| Game routing | Jest tests cover native and H5 selection, expired-session block, atomic native session updates, top safe-area placement, and return action. The synchronized Swift auth model passes an external-session boundary check; a source contract check covers UIKit child-controller attachment. |
| disClick baseline | Core, auth, life rules, life store, and reward callback tests passed from the pinned source snapshot. |
| iOS build | Expo prebuild and CocoaPods resolved the local game module. An iPhone 17 Pro simulator Debug build with `CODE_SIGNING_ALLOWED=NO` succeeded; `simctl install` and `simctl launch` succeeded. |

Commands: `npm test`, `npm run test:disclick`, `npm run typecheck`, and `xcodebuild -workspace ios/Joybit.xcworkspace -scheme Joybit -configuration Debug -destination 'platform=iOS Simulator,id=28D965C3-77F2-4A1E-A212-EDE15E866BEB' CODE_SIGNING_ALLOWED=NO build`.

Final review checks: 4 catalog checks, 26 UI/state tests across 8 suites, the pinned disClick checks, native boundary/containment checks, TypeScript, and `git diff --check` passed. The unsigned iOS simulator build also passed after the native bridge and hosting fixes.

## Not yet verified live

- No account credentials were supplied, so email/Apple login against the live Supabase project, cloud favorites, account deletion, server lives, and authenticated gameplay were not exercised end to end. The favorites migration is prepared but not deployed.
- The Mac was locked during simulator UI inspection. The native scene compiled and the app process launched, but an authenticated game screen, including SwiftUI sheets inside the UIKit host, was not visually inspected.
- A normally signed simulator build in this environment failed while signing a downloaded CocoaPods framework with `resource fork, Finder information, or similar detritus not allowed`. The build tree carries `com.apple.provenance` metadata. The unsigned build compiled successfully, but its Keychain access returned a missing-entitlement error. Joybit now allows guest browsing when Keychain reads fail while keeping secure writes mandatory. Verify login and game presentation using a normally signed development build on an unlocked Mac.
- The catalog ad is a placeholder. No Joybit banner unit, Joybit rewarded ad unit, live played-count data source, or Android native game port has been supplied.

## Release gate

Before distribution, apply the favorites migration, configure Apple Sign in and Joybit-specific ad units, complete a developer-signed iOS build, and manually test login, the native game, life changes, account deletion, and sign-out with a test account. The independent disClick app remains maintained; Joybit does not import its on-device level progress.
