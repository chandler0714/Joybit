#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
swiftc -module-cache-path /tmp/steady-drop-module-cache SteadyDrop/Core/LifeRules.swift Tests/LivesTests.swift -o /tmp/steady-lives-tests
/tmp/steady-lives-tests
swiftc -module-cache-path /tmp/steady-drop-module-cache SteadyDrop/Core/AuthTypes.swift SteadyDrop/Core/LifeRules.swift SteadyDrop/Lives/LivesService.swift Tests/LivesServiceTests.swift -o /tmp/steady-lives-service-tests
/tmp/steady-lives-service-tests
swiftc -module-cache-path /tmp/steady-drop-module-cache SteadyDrop/Core/AuthTypes.swift SteadyDrop/Core/LifeRules.swift SteadyDrop/Lives/LivesService.swift SteadyDrop/Lives/LifeStore.swift Tests/LifeStoreTests.swift -o /tmp/steady-life-store-tests
/tmp/steady-life-store-tests
node --test Tests/admob-ssv.test.mjs Tests/admob-handler.test.mjs
