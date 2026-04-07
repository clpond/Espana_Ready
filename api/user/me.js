import jwt from 'jsonwebtoken'
import { storeHGetAll, storeHSet } from '../../lib/store.js'

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret')
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method === 'GET') {
    const user = await storeHGetAll(`user:${payload.username}`)
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.json({
      username: user.username,
      displayName: user.displayName,
      level: user.level ?? 'beginner',
      streak: Number(user.streak ?? 0),
      lastQuizDate: user.lastQuizDate ?? '',
    })
  }

  if (req.method === 'PATCH') {
    const { level } = req.body ?? {}
    if (level && (level === 'beginner' || level === 'some-experience')) {
      await storeHSet(`user:${payload.username}`, { level })
    }
    const user = await storeHGetAll(`user:${payload.username}`)
    return res.json({
      username: user.username,
      displayName: user.displayName,
      level: user.level ?? 'beginner',
      streak: Number(user.streak ?? 0),
    })
  }

  res.status(405).end()
}
