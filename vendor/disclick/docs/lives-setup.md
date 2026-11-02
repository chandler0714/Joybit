# Lives and rewarded video

Implemented 2026-10-29. The owner approved daily top-up to five retaining larger balances, a 99 cap, 10 progress per successful round, retry charging one loss, free home navigation, account-owned server state and rewarded videos.

## Database
`supabase/migrations/202610290001_lives.sql` was executed through the authenticated Supabase dashboard on project `jrlpghljmqwudywajkpo` (disclick). Dashboard returned success. Verification found four RLS-enabled tables, authenticated-only life_action, no authenticated life_ad_grant permission, and test rewards disabled. No existing accounts were created, modified or deleted for testing.

The server creates each player's balance on first access. It captures a valid IANA time zone once, uses server time and never accepts device clock timestamps. Each later local calendar day tops up to max(5,current). It does not stack five lives per missed day. Points carry across days. Clients need a connection to start/settle rounds. Pending outcomes persist on device until acknowledged; settlements and ad transactions are idempotent. Starting on another device abandons the earlier active round; that device receives a retryable expired-round message.

Balances persist across devices; existing level/star progress still uses the existing per-account device storage. Physics outcomes are client-reported; this is not server-replayed anti-cheat.

## AdMob
GoogleMobileAds Swift Package 13.11.0 is pinned, including UMP 3.1.0. The plist uses the owner's app ID `ca-app-pub-3267856586189154~5641394743` and rewarded unit `ca-app-pub-3267856586189154/8507939079`. Debug explicitly selects Google's sample rewarded unit; Release uses the owner's unit and refuses a sample unit. UMP refresh/form and canRequestAds gate run before ad requests; settings offers privacy choices when required.

Production activation status:
1. Owner IDs have been supplied and set in `SteadyDrop/Resources/Info.plist`. Configure region-appropriate AdMob privacy messages, store privacy disclosures, and current SKAdNetwork identifiers from Google's integration guide before release.
2. Deployed `supabase/functions/admob-reward` on2026-10-30 using the authenticated CLI/API bundler. Management reports ACTIVE v1; live unsigned GET400/POST405 smoke checks passed. It is a Google callback endpoint, authenticated by Google's ECDSA signature instead of an app JWT. SQL already grants its service role sole access to life_ad_grant. Backend service key stays in Supabase's automatic Edge Function environment; never place it in the app.
3. The function defaults to the owner's allowed unit. Optionally override `ADMOB_REWARDED_UNITS` with allowed full ad-unit IDs, comma separated if multiple. Configure AdMob SSV URL `https://jrlpghljmqwudywajkpo.supabase.co/functions/v1/admob-reward`. For console verification use custom data `ssv-verify`; the signed probe returns success but grants nothing. See docs/admob-console-setup.md.
4. Each video is assigned an expiring account-owned ticket passed as custom_data. The function verifies exact raw query bytes against Google's rotating P-256 public keys, validates the allowed unit/timestamp/UUID, and grants one life once per ticket and transaction. The client polls for 24 seconds and can recover a delayed grant on future refresh. Early dismissal or load/presentation failure grants nothing.
5. Test complete playback, early close, no fill, network failure, delayed/replayed callbacks, and cap99 on a real device before release. Neither a real ad play nor a live SSV callback has been verified in this session.

Test ad rewards are intentionally **off in the live project**. Only in an isolated disposable test project may an owner enable `life_configuration.allow_test_rewards`; this exposes a client-callable test grant and must never remain enabled for production. Debug-only code invokes it only after Google's test ad completion callback. Production uses SSV only. Do not describe test ads as monetizing.

## Verification
- `./scripts/test-core.sh`: 2404 existing game/auth-validation assertions.
- `./scripts/test-auth.sh`: existing auth transport and mandatory login tests.
- `./scripts/test-lives.sh`: daily/cap/conversion rules, six HTTP scenarios, concurrent finish and persisted settlement recovery including expired rounds, six ECDSA SSV tests and three callback/bundle tests.
- PostgreSQL tests: `node Tests/lives-db.test.mjs /path/to/@electric-sql/pglite/dist/index.js` (temporary dependency installed outside repo). Runs actual migration/routines: daily refill, repeated loss/win, cap, replacement/abandonment, test switch, replayed transactions, account isolation and role privileges. All passed locally.
- Signed Debug simulator build passed. Live database schema/privileges verified through dashboard. Independent simulator UI fixture verified home/game/right-top badge and win overlay visibility; fixture removed afterward and production development app installed. The owner supplied AdMob IDs on2026-10-30. On2026-10-31 the owner confirmed console URL verification/save, and a signed-device acceptance copy using the owner's unit with an explicit SDK test device logged the client reward callback and authenticated server status `granted=true lives=1`; the owner confirmed +1 in the UI. That copy did not call the Debug sample `test_reward` branch. One complete reward flow in SDK test mode is verified; remaining failure/recovery/device QA and monetization readiness are not. See [console acceptance](admob-console-setup.md).
