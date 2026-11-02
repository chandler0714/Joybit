#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
swiftc -parse-as-library -module-cache-path /tmp/steady-drop-module-cache SteadyDrop/Core/AuthTypes.swift SteadyDrop/Auth/AuthService.swift Tests/AuthServiceTests.swift -o /tmp/steady-drop-auth-tests
/tmp/steady-drop-auth-tests
swiftc -parse-as-library -module-cache-path /tmp/steady-drop-module-cache SteadyDrop/Core/AuthTypes.swift SteadyDrop/Auth/AuthService.swift SteadyDrop/Auth/SessionVault.swift SteadyDrop/Auth/AuthModel.swift Tests/AuthModelTests.swift -o /tmp/steady-drop-auth-model-tests
/tmp/steady-drop-auth-model-tests
