# Steady Drop release preparation

Authorized scope: make level 2 moderately harder, add privacy links and self-service deletion in the existing settings, validate reward behavior without enabling production test rewards.

Design: level 1 unchanged; level 2 keeps four fully packed rows but staggers rectangular seams with a 300pt landing pad. Existing five-column geometry and cell dimensions remain. Login and settings link to the published HTTPS policy. Settings deletion requires explicit confirmation and reauthentication; server determines account identity from verified access token, never from a client user id. Email users re-enter password; Apple-linked users supply fresh Apple authorization. Apple credentials stay server-side. Cascade deletes remove lives, rounds and reward tickets. Local account data and Keychain session clear only after acknowledged deletion. No real account is deleted by automated tests.

- [x] Add failing geometry and deletion transport/handler tests.
- [x] Implement level 2 transition, privacy links, deletion UI/service and backend.
- [x] Run core/auth/lives/backend tests and build for device.
- [x] Deploy authenticated deletion endpoint; verify unauthenticated rejection.
- [x] Document missing Apple signing configuration and remaining live tests accurately.

Apple key PU3P3W77YD configured on 2026-10-30; all four expected server secret names verified. An invalid-code Apple configuration probe returns invalid_grant, not invalid_client; this is not a live user revocation test. Fresh automated checks passed: 2424 core assertions, 14 auth transport cases plus model deletion success/failure state, 11 deletion/Apple tests, lives and SSV tests, PostgreSQL reward/cascade tests. Device Debug build succeeded and installed. Unsigned deletion POST returned401. Physical Apple deletion and Google live SSV reward remain unverified.

UI fixture compiled, but the simulator stalled during system boot; no runtime visual QA is claimed. Updated production Debug build installed successfully on the owner iPhone.
