> Current policy: mandatory authentication. Guest mode has been removed by owner request. Without a configured backend, the app remains on the sign-in screen. Historical guest references below are superseded.

# Account integration
Requested: email registration/login and Apple auto-login. Existing app is fully offline, no backend config supplied. Default proposed Supabase Auth adapter with no third-party SDK; native AuthenticationServices Apple button; secure random hashed nonce and server ID token exchange. User can substitute a backend adapter later. No external account or paid project is created by this implementation.
- Branded EN/JA/KO entry screen, email/password login and registration, confirmation email notice, reset-password email/code/new-password flow. Guest access remains available.
- Tokens only in device-only Keychain; passwords never stored. Restore session by refresh token; Apple credential state checked before restoring Apple session, revoked credentials clear local session.
- Backend URL and publishable/anon key configured in Info.plist; no service-role key permitted. Missing config disables real sign-in and clearly reports unavailable, never simulates authenticated success.
- Per-user local progress isolated from guests and other accounts; this pass does not implement cloud progress sync.
- Sign in with Apple entitlement is prepared, but Apple developer portal capability and Supabase Apple/email provider setup require owner access/configuration.
- No real sign-up messages or authorization requests submitted without actual user interaction. Account deletion/backend token revocation, privacy policy/terms URLs and real SMTP verification are release prerequisites, not claimed complete.
Plan: pure input/config tests RED→GREEN; implement transport+Keychain/session model; native auth UI and root routing; language strings; build/tests and simulator missing-config/guest smoke checks. Live end-to-end auth blocked by missing backend and Apple portal configuration.
