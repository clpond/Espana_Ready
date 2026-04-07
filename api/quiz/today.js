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

Your audience: a group of 39-year-olds traveling through Sevilla and Madrid — no kids, big on food, wine, late nights, and culture. They need practical Spanish for real situations: ordering rebujito at the Feria de Abril, asking what time the flamenco show starts, splitting the bill after tapas in Triana, getting a taxi to the Alcázar, another round of cañas at a rooftop bar, finding out if a restaurant has a table at 10pm. Keep it fun and slightly cheeky — never textbook.

These flashcards were just studied — base some questions on them:
${flashcardContext}

RULES — CRITICAL:
- Use ONLY Castilian Spanish (Spain), NOT Latin American
- Use vosotros (not ustedes) for "you all"
- Include pronunciation hints using "th" for c/z where relevant: grathias, therveza, barthelona
- Level: ${isAdvanced ? 'Some Experience — full sentences, real dialogue, grammatical nuance, conjugation' : 'Beginner — clear simple vocabulary and short phrases'}
- Question distribution: 3-4 multiple-choice, 3 tap-blank, 2 reorder, 1 match-pairs
- No free-text input questions of any kind

Return ONLY valid JSON — an array of exactly 10 objects. No markdown, no extra text.

For type "multiple-choice":
{
  "type": "multiple-choice",
  "question": "English question or prompt grounded in a real Spain situation",
  "options": ["option A", "option B", "option C", "option D"],
  "answer": "exact text of the correct option",
  "explanation": "why this is correct, with any Spain-specific pronunciation or cultural note"
}

For type "tap-blank":
{
  "type": "tap-blank",
  "question": "Spanish sentence with ___ where one word is missing",
  "options": ["correctWord", "wrongWord1", "wrongWord2", "wrongWord3"],
  "answer": "correctWord",
  "explanation": "what the full sentence means and any useful notes"
}
Note: options must be shuffled — do not put the correct answer first. The blank should be a single word.

For type "reorder":
{
  "type": "reorder",
  "question": "English prompt describing what you want to say",
  "words": ["shuffled", "Spanish", "words", "to", "arrange"],
  "answer": "correct Spanish word1 word2 word3 word4 word5",
  "explanation": "breakdown of the phrase and any pronunciation tips"
}
Note: words must be shuffled — not in correct order. Use 4-6 words. Answer is the correctly ordered words joined by spaces.

For type "match-pairs":
{
  "type": "match-pairs",
  "question": "Match each Spanish phrase to its English meaning",
  "pairs": [
    {"spanish": "Spanish phrase 1", "english": "English meaning 1"},
    {"spanish": "Spanish phrase 2", "english": "English meaning 2"},
    {"spanish": "Spanish phrase 3", "english": "English meaning 3"},
    {"spanish": "Spanish phrase 4", "english": "English meaning 4"}
  ],
  "explanation": "notes on any tricky ones or cultural context"
}
Note: exactly 4 pairs. Choose phrases from a real shared situation (e.g. all from ordering at a bar, or all from asking about times/directions).`
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
  const cacheKey = `quiz:${today}:${level}:v2`

  const cached = await storeGet(cacheKey)
  if (cached) {
    return res.json({ topic, questions: cached, cached: true })
  }

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
