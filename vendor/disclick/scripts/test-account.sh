#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
./scripts/test-auth.sh
node --test Tests/delete-account.test.mjs Tests/apple-revocation.test.mjs
