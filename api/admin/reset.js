import { storeKeys } from '../../lib/store.js'

// Clears all users and scores. Protected by ADMIN_SECRET env var.
// POST /api/admin/reset  { secret: "your-admin-secret" }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return res.status(403).json({ error: 'ADMIN_SECRET not configured' })
  }

  if (req.body?.secret !== adminSecret) {
    return res.status(403).json({ error: 'Invalid secret' })
  }

  const { createClient } = await import('@vercel/kv')
  const db = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })

  // Find and delete all user keys and leaderboard keys
  const userKeys = await db.keys('user:*')
  const leaderboardKeys = await db.keys('leaderboard:*')
  const allKeys = [...userKeys, ...leaderboardKeys]

  if (allKeys.length > 0) {
    await db.del(...allKeys)
  }

  res.json({ success: true, deleted: allKeys.length, keys: allKeys })
}
