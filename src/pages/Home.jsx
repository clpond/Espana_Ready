import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Countdown from '../components/Countdown.jsx'
import Leaderboard from '../components/Leaderboard.jsx'

const TOPIC_ICONS = {
  'Food & Tapas Bars': '🍷',
  'Sightseeing & Museums': '🏛️',
  'Nightlife & Bars': '🎵',
  'Day Trips & Transport': '🚂',
}

const TOPICS = Object.keys(TOPIC_ICONS)

function getTodayTopic() {
  const start = new Date('2025-01-01')
  const today = new Date()
  const dayIndex = Math.floor((today - start) / 86400000)
  return TOPICS[dayIndex % TOPICS.length]
}

export default function Home() {
  const { user, updateLevel } = useAuth()
  const navigate = useNavigate()
  const topic = getTodayTopic()
  const icon = TOPIC_ICONS[topic]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-3xl font-['Playfair_Display'] text-spain-red mb-1">
          ¡Hola, {user?.displayName}! 👋
        </h1>
        <p className="text-gray-500">Ready to practice your Spanish today?</p>
      </div>

      {/* Countdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Countdown />
      </div>

      {/* Today's topic */}
      <div className="bg-gradient-to-br from-spain-red to-spain-dark rounded-2xl p-6 text-white shadow-lg">
        <p className="text-white/70 text-sm uppercase tracking-widest font-semibold mb-2">
          Today's Topic
        </p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{icon}</span>
          <h2 className="text-2xl font-bold">{topic}</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/study')}
            className="flex-1 bg-white text-spain-red font-bold py-3 rounded-xl hover:bg-spain-yellow hover:text-spain-dark transition-colors"
          >
            📚 Study Flashcards
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="flex-1 bg-spain-yellow text-spain-dark font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            🎯 Take Quiz
          </button>
        </div>
      </div>

      {/* Level selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Your Spanish level</p>
        <div className="flex gap-3">
          {['beginner', 'some-experience'].map(lvl => (
            <button
              key={lvl}
              onClick={() => updateLevel(lvl)}
              className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                user?.level === lvl
                  ? 'border-spain-red bg-red-50 text-spain-red'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {lvl === 'beginner' ? '🌱 Beginner' : '💬 Some Experience'}
            </button>
          ))}
        </div>
      </div>

      {/* Streak */}
      {user?.streak > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center">
          <p className="text-3xl mb-1">🔥</p>
          <p className="font-bold text-orange-700 text-lg">{user.streak}-day streak!</p>
          <p className="text-orange-500 text-sm">Keep it going — don't break the chain!</p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-['Playfair_Display'] text-xl text-gray-800 mb-4 flex items-center gap-2">
          🏆 Today's Leaderboard
        </h2>
        <Leaderboard />
      </div>
    </div>
  )
}
