# Joybit Mini Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three fully playable offline H5 mini games to Joybit's catalog while requiring an existing Joybit login.

**Architecture:** Bundle each game's self-contained HTML/CSS/JavaScript as a TypeScript string and load it through the existing WebView host. Keep WebView content isolated from account tokens. The app routes signed-in users to offline games from its local session, while the existing native game retains online validation.

**Tech Stack:** Expo 58, React Native, react-native-webview 14, TypeScript, Jest, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-03-joybit-mini-games-design.md`

## Global Constraints

- Add exactly three games: reaction challenge, 4×4 memory pairs, and solvable 3×3 number puzzle.
- All games require Joybit login. Previously signed-in users can enter the three bundled games offline; first login needs network.
- No remote assets, scripts, account tokens in WebView, invented played counts, or new backend calls.
- Preserve existing Hexa Landing login and game behavior and unrelated auth-screen edits.

## Review Focus

- A signed-out user taps any new card: the existing sign-in screen appears before game content mounts.
- A cached login opens a bundled game without `getUser()` network validation; native game still validates online.
- An expired token in a cached account does not block the local game; no token is passed to its HTML.
- A puzzle shuffle remains solvable and cannot be immediately marked complete.
- A memory mismatch cannot be clicked a third time while its two cards are visible.

---

### Task 1: Catalog and login-aware game host

**Files:** Modify `src/catalog/catalog.ts`, `src/catalog/catalog.test.ts`, `src/home/GameCard.tsx`, `src/home/HomeScreen.test.tsx`, `src/games/GameHost.tsx`, `src/games/GameHost.test.tsx`, `App.tsx`. Create `src/miniGames/index.ts`.

**Interfaces:** `Game` gains an offline HTML key for the three bundled games; `getMiniGameHtml(id)` returns the corresponding HTML or `null`. `GameHost` receives an already-selected session, checks only its presence for bundled games, and still guards native/remote games. `App.openGame()` routes bundled games based on the local session and other games through `requireValidSession()`.

- [ ] Write failing catalog/home/host tests for four cards, sign-in routing, and inline HTML WebView source without tokens.
- [ ] Run focused tests and confirm failure.
- [ ] Implement the catalog, offline routing, WebView `originWhitelist` and source branch, and distinct cover art.
- [ ] Run focused tests and TypeScript check; confirm pass.

### Task 2: Reaction challenge

**Files:** Create `src/miniGames/reaction.ts`, `src/miniGames/reaction.test.ts`.

**Interfaces:** Export a self-contained HTML string and testable pure reaction scoring/state helpers used by the embedded script. Five valid rounds produce average and best milliseconds; false starts reset the pending round.

- [ ] Write failing tests for false start, five valid results, and restart.
- [ ] Confirm red; implement responsive HTML/CSS/JavaScript and helpers.
- [ ] Confirm green and review touch labels.

### Task 3: Memory pairs

**Files:** Create `src/miniGames/memory.ts`, `src/miniGames/memory.test.ts`.

**Interfaces:** Export self-contained HTML and testable deck/turn helpers. Deck has exactly eight pairs; a mismatch locks input until hidden; completion counts all 8 pairs.

- [ ] Write failing tests for deck distribution, mismatch lock, matches, and restart.
- [ ] Confirm red; implement 4×4 responsive game and timer.
- [ ] Confirm green.

### Task 4: Number puzzle

**Files:** Create `src/miniGames/puzzle.ts`, `src/miniGames/puzzle.test.ts`.

**Interfaces:** Export self-contained HTML and testable shuffle/move helpers. Start from solved state and shuffle via legal adjacent moves; winning state is not shown immediately after shuffle.

- [ ] Write failing tests for legal moves, unsolvable move rejection, shuffled state, and completion.
- [ ] Confirm red; implement responsive 3×3 game and timer.
- [ ] Confirm green.

### Task 5: End-to-end verification and documentation

**Files:** Modify `README.md`, `docs/verification.md`; keep unrelated auth-screen changes outside the games commit.

- [ ] Run `npm test`, `npm run typecheck`, and existing native-boundary checks; inspect results.
- [ ] In iOS simulator, open each game from a cached login, play to completion, replay, return, and check home covers. Record any inability to complete this check honestly.
- [ ] Update usage and verification notes, inspect diff, then commit only mini-games-related files.
