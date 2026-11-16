#!/usr/bin/env bash
# Back up the database and the uploaded media together (they reference each other).
# Usage: ./backup.sh [label]     Output: ./backups/<timestamp>[-label]/{db.dump,media.tar.gz,VERSION}
set -euo pipefail
cd "$(dirname "$0")"

stamp="$(date -u +%Y%m%dT%H%M%SZ)${1:+-$1}"
dir="backups/$stamp"
mkdir -p "$dir"

{ grep -E '^APP_VERSION=' .env | tail -1 | cut -d= -f2- || echo unknown; } > "$dir/VERSION"

echo "→ Database"
docker compose exec -T postgres pg_dump -U payload -d bridge2ukraine --format=custom > "$dir/db.dump"

echo "→ Media"
docker run --rm -v bridge2ukraine_media:/media:ro -v "$PWD/$dir":/backup alpine:3 \
  tar czf /backup/media.tar.gz -C /media .

echo "✓ Backup written to $dir ($(du -sh "$dir" | cut -f1))"
