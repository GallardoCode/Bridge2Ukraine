#!/usr/bin/env bash
# Deploy (or roll back to) a released image version.
# Usage: ./deploy.sh 1.4.0
#   1. backs up database + media, labelled with the version being replaced
#   2. pulls the image and switches APP_VERSION in .env
#   3. restarts the app (pending migrations run at start-up) and waits until
#      /healthz reports the requested version
set -euo pipefail
cd "$(dirname "$0")"

version="${1:?Usage: ./deploy.sh <version>  e.g. ./deploy.sh 1.4.0}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Version must look like 1.4.0 (got: $version)"; exit 1
fi
env_value() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- || true; }
current="$(env_value APP_VERSION)"
port="$(env_value APP_PORT)"; port="${port:-3000}"

echo "Deploying $version (currently $current)"

if docker compose ps --status running --services | grep -qx postgres; then
  ./backup.sh "before-$version"
fi

APP_VERSION="$version" docker compose pull app
sed -i "s/^APP_VERSION=.*/APP_VERSION=$version/" .env
docker compose up -d --remove-orphans

echo -n "Waiting for /healthz"
for _ in $(seq 1 60); do
  if body="$(curl -fsS "http://127.0.0.1:$port/healthz" 2>/dev/null)"; then
    echo
    if [[ "$body" == *"\"version\":\"$version\""* ]]; then echo "✓ $body"; exit 0; fi
    echo "✗ Healthy, but the app reports $body instead of version $version."
    exit 1
  fi
  echo -n .; sleep 2
done
echo
echo "✗ $version did not become healthy. Logs: docker compose logs --tail=100 app"
echo "  Roll back with: ./deploy.sh $current"
echo "  If $version ran a migration that $current cannot read, restore the backup taken just now first."
exit 1
