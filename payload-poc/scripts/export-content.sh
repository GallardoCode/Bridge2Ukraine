#!/usr/bin/env bash
# PROTOTYPE helper: builds a content bundle for production from the seed data.
#
# Production must only ever see a database built by migrations. The local dev
# database is built by `push`, and restoring it would make Payload stop at an
# interactive prompt on start-up. So this script:
#   1. creates a fresh `bridge2ukraine_export` database on the dev Postgres,
#   2. applies the committed migrations,
#   3. runs the seed into it (no dev login is created),
#   4. writes db.dump + media.tar.gz in the same layout as deploy/backup.sh.
# Load it on the server with deploy/restore.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

db=bridge2ukraine_export
out="content-export/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$out"

docker compose -f compose.dev.yml exec -T postgres psql -U payload -d postgres -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS $db WITH (FORCE);" -c "CREATE DATABASE $db OWNER payload;"

export DATABASE_URL="postgresql://payload:payload@localhost:5433/$db"
export MEDIA_DIR="$PWD/$out/media"
export NODE_OPTIONS=--no-deprecation

pnpm exec payload migrate
pnpm exec payload run src/seed/run.ts

docker compose -f compose.dev.yml exec -T postgres pg_dump -U payload -d "$db" --format=custom > "$out/db.dump"
tar czf "$out/media.tar.gz" -C "$out/media" .
rm -rf "${out:?}/media"
echo "unknown (exported from seed)" > "$out/VERSION"

echo "✓ Content bundle: $out"
echo "  Copy it to the server's backups/ directory and run ./restore.sh backups/$(basename "$out")"
