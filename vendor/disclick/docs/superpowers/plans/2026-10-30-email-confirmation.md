# Signup Code Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline.
**Goal:** Replace signup browser confirmation with an in-app email code.
**Architecture:** Supabase signup/resend/verify REST, AuthModel owns pending email and cooldown, SwiftUI displays confirmation form, Keychain accepts only validated session.
**Tech Stack:** SwiftUI, AuthenticationServices, Supabase Auth.
**Spec:** docs/superpowers/specs/2026-10-30-email-confirmation-design.md
## Global Constraints
Mandatory login; keep email+password and Apple login; never log codes/passwords/tokens. EN/JA/KO. No live accounts/messages created by automated testing.
## Review Focus
Wrong/expired OTP cannot enter game; resend cannot target a modified email; unconfirmed existing accounts can resend; busy/restore must preserve flow; no signup auto-session from an empty response.
### Task 1: Transport/state
- [x] Add failing signup verify/resend HTTP and model-state/cooldown tests.
- [x] Implement signup verification, resend, pending email, code validation and cooldown.
- [x] Verify auth/core/lives regression suites.
### Task 2: UI and backend
- [x] Add code form, resend/countdown/back actions and localized copy.
- [x] Save and update Supabase confirmation/reset templates through authenticated dashboard; retain email confirmation.
- [x] Build/install simulator, inspect form; document external inbox QA and sync repository.
User already selected the concrete proposed OTP approach; proceed without repeating design approval. Existing checkout is clean at start, use codex/email-confirmation branch in this small single-directory project to preserve current Xcode workflow.

Execution record: Transport tests observed RED before verifySignup/resendSignup existed; state tests observed RED before pending-email methods existed. Auth transport 11 scenarios, OTP state/cooldown/storage and existing core/lives suites pass. Independent reviewer found no important issues. Simulator fixture showed pending email, input, cooldown, back/change email and invalid-input feedback; no real messages/accounts used. Owner manually configured live Confirm signup template; SMTP configuration was supplied for reusing Mobpet Direct Mail. No dashboard mutation was required after owner confirmation. Reset-password template stays separate and was not changed. In-app OTP actual delivery/verification remains for owner testing. Source and template saved to private repository, main target follows the owner's previously authorized sync destination; no new PR/permission round needed for routine fast-forward sync.
