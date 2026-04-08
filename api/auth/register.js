import jwt from 'jsonwebtoken'
import { storeHGetAll, storeHSet } from '../../lib/store.js'

const AVATARS = ['🦅', '🐂', '🌞', '🍷', '💃', '🎸', '⚽', '🌹', '🏰', '🎭', '🌊', '🥘', '🎨', '🎺', '🦁']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, level } = req.body ?? {}
  if (!name) return res.status(400).json({ error: 'Name required' })

  const username = name.trim().toLowerCase()
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Name must be 2–20 characters' })
  }

  const existing = await storeHGetAll(`user:${username}`)
  if (existing) {
    return res.status(409).json({ error: 'That name is already taken' })
  }

  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
  const userLevel = level === 'some-experience' ? 'some-experience' : 'beginner'

  await storeHSet(`user:${username}`, {
    username,
    displayName: name.trim(),
    avatar,
    level: userLevel,
    streak: 0,
    lastQuizDate: '',
    createdAt: new Date().toISOString(),
  })

  const token = jwt.sign({ username }, process.env.JWT_SECRET ?? 'dev-secret', {
    expiresIn: '90d',
  })

  const kvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

  res.status(201).json({
    token,
    user: { username, displayName: name.trim(), avatar, level: userLevel, streak: 0 },
    ...(!kvConfigured && { warning: 'KV store not configured — account will be lost on server restart' }),
  })
}
