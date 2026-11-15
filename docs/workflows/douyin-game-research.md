# Douyin mini-game research loop

## Current machine (2026-11-16)

Android Studio, Android SDK, Platform Tools, and the emulator are installed on this Apple Silicon Mac. The existing `Medium_Phone_API_37.0` ARM64 AVD boots as `emulator-5554` at 1080 × 2400. Its first cold boot was slow and Android briefly showed a System UI not responding dialog; selecting **Wait** allowed it to finish. The official Douyin Android APK version 32.2.6 installed successfully, and Douyin launched and loaded a video. The first-run privacy dialog still needs the owner's choice. Mini-game play has not yet been verified.

The iOS Simulator runs simulator builds; it cannot install the App Store release of Douyin. Use the Android emulator for the first pilot and a dedicated Android phone if a specific game blocks emulators or performs poorly.

## One-time setup

1. Install [Android Studio for Mac with Apple chip](https://developer.android.com/studio) from the official Android Developers site. The owner accepts Google's Android SDK license during setup. This machine has completed this step.
2. In Android Studio's Device Manager, create an ARM64 phone AVD with a supported Android system image and install Android SDK Platform Tools (`adb`) and the Android Emulator. This machine already has `Medium_Phone_API_37.0`; start it with `~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_37.0` and verify with `python3 scripts/game_research.py devices`. The script finds `adb` in the standard macOS SDK location even when Platform Tools is absent from `PATH`.
3. Install Douyin from its [official Android download page](https://www.douyin.com/downloadpage/app), then let the owner handle its first-run privacy choice and sign in within the emulator if needed. Do not export credentials, cookies, or verification codes. Douyin is installed on this AVD as `com.ss.android.ugc.aweme.mobile`.
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
