// Fails when the Payload config has schema changes that no migration captures.
// Runs `payload migrate:create --skip-empty`; if it writes a file, a migration is missing.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const dir = new URL('../src/migrations/', import.meta.url)
const before = new Set(fs.readdirSync(dir))
const indexBefore = fs.readFileSync(new URL('index.ts', dir), 'utf8')

execFileSync('pnpm', ['exec', 'payload', 'migrate:create', 'drift_check', '--skip-empty'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
})

const added = fs.readdirSync(dir).filter((f) => !before.has(f))
if (added.length === 0) {
  console.log('✓ Migrations match the Payload config.')
  process.exit(0)
}
for (const f of added) fs.rmSync(new URL(f, dir))
fs.writeFileSync(new URL('index.ts', dir), indexBefore)
console.error(`✗ The Payload config changed the schema without a migration (would create: ${added.join(', ')}).`)
console.error('  Run `pnpm migrate:create <name>`, review the SQL, and commit it.')
process.exit(1)
