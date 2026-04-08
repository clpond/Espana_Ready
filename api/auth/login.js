import jwt from 'jsonwebtoken'
import { storeHGetAll } from '../../lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name } = req.body ?? {}
  if (!name) return res.status(400).json({ error: 'Name required' })

  const username = name.trim().toLowerCase()
  const user = await storeHGetAll(`user:${username}`)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET ?? 'dev-secret', {
    expiresIn: '90d',
  })

  res.status(200).json({
    token,
    user: {
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar ?? '🌍',
      level: user.level ?? 'beginner',
      streak: Number(user.streak ?? 0),
    },
  })
}
