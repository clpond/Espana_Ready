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

function buildPrompt(level, topic, flashcardContext) {
  const isAdvanced = level === 'some-experience'
  return `You are a Spain travel Spanish tutor. Generate exactly 10 quiz questions about "${topic}".

These flashcards were just studied — base some questions on them:
${flashcardContext}

Rules — CRITICAL:
- Use ONLY Castilian Spanish (Spain), NOT Latin American
- Use vosotros (not ustedes) for "you all"
- Include pronunciation hints using "th" for c/z: grathias, thervesa, barthelona
- Level: ${isAdvanced ? 'Some Experience — full sentences, real dialogue, grammatical nuance, conjugation challenges' : 'Beginner — clear simple vocabulary and phrases'}
- Mix these 3 question types roughly equally (3-4 of each):
  1. "multiple-choice": English prompt → pick the correct Spanish phrase (4 options)
  2. "fill-blank": Spanish sentence with a blank to complete
  3. "scenario": real travel situation described in English, write what you'd say

Return ONLY valid JSON — an array of exactly 10 objects. No markdown, no extra text.

For type "multiple-choice":
{
  "type": "multiple-choice",
  "question": "English question or prompt",
  "options": ["option A", "option B", "option C", "option D"],
  "answer": "exact text of the correct option",
  "explanation": "why this is correct, mention Spain-vs-Latin-America differences if relevant"
}

For type "fill-blank":
{
  "type": "fill-blank",
  "question": "Spanish sentence with ___ for the blank",
  "answer": "the word(s) that fill the blank",
  "explanation": "what it means and any pronunciation/cultural note"
}

For type "scenario":
{
  "type": "scenario",
  "question": "You are in [Spain location]. [Situation]. What do you say?",
  "answer": "the Spanish phrase or sentence to say",
  "explanation": "breakdown of the phrase and any tips"
}

Make questions feel like real Spain travel situations. Fun, practical, memorable.`
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
  const cacheKey = `quiz:${today}:${level}`

  const cached = await storeGet(cacheKey)
  if (cached) {
    return res.json({ topic, questions: cached, cached: true })
  }

  // Try to get flashcard context for better quiz generation
  const flashcardKey = `flashcards:${today}:${level}`
  const flashcards = await storeGet(flashcardKey)
  const flashcardContext = flashcards
    ? flashcards.map(c => `- ${c.front} → ${c.back}`).join('\n')
    : '(no flashcard context available)'

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: buildPrompt(level, topic, flashcardContext) }],
  })

  const text = message.content[0].text.trim()
  let questions
  try {
    const json = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    questions = JSON.parse(json)
    if (!Array.isArray(questions)) throw new Error('Not an array')
  } catch (e) {
    console.error('Failed to parse quiz:', text)
    return res.status(500).json({ error: 'Failed to generate quiz' })
  }

  await storeSet(cacheKey, questions, { ex: 82800 })

  res.json({ topic, questions, cached: false })
}
