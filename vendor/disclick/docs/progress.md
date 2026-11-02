# First playable progress
- Spec/plan recorded; user chose native and direct execution.
- Core rule tests failed with absent implementation, then passed 12 checks.
- Review identified repeated intro layouts and assumed timestep; added checks, observed missing clock failure; fixed 20 distinct layouts + real timestep. 19 checks pass.
- Xcode simulator build succeeded twice.
- Fresh independent read-only review performed by review_game agent.
- Ruling: empty non-Git directory used directly because user explicitly selected this workspace; no branch, remote or worktree modified.
- Release work: advertising SDK, consent, App Store metadata/signing/submission deferred until after playable review.

- UI observed on iPhone 17 Pro iOS 26.5: home, click-removal descent, stable landing win in level 2, next level creates fresh tower, pause, home, EN/JA/KO settings.
- Fixed SpriteView identity reuse after observed stale scene on next/retry; manually confirmed next-level rebuild.
- Added original app icon; final build with simulator service access succeeded. Pure rules: 19/19 passed.
- Minor reward display corrected to total stars; game-board accessibility localized. Compact-device/Dynamic Type layout and 20-level physical solvability remain QA gaps.
- No advertising network, release signing, TestFlight or App Store publication performed.

# Feedback update
- Added immediate collider release +180ms removal ghost, flash/ring,14–22 ballistic wood fragments.
- Added impulse-gated dust/rings/camera shake and haptics, without changing actual collision shapes.
- HeroReaction triggers pain for95pt continuous descent at100pt/s, recovers0.8s after support; victory takes precedence.
- Happy face +72 confetti strips,1.6s celebration before result UI; old scene callbacks cleared on restart/home.
-28 core assertions pass; simulator build succeeded; independent review found no important issues.
- Manually observed large-drop pain in level3 and happy face at victory; video captured to inspect short-lived effects.
- Haptics require physical device validation; no audio added in this pass.

- Recorded footage confirms wood fragments at17s and happy/confetti celebration at23–24s before result card. Demo saved as docs/feedback-demo.mp4.

# Difficulty v2 update
- User changed difficulty onset to level3, superseding first10 easy policy. Levels1–2 keep144pt tutorial center supports.
- Mixed36pt grid rectangles/squares/Ls; concave L silhouette + compound collider, real notch; remove as one body.
- Hero radius43.5pt, face150%, mass scaled with area; progress/angular-speed checks updated.
-2515 geometry/rule assertions passed; simulator build succeeded; independent static review found no important issues.
- Observed level3 and4 mixed towers/large hero on simulator. User actively interacting; stopped UI actions to preserve their session. Full dynamic solvability across20 levels remains playtesting work.

# Narrower supports
- Owner requested removable base30% narrower. Horizontal grid36→25.2pt; total288→201.6pt, centered at195. Height, hero and final landing platform unchanged.
- Silhouette, L compound cells, grain and mass all use the narrowed grid. Tutorial opening100.8pt remains wider than87pt hero.
-2519 rule/geometry assertions passed.

# Fixed-size brick correction
- Previous horizontal scaling distorted squares; removed it.36×36 cells,72×72 squares and72×36/36×72 rectangles now retain original dimensions, L corners remain square.
- Rebuilt supports as5 columns in2+2+1 groups with10.8pt gaps; total envelope remains201.6pt (30% below initial288pt). No block spans a gap.
- Central passage93.6pt > enlarged hero87pt. Initial group cells tile completely without overlap. Hero/platform/height unchanged.
-2369 rule/geometry assertions pass and simulator build succeeds. Dynamic20-level solvability remains playtest work.

# Initially touching bricks
- Owner requested no pre-existing gaps. Five36pt columns now touch exactly, so total width is180pt (fixed-size priority supersedes exact30% envelope).
- Tutorial rows use1+3+1 cells, maintaining108pt central openings for87pt hero. Challenge pieces remain square/rectangle/L with full-cell tiling.
- Regression checks enforce column adjacency, zero group spacing, correct shape proportions and bounds.

