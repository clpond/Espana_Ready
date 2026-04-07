import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { storeHGetAll, storeHSet } from '../../lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, password, level } = req.body ?? {}
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password required' })
  }

  const username = name.trim().toLowerCase()
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Name must be 2–20 characters' })
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' })
  }

  const existing = await storeHGetAll(`user:${username}`)
  if (existing) {
    return res.status(409).json({ error: 'That name is already taken' })
  }

  const hash = await bcrypt.hash(password, 10)
  await storeHSet(`user:${username}`, {
    username,
    displayName: name.trim(),
    passwordHash: hash,
    level: level === 'some-experience' ? 'some-experience' : 'beginner',
    streak: 0,
    lastQuizDate: '',
    createdAt: new Date().toISOString(),
  })

  const token = jwt.sign({ username }, process.env.JWT_SECRET ?? 'dev-secret', {
    expiresIn: '90d',
  })

  res.status(201).json({
    token,
    user: { username, displayName: name.trim(), level: level === 'some-experience' ? 'some-experience' : 'beginner', streak: 0 },
  })
}
