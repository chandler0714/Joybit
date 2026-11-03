# Joybit Seven Languages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Joybit shell and three bundled mini games available in English, Japanese, Korean, French, Spanish, Russian, and German, with device default and a persistent in-app override.

**Architecture:** A typed translation catalog and React language context resolve the selected locale; every shell component receives translated copy through the context. Bundled HTML games embed the selected locale's strings and set `<html lang>` without network access. Expo localization reads the device preference and declares seven supported locales to the operating system.

**Tech Stack:** Expo 58, React Native, expo-localization, AsyncStorage, TypeScript, Jest, Node/JSDOM.

**Spec:** `docs/superpowers/specs/2026-11-03-joybit-seven-languages-design.md`

## Global Constraints

- Supported language codes: `en`, `ja`, `ko`, `fr`, `es`, `ru`, `de`; fallback `en`; no Chinese selector.
- Scope is Joybit UI and the three bundled games. Keep Hexa Landing's own English/Japanese/Korean settings and source intact.
- Do not change game rules, backend, email delivery, real player counts, or session handling.
- Preserve the existing uncommitted AuthScreen copy edits and include their current copy in translations.

## Review Focus

- Device locale such as `zh-CN` must display English, and `fr-CA` must resolve French.
- A saved manual choice must override device changes and survive restart; returning to automatic must reread the device.
- Switching language while the settings screen is open must update its labels immediately.
- Game dynamic results, screen-reader labels, and `<html lang>` must use the selected locale; gameplay tests still pass.
- Long German/Russian text must remain readable in cards, buttons, and dialogs.

---

### Task 1: Language foundation and OS declaration

**Files:** Create `src/i18n/translations.ts`, `src/i18n/LanguageProvider.tsx`, tests; modify `App.tsx`, `app.json`, `package.json`, lockfile.

**Interfaces:** `LanguageCode`, `TranslationKey`, `translate(locale,key,params?)`, `useLanguage()` returning `{locale, preference, setPreference, t}`. `LanguageProvider` reads `getLocales()`, persists `auto` or a supported language in AsyncStorage, and refreshes automatic mode on foreground.

- [x] Write failing tests for locale resolution, key completeness, saved preference, and automatic override.
- [x] Run red tests; implement translation foundation and device locale declaration.
- [x] Run green tests, typecheck, and validate Expo config.

### Task 2: Joybit shell and account copy

**Files:** Modify `src/home/HomeScreen.tsx`, `Drawer.tsx`, `GameCard.tsx`, `AdSlot.tsx`, `src/catalog/catalog.ts`, `formatPlayedCount.ts`, `src/auth/AuthScreen.tsx`, `src/games/GameHost.tsx`, `SteadyDropScreen.tsx`, `App.tsx`, relevant tests.

**Interfaces:** UI calls `useLanguage().t`; `GameCard` uses translated game title and locale-aware played-count label; settings offers auto plus seven languages with autonyms.

- [x] Write failing UI tests for English fallback, Japanese/French switch, settings persistence, account and accessibility copy.
- [x] Run red tests; replace every Joybit-owned hardcoded user-facing string with translation keys.
- [x] Run green tests and typecheck; audit remaining literal strings.

### Task 3: Bundled mini games

**Files:** Modify `src/miniGames/page.ts`, `reaction.ts`, `memory.ts`, `puzzle.ts`, `index.ts`, and JSDOM gameplay tests.

**Interfaces:** `getMiniGameHtml(key,locale)` returns fully local HTML with the selected `<html lang>` and embedded static/dynamic copy; game logic stays the same.

- [x] Write failing tests for all seven languages' initial and dynamic copy, accessibility labels, and unchanged gameplay.
- [x] Run red tests; implement locale-specific embedded strings and HTML language tag.
- [x] Run green tests and check no remote translation resources or token exposure.

### Task 4: Full verification and docs

**Files:** Update `README.md`, `docs/verification.md`, tests as needed.

- [x] Run `npm test`, `npm run typecheck`, `npm run test:disclick`, and iOS JavaScript export.
- [x] Inspect locale catalog completeness and all changed files; record runtime visual-check limits honestly.
- [x] Commit only localization-related changes; keep unrelated pending work intact.