# Authentication client
- Owner selected Supabase; no project URL/key supplied. Native Apple entitlement and client flows prepared, no external project/users/mail created.
- Added EN/JA/KO login/register/recovery UI, guest entry, account settings, Keychain session storage, nonce/token exchange, launch and foreground session validation and revocation handling.
- Guest progress preserved; each authenticated user gets a separate local progress namespace. Cloud sync not implemented.
-2391 rule/config checks +7 stubbed HTTP scenarios passed. Guest→login regression failed with locked Keychain, then passed after skipping credential deletion for guests.
- Independent review identified missing foreground revalidation; fixed. Auth real backend and Apple capability cannot be tested without owner configuration.
- Final simulator build succeeded. No production signup/login claimed. Setup instructions in docs/auth-setup.md.
- Final simulator UI confirmed: login/register page, unavailable-provider state, guest entry retains level7 progress, Settings→Sign in returns to login successfully after fix. Screenshot docs/screenshots/login-en.png.

# Mandatory authentication
- Removed guest state, method, UI controls and fallback routing. ContentView requires a confirmed session user ID; saves use account namespaces only.
- Updated EN/JA/KO unavailable/subtitle/progress copy. Old guest data is left untouched but is no longer accessible through the app.
-2391 core/config checks,7 transport scenarios, mandatory-gate model checks and simulator build passed. Real auth still awaits Supabase project configuration.

# Owner Supabase project connected
- Configured owner-provided HTTPS project URL and publishable key in app Info.plist.
- Read-only health/settings returned200; email enabled/signup allowed/confirmation required, Apple provider disabled. No users or mail created.
- Apple button follows live public-provider settings and remains disabled until enabled in Supabase;8 stubbed transport scenarios and auth model regression pass.
- Simulator build succeeded. Actual email delivery/registration and signed-device Apple authorization still pending.

- Found unsigned simulator Keychain access error after live config enabled; rebuilt with local ad-hoc simulator signing (CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=-), installed and observed clean login screen with no storage error. Updated build instructions. Email enabled, Apple button disabled as backend reports.

## 2026-10-29 — Account lives
Added server-backed lives, daily top-up5, loss/retry charging, 10% win conversion/cap99, no-life gate, AdMob test integration/UMP and SSV callback source, pentagon and coin absorption. SQL deployed through authenticated dashboard; four RLS tables/role checks verified. Production AdMob IDs and callback deployment remain pending. Details: docs/lives-setup.md.

## 2026-10-30 — Signup email OTP
The owner chose in-app email code after a successful email-confirmation redirect pointed to localhost. Added pending-email form, email verification, 60-second resend, existing unconfirmed-account recovery and EN/JA/KO copy. Confirm signup HTML is tracked in supabase/templates/confirmation.html; owner reported saving the live template and chose Mobpet's Alibaba Direct Mail service for SMTP. No real emails/accounts/tokens were used in automated tests. Existing confirmed accounts keep password login. Tests, signed build/UI checks and repo sync are recorded in the implementation plan.

## 2026-10-30 — Tower width +30%
Owner requested a wider brick tower with unchanged shapes. Uniformly scaled grid cells from36×36 to46.8×46.8, widening the five-column tower from180 to234. Kept level combinations, touching layout, centered position, landing pad and hero unchanged. Existing geometry tests cover exact width, square aspect ratio and touching columns.

## 2026-10-30 — U/T shapes and increasing tower height
Added concave U/凹 at level4 and T/凸 at level5, with alternating positions and rotations. Original L/rectangle/square combinations remain. Challenge rows=level+3, so every next level adds one46.8pt row. Filled cutouts keep towers initially touching/fully supported, compound cell bodies preserve notches, and path-based hit tests avoid selecting the surrounding irregular brick through a cutout. Geometry checks pass at all20 levels.

## 2026-10-30 — Owner AdMob IDs
Configured public owner app/rewarded IDs. Explicit DEBUG build condition added to project/generator; Debug keeps sample unit, Release uses production. SSV supports own unit full/numeric forms and a signed no-grant console probe. Added tested single-file dashboard bundle and CLI deployment script. Callback initially returned404; after the owner completed local CLI login it was deployed successfully (ACTIVE v1, gateway JWT off, Google signatures required). Live unsigned GET400/POST405 checks passed. No claim of live ads/SSV or reward completion.

## 2026-10-30 — AdMob console HTTP400 fix
Google console probe uses fixed sample ad_unit1234567890 rather than the owner unit. Added signed marker-only no-grant compatibility, preserved production whitelist. 10 regression checks and independent review passed. Deployed and verified same Google-signed probe returns200, unsigned remains400. AdMob UI validation/save still requires owner action; real video reward not yet verified.

