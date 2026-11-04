# Five Joybit Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add five original playable offline games with deterministic numbered levels, progress, and Joybit catalog entries.

**Architecture:** Each game exports an HTML generator following the existing WebView mini-game pattern. A shared native progress bridge records the highest completed level per account and passes the selected level into each game. Generation is seeded from game ID and level so replay is stable.

**Tech Stack:** Expo 58, React Native, TypeScript, WebView, AsyncStorage, JSDOM tests.

**Spec:** `docs/superpowers/specs/2026-11-04-video-inspired-five-games-design.md`

## Global Constraints

- Five games: hex placement, gravity star puzzle, three-lane runner, timed cooking, hidden object.
- Offline after login, no remote assets or tokens inside WebView; seven locales.
- Numbered levels 1–100, then 101+, deterministic content and increasing bounded difficulty.
- Replay same level, next level on completion, account-scoped saved progress.
- Original graphics and rules, inspired by the reference video and approved concept images.

## Review Focus

- Generated levels have a path to win, including levels 1, 50, 100, 101, and 500.
- Pausing and leaving a timed game stops timers and input.
- Account changes do not share unlocked levels.
- Games remain touchable on a narrow portrait WebView.
- WebView completion messages cannot award anything besides local unlock state.

---

### Task 1: Shared progression and integration

**Files:** `src/miniGames/levels.ts`, `src/games/GameHost.tsx`, `src/catalog/catalog.ts`, `src/home/GameCard.tsx`, `src/i18n/translations.ts`, related tests.

- [x] Define five new game IDs and HTML keys; keep existing games working.
- [x] Implement deterministic seed, level bounds, local progress per account and WebView completion bridge.
- [x] Add five catalog covers and seven-language game titles.
- [x] Test account isolation, valid completion messages, catalog, and HTML routing.
- [x] Run affected tests and typecheck.

### Task 2: Hex Garden

**Files:** `src/miniGames/hex.ts`, `src/miniGames/hex.test.mjs`.

- [x] Test deterministic board, legal placement and winnability over 1–100 and higher levels.
- [x] Build hex placement, line clearing, level target, replay, pause, completion bridge and responsive UI.
- [x] Run tests for this game.

### Task 3: Star Trail

**Files:** `src/miniGames/star.ts`, `src/miniGames/star.test.mjs`.

- [x] Test deterministic level with reachable stars and exit over 1–100 and higher levels.
- [x] Build gravity-inspired lever puzzle, star collection, restart, pause, completion bridge and responsive UI.
- [x] Run tests for this game.

### Task 4: Lane Glow

**Files:** `src/miniGames/lane.ts`, `src/miniGames/lane.test.mjs`.

- [x] Test deterministic safe route and bounded challenge over 1–100 and higher levels.
- [x] Build touch lane switching, obstacle/collectible loop, pause, retry, completion bridge and responsive UI.
- [x] Run tests for this game.

### Task 5: Little Corner Kitchen

**Files:** `src/miniGames/kitchen.ts`, `src/miniGames/kitchen.test.mjs`.

- [x] Test deterministic feasible orders and bounded timer over 1–100 and higher levels.
- [x] Build recipe assembly, order fulfilment, timer, pause, retry, completion bridge and responsive UI.
- [x] Run tests for this game.

### Task 6: Hidden Nook

**Files:** `src/miniGames/hidden.ts`, `src/miniGames/hidden.test.mjs`.

- [x] Test deterministic object layout with visible, separated targets over 1–100 and higher levels.
- [x] Build tap-to-find scene, target tray, hints, pause, retry, completion bridge and responsive UI.
- [x] Run tests for this game.

### Task 7: Whole app verification

**Files:** README and tests as needed.

- [x] Run `npm test`, `npm run typecheck` and inspect all five screens in web or simulator if available.
- [x] Fix integration and touch issues found by verification.
- [x] Document exact tested scope and remaining device limitations.
