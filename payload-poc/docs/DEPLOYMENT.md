# Deployment: Docker, Plesk and CI/CD

The production setup is two containers on the Plesk server, managed with
Docker Compose:

```text
browser ──HTTPS──▶ Plesk nginx (TLS, Let's Encrypt)
                       │ proxy_pass http://127.0.0.1:3000
                       ▼
                 app  (ghcr.io/…/bridge2ukraine-cms:<version>)
                   │  volume: media  → /app/media
                   ▼
                 postgres:18-alpine
                      volume: pgdata → /var/lib/postgresql
```

Plesk's nginx is the only reverse proxy. The app publishes its port on
`127.0.0.1` only, and Postgres publishes no port.

Everything in this document was rehearsed on a local machine: a local registry
stood in for GHCR and a scratch directory for the server. That covered a first
deploy on an empty database, restoring content, a release with a migration, and
a rollback. **The Plesk-specific steps (nginx directives, Docker extension)
were not tested on a real Plesk server.** Check them against your Plesk
version.

## Images and releases

CI (`.github/workflows/payload-poc.yml`) runs on pull requests and on pushes to
`main` and `prototype/**` that touch `payload-poc/`, `photos/` or the workflow:

1. lint, typecheck, and check that the generated types and import map are
   committed
2. `pnpm migrate:check`: fails if the config changed without a migration
3. integration tests on Postgres 18: build the schema from the committed
   migrations, seed, then check rendering, reordering, drafts and access
4. shellcheck on the deploy scripts
5. build the production image and smoke-test it against an empty database. The
   test checks that the container applies migrations, answers `/healthz`,
   `/admin` and `/`, and runs as a non-root user.

Pushing a tag `cms-vX.Y.Z` does all of that, then:

- tags the image that just passed the smoke test as `X.Y.Z`, `X.Y` and
  `sha-<commit>` and pushes it to `ghcr.io/<owner>/bridge2ukraine-cms`. It
  doesn't rebuild, so the published image is the tested one.
- creates a GitHub release with notes generated from the commits

```bash
git tag cms-v0.1.0
git push origin cms-v0.1.0
```

The tags carry a `cms-` prefix so they can't clash with any future tags for
the static site. There's no `latest` tag on purpose: the server always runs an
exact version, so a deploy is reproducible and a rollback is "run the previous
number".

The image name comes from the repository owner. The upstream repository
belongs to APIvahnenko, so CI there publishes `ghcr.io/apivahnenko/...`. A fork
publishes under the fork's owner; set `IMAGE=` in the server's `.env` to match.

Deployment itself is a manual step: someone runs `./deploy.sh <version>` on the
server, and the server pulls the image. CI holds no server credentials. Adding
an automatic deploy later means giving CI an SSH key to the Plesk host, which
I left out until the release flow has been used for a while.

The workflow has not run on GitHub yet. Running it needs the branch pushed to a
repository where Actions is enabled.

## One-time server setup

Requirements: Docker Engine with the Compose plugin on the Plesk host (the
Plesk Docker extension installs it), and SSH access.

```bash
sudo mkdir -p /opt/bridge2ukraine && cd /opt/bridge2ukraine
# copy these four files from payload-poc/deploy/ in the release you deploy:
#   compose.yml  deploy.sh  backup.sh  restore.sh
cp .env.example .env    # from payload-poc/deploy/.env.example
chmod 600 .env
openssl rand -hex 32    # paste as PAYLOAD_SECRET
openssl rand -hex 32    # paste as POSTGRES_PASSWORD
```

If the GHCR package is private, log the server in once with a GitHub token that
only has `read:packages`:

```bash
echo "$TOKEN" | docker login ghcr.io -u <github-user> --password-stdin
```

### Plesk reverse proxy

Create the domain or subdomain in Plesk and issue a Let's Encrypt certificate.
Then pick one of these:

**A. Additional nginx directives.** Under *Apache & nginx Settings*, turn off
*Proxy mode* so nginx serves the domain itself, and add:

```nginx
client_max_body_size 200m;   # video uploads through the admin

location ~ / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 120s;
}
```

Plesk already defines `location /`. The regex form `location ~ /` avoids the
duplicate-location error.

**B. Docker Proxy Rules.** If the Plesk Docker extension lists the containers,
*Websites & Domains → Docker Proxy Rules* can map `/` to the `app` container's
port 3000. You still need `client_max_body_size` in the nginx directives.

Always redirect HTTP to HTTPS (a Plesk hosting setting). The admin's session
cookie is `Secure` in production, so login fails over plain HTTP. The one
exception is `localhost`, which browsers treat as secure.

## First deploy

```bash
cd /opt/bridge2ukraine
./deploy.sh 0.1.0
```

This pulls the image, starts Postgres and the app, and applies migrations on
start-up. It finishes when `/healthz` returns `{"status":"ok","version":"0.1.0"}`.
The database is empty at this point.

Two ways to add content:

- **Start fresh:** open `https://<domain>/admin`. Payload asks you to create the
  first user.
- **Import the current site:** on your machine run `pnpm content:export` in
  `payload-poc/`. That builds a database from the committed migrations, seeds
  it, and writes `content-export/<timestamp>/` in the same format as a backup.
  Copy that folder to `/opt/bridge2ukraine/backups/` on the server, then:

  ```bash
  ./restore.sh backups/<timestamp>
  docker compose up -d app
  ```

  The export contains no users. Create the first one at `/admin`.

