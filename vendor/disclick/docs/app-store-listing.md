# Hexa Landing — App Store draft, 2026-10-31

App Store Connect app ID: `6828956966`. Store version `0.1.0`, attached build `2` (replacing build1 after the privacy adjustment). The owner authorized formal submission with automatic release after approval. Apple confirmed1 Item Submitted; the submission and app item are Waiting for Review. No approval or public release is claimed. Reviewer credentials/contact details are intentionally excluded.

Submission: `6f388f32-76c3-43a5-b903-c5dfbe087a42`; displayed submission date Oct31,2026 at5:11AM. [Review details](https://appstoreconnect.apple.com/apps/6828956966/distribution/reviewsubmissions/details/6f388f32-76c3-43a5-b903-c5dfbe087a42).

## Saved listing

- Name: Hexa Landing
- Primary language: English (U.S.)
- Subtitle: Physics puzzles. Careful taps.
- Primary category: Games; subcategories: Puzzle, Casual
- Keywords: `physics,puzzle,hexagon,balance,blocks,wood,tower,landing,brain,casual`
- Support: <https://epanda.com.cn/steady-drop/support.html>
- Marketing: <https://epanda.com.cn>
- Privacy: <https://epanda.com.cn/steady-drop/privacy.html>
- Copyright: `2026 Beijing Xuanniao Zhixu Technology Co., Ltd.`
- Price: free; USD0.00 schedule confirmed and saved. Owner confirmed optional rewarded ads, no purchases/subscriptions.
- Age questionnaire: advertising present; no other flagged content/features; general rating4+, not Made for Kids. Regional ratings differ.
- Content rights: necessary rights for third-party content declared.

Promotional text:

> Tap away wooden blocks, balance the hexagon, and land safely. Explore 20 physics puzzles with increasingly intricate towers and three selectable languages.

Description:

```text
Choose your taps carefully. Every block you remove changes the balance.

Hexa Landing is a physics puzzle game about guiding a hexagonal character onto a landing pad. Tap wooden supports to remove them, watch the tower respond, and keep the hexagon safely on the pad long enough to finish the level.

20 LEVELS TO EXPLORE
Start with broad supports and learn how the blocks move. Later levels introduce taller towers and L-, U-, and T-shaped pieces that make each decision count.

PLAY AT YOUR OWN PACE
Pause a round, retry a puzzle, or revisit unlocked levels. Earn stars and keep your level progress on your device, separately for each account.

LIVES AND OPTIONAL REWARDS
Lives replenish daily. When you need another life, you can choose to watch a rewarded ad, subject to availability and successful reward verification.

THREE LANGUAGES
Choose English, Japanese, or Korean in Settings.

An account and an internet connection are required. Sign in with your email and password or with Sign in with Apple. Level progress is stored locally; your life balance is managed through your account.

Free to download. No in-app purchases or subscriptions.
```

Review notes explain the original installed name Steady Drop, supplied review login, internet requirement,20 levels/local progress, daily lives, optional server-verified rewards/no-fill, settings links, reauthenticated account deletion, and languages. Owner-supplied credentials were preserved. The contact phone's international prefix was normalized from00 to+ and saved successfully.

## Screenshot evidence

Four JPEGs uploaded to iPhone with Dynamic Island (large display),1320×2868. Media Manager showed all four filenames and `4 of 10 App Screenshots`; the medium-display slot showed all four under `Using Existing Assets`. Returning to the version page showed the same assets and Save disabled.

The third asset initially showed a cloud/processing placeholder. A subsequent version-page check showed all four as screenshot buttons, with no upload error.

Files under ignored `build/app-store/screenshots/iphone/`:

1. `01-first-landing.jpg` — level1
2. `02-shaped-towers.jpg` — level3
3. `03-u-shaped-puzzle.jpg` — level4
4. `04-t-shaped-puzzle.jpg` — level5

Captured from a separate simulator fixture at `build/local-artifacts/store-capture-source`, bundle `com.xuanniaozhixu.steadydrop.capture`. Only fixture entry/initial state/life snapshot changed to show deterministic gameplay without credentials or production account writes. GameScene/geometry matched the production sources. These are real app-rendered gameplay images, with no generated art. PNGs were converted to alpha-free JPEG95 using sips. The fixture binary must never be archived or uploaded to Apple. Production Swift sources were not changed for the captures.

## App Privacy — published

The policy URL was saved. Ten data types have all questionnaire details completed. The owner selected no cross-app tracking for launch. Device ID was changed to not used for tracking and saved; the preview no longer shows Data Used to Track You. Build2 was uploaded successfully. After the owner explicitly confirmed Apple's final accuracy/compliance/update-responsibility statement, Publish was completed; the page showed Published a few seconds ago.

| Data type | Purposes | Linked to identity | Used for tracking |
| --- | --- | --- | --- |
| Email Address | App Functionality | Yes | No |
| User ID | App Functionality | Yes | No |
| Other Usage Data (life ledger) | App Functionality | Yes | No |
| Coarse Location | Third-Party Advertising, Analytics, App Functionality | Yes | No |
| Device ID | Third-Party Advertising, Analytics | Yes | No |
| Product Interaction | Third-Party Advertising, Analytics, App Functionality | Yes | No |
| Advertising Data | Third-Party Advertising, Analytics | Yes | No |
| Crash Data | Analytics | No | No |
| Performance Data | Third-Party Advertising, Analytics, App Functionality | No | No |
| Other Diagnostic Data | Third-Party Advertising, Analytics | No | No |

The SDK portion was checked against bundled Google Mobile Ads13.11.0 and UMP3.1 manifests. SDK declarations alone do not prove the app's actual tracking behavior. Build2 applies publisher first-party ID disabled, global personalization disabled, and NPA1 on each rewarded request before loading. It includes no ATT request/usage description. This changes the app's configured use, not the vendor SDK's generic manifest; vendor manifests were not edited. Other device/advertising/diagnostic collection remains declared. See [privacy strategies](https://developers.google.com/admob/ios/privacy/strategies), [PPT limitations and NPA](https://support.google.com/admob/answer/14323214), and [Apple privacy definitions](https://developer.apple.com/app-store/app-privacy-details/).

## Remaining decisions and release checks

- Owner selected iPhone with iPad compatibility only. Mac and Vision Pro availability checkboxes were both disabled, saved (Saved shown), and checked again after a full reload with the174-region availability data loaded. Binary targets iPhone only (`TARGETED_DEVICE_FAMILY=1`); no native iPad claim.
- Owner confirmed including EU. Availability was configured for174 current countries/regions (all175 except China mainland); future-country automatic expansion is off. The saved page showed174 and China mainland Not Available. These are availability settings for after release, not a public release.
- Owner confirmed DSA trader status, switched back to the supplied mobile (ending2917), and completed email/SMS verification in the Apple page. A subsequent Business→Compliance check showed Digital Services Act,27 Countries or Regions, last updated Oct31,2026, status Active. Public business email is `chandler@epanda.com.cn`; the address comes from Apple/D‑U‑N‑S. DSA activation is verified; the app itself is not publicly released.
- Owner selected no cross-app tracking. Build2 was uploaded, processed and added to the existing Internal group (one tester). Test notes were saved. The distribution version was switched to build2 and saved. The unused Game Center option was unchecked because the game has no Game Center implementation/entitlement.
- Privacy responses were published after explicit owner confirmation of Apple's final statement.
- Build2 limits `Development build · Test ads` to Debug; production Release home/settings were verified without the label in the simulator.
- Owner explicitly requested restoring the dedicated review account to5 lives. After the owner refreshed Supabase CLI login, a single guarded update changed only that account's lives0→5. The account was matched against the retained review-login identifier using a digest, without printing credentials. It had no open round. A separate database query and the normal Release simulator client both confirmed5 lives and unchanged40% points; timezone, daily top-up date and round/reward records were not changed.
- Installed name remains Steady Drop, consistent with the owner's prior store-only rename choice; listing/review notes explain it.
- AdMob still requires readiness review/public store linking; do not promise live fill or revenue.
- AdMob Privacy & messaging→European regulations already has a Published message assigned to Steady Drop, English plus one other language. This was inspected, not changed. No IDFA explainer is configured (Create a new message), consistent with the no-ATT launch choice. No real EU ad-serving test is claimed.
- After the platform change, the saved version/build2 remained Ready for Review. The owner chose formal submission and automatic release after approval. Before submission, the saved release radios were checked as manual0/automatic1. Submit for Review completed with1 Item Submitted, and the review details page independently showed Waiting for Review for the submission and iOS App0.1.0/build2. A Cancel Submission action is available; it was not used. Approval/public release and AdMob readiness remain future steps.
- Public-release policy in `web/steady-drop/privacy.html` was deployed with an expected-content guard, external backup and atomic replacement. HTTPS200 body matched all8758 bytes (SHA256 `dbff7c475913e209006736e94bd270e238785a0caa2c950232b615e0a00bbc0c`).

## Published support page

`web/steady-drop/support.html` was published through the owner's Alibaba Workbench session to `/var/www/epanda/steady-drop/support.html` on47.82.96.64. Public HTTPS returned200 with a2612-byte body matching the repository file. The local website copy is `/Volumes/MACMINIDISK/work/epanda-site/steady-drop/support.html`. No Nginx configuration change was required.
