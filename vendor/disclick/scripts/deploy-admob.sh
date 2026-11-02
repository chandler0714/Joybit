#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
# First log in yourself: npx --yes supabase@latest login
# Google's signature authenticates this public callback; app JWTs cannot be required.
npx --yes supabase@latest functions deploy admob-reward \
  --project-ref jrlpghljmqwudywajkpo --use-api --no-verify-jwt
