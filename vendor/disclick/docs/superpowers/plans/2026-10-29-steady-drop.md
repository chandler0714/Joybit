# Steady Drop Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
**Goal:** Native iOS first playable.
**Architecture:** Pure level and outcome rules, SpriteKit simulation, SwiftUI shell; no dependencies.
**Tech Stack:** Swift 5, SpriteKit, SwiftUI, iOS 17.
**Spec:** docs/superpowers/specs/2026-10-29-steady-drop-design.md
## Global Constraints
- Original assets, EN/JA/KO, first ten forgiving, later gradual difficulty; no live advertising or publication.
## Review Focus
- Win requires actual pad support and stable motion, not only height.
- Pause/background must not advance settlement timer.
- Restart must remove old simulation and callbacks.
- Long translations and small phones must fit.
- Locked levels cannot be opened, final level has a replay path.
## Tasks
- [x] 1. Core: LevelDefinition.make(number:), LandingJudge.step(supported:speed:dt:) and unavailable AdService; executable rule tests fail before implementation, then pass.
- [x] 2. App: GameScene physics and SwiftUI App/GameModel/localization, generated Xcode project; build for simulator and launch.
- [x] 3. Verify: inspect screenshots, exercise retry/settings/level select, pure rule tests for landing/reset at 30/60/120 FPS, document release gaps. Full physical level solvability and device matrix remain unverified.
