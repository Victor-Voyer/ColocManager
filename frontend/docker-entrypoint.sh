#!/bin/sh
set -e

cd /app

LOCK_HASH_FILE="node_modules/.package-lock.hash"

if [ ! -d node_modules ] || [ ! -f "$LOCK_HASH_FILE" ] || ! cmp -s package-lock.json "$LOCK_HASH_FILE"; then
  echo "Installing frontend dependencies..."
  npm ci
  cp package-lock.json "$LOCK_HASH_FILE"
fi

exec "$@"
