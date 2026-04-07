import jwt from 'jsonwebtoken'
import { storeHGetAll, storeHSet, storeZAdd } from '../../lib/store.js'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(a, b) {
  const da = new Date(a)
  const db = new Date(b)
  return Math.round((db - da) / 86400000)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret')
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { score, total = 10 } = req.body ?? {}
  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'score required' })
  }

  const today = getToday()
  const username = payload.username
  const user = await storeHGetAll(`user:${username}`)
  if (!user) return res.status(404).json({ error: 'User not found' })

  // Don't overwrite a better score for the same day
  const existingScoreKey = `score:${today}:${username}`
  // We'll store per-day score separately and use sorted set for leaderboard

  // Update streak
  let streak = Number(user.streak ?? 0)
  const lastDate = user.lastQuizDate ?? ''

  if (lastDate === today) {
    // Already submitted today — allow re-submit but don't extend streak again
  } else if (lastDate && daysBetween(lastDate, today) === 1) {
    streak += 1
  } else if (lastDate && daysBetween(lastDate, today) > 1) {
    streak = 1
  } else {
    streak = 1
  }

  await storeHSet(`user:${username}`, {
    streak: String(streak),
    lastQuizDate: today,
  })

  // Add to today's leaderboard sorted set (score out of 10, higher = better)
  await storeZAdd(`leaderboard:${today}`, score, username)

  res.json({ success: true, streak, score, total })
}
