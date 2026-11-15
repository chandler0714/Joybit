# Douyin mini-game research loop

## Current machine

This Apple Silicon Mac has Xcode's iOS Simulator, but no Android SDK, `adb`, or Android Emulator yet. The iOS Simulator runs simulator builds; it is not a route for installing the App Store release of Douyin. Use an ARM64 Android virtual device for the first pilot, then confirm whether the official Douyin Android app and the chosen mini-game actually run there.

## One-time setup

1. Install [Android Studio for Mac with Apple chip](https://developer.android.com/studio) from the official Android Developers site. The owner must accept Google's Android SDK license during setup.
2. In Android Studio's Device Manager, create an ARM64 phone AVD with a supported Android system image. Install Android SDK Platform Tools (`adb`) and the Android Emulator.
3. Install Douyin from its [official Android download page](https://www.douyin.com/downloadpage/app), then let the owner sign in within the emulator. Do not export credentials, cookies, or verification codes.
4. Check `adb devices -l`, launch Douyin, open one publicly accessible mini-game, and verify that touches, graphics, and audio work. Some games may reject emulators or require a real device; use a dedicated Android phone if this pilot fails.

## Repeat for each candidate

1. Find a game through Douyin's own mini-game entry or search. Record its title and share link when available. Avoid blind feed scrolling as a selection method.
2. Start a session: `python3 scripts/game_research.py new "game name"`. The command prints a session directory under ignored `research/captures/`.
3. Pass that path with `--session` to `shot`, `tap`, `swipe`, `record`, and `note`. Each action writes a timestamped JSONL entry; screenshots and short recordings stay in the same folder. Example: `python3 scripts/game_research.py --session research/captures/SESSION shot first-screen`.
4. Play at least three rounds or levels. Record controls, objective, win/loss, restart, scoring, difficulty changes, and anything that was only inferred. Note where a tutorial differs from normal play.
5. Write an original Joybit gameplay brief from those observations. Recreate the mechanic in our own code and art; do not reuse Douyin assets, copy, branding, or game code.
6. Implement one game at a time, verify its first rounds and increasing difficulty in the simulator, then do a real-device acceptance pass before adding another game.

## Boundaries

The capture script only sends explicit ADB actions and records local output. It does not auto-login, bypass app restrictions, or publish content. Store only game observations; omit personal account details. Keep videos and screenshots out of Git unless the owner selects a specific item for review.
