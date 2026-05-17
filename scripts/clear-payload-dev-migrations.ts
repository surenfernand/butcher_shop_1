/**
 * Removes Payload dev-mode schema push markers (batch = -1) so `payload migrate`
 * does not block CI with an interactive prompt.
 *
 * Run before migrate on Render/Vercel when local `npm run dev` used the same DATABASE_URL.
 */
import 'dotenv/config'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL?.trim()

if (!connectionString) {
  console.log('[clear-payload-dev-migrations] DATABASE_URL not set — skipping')
  process.exit(0)
}

const client = new pg.Client({ connectionString })

try {
  await client.connect()
  const result = await client.query('DELETE FROM payload_migrations WHERE batch = -1')
  const count = result.rowCount ?? 0
  if (count > 0) {
    console.log(`[clear-payload-dev-migrations] Removed ${count} dev-mode row(s) (batch = -1)`)
  } else {
    console.log('[clear-payload-dev-migrations] No dev-mode rows to remove')
  }
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null
  if (code === '42P01') {
    console.log('[clear-payload-dev-migrations] payload_migrations table not found — skipping')
    process.exit(0)
  }
  throw error
} finally {
  await client.end()
}
