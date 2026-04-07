import jwt from 'jsonwebtoken'
import { storeZRange, storeHGetAll } from '../../lib/store.js'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret')
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const today = getToday()

  // Get today's scores — sorted descending (highest score first)
  const raw = await storeZRange(`leaderboard:${today}`, 0, -1, {
    rev: true,
    withScores: true,
  })

  // raw is [member, score, member, score, ...] when withScores=true
  const entries = []
  for (let i = 0; i < raw.length; i += 2) {
    const username = raw[i]
    const score = Number(raw[i + 1])
    const user = await storeHGetAll(`user:${username}`)
    entries.push({
      username,
      displayName: user?.displayName ?? username,
      score,
      streak: Number(user?.streak ?? 0),
      completedToday: true,
    })
  }

  res.json({ date: today, entries })
}
