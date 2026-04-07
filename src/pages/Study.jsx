import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authFetch } from '../lib/api.js'
import FlashcardDeck from '../components/FlashcardDeck.jsx'

export default function Study() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState('loading') // loading | ready | done | error
  const [cards, setCards] = useState([])
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    authFetch(`/api/flashcards/today?level=${user?.level ?? 'beginner'}`)
      .then(data => {
        setCards(data.cards)
        setTopic(data.topic)
        setState('ready')
      })
      .catch(e => {
        setError(e.message)
        setState('error')
      })
  }, [user?.level])

  if (state === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-bounce">🇪🇸</div>
      <p className="text-gray-500 font-medium">Generating your flashcards with AI...</p>
      <p className="text-sm text-gray-400">(This takes about 5 seconds the first time)</p>
    </div>
  )

  if (state === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-5xl">😕</div>
      <p className="text-gray-700 font-medium text-center">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-spain-red text-white rounded-xl font-semibold">
        Try Again
      </button>
    </div>
  )

  if (state === 'done') return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-['Playfair_Display'] text-spain-red mb-2">¡Buen trabajo!</h2>
      <p className="text-gray-600 mb-8">You've studied all {cards.length} flashcards. Ready to test yourself?</p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/quiz')}
          className="w-full py-4 bg-spain-red text-white font-bold rounded-2xl text-lg hover:bg-spain-dark transition-colors"
        >
          🎯 Take Today's Quiz
        </button>
        <button
          onClick={() => setState('ready')}
          className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:border-spain-red hover:text-spain-red transition-colors"
        >
          Review Cards Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-spain-red text-sm font-medium flex items-center gap-1 mb-4">
          ← Home
        </button>
        <h1 className="text-2xl font-['Playfair_Display'] text-gray-800">Today's Flashcards</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">{topic}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {user?.level === 'some-experience' ? '💬 Some Experience' : '🌱 Beginner'}
          </span>
        </div>
      </div>

      <FlashcardDeck cards={cards} onFinish={() => setState('done')} />
    </div>
  )
}
