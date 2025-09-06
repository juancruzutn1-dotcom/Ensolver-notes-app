
#!/usr/bin/env bash
set -euo pipefail

# Simple runner to bootstrap and start the app (macOS/Linux)
# Requirements:
# - Node.js v20+ and npm v10+
# - bash, git, sqlite3 (optional: for inspecting the DB file)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT_DIR/backend"
FRONTEND="$ROOT_DIR/frontend"

echo "==> Installing backend deps"
cd "$BACKEND"
npm ci || npm install
echo "==> Generating Prisma client & migrating DB"
npx prisma generate
# Use migrate dev for first-time local setup (creates DB and applies migrations), then seed
npx prisma migrate dev --name init || true
npx ts-node prisma/seed.ts || npx ts-node-dev prisma/seed.ts || npx ts-node prisma/seed.ts

echo "==> Starting backend (port 3000)"
# Start backend in background
( npm run start:dev & )

cd "$FRONTEND"
echo "==> Installing frontend deps"
npm ci || npm install

echo "==> Starting frontend (port 5173)"
npm run dev
