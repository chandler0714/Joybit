# Account deletion and privacy

Login and settings link to https://epanda.com.cn/steady-drop/privacy.html. Settings includes support email chandler@epanda.com.cn, a destructive confirmation, and reauthentication. English/Japanese/Korean copy included.

`delete-account` is deployed to project `jrlpghljmqwudywajkpo`. The gateway JWT toggle is off only because the handler itself verifies the bearer through Supabase Auth `/user`; anonymous requests return401. No client-supplied target id is used. Email users verify their current password server-side, and only the returned identical account id is deleted. Admin credentials never leave the function. Responses use `Cache-Control: no-store`. No credentials or tokens are logged.

Deleting the Auth user cascades through `player_lives`, `life_rounds`, `life_ad_tickets`. The client clears only that user's local progress and Keychain session after acknowledged success. A failed request preserves the session/progress. Other devices' on-device progress is not remotely erased. Existing JWTs expire normally, but Auth verification and the FK to the deleted identity prevent further life actions. A deletion response lost in transit can require signing out/rechecking account status; do not claim deletion completed without acknowledgement.

## Apple configuration

Create a Sign in with Apple key in Apple Developer > Certificates, Identifiers & Profiles > Keys > +. Enable Sign in with Apple, Configure to the primary App ID `com.xuanniaozhixu.steadydrop`, Register, record Key ID, and download the .p8 file once. Team ID: `KMY94A6RM7`. Keep .p8 outside the repository. Never paste it into chat or client code.

Configure these **server-only** Supabase Edge Function secrets after creation:
- APPLE_CLIENT_ID=com.xuanniaozhixu.steadydrop
- APPLE_TEAM_ID=KMY94A6RM7
- APPLE_KEY_ID=PU3P3W77YD
- APPLE_PRIVATE_KEY=(contents of protected .p8 file)

The function signs a short-lived ES256 client secret, exchanges the fresh authorization code, validates Apple's RS256 id token signature/issuer/audience/expiry/subject against the authenticated account's Apple identity, revokes the refresh token, and only then deletes the Auth user. Linked Apple identities cannot bypass this branch with an email password. Missing configuration returns503 APPLE_SETUP_REQUIRED and does not delete. Apple live deletion remains unverified and is a release blocker until keys and a disposable-account test are completed.

Deploy: `npx --yes supabase@latest functions deploy delete-account --project-ref jrlpghljmqwudywajkpo --use-api --no-verify-jwt`.

Tests: `./scripts/test-account.sh`; SQL cascade/reward tests: `node Tests/lives-db.test.mjs /path/to/@electric-sql/pglite/dist/index.js`.

No production users were deleted during automated verification. Existing production test reward grants remain disabled. Mocked signature/revocation/deletion tests and local PostgreSQL ledger tests do not constitute a live Google reward or Apple revocation test.

2026-10-30: owner supplied Sign in with Apple key PU3P3W77YD; all four server secrets configured successfully. The private key is ignored by Git and is not bundled in the app. Actual Apple account deletion/revocation still needs a disposable-account test.

Owner validation update (2026-10-30): the owner reports validation of the installed update complete. This is owner-reported device verification, not an independently captured Apple revocation trace. Google production SSV reward verification remains a separate pending item.
