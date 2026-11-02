#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
swiftc -module-cache-path /tmp/steady-drop-module-cache SteadyDrop/Core/*.swift Tests/main.swift -o /tmp/steady-drop-core-tests
/tmp/steady-drop-core-tests