## 2026-10-31 — Signed-device rewarded-ad acceptance
Owner confirmed AdMob account access and console callback verification/save. Signed Debug and Release builds succeeded on this Mac. A temporary copy outside the repository configured an explicit SDK test device and selected the owner's rewarded unit; normal repository Debug behavior remains sample ads. Device logs recorded ad load, the client reward callback, and an authenticated server status response `granted=true lives=1` at 00:03:04 Asia/Shanghai. Owner confirmed the additional life in the UI. The owner-unit selection bypassed the Debug-only sample `test_reward` branch. One complete reward flow in SDK test mode is verified; revenue and unrestricted production serving are not. Early-close/no-reward, delayed/replayed callback, and cap99 device acceptance remain. Initial UMP timeout and a stale iPhone proxy address were resolved through network configuration. See docs/admob-console-setup.md for evidence and scope.

The current test creative has no mid-ad close control according to the owner. Pre-reward cancellation remains unverified on device; closing after the SDK reward threshold must not be treated as a no-reward case.

## 2026-10-31 — TestFlight release preparation
Added the current 50 Google quick-start SKAdNetwork entries and the app-owned UserDefaults privacy reason CA92.1, including the manifest in the tracked Xcode project and generator. Core/auth/lives/AdMob/deletion checks and local PostgreSQL ledger/deletion tests passed. Release archive and App Store Connect IPA export succeeded for0.1.0(1); archive signatures, SDK/app privacy manifests, and absence of temporary acceptance/device configuration were checked. Prepared web/app-ads.txt; public root URL still returned404, so publication remains pending. Owner accepted both Apple agreements and authorized app creation/upload. Original store name Steady Drop was unavailable; the owner selected Hexa Landing. App Information showed the new name saved, with Apple ID6828956966 and the other authorized fields retained. Xcode upload succeeded at00:38:55 Asia/Shanghai and reported Apple processing; GoogleMobileAds/UMP vendor dSYM warnings were non-blocking. The store rename did not require rebuilding or reuploading0.1.0(1). TestFlight availability and tester assignment remain to be confirmed. See docs/testflight-setup.md.

The TestFlight dashboard subsequently showed0.1.0(1) as Ready to Submit. After internal-testing guidance, the owner confirmed successful TestFlight installation and entry into the game. Installation/launch are owner-reported passed; release-build account, persistence, settlement, and full-level acceptance remain. The TestFlight Release build does not contain the temporary SDK test-device configuration used for the earlier ad acceptance.

## 2026-10-31 — iPad TestFlight ad diagnosis
Owner confirmed successful email/password sign-in on the iPad Air5. After the owner enabled Developer Mode, direct process output captured the ad failure at01:52:58 Asia/Shanghai: `com.google.admob code=1`, `Request Error: No ad to show.` This confirms no-fill at the ad-load stage, rather than the earlier UMP timeout. The underlying serving/inventory reason remains unverified; AdMob app readiness must be checked. The developer website's app-ads.txt URL still returned404. No ad implementation change, replacement build, or website deployment occurred. See docs/testflight-setup.md for evidence and next steps.

## 2026-10-31 — app-ads.txt published
Located the website on Alibaba Cloud's Hong Kong lightweight server47.82.96.64 (`Ubuntu-krcs`), with Nginx root `/var/www/epanda`. Created the single app-ads.txt file through the owner's Workbench connection. Public HTTPS returned200 with text/plain and the59-byte body exactly matching the repository file. AdMob App settings was inspected directly: store details empty, app verification Not required/disabled, approval Requires review. The file publication is complete; public App Store release, AdMob store linking and readiness approval remain pending.

## 2026-10-31 — App Store listing draft and screenshots
Saved English listing/subtitle/keywords/URLs, Games→Puzzle/Casual categories, advertising-aware age questionnaire (general4+), content rights, free pricing, store version0.1.0 and attached build1. Preserved owner-provided review details and verified simulator sign-in. Published a dedicated support page, verified HTTPS200 and exact body. Uploaded four actual gameplay JPEGs1320×2868; Apple showed4 of10 and smaller-screen reuse. A separate simulator capture fixture was used without production account writes or changes to production Swift sources; it must never be uploaded as a binary. Storage recovery restored the original simulator directory after external-volume access failed, and captures then succeeded. App Privacy's ten categories are configured in draft but not published. Platform/EU/tracking choices, review account lives0, unconditional release development label, and AdMob readiness remain outstanding. No App Review submission. See docs/app-store-listing.md.

