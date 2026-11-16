#!/usr/bin/env bash
# Restore a backup made by backup.sh. Replaces ALL current content and media.
# Usage: ./restore.sh backups/<timestamp>
set -euo pipefail
cd "$(dirname "$0")"

dir="${1:?Usage: ./restore.sh backups/<timestamp>}"
[[ -f "$dir/db.dump" && -f "$dir/media.tar.gz" ]] || { echo "No backup in $dir"; exit 1; }

read -r -p "Replace the live database and media with $dir? [y/N] " ok
[[ "$ok" == "y" ]] || exit 1

docker compose stop app

echo "→ Database"
docker compose exec -T postgres psql -U payload -d postgres -v ON_ERROR_STOP=1 \
  -c 'DROP DATABASE IF EXISTS bridge2ukraine WITH (FORCE);' -c 'CREATE DATABASE bridge2ukraine OWNER payload;'
docker compose exec -T postgres pg_restore -U payload -d bridge2ukraine --no-owner < "$dir/db.dump"

echo "→ Media"
docker run --rm -v bridge2ukraine_media:/media -v "$PWD/$dir":/backup:ro alpine:3 \
  sh -c 'find /media -mindepth 1 -delete && tar xzf /backup/media.tar.gz -C /media && chown -R 1001:1001 /media'

echo "Backup was taken from version $(cat "$dir/VERSION"). Make sure APP_VERSION in .env matches before starting."
echo "Then run: docker compose up -d app"
