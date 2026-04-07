import { storeHGetAll } from '../../lib/store.js'

// Temporary debug endpoint — remove after fixing auth
// GET /api/admin/debug?user=yourname&secret=xxx

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || req.query.secret !== adminSecret) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const username = (req.query.user ?? '').trim().toLowerCase()
  if (!username) return res.status(400).json({ error: 'user param required' })

  const user = await storeHGetAll(`user:${username}`)

  if (!user) return res.json({ found: false, username })

  res.json({
    found: true,
    username,
    fields: Object.keys(user),
    hasPasswordHash: !!user.passwordHash,
    passwordHashPrefix: user.passwordHash?.slice(0, 7),
    level: user.level,
    displayName: user.displayName,
    kvEnvSet: !!process.env.KV_REST_API_URL,
  })
}
