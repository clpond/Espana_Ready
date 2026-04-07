import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { storeHGetAll } from '../../lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, password } = req.body ?? {}
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password required' })
  }

  const username = name.trim().toLowerCase()
  const user = await storeHGetAll(`user:${username}`)
  if (!user) {
    return res.status(401).json({ error: 'Invalid name or password' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid name or password' })
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET ?? 'dev-secret', {
    expiresIn: '90d',
  })

  res.status(200).json({
    token,
    user: {
      username: user.username,
      displayName: user.displayName,
      level: user.level ?? 'beginner',
      streak: Number(user.streak ?? 0),
    },
  })
}
