import Anthropic from '@anthropic-ai/sdk'
import jwt from 'jsonwebtoken'
import { storeGet, storeSet } from '../../lib/store.js'

const TOPICS = [
  'Food & Tapas Bars',
  'Sightseeing & Museums',
  'Nightlife & Bars',
  'Day Trips & Transport',
]

function getTodayTopic() {
  const start = new Date('2025-01-01')
  const today = new Date()
  const dayIndex = Math.floor((today - start) / 86400000)
  return TOPICS[dayIndex % TOPICS.length]
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function buildPrompt(level, topic) {
  const isAdvanced = level === 'some-experience'
  return `You are a Spain travel Spanish tutor. Generate exactly 10 flashcards for the topic "${topic}".

Rules — CRITICAL:
- Use ONLY Castilian Spanish (Spain), NOT Latin American Spanish
- Use VOSOTROS (not ustedes) for "you all"
- For words with c before e/i or z, include pronunciation hint spelling using "th" sound (e.g. "grathias" for gracias, "barthelona" for barcelona, "thervesa" for cerveza)
- Include Spain slang naturally where relevant: guay (cool), mola (it rocks/is cool), tío/tía (dude/mate), venga (come on/let's go/OK), ¿qué tal? (how's it going?), bocadillo (sandwich), vale (OK)
- Level: ${isAdvanced ? 'Some Experience — full sentences, conjugations, real conversational phrases, include dialogue snippets' : 'Beginner — simple vocabulary and short phrases, clear English hints'}
- Topic: ${topic}

Return ONLY a valid JSON array of exactly 10 objects. No markdown, no explanation, just the JSON array.
Each object must have these fields:
{
  "front": "English word or phrase",
  "back": "Spanish translation",
  "pronunciation": "phonetic reading hint for the Spanish (e.g. 'grathias', 'bar-the-lona')",
  "tip": "brief usage tip or cultural note, 1 sentence, mention if this is Spain-specific vs Latin American"
}

Make the cards feel practical and fun — phrases real travelers actually need. Include ordering food, asking prices, getting around, talking to locals.`
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

  const level = req.query.level === 'some-experience' ? 'some-experience' : 'beginner'
  const today = getToday()
  const topic = getTodayTopic()
  const cacheKey = `flashcards:${today}:${level}`

  const cached = await storeGet(cacheKey)
  if (cached) {
    return res.json({ topic, cards: cached, cached: true })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: buildPrompt(level, topic) }],
  })

  const text = message.content[0].text.trim()
  let cards
  try {
    // Strip any accidental markdown fences
    const json = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    cards = JSON.parse(json)
    if (!Array.isArray(cards)) throw new Error('Not an array')
  } catch (e) {
    console.error('Failed to parse flashcards:', text)
    return res.status(500).json({ error: 'Failed to generate flashcards' })
  }

  // Cache for 23 hours so it refreshes after midnight
  await storeSet(cacheKey, cards, { ex: 82800 })

  res.json({ topic, cards, cached: false })
}