Don't copy your local dev database to production. It was built with schema
push, and Payload will stop at an interactive prompt on start-up. See
ARCHITECTURE.md, "Things the prototype surfaced".

## Configuration and secrets

| Variable | Where it's set | Notes |
| --- | --- | --- |
| `APP_VERSION` | server `.env` | Image tag to run. `deploy.sh` rewrites it. |
| `IMAGE` | server `.env` (optional) | Defaults to `ghcr.io/apivahnenko/bridge2ukraine-cms`. |
| `APP_PORT` | server `.env` | Host port on 127.0.0.1 that nginx proxies to. Default 3000. |
| `PAYLOAD_SECRET` | server `.env` | Signs sessions and tokens. Changing it logs everyone out. |
| `POSTGRES_PASSWORD` | server `.env` | Used by both containers. Set it before the first start; Postgres only reads it when it creates the data directory. |
| `DATABASE_URL` | built in `compose.yml` | Points at the `postgres` service. |
| `MEDIA_DIR` | image (`/app/media`) | Upload directory, backed by the `media` volume. |
| `NODE_ENV=production` | image | Turns off schema push and turns on secure cookies. |

Secrets live only in `/opt/bridge2ukraine/.env` with mode 600. They aren't in
the image, the repository or CI. CI needs no deployment secrets: it publishes
with the built-in `GITHUB_TOKEN`, and the server pulls.

Development uses `payload-poc/.env` (from `.env.example`) with throwaway
values. The dev and production configs share the same code. The differences
are `NODE_ENV`, where Postgres runs, and whether the schema comes from push or
from migrations.

## Database migrations

- **Locally**, `pnpm dev` pushes schema changes straight to the dev database.
  Treat that database as disposable (`pnpm db:reset`).
- When a feature is done, run `pnpm migrate:create <name>`, read the generated
  SQL in `src/migrations/`, and commit it. CI fails the branch if you forget
  (`migrate:check`).
- **In production**, the app applies pending migrations on start-up, before it
  serves requests (`prodMigrations` + `src/instrumentation.ts`). That's
  Payload's recommended option for long-running containers. If a migration
  fails, the container never turns healthy and `deploy.sh` reports it.

Each migration runs in a transaction, and Payload records it in the
`payload_migrations` table.

### Keeping rollback possible

Image rollback is instant. Database rollback is a restore. To keep rollbacks to
image-only, write migrations that the previous release can live with:

- **Safe in one release:** add a table, add a nullable column, add an index.
  The rehearsal rolled 0.2.0 (new nullable column) back to 0.1.0 with no
  database change.
- **Split across two releases:** renaming or removing a field. Release N adds
  the new field and copies the data across. Release N+1 removes the old one.
- **Needs a restore to roll back:** anything destructive in a single release.
  `deploy.sh` takes a backup labelled `before-<version>` before every deploy for
  exactly this case.

Payload migrations also have `down()` functions. They aren't part of the
rollback procedure here, because a restore is easier to reason about.

## Deploy, roll back, restore

```bash
./deploy.sh 1.4.0           # deploy a release
./deploy.sh 1.3.2           # roll back: same command, previous number
```

`deploy.sh` does four things:

1. Backs up the database and media to `backups/<timestamp>-before-<version>/`.
2. Pulls the image.
3. Writes `APP_VERSION` to `.env` and runs `docker compose up -d`.
4. Waits up to two minutes for `/healthz` to report the requested version. On
   failure it prints the rollback command.

If the release you're leaving ran a migration the older one can't handle,
restore the backup taken just before it, then deploy the older version:

```bash
./restore.sh backups/20261116T113624Z-before-1.4.0
./deploy.sh 1.3.2
```

## Backups

`./backup.sh [label]` writes three files to `backups/<timestamp>[-label]/`:

- `db.dump`: `pg_dump` custom format, restored with `pg_restore`
- `media.tar.gz`: everything in the `media` volume
- `VERSION`: the `APP_VERSION` at the time of the backup

The database and media go together because each refers to the other. Restore
them as a pair (`restore.sh` does).

Suggested schedule:

```cron
# /etc/cron.d/bridge2ukraine: nightly at 03:15, keep 14 days
15 3 * * * root cd /opt/bridge2ukraine && ./backup.sh nightly >/dev/null && find backups -maxdepth 1 -name '*-nightly' -mtime +14 -exec rm -rf {} +
```

These backups sit on the same disk as the data. Copy `backups/` off the server
too, for example with the Plesk Backup Manager's remote storage or `rclone`.
Test a restore occasionally on a scratch machine with `restore.sh`.

## Operations

```bash
docker compose ps                         # status and health
docker compose logs -f --tail=100 app     # app logs (rotated at 5 × 10 MB)
curl -s 127.0.0.1:3000/healthz            # {"status":"ok","version":"…"}
docker compose exec postgres psql -U payload bridge2ukraine
```

To upgrade Postgres to a new major version, use `pg_dump`/`pg_restore`. A
data directory can't be reused across major versions. Take a backup, change
the image tag, remove the `pgdata` volume, start the stack, and restore.
