# Joybit MVP Implementation Plan

> 2026-11-03 scope update: the user clarified that account registration currently supports email only. References to Apple login below record the original plan and are superseded by the email-only implementation.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an iOS Joybit app with a two-column game catalog, drawer, favorites, bottom ad slot, one shared account, and in-app Steady Drop gameplay.

**Architecture:** React Native with Expo development builds owns the platform shell and catalog. The iOS native module presents Steady Drop's SwiftUI/SpriteKit game in the same app; the game source is synchronized from the owner-maintained disClick repository snapshot, excluding its standalone `@main` entry. Joybit and disClick use the same Supabase user backend, while each app keeps its own local level progress.

**Tech Stack:** TypeScript, React Native, Expo, Jest/React Native Testing Library, Swift, SpriteKit, Supabase Auth and PostgREST, Xcode 26.

**Spec:** `docs/superpowers/specs/2026-11-02-joybit-design.md`

## Global Constraints

- iOS first; Android structure remains available but Steady Drop requires a later Android port.
- The first card is Hexa Landing / Steady Drop from `chandler0714/disclick` at commit `4bc3680f62380a7eb63b0142461c75403d13298b`.
- The app opens on the catalog without login. Joybit and the game share one user account and session after login.
- The independent disClick app remains maintained. Its local level progress is not migrated to Joybit.
- Game counts are real values from a data source or absent; do not publish invented counts. The home ad remains a labeled slot until a Joybit ad unit is configured.
- Never embed server secrets in the app; only public Supabase client configuration may ship.

## Review Focus

- Counts at 999, 1000, 9999, 10000: exact below 1000 and integer-unit floor above it (Task 1 tests).
- One real game in a two-column list: one card, no fabricated filler card (Task 2 test).
- Open/close drawer: bottom ad slot disappears and returns without overlay or stale space (Task 2 test).
- Guest favorites followed by login: local choices merge once into the signed-in account (Task 3 test).
- Expired/revoked session while opening Steady Drop: ask for login instead of showing a second game login or blank screen (Task 4 test).

---

### Task 1: App foundation and game catalog

**Files:** Create `package.json`, `app.json`, `tsconfig.json`, `App.tsx`, `src/catalog/catalog.ts`, `src/catalog/formatPlayedCount.ts`, `src/catalog/catalog.test.ts`, `assets/steady-drop.png`, `README.md`, `.gitignore`.

**Interfaces:** `Game = { id: string; title: string; image: ImageSourcePropType; kind: 'native' | 'h5'; playedCount: number | null; h5Url?: string }`; `GAMES: readonly Game[]`; `formatPlayedCount(count: number | null): string | null`.

- [ ] Write tests for `formatPlayedCount(null)`, `0`, `999`, `1000`, `9999`, `10000`, invalid negative input, and the one-game catalog ID.
- [ ] Run `npm test -- --runInBand src/catalog/catalog.test.ts`; confirm the missing implementation fails.
- [ ] Scaffold an Expo TypeScript app with only the needed dependencies; implement the one real game record and count formatter. Use the existing game art as the first cover.
- [ ] Run `npm test -- --runInBand src/catalog/catalog.test.ts` and `npx tsc --noEmit`; both pass.
- [ ] Commit the foundation and the approved spec/plan.

### Task 2: Catalog, drawer, favorites, and ad slot

**Files:** Create `src/home/HomeScreen.tsx`, `src/home/GameCard.tsx`, `src/home/Drawer.tsx`, `src/home/AdSlot.tsx`, `src/home/HomeScreen.test.tsx`, `src/favorites/favoritesStore.ts`, `src/favorites/favoritesStore.test.ts`; modify `App.tsx`.

**Interfaces:** `FavoritesStore` exposes `load(): Promise<string[]>`, `toggle(id: string): Promise<string[]>`, and `subscribe(listener: (ids: string[]) => void): () => void`; `HomeScreen` receives `games`, `favoriteIds`, `onToggleFavorite`, `onOpenGame`, `account`.

