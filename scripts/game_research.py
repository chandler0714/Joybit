#!/usr/bin/env python3
"""Capture a bounded, reviewable Android game-play research session via ADB."""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess
import sys


DEFAULT_ROOT = Path(__file__).resolve().parents[1] / "research" / "captures"


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def find_adb() -> str:
    if adb := shutil.which("adb"):
        return adb
    for sdk_root in (os.environ.get("ANDROID_HOME"), os.environ.get("ANDROID_SDK_ROOT"), str(Path.home() / "Library/Android/sdk")):
        if sdk_root:
            candidate = Path(sdk_root) / "platform-tools" / "adb"
            if candidate.is_file() and os.access(candidate, os.X_OK):
                return str(candidate)
    raise RuntimeError("adb is missing. Install Android SDK Platform Tools first.")


def adb_command(serial: str | None, *args: str, capture: bool = False) -> bytes:
    adb = find_adb()
    command = [adb, *(["-s", serial] if serial else []), *args]
    return subprocess.run(command, check=True, stdout=subprocess.PIPE if capture else None).stdout or b""


def log_action(session: Path, action: str, **details: object) -> None:
    with (session / "actions.jsonl").open("a", encoding="utf-8") as out:
        out.write(json.dumps({"at": now(), "action": action, **details}, ensure_ascii=False) + "\n")


def require_session(path: Path) -> Path:
    if not (path / "session.md").is_file():
        raise RuntimeError(f"Not a research session: {path}")
    return path


def screenshot(session: Path, serial: str | None, label: str) -> Path:
    safe_label = "".join(char if char.isalnum() or char in "-_" else "-" for char in label)[:48]
    destination = session / f"{datetime.now().strftime('%H%M%S')}-{safe_label or 'screen'}.png"
    destination.write_bytes(adb_command(serial, "exec-out", "screencap", "-p", capture=True))
    log_action(session, "screenshot", file=destination.name)
    return destination


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--serial", default=os.environ.get("ANDROID_SERIAL"), help="ADB device serial")
    parser.add_argument("--session", type=Path, help="Existing capture session path")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("devices")
    new = commands.add_parser("new")
    new.add_argument("name", help="Short game or exploration label")
    new.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    shot = commands.add_parser("shot")
    shot.add_argument("label", nargs="?", default="screen")
    tap = commands.add_parser("tap")
    tap.add_argument("x", type=int)
    tap.add_argument("y", type=int)
    swipe = commands.add_parser("swipe")
    for coordinate in ("x1", "y1", "x2", "y2"):
        swipe.add_argument(coordinate, type=int)
    swipe.add_argument("--ms", type=int, default=350)
    note = commands.add_parser("note")
    note.add_argument("text")
    record = commands.add_parser("record")
    record.add_argument("--seconds", type=int, default=30)
    args = parser.parse_args()

    try:
        if args.command == "devices":
            print(adb_command(args.serial, "devices", "-l", capture=True).decode().strip())
            return
        if args.command == "new":
            slug = "".join(char if char.isalnum() or char in "-_" else "-" for char in args.name)[:48].strip("-") or "game"
            session = args.root / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{slug}"
            session.mkdir(parents=True, exist_ok=False)
            (session / "session.md").write_text(
                f"# {args.name}\n\nStarted: {now()}\n\n## Source\n\nGame title / share link:\n\n"
                "## Controls and objective\n\n## Win, loss and restart\n\n## Difficulty changes\n\n"
                "## Three observed rounds\n\n## Open questions\n\n## Original Joybit adaptation\n\n",
                encoding="utf-8",
            )
            log_action(session, "new", name=args.name, serial=args.serial)
            print(session)
            return
        session = require_session(args.session) if args.session else None
        if session is None:
            raise RuntimeError("Pass --session with an existing session path")
        if args.command == "shot":
            print(screenshot(session, args.serial, args.label))
        elif args.command == "tap":
            adb_command(args.serial, "shell", "input", "tap", str(args.x), str(args.y))
            log_action(session, "tap", x=args.x, y=args.y)
        elif args.command == "swipe":
            if not 50 <= args.ms <= 3000:
                raise RuntimeError("Swipe duration must be 50–3000 ms")
            adb_command(args.serial, "shell", "input", "swipe", *(str(getattr(args, key)) for key in ("x1", "y1", "x2", "y2")), str(args.ms))
            log_action(session, "swipe", x1=args.x1, y1=args.y1, x2=args.x2, y2=args.y2, ms=args.ms)
        elif args.command == "note":
            log_action(session, "note", text=args.text)
        elif args.command == "record":
            if not 1 <= args.seconds <= 180:
                raise RuntimeError("Recording duration must be 1–180 seconds")
            remote = "/sdcard/joybit-research.mp4"
            adb_command(args.serial, "shell", "screenrecord", "--time-limit", str(args.seconds), remote)
            destination = session / f"{datetime.now().strftime('%H%M%S')}-play.mp4"
            adb_command(args.serial, "pull", remote, str(destination))
            adb_command(args.serial, "shell", "rm", remote)
            log_action(session, "record", seconds=args.seconds, file=destination.name)
            print(destination)
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
