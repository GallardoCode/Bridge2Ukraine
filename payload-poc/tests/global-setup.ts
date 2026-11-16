import { execFileSync } from 'child_process'
import { applyTestEnv } from './env'

/** Drops the test database and applies every committed migration, via the official CLI. */
export default function setup() {
  applyTestEnv()
  execFileSync('pnpm', ['exec', 'payload', 'migrate:fresh', '--force-accept-warning'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
  })
}