- [ ] Write UI tests for the two-column layout, one real card, card labels, favorite toggle, drawer sections, and ad slot hidden/restored by drawer state. Write store tests for persistence and duplicate toggles.
- [ ] Run the focused tests; confirm they fail before implementation.
- [ ] Implement the screens with safe-area spacing, touch targets, and a fixed bottom ad placeholder; use local favorites storage for guests.
- [ ] Run focused tests and `npx tsc --noEmit`; both pass.
- [ ] Commit the catalog UI.

### Task 3: One Joybit account and cloud favorites

**Files:** Create `src/auth/AuthProvider.tsx`, `src/auth/AuthScreen.tsx`, `src/auth/authClient.ts`, `src/auth/AuthProvider.test.tsx`, `src/favorites/syncFavorites.ts`, `src/favorites/syncFavorites.test.ts`, `supabase/migrations/20261102_joybit_favorites.sql`; modify `src/home/Drawer.tsx`, `App.tsx`.

**Interfaces:** `AuthContext` exposes `session`, `signIn`, `signUp`, `signInWithApple`, `signOut`, `deleteAccount`; `syncFavorites(localIds, userId, accessToken)` returns merged IDs and persists them under RLS. Native game receives the same authenticated session, not a second credential prompt.

- [ ] Write tests for guest catalog access, login-required game launch, session restore/expiry, sign-out, cloud favorites merge, and RLS isolation using a test client. Include account-deletion path in the design of the provider.
- [ ] Run focused tests and confirm failure.
- [ ] Implement Supabase Auth with secure local session storage, the existing project's public URL/key configuration, email and Apple login, and favorites SQL with user-owned rows. Keep catalog browsing available to guests.
- [ ] Run focused tests and `npx tsc --noEmit`; both pass. Do not deploy the migration or alter production data during this task.
- [ ] Commit account and favorites code.

### Task 4: Native Steady Drop inside Joybit

**Files:** Create `vendor/disclick/` from the source snapshot, `scripts/sync-disclick.mjs`, `modules/steady-drop/ios/SteadyDropModule.swift`, `modules/steady-drop/ios/SteadyDropHostView.swift`, `src/games/SteadyDropScreen.tsx`, `src/games/GameHost.tsx`, `src/games/GameHost.test.tsx`; modify Expo native config and the game-source synchronization map.

**Interfaces:** `SteadyDropHostView` accepts a validated Joybit session and `onExit`; `GameHost` chooses native or H5 by `Game.kind`; `sync-disclick.mjs` copies the pinned Swift sources except `SteadyDropApp.swift`, preserving original source as the update source. The module must not initialize a second `AuthModel` that prompts again.

- [ ] Run the disClick archive's existing core/auth/lives tests as a baseline; record any environment-only failures.
- [ ] Write a `GameHost` test for native/H5 selection, blocked launch on expired session, and return to catalog. Add a native smoke test for presenting and dismissing the SwiftUI scene with a supplied user session.
- [ ] Run focused tests; confirm the new cases fail.
- [ ] Synchronize the native game source and create the Expo iOS module. Adapt its entry and auth boundary so Joybit owns sign-in, while game progress remains in Joybit's local container and lives use the existing Supabase user.
- [ ] Run focused tests, disClick's core/auth/lives tests, and an iOS simulator build. Record any signing or unavailable dependency limit accurately.
- [ ] Commit the integration.

### Task 5: End-to-end verification and handoff

**Files:** Modify `README.md`; create `docs/verification.md` and any focused regression test exposed by QA.

**Interfaces:** Document startup, game source refresh, public config injection, and prerequisites for Apple login, Supabase favorites migration, banner ads, and Android game port.

- [ ] Run all JS tests, typecheck, disClick tests, and the iOS simulator build; inspect the catalog, drawer/ad behavior, login, game launch/exit, and sign-out on an iPhone simulator when available.
- [ ] Fix only failures tied to the spec, then rerun the affected check and full required suite.
- [ ] Record verified behavior and unresolved external configuration in `docs/verification.md` without claiming live backend or ad serving unless observed.
- [ ] Commit documentation and final fixes.
