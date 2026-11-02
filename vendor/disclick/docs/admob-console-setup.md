# Steady Drop AdMob activation

Owner-supplied identifiers (public client configuration):
- iOS application: ca-app-pub-3267856586189154~5641394743
- Rewarded ad unit: ca-app-pub-3267856586189154/8507939079

The app plist now contains these IDs. Explicit DEBUG compilation is enabled for Debug; Debug requests Google's sample rewarded ad unit, while Release uses the owner's ID. The live database still has test rewards disabled. Seeing a test ad is not proof of monetization or life-grant completion.

## Deploy callback
The owner completed local Supabase CLI login. The callback was deployed to disclick on2026-10-30; management lists admob-reward ACTIVE version1, gateway verify_jwt=false. Live unsigned GET returned400 and POST returned405, confirming the handler is public but grants nothing to unsigned requests. No credentials were sent in chat or saved in Git.

1. In a local terminal run `npx --yes supabase@latest login`, follow Supabase's login prompts yourself.
2. From the repository root, run `./scripts/deploy-admob.sh` (or let the agent do so after login). It deploys only admob-reward to project jrlpghljmqwudywajkpo via API bundling, without Docker or database resets. The callback uses Google ECDSA validation instead of Supabase user JWT; service-role grant remains inaccessible to app users.
3. The deployed function defaults to the owner's rewarded ad unit whitelist. Optional ADMOB_REWARDED_UNITS may override it with comma-separated IDs; full ID is recommended. The verifier accepts a matching numeric callback form but rejects a different publisher's full ID. No new secrets are embedded in the repo. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY stay in the Edge runtime.

Dashboard alternative: regenerate with `python3 scripts/bundle-admob.py`, then create Edge Function `admob-reward` using the complete contents of `supabase/deploy/admob-reward.ts` as index.ts. This bundle is tested against canonical source. Configure gateway JWT verification off because Google does not send an app JWT; the function still requires a valid Google signature before any action.

## AdMob SSV fields (after deployment)
Open the game's rewarded unit → Advanced settings → Server-side verification.
- Callback URL: https://jrlpghljmqwudywajkpo.supabase.co/functions/v1/admob-reward
- User ID: leave empty for the console check.
- Custom data: ssv-verify
- Click Verify URL, then Use verified URL, then Save.

The console marker ssv-verify is validated with signature/time/unit and returns200 without creating or granting any reward. Production code always passes a unique server-issued UUID as custom data; the signed callback redeems it exactly once. Never replace production custom data with a fixed marker.

## Before production
Configure AdMob Privacy & messaging for the target regions (EU/UK and applicable US jurisdictions), complete store privacy disclosures/SKAdNetwork configuration, and link the published iOS app when available for readiness review. One completed rewarded-ad flow on a signed device in SDK test mode is verified below. Physical-device checks for early close, duplicated callback, network delay, and cap99 remain. The owner has confirmed that the AdMob account is operational and the console callback URL was verified and saved; the account dashboard was not independently inspected here.

## Console fixed sample-unit compatibility (2026-10-30)
The owner's first Verify URL attempt returned400. Bounded read-only invocation diagnostics established that Google's signed console request uses ad_unit=1234567890 even when initiated from the owner's rewarded unit; custom_data was correctly ssv-verify. The old whitelist rejected it as unknown ad unit after signature/time verification.

A narrowly scoped exception now accepts that fixed sample unit only with the reserved ssv-verify marker, retaining Google signature, timestamp and transaction validation. It returns ticket:null and the handler returns200 without calling life_ad_grant. Fixed sample units carrying a UUID and all other unknown units are rejected. Regression was observed red (400/unknown unit), then all10 verifier/handler/bundle tests passed. Independent review found no important issues. Deployed fix was tested with the same already-signed Google console probe: HTTP200 “Verified. No reward issued.”; unsigned GET still400. No real ad rewards or account changes occurred. The owner must click Verify URL again, then Use verified URL and Save in AdMob; this backend fix does not save the AdMob UI settings automatically.

## Signed-device reward acceptance (2026-10-31)

The owner confirmed the account and console callback setup are complete. Signed Debug and Release device builds succeeded. A temporary acceptance copy outside this repository selected the owner's rewarded unit and configured the iPhone as an SDK test device. The repository's normal Debug sample-unit selection was not changed. The temporary SDK device identifier is not an IDFA and must not be entered in the console's IDFA field.

Device logs captured the owner-unit ad loading and the client reward callback. At 00:03:04 Asia/Shanghai, the authenticated `ad_status` response logged `server reward granted=true lives=1`; the owner also confirmed seeing one life added. The acceptance copy used the owner's unit, so `usesTestAds` was false and its Debug-only `test_reward` branch was not called. This verifies one server-confirmed reward in SDK test mode, not advertising revenue or unrestricted production ad serving. The Edge Function invocation and database transaction were not separately inspected in this check.

The initial UMP request timed out before ad loading. After configuring the iPhone's Wi-Fi proxy to the Mac's current LAN address, playback succeeded. The Mac changed from Ethernet to Wi-Fi during testing, changing its LAN IP; stale proxy settings also caused account-service connection errors. Proxy addresses must be rechecked after network changes.

The owner reported no mid-ad close control in the current test creative. Cancellation before reward eligibility therefore remains unverified on device; it is not marked passed. Test the absence of a reward only when a creative permits dismissal before the SDK's earned-reward event. Closing after the reward threshold can legitimately retain the reward, even if the creative has not visually finished. Ad close controls are managed by the SDK/creative.
