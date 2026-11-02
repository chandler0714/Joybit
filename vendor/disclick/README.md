> Current policy: mandatory authentication. Guest mode has been removed by owner request. Without a configured backend, the app remains on the sign-in screen. Historical guest references below are superseded.

# Hexa Landing / Steady Drop — iOS

Open `SteadyDrop.xcodeproj` in Xcode 26, choose the SteadyDrop scheme and an iPhone simulator, then Run. Minimum iOS 17. Xcode resolves Google Mobile Ads 13.11.0 and UMP 3.1.0 through Swift Package Manager. No AI model/API key is needed.

Tap wooden supports to remove them. Let the hexagonal character settle on the mint landing pad for a continuous second. Falling off loses. Retry, pause, level selection and saved progress are implemented. Twenty generated layouts: levels 1–2 are tutorials with broad supports; level 3 introduces L shapes, level 4 adds U/凹 shapes, and level 5 adds T/凸 shapes alongside rectangles and squares. From level 3 onward each level adds one tower row, with gradually narrower landing pads. Irregular pieces use real compound collision bodies; their cutouts are filled with separately removable bricks at the start. The hero is 150% of its original size (87pt wide). Supports use 46.8pt square cells (a uniform 30% increase from 36pt) in five tightly packed columns, spanning 234pt. Brick combinations and aspect ratios are preserved; the hero size is unchanged. No group gaps exist initially; openings appear only when blocks are removed. Tutorial center supports are 140.4pt wide to fit the87pt hero. English, Japanese and Korean selectable on the home settings screen; other languages use English. Difficulty is provisional, pending user playtesting.

## Checks

- `./scripts/test-core.sh`: game geometry, landing, feedback and auth configuration checks.
- `./scripts/test-auth.sh`: authentication transport and mandatory-login tests.
- `./scripts/test-lives.sh`: life rules, transport, settlement recovery and advertising signature tests (requires Node.js for the signature tests).
- `./scripts/test-account.sh`: authentication plus account deletion and Apple revocation checks.
- `./scripts/test-ads-privacy.sh`: real-SDK simulator privacy checks; requires `ADS_TEST_SIMULATOR` and `ADS_SOURCE_PACKAGES`, optionally `ADS_TEST_CONFIGURATION=Release` (see [TestFlight setup](docs/testflight-setup.md)).
- PostgreSQL ledger tests and deployment details: [lives setup](docs/lives-setup.md).

`xcodebuild -project SteadyDrop.xcodeproj -scheme SteadyDrop -sdk iphonesimulator -configuration Debug -derivedDataPath /tmp/SteadyDropBuild CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=- build`

`python3 scripts/make_project.py` regenerates the tracked project if source files change. Existing Xcode-only project edits would be overwritten; add source files to this generator or edit the project manually instead.

## Release status — 2026-10-31

App Store name **Hexa Landing**, installed name **Steady Drop**. Version **0.1.0 (2)** was uploaded to TestFlight and formally submitted to Apple; the last dashboard check showed **Waiting for Review**. The owner selected automatic release after approval, free download with optional rewarded ads, and174 countries/regions including the EU and excluding mainland China. Mac and Vision Pro availability are off; the iPhone-only binary can run on iPad in compatibility mode. DSA status is Active and the existing European consent message is Published. Store metadata, screenshots and published App Privacy answers are recorded in [listing details](docs/app-store-listing.md); build/upload evidence is in [TestFlight setup](docs/testflight-setup.md). Public availability has not been confirmed.

Account lives use a Supabase ledger: daily top-up to five, loss−1, win+10% toward+1, cap99. Release uses the owner's AdMob unit, disables publisher first-party ID and personalization, and sends NPA1 on rewarded requests without requesting ATT. Debug deliberately uses Google sample ads; the development label is Debug-only. The app privacy manifest and50 SKAdNetwork entries are included. The [privacy policy](https://epanda.com.cn/steady-drop/privacy.html), [support page](https://epanda.com.cn/steady-drop/support.html), and root app-ads.txt are deployed.

The signed SSV callback is deployed. A designated test-device acceptance using the owner's unit received server-confirmed+1 life; production test grants remain disabled. This establishes a complete SDK-test-mode reward flow, not live revenue or unrestricted serving. Current TestFlight ad diagnostics found no-fill. After public App Store release, link the existing AdMob app to the store listing and complete its verification/readiness review. Early-close, delayed/replayed callback and cap99 physical-device acceptance, broader device/accessibility QA and all-level playtesting remain outstanding. See [console acceptance](docs/admob-console-setup.md) and [lives setup](docs/lives-setup.md).

The project uses bundle identifier `com.xuanniaozhixu.steadydrop`; the owner reports Sign in with Apple enabled for it in Apple Developer. All art is drawn locally with shapes; no game assets or source were extracted from the reference.

## Signing team

Debug and Release use team `KMY94A6RM7` supplied by the owner, with automatic signing and bundle ID `com.xuanniaozhixu.steadydrop`. The owner accepted the Apple agreements and used this team to archive, export and upload the signed App Store build. Signing configuration alone does not establish approval or public availability.

## Accounts

Email/password signup with in-app email-code confirmation, password login and native Apple sign-in are implemented with a Supabase Auth REST adapter. Setup instructions: `docs/auth-setup.md`. Set `SupabaseURL` and `SupabasePublishableKey` in `SteadyDrop/Resources/Info.plist`; the owner-provided Supabase project is now configured. Email registration/login are enabled by the backend. Apple and email providers were both confirmed enabled on 2026-10-29; the Apple button follows live backend settings. Authentication is mandatory. First Apple sign-in needs consent; valid stored sessions refresh on launch and foreground. Level/star progress remains local to each account on each device. Lives and life points are stored in Supabase and shared across devices.

`./scripts/test-auth.sh` checks 14 stubbed HTTP scenarios, signup OTP/cooldown/recovery behavior and the mandatory-login regression. Email/password sign-in was verified by the owner and with the dedicated review account in the signed simulator build; broader native Apple/device acceptance remains. Settings now includes privacy/support links and self-service account deletion with password or Apple reauthentication. The authenticated deletion endpoint and Apple signing secrets are deployed; App Privacy disclosures are published; disposable-account live deletion/revocation acceptance remains outstanding. See [account deletion setup](docs/account-deletion-setup.md).

## Repository and configuration

Private source repository: https://github.com/chandler0714/disclick

This repository contains the iOS app, Xcode project and pinned dependencies, tests, Supabase migration/Edge Function source, design history, screenshots and a feedback demo. Generated builds, Xcode user state, account sessions, signing credentials and backend secrets are excluded.

The Supabase URL/publishable key in Info.plist are public client configuration, not server credentials. Database RLS/RPC permissions enforce access. AdMob IDs identify the owner's game; Debug still uses Google sample rewarded ads. Keep Apple private keys, Supabase service-role keys and other secrets in the appropriate service settings, never in Git.

See [account setup](docs/auth-setup.md), [lives and ads](docs/lives-setup.md), and [development history](docs/progress.md). This sync does not include live user data or deploy/publish the app.

AdMob activation and callback deployment: [console setup](docs/admob-console-setup.md).
