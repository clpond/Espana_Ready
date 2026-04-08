import { storeKeys, storeHGetAll } from '../../lib/store.js'

// Public endpoint — returns all registered users for the login picker
// GET /api/auth/users

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const keys = await storeKeys('user:*')
  if (!keys.length) return res.json({ users: [] })

  const records = await Promise.all(keys.map(key => storeHGetAll(key)))

  const users = records
    .filter(Boolean)
    .map(u => ({
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar ?? '🌍',
      streak: Number(u.streak ?? 0),
      level: u.level ?? 'beginner',
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  res.json({ users })
}