## 2026-10-31 — Nontracking launch choice and replacement build2
Owner selected no cross-app tracking for launch. Ad service disables publisher first-party ID and global personalization before consent/start, and each rewarded request registers NPA1; UMP and signed server reward flow are retained. Real-SDK simulator regression observed the personalization and missing-NPA failures, then passed in Debug and Release after changes. Core/auth/lives/SSV/deletion checks passed again. Development text is now Debug-only and Release simulator home/settings were verified without it. Prepared and signature-verified0.1.0(2) archive/export; IPA SHA256 and paths in docs/testflight-setup.md. No replacement upload yet. App Privacy Device ID now saved as not used for tracking; draft unpublished. Updated public-release policy is local, not deployed. Platforms/EU, review account lives0, AdMob readiness and final submission remain outstanding.

Build2 upload subsequently succeeded at04:12:20 Asia/Shanghai (Xcode exit0, Apple processing; non-blocking vendor dSYM warnings). Published corresponding website privacy policy with guarded/atomic replacement and backup outside the web root; HTTPS200,8758 bytes exactly match the repository. Apple's final Publish Privacy Responses dialog contains a responsibility confirmation; owner response requested before that action. No public App Review submission or release.

Owner explicitly confirmed the privacy publication statement; Apple then showed Published a few seconds ago. Build2 processed to Ready to Submit, received saved test notes and was assigned to the existing Internal group with one tester. Version0.1.0 was switched to build2 and saved; unused default Game Center selection disabled. Platform/EU decisions and review-account playability remain; no public review or release.

## 2026-10-31 — EU selected and review lives restored
Owner confirmed EU inclusion and requested review-account lives restored to5. After owner CLI reauthentication, a guarded single-account UPDATE changed lives0→5; independent backend query and normal Release simulator UI confirmed5 lives/40% points, with no open round or changes to other records/rules. Configured174 current App Store regions including EU, excluding China mainland, with future-region automatic expansion off. Owner confirmed DSA trader status; the contact-verification form has the Apple/D‑U‑N‑S address and prepared public business email/+86. Public phone and address confirmation are pending; no final DSA verification/submission or public App Review submission/release.

Owner supplied the public phone; normalized+86 national number entered. Apple requested email verification and reported sending a code to the public business email. Owner asked to complete code/any phone verification in the page. DSA completion and displayed-address confirmation remain pending.

Owner requested replacing the public phone and confirmed Beijing city code10. Reopened the DSA contact form and checked+86 /1065866704 (ending6704) before proceeding. One owner-supplied email verification code was rejected by Apple; no retry/resend was performed, and owner asked to enter the latest code in the page. No code retained in files; no final DSA submission or publication of either phone occurred.

Owner subsequently requested reverting to the original mobile (ending2917) for SMS and restarting email verification. The fixed-line flow had reached phone verification; it was cancelled and the contact form was reopened. The mobile+86 national number18518752917 was entered and checked before Next. Apple reported sending a fresh email code to chandler@epanda.com.cn. Owner asked to complete email then SMS in the page; final DSA completion remains pending.

## 2026-10-31 — DSA active and ready-for-review draft
Owner completed verification; Apple Business→Compliance independently showed DSA Active for27 countries/regions, updated Oct31. Existing AdMob European regulations message was checked as Published for Steady Drop; no message edits or live EU ad-serving test. Add for Review validated version0.1.0/build2 and created one draft, with Ready for Review / Item Ready to Submit. Final Submit for Review was not clicked. Mac/Vision Pro platform scope still awaits owner choice; current release option is automatic after approval and must be included in final submission confirmation.

Owner selected iPhone/iPad compatibility only. Disabled Mac and Vision Pro availability, saved, and reloaded to verify both remain off with174 regions unchanged. Version0.1.0/build2 remained Ready for Review; draft showed one ready item and Submit for Review. Final submission/release-mode authorization requested with concrete scope and AdMob readiness limitation. No formal submission yet.

## 2026-10-31 — Formal App Review submission
Owner authorized submitting0.1.0(2) and automatic release after approval. Saved automatic release option rechecked; Submit for Review returned1 Item Submitted. Review details independently showed submission6f388f32-76c3-43a5-b903-c5dfbe087a42 and its sole iOS App0.1.0/build2 item both Waiting for Review, displayed submission time Oct31,2026 at5:11AM. No cancellation. Approval/public availability remain unconfirmed; AdMob public listing association/readiness follows when the listing is available. Details in docs/testflight-setup.md.
