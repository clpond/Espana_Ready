import bcrypt from 'bcryptjs'
import { storeHGetAll, storeHSet } from '../../lib/store.js'

// Resets a single user's password. Protected by ADMIN_SECRET env var.
// POST /api/admin/reset-password  { user: "username", newPassword: "...", secret: "..." }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || req.body?.secret !== adminSecret) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { user, newPassword } = req.body ?? {}
  if (!user || !newPassword) {
    return res.status(400).json({ error: 'user and newPassword required' })
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' })
  }

  const username = user.trim().toLowerCase()
  const existing = await storeHGetAll(`user:${username}`)
  if (!existing) {
    return res.status(404).json({ error: `No account found for "${username}"` })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await storeHSet(`user:${username}`, { passwordHash })

  res.json({ success: true, username })
}
