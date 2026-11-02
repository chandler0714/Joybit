# TestFlight preparation — 2026-10-31

## Prepared build

- Version/build: `0.1.0 (1)`.
- Bundle ID: `com.xuanniaozhixu.steadydrop`; team: `KMY94A6RM7`.
- Release archive: `build/testflight/SteadyDrop-0.1.0-1.xcarchive`.
- Exported App Store Connect IPA: `build/testflight/export/SteadyDrop.ipa`.
- IPA SHA-256: `ddcd77a6acc3af5ee47eb5c6679fcaca1ffd254a200e932e097b1adb65edcc61`.
- Archive and export both succeeded. The app signature was checked; the archive includes the app, Google Mobile Ads, and UMP privacy manifests. Temporary acceptance logs/device configuration are absent from the archived executable.

The app plist includes the 50 SKAdNetwork identifiers from Google's iOS quick-start guide checked on 2026-10-31. The app privacy manifest declares UserDefaults reason `CA92.1` for app-owned preferences, per-account progress, and settlement journals. The project generator includes the manifest as a resource. This manifest does not replace the App Store privacy questionnaire or region-specific AdMob privacy messages.

References: [Google SDK setup](https://developers.google.com/admob/ios/quick-start), [Apple required-reason APIs](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api).

## Verification

Core checks (2424 assertions), lives rules/transport/recovery, 14 auth transport cases and auth model checks, 10 AdMob verifier/handler checks, and 11 account-deletion/Apple checks passed. Local PostgreSQL tests passed for the migration and routines, including duplicate rewards, transaction replay, cap99, account isolation, privileges, and deletion cascades. These tests used a local PGlite database and did not alter production accounts.

The on-device rewarded test-mode acceptance is documented in [AdMob setup](admob-console-setup.md). Pre-reward cancellation is still unverified because the tested creative offered no mid-ad close control.

## App Store Connect handoff

The owner accepted the App Store Connect terms and updated Apple Developer Program License Agreement. The agreement-update banner disappeared after refresh. The account initially had no app records.

The owner authorized creating an iOS app and uploading this build with:

- Developer display name: `Beijing Xuanniao Zhixu Technology Co., Ltd`.
- Primary language: `English (U.S.)`.
- SKU: `steadydrop-ios`.
- Full access, existing bundle ID listed above.

Apple rejected the proposed store name `Steady Drop` as already in use. The owner requested changing only the store app name and selected `Hexa Landing`. This name was saved in App Information; the page showed `Saved` and the app menu updated to `Hexa Landing`. Apple ID remains `6828956966`, [App Store Connect](https://appstoreconnect.apple.com/apps/6828956966/distribution). The remaining authorized fields were retained. Apple's first-app developer display name is not editable later; the owner explicitly confirmed the name above. The on-device display name remains `Steady Drop`; the store-name adjustment did not require rebuilding or reuploading the IPA.

The owner authorized uploading the prepared `0.1.0 (1)` build to Apple for TestFlight. Xcode completed the upload with exit0 at 00:38:55 Asia/Shanghai on2026-10-31 and reported `Upload succeeded` and `Uploaded package is processing`. A subsequent dashboard check showed version0.1.0, Build1, status `Ready to Submit`. At that check, build details showed `Groups (0)` and an `Add Group` button. After the internal-testing setup instructions, the owner reported successfully installing through TestFlight and entering the game. This confirms installation/launch by owner report; the updated group membership and broader gameplay/account acceptance were not independently inspected. No external Beta Review or public release was submitted.

Upload produced non-blocking symbol warnings: the vendor `GoogleMobileAds.framework` dSYM (UUID `042D747A-B313-36D5-A4C2-8A3DF047ABBC`) and `UserMessagingPlatform.framework` dSYM (UUID `BC5E040B-44BB-336C-A4DC-9388F5D8AD15`) were absent from the archive. The upload succeeded; resolving these warnings would improve symbolication of crashes inside those SDKs. The app's own dSYM is included in the archive.

## Remaining publication work

### Connected iPad ad diagnosis (2026-10-31)

The owner reported successful email/password sign-in followed by the generic ad-unavailable message on the TestFlight installation on Xiaoxia's iPad Air (5th generation). The initial Console capture was inconclusive. After the owner enabled Developer Mode, `devicectl` confirmed it was enabled and launched the installed0.1.0(1) app with direct console output. The owner triggered one ad request. At01:52:58 Asia/Shanghai the app logged `[SteadyDrop Ads] load failed: domain=com.google.admob code=1 description=Request Error: No ad to show.` Evidence is saved locally at `/tmp/disclick-ipad-testflight-direct-console.log`. Google defines code1 as no-fill: the ad request succeeded but no ad was returned. The observed failure is at ad loading, after the consent flow; it is not the earlier consent timeout. No-fill does not identify the underlying serving restriction or inventory reason. No ad code change or replacement build was made.

The TestFlight build uses the owner unit without the earlier temporary iPhone test-device configuration. Deliberate further ad acceptance should use a designated test device. AdMob App settings was subsequently inspected directly: `App store details` is empty, `App verification` is `Not required` with `Verify app` disabled, and `Approval status` is `Requires review`. Public App Store distribution and store linking remain outstanding; no readiness review was submitted. The app-ads.txt file was subsequently published successfully as described below. No-fill alone does not prove a particular serving restriction caused the request to fail. References: [Google iOS error codes](https://developers.google.com/admob/ios/api/reference/Enums/GADErrorCode), [test devices](https://developers.google.com/admob/ios/test-ads), [app readiness](https://support.google.com/admob/answer/10564477), [app verification](https://support.google.com/admob/answer/14538460).

### Published app-ads.txt (2026-10-31)

The website is hosted on the Alibaba Cloud Hong Kong lightweight instance `Ubuntu-krcs`, public IP47.82.96.64. Workbench inspection of `/etc/nginx/sites-enabled/epanda` confirmed `server_name epanda.com.cn www.epanda.com.cn` and root `/var/www/epanda`. The owner reconnected to this instance after the initially opened Singapore instance was identified as a different site. A new `/var/www/epanda/app-ads.txt` was created with no-clobber protection and mode0644; no Nginx configuration change or reload was needed. At02:27 Asia/Shanghai, `https://epanda.com.cn/app-ads.txt` returned HTTP200, `Content-Type: text/plain`, length59 bytes. Its downloaded body matched `web/app-ads.txt` byte for byte. The local website copy is `/Volumes/MACMINIDISK/work/epanda-site/app-ads.txt`. Website publication is verified; AdMob crawling, app verification, and readiness approval are separate and remain unconfirmed.

- Continue acceptance of the installed TestFlight build: account/session behavior, progress persistence, life settlement, and level playability. Record actual results and any failures. External testing requires the Beta Review workflow.
- Configure internal TestFlight access and test information. External testing or App Store review require their own metadata and review steps.
- Keep development ad requests in test mode. This Release IPA follows the repository's normal production-unit configuration; it does not embed the temporary device test configuration. Designate tester devices before deliberate ad testing.
- Complete the store privacy questionnaire, target-region AdMob privacy messages, screenshots, age rating, and release availability (the existing requirement excludes mainland China). Resolve EU trader status if distributing there.
- `web/app-ads.txt` is published at `https://epanda.com.cn/app-ads.txt` with verified HTTP200 and exact content. Link the developer website in the App Store listing, associate the public app with AdMob, and complete any requested verification/readiness review. Publication of the text file does not establish AdMob approval.

App Store Connect upload/processing, tester assignment, public app release, and advertising revenue must not be reported as complete until independently confirmed.

### Store metadata and screenshots saved (2026-10-31)

The owner delegated completion of missing listing information and confirmed free download with optional rewarded ads and no purchases/subscriptions. English metadata, categories, content-rights declaration, age questionnaire, free pricing schedule and privacy-policy URL were saved. The version was aligned to0.1.0 and build1 attached. The owner's review credentials/contact information were retained; the phone prefix was normalized to international+ format. Review sign-in was verified in the signed simulator build, but its life balance was0 at inspection.

Four genuine gameplay screenshots (1320×2868 JPEGs) were uploaded into the large Dynamic Island iPhone slot. Media Manager showed4 of10 and smaller-device reuse; returning to the version page showed all four images with Save disabled. A separate capture-only simulator fixture seeded local gameplay/lives and was never archived or uploaded as a binary. Production Swift sources were unchanged.

The support page was published at <https://epanda.com.cn/steady-drop/support.html> and its HTTP200 body matched `web/steady-drop/support.html`. Ten App Privacy data categories were fully configured but remain unpublished pending tracking consistency. Platform availability, EU/trader choice and tracking strategy await owner answers. Current source still shows the development/test-ad label in Release; address it before formal submission. Exact saved copy, the draft privacy matrix and remaining checks are in [App Store listing](app-store-listing.md). No public review was submitted.

### No cross-app tracking launch configuration — build2 prepared

The owner selected first-release operation without requesting cross-app tracking. `RewardedAds` now disables publisher first-party ID and global personalization at initialization, before UMP or Mobile Ads start, and registers NPA1 in each real SDK rewarded request. UMP consent and server-side reward verification remain in place. No ATT request/usage description was added. Publisher Privacy Treatment alone permits some third-party vendors, so NPA was also applied; see [Google PPT behavior](https://support.google.com/admob/answer/14323214). These restrictions do not mean no SDK data collection, guaranteed ad fill, or verified production ad delivery.

The real-SDK simulator harness first failed on the previous personalization state, passed after the initialization change, then failed on missing NPA and passed after adding NPA. Debug and Release harness runs passed using the production ad-service source; no ad request, test reward, or production balance mutation is performed by the harness. It also checks absent ATT usage text, non-authorized tracking state and zero IDFA in its test installation. The SDK exposes no public first-party-ID getter, so that setter is verified by source/API inspection rather than a claimed runtime readback. To rerun: set `ADS_TEST_SIMULATOR` to a booted test simulator, `ADS_SOURCE_PACKAGES` to resolved SourcePackages, optionally `ADS_TEST_CONFIGURATION=Release`, and run `scripts/test-ads-privacy.sh`. The harness app/entry point must never be uploaded.

Core2424 assertions, life rules/transport/store recovery,14 auth transport cases/auth model,10 AdMob checks and11 deletion/Apple checks passed again. The database routines were unchanged; the previously recorded local PostgreSQL checks were not rerun for this client-only configuration change. Release simulator build/install succeeded; home and settings were verified without the development label after limiting it to Debug. Review account still had0 lives at this check.

Prepared and subsequently uploaded:

- Version/build: `0.1.0 (2)`; project and generator updated together.
- Archive: `build/testflight/SteadyDrop-0.1.0-2.xcarchive`; archive succeeded.
- Export: `build/testflight/export-2/SteadyDrop.ipa`; export succeeded.
- SHA256: `0ee4fa7be1529c7451f7fc70debd0b05a40630c38c2ea90c88364e7ab28ce805`.
- Archive/export signatures verified, production identity/unit and build2 confirmed, `get-task-allow=false`, no ATT description, app privacy manifest and50 SKAdNetwork entries present. Production archive contains no fixture files.

Xcode reported Upload succeeded / Uploaded package is processing at04:12:20 Asia/Shanghai on2026-10-31, then exited0. Build2 was sent to the existing app for TestFlight; no public review or release was submitted. Vendor GMA/UMP dSYM upload warnings remain non-blocking, as with build1.

App Privacy Device ID tracking was changed to No and saved; preview no longer shows Data Used to Track You. Other collected categories remain declared. Clicking Publish opened Apple's final accuracy/compliance/update-responsibility confirmation; it was not accepted, and explicit owner confirmation was requested. The updated policy was published through Workbench with an expected-old-content SHA256 guard, backup outside the web root at `/var/backups/epanda/steady-drop-privacy-before-build-2.html`, and atomic replacement. Public HTTPS returned200,8758 bytes, matching the repository; SHA256 `dbff7c475913e209006736e94bd270e238785a0caa2c950232b615e0a00bbc0c`. Local website copy synchronized. Platform/EU answers, review-account playability and final review submission remain outstanding.

The owner then explicitly confirmed publishing the privacy responses. The final Publish action completed and Apple showed Published a few seconds ago. TestFlight build2 appeared as Ready to Submit, accepted saved What to Test notes, and was added to the existing Internal group (one tester). The distribution version0.1.0 was changed from build1 to build2 and saved (Save disabled afterward). The default Game Center checkbox was disabled because no such implementation/entitlement is present. No new testers were invited, no external review was sent, and no public App Review submission or release was performed.

### EU availability and review lives restored

The owner confirmed including EU and explicitly requested5 lives for the dedicated review account. Supabase CLI initially lacked login credentials; the owner completed official CLI login. A read-only lookup matched the review identifier through its digest, confirmed exactly one target with lives0, points40, Asia/Shanghai timezone, top-up day2026-10-31 and no open rounds. One guarded UPDATE set only lives to5, requiring the same account match, old balance0 and no open round. Its returned row and an independent readback confirmed5/40 with the original timezone/day. Relaunching the normal signed Release simulator app showed Lives5,40%. No account password, game progress, reward tickets, round history or life rules were altered.

Apple availability was confirmed for174 existing countries/regions, including Europe and excluding China mainland. Future-country automatic availability was disabled. The resulting availability page showed174 and China mainland Not Available. No public release occurred. The owner confirmed DSA trader status; contact-information verification now awaits a public phone number and owner confirmation of the read-only Apple/D‑U‑N‑S address. Public business email chandler@epanda.com.cn and+86 calling code are prepared. No contact verification code was sent and no final DSA submission was made. Mac/Vision Pro availability remains at its prior default pending platform scope confirmation.

The owner subsequently supplied the public phone (ending2917). It was entered with+86 country code and the national number separately. Proceeding opened Verify Email Address and Apple stated that a code was sent to chandler@epanda.com.cn. The owner was asked to enter the code on the page and complete any subsequent phone verification, without sending codes to chat. No verification code was read/entered by the agent, and no final DSA completion is claimed. Displayed-address confirmation is still outstanding.

The owner then requested a different public phone and confirmed it was the proposed Beijing fixed line. The previous verification flow was cancelled before phone verification; the DSA form was reopened with the previously authorized trader choice, and the number was replaced using+86 and national number1065866704 (ending6704). The number was checked in the actual field before proceeding to email verification. A single code explicitly supplied by the owner was entered for that purpose but Apple returned Incorrect verification code. No retries or new code resend requests were made; the owner was asked to use the latest email code in the page. No code is stored in project files. The old phone was never published, and DSA verification/final submission remains incomplete.

The owner then requested reverting to the original mobile for SMS and restarting email verification. On returning to the original tab, Apple was already on Verify Phone Number for the fixed line, indicating the owner had progressed beyond email verification. That flow was cancelled, trader/contact information was reopened, and the requested mobile was entered with+86 and national number18518752917 (ending2917). Its exact field value was checked before Next. Apple opened a fresh Verify Email Address challenge and explicitly reported sending a code to chandler@epanda.com.cn; no additional resend was pressed, to avoid replacing that fresh code. The owner was asked to complete the latest email challenge followed by SMS on the page. No final verification/submission or public release occurred.

### DSA active and review draft prepared

The owner reported verification complete. Business→Compliance was then inspected directly: Digital Services Act,27 Countries or Regions, last updated Oct31,2026, status Active. The EU compliance blocker is resolved. AdMob Privacy & messaging→European regulations was also inspected: an existing Untitled European regulations message is assigned to Steady Drop, language English plus one other, status Published, Unpublish message toggle on. No message changes or real EU ad-serving test were performed. The IDFA explainer remains uncreated, consistent with no ATT.

After confirming the attached build2 and saved version0.1.0, Add for Review was used to validate/prepare the draft. Apple changed the version to Ready for Review and opened Draft Submission with one Item Ready to Submit and a Submit for Review button. No validation errors appeared. This is not a review submission: the final Submit for Review button was not clicked. Apple's current documented flow explicitly distinguishes these steps ([Submit an app](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)). The release option remains Automatically release this version and must be part of the final owner confirmation. Platform scope (Mac/Vision Pro defaults versus only iPhone/iPad compatibility) was asked again and remains pending.

### Phone/iPad compatibility-only scope saved; final submission decision pending

The owner selected only iPhone/iPad compatibility. Pricing and Availability's Mac and Vision Pro availability were both unchecked and saved; Saved appeared. A full reload subsequently showed174 Available with both platform checkboxes still0. The iPhone-only device family in the binary remains unchanged; this does not add native iPad support.

The version page still showed Ready for Review, attached build2 and disabled Save. Opening its draft showed one Item Ready to Submit, iOS App0.1.0 /0.1.0(2), and Submit for Review. The owner was asked whether to formally submit now, with either automatic release after approval or manual release. The prompt included the174-region EU-inclusive/mainland-China-excluded scope, free/optional non-personalized rewarded ads, and the separate outstanding AdMob public-store-link/readiness work. Current automatic release setting was not changed pending that decision; Submit for Review was not clicked.

### Formally submitted — Waiting for Review

The owner explicitly selected submit for review with automatic release after approval. The saved version-release controls were rechecked as manual0/automatic1. Its draft showed0.1.0(2). Submit for Review completed and Apple displayed1 Item Submitted. Following Go to App Review opened [submission6f388f32-76c3-43a5-b903-c5dfbe087a42](https://appstoreconnect.apple.com/apps/6828956966/distribution/reviewsubmissions/details/6f388f32-76c3-43a5-b903-c5dfbe087a42): the submission and its sole iOS App0.1.0/build2 item both showed Waiting for Review. Apple displayed Date Submitted Oct31,2026 at5:11AM. No cancellation was performed.

Formal review submission is verified. Approval and public availability are not yet verified; the selected setting releases automatically if Apple approves and applicable release conditions are satisfied. Distribution settings remain174 regions including EU/excluding China mainland, Mac and Vision Pro off, free with optional non-personalized rewarded ads. When the public App Store listing becomes available, associate it with AdMob and complete any requested readiness/app verification steps; live ad fill/revenue is still not established by this submission.
