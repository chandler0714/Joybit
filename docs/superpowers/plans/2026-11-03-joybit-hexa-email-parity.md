# Joybit Hexa Email Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Joybit's email account flow to Hexa Landing parity without changing its seven-language React Native UI or shared Supabase identity.

**Architecture:** A focused input module implements Hexa-compatible normalization and validation. Joybit's AuthProvider retains the main Supabase session and adds unconfirmed-account recovery, cooldown, and an isolated password-reset client; AuthScreen presents the corresponding states with localized copy. Hexa Swift remains untouched.

**Tech Stack:** Expo 58, React Native, Supabase JS 2, TypeScript, Jest, SecureStore.

**Spec:** `docs/superpowers/specs/2026-11-03-joybit-hexa-email-parity-design.md`

## Global Constraints

- One shared Supabase project and user identity; no new account store or project.
- Joybit exposes email flows only and retains en/ja/ko/fr/es/ru/de copy; Hexa Swift and its Apple login stay as they are.
- Email: trim surrounding whitespace, lowercase domain only, validate format and at most 254 characters. Password: at least 8 characters and at most 128 UTF-8 bytes. Code: 6–10 ASCII digits.
- Resend cooldown is 60 seconds after signup/resend, with server rate limits authoritative.
- No passwords/codes in persistent storage, logs, or WebView; recovery must not publish a session until password update succeeds.
- Do not change the shared Supabase SMTP or templates without first inspecting the exact live configuration and impact on Hexa.

## Review Focus

- An email with uppercase local part retains it through all auth calls and an uppercase domain becomes lowercase.
- A signup response without a session, including a duplicate email response, cannot be treated as proof of delivery or as a signed-in state.
- `email_not_confirmed` during sign-in reopens the verification flow and permits resend after restart; a bad code never opens a game.
- A failed password update after a valid recovery code does not mount a Joybit session.
- Rapid resend taps, 429 rate limits, app backgrounding, and leaving verification cannot bypass cooldown or leak codes.

---

### Task 1: Hexa-compatible email input rules

**Files:** Create `src/auth/emailInput.ts`, `src/auth/emailInput.test.ts`; modify `package.json` unit test script.

**Interfaces:** `normalizeEmail(input: string): string`, `isEmail(input: string): boolean`, `isPassword(input: string): boolean`, `isEmailCode(input: string): boolean`.

- [ ] Test uppercase local part/domain normalization, whitespace and malformed email, 254-character limit, UTF-8 password boundary, and ASCII-only 6–10 digit codes.
- [ ] Run `npm run test:unit` and confirm the new test fails.
- [ ] Implement the four functions using Hexa's `AuthInput` rules.
- [ ] Run `npm run test:unit` and `npm run typecheck`; both pass.
- [ ] Commit the focused input module and test.

### Task 2: Account operations and recovery isolation

**Files:** Modify `src/auth/AuthProvider.tsx`, `src/auth/AuthProvider.test.tsx`; optionally add a small `src/auth/passwordRecovery.ts` if isolated client setup warrants it.

**Interfaces:** `signIn` returns a typed `email_not_confirmed` error without opening a session; existing `signUp`, `verifyEmail`, `resendEmail` use `normalizeEmail`. Add `requestPasswordReset(email): Promise<void>` and `resetPasswordWithCode(email, code, password): Promise<void>`. Implement recovery with a temporary Supabase client configured `persistSession:false` and `autoRefreshToken:false`, then call the main client's `setSession` only after `verifyOtp(type:'recovery')` and `updateUser({password})` succeed.

- [ ] Add failing tests for Hexa account sign-in, unconfirmed email, signup no-session, code verification, resend, recovery request, recovery success, and failed update isolation.
- [ ] Run focused provider tests and confirm red.
- [ ] Implement provider operations and session promotion only after completed password update.
- [ ] Run provider tests and typecheck; pass.
- [ ] Commit provider behavior and tests.

### Task 3: Seven-language Joybit email UI

**Files:** Modify `src/auth/AuthScreen.tsx`, `src/i18n/translations.ts`, `src/auth/AuthScreen.test.tsx`, `src/auth/AuthScreen.localization.test.tsx`.

**Interfaces:** Modes `signin`, `signup`, `verify`, `recover`, `reset`, `delete`; a pending email in `verify`; one-second resend countdown; localized labels and error messages. Authentication operations are the Task 2 `useAuth()` interface.

- [ ] Add failing UI tests for password confirmation, unconfirmed-account continuation, immutable pending email, resend cooldown/429, cancel/change-email, recovery code/new password flow, cleared secrets, and seven-language copy.
- [ ] Run focused UI tests and confirm red.
- [ ] Add all needed keys to the seven-language catalog and implement mode transitions and accessible fields/buttons.
- [ ] Run focused UI tests and `npm run typecheck`; pass.
- [ ] Commit UI and translation changes.

### Task 4: Integration and delivery verification

**Files:** Update `README.md`, `docs/verification.md`; add focused integration tests only if a concrete gap is found.

- [ ] Run `npm test`, `npm run test:disclick`, `npm run typecheck`, `git diff --check`, and iOS JavaScript export.
- [ ] Inspect the same-project environment wiring, confirmation/recovery template assumptions, and native game session bridge; record any external email-delivery dependency honestly.
- [ ] Perform an unsigned iOS build if native project is available; otherwise document the precise build limit.
- [ ] Commit documentation and any focused regression fix; request independent read-only code review and address important findings.
