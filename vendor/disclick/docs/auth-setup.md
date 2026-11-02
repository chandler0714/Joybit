> Current policy: mandatory authentication. Guest mode has been removed by owner request. Without a configured backend, the app remains on the sign-in screen. Historical guest references below are superseded.

# Supabase / Apple account setup

## Current status

Owner project jrlpghljmqwudywajkpo is configured using its publishable key. Read-only health/settings checks on2026-10-29 returned200: email enabled, signup allowed, email confirmation required, Apple enabled (latest check after the owner completed provider setup). Client Apple button now follows provider availability. No real users were registered and mail delivery was not tested. Authentication is mandatory; there is no guest route.

## Owner configuration

1. Create a Supabase project in the owner's organization. Select the region/data processing arrangement suitable for the intended audience. Authentication itself needs no custom tables; the lives feature now requires the migration described in docs/lives-setup.md.
2. Copy the project's HTTPS URL and **publishable** key (or legacy **anon** key) into `SteadyDrop/Resources/Info.plist`:
   - `SupabaseURL`: `https://YOUR_PROJECT.supabase.co`
   - `SupabasePublishableKey`: the public client key.
   Never put a service-role key, secret key, SMTP password or Apple private key in the iOS app.
3. Enable the Email provider, require email confirmation, and set minimum password length to8. Configure production SMTP and verify delivery to real recipients. Configure a working Site URL for email confirmation links. Signup asks the user to enter the email verification code in the app; successful verification stores the returned session and enters the game. In Confirm signup, use the code-only HTML in supabase/templates/confirmation.html with subject “Steady Drop — Email verification code”. {{ .Token }} replaces browser confirmation links. The owner reported saving this template on 2026-10-30; actual new-message delivery remains to be verified.
4. For password recovery this app accepts an email **code**, not a deep link. Customize the Supabase Reset Password email template to include `{{ .Token }}` visibly. Keep reset token validity/rate limits appropriate; the app accepts6–10 numeric digits. Verify the configured code format before enabling recovery for users.
5. In Apple Developer, choose team `KMY94A6RM7`, verify its legal entity, and enable **Sign in with Apple** for `com.xuanniaozhixu.steadydrop`. Refresh the provisioning profile. The entitlement is already in the project, but a local entitlement does not enable the developer-portal capability.
6. Enable Supabase's Apple provider and include `com.xuanniaozhixu.steadydrop` among accepted Client IDs for native ID tokens. This client uses the native authorization dialog, hashed nonce, and server exchange. Follow the current Supabase native Apple setup guide; web Services ID/OAuth configuration is a separate flow. Do not disable nonce verification.
7. Build with the actual developer signing team and test on a physical iPhone with an Apple account. First sign-in requires authorization. Subsequent launches/foregrounding check credential state and refresh the stored server session.

## Implemented behavior

Email registration/login, confirmation notice, email-code password reset, Apple native token exchange; Keychain-only token storage; session refresh on launch/foreground, Apple credential revocation; local logout with attempted server session revocation; mandatory login with no guest fallback. Passwords are never persisted. Usernames are not collected. Language follows in-app EN/JA/KO selection.

Account level/star saves use separate local namespaces. Old guest saves are inaccessible and are not merged. Lives/points now synchronize via Supabase; level/star progress does not.

## Release gaps / live checks

- The live backend is configured, but actual registration, email delivery, native authorization, reset-code delivery, token rotation and external revocation have not been end-to-end verified.
- In-app account deletion is implemented with a server-only admin endpoint and password/Apple reauthentication. Apple signing secrets are configured; see [account deletion setup](account-deletion-setup.md). Privacy policy links are present on login/settings. Real disposable-account deletion and Apple revocation tests remain release prerequisites; no admin key is in the app.
- Sign in with Apple may need a refreshed provisioning profile for device builds.
- Test refresh/revocation after backgrounding and slow-network logout races using a staging project. Transport fixtures check error handling but do not substitute for these live tests.

## Local checks

`./scripts/test-core.sh`
`./scripts/test-auth.sh` —11 stubbed network scenarios; no external users or messages.

Official references:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-apple
- https://supabase.com/docs/reference/swift/auth-signup
- https://developer.apple.com/documentation/authenticationservices/implementing-user-authentication-with-sign-in-with-apple

## Simulator signing

Authentication builds must use local simulator signing: `CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=-`. Building with signing disabled can cause Keychain access failures. On2026-10-29 the locally signed simulator app successfully loaded the empty session vault without the earlier storage error. Device builds need actual team signing/capabilities.

## Signup verification code (2026-10-30)
- Email/password signup is preserved. The client sends signup, displays the immutable pending email and an OTP field, and verifies using POST /auth/v1/verify with type=email per Supabase's current OTP documentation. No browser/local-host redirect is required for this path.
- Resend uses POST /auth/v1/resend with type=signup; local cooldown is 60 seconds and server limits remain authoritative. Unconfirmed existing accounts reach this form after a password login attempt and can request a new code. Already-confirmed accounts log in normally with their password.
- Failed/expired/malformed codes cannot enter the game. Only a successful server session saved to Keychain opens the account gate. Code/password input is neither logged nor persisted; passwords are cleared when entering confirmation. Returning from the inbox preserves pending state while the app remains running. After full restart, use email/password login to recover an unconfirmed account and resend.
- Code expiry/length remain controlled by the project's Supabase email settings; the client accepts 6–10 ASCII digits, including leading zeroes. Never ask the user to send an OTP or password in chat.
- SMTP may reuse the owner's Mobpet sender (auth@mobpet.com.cn, smtpdm.aliyun.com:465 SSL/TLS), with sender display name Steady Drop. The password must be entered directly in the disclick Supabase dashboard; it is not in this repository. Mobpet users and this project's users remain separate.
- The user configured the signup template manually; this work did not read their mailbox, create a real account or send an email. Reset-password code template remains separately configured as described above. Old confirmation-link emails are unchanged; confirmed accounts do not need re-registration.
