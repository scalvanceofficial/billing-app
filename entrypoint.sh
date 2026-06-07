#!/bin/sh
set -e

echo "Running Prisma DB push..."
npx prisma db push --accept-data-loss

echo "Running seed..."
node prisma/seed.js

echo "Starting app...
exec node server.js
