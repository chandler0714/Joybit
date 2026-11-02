#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
swiftc -parse-as-library -module-cache-path /tmp/joybit-swift-cache \
  modules/steady-drop/ios/Upstream/Core/AuthTypes.swift \
  modules/steady-drop/ios/Upstream/Auth/AuthService.swift \
  modules/steady-drop/ios/Upstream/Auth/SessionVault.swift \
  modules/steady-drop/ios/Upstream/Auth/AuthModel.swift \
  tests/Swift/JoybitAuthBoundaryTests.swift \
  -o /tmp/joybit-auth-boundary-tests
/tmp/joybit-auth-boundary-tests
