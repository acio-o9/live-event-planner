#!/bin/sh
set -e

echo "Waiting for database and running migrations..."
for i in $(seq 1 12); do
  if node node_modules/prisma/build/index.js migrate deploy; then
    echo "Migration successful"
    break
  fi
  if [ $i -eq 12 ]; then
    echo "Migration failed after 12 attempts"
    exit 1
  fi
  echo "Attempt $i failed (Aurora may be waking up), retrying in 10s..."
  sleep 10
done

exec node server.js
