import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import Leaderboard from '../components/Leaderboard.jsx'

const SCORE_MESSAGES = [
  { min: 10, emoji: '🏆', title: '¡Perfecto!', msg: 'Full marks! You absolute legend. España is READY for you.' },
  { min: 9,  emoji: '🌟', title: '¡Casi perfecto!', msg: 'One slip. Mola mogollón — you\'re going to nail this trip.' },
  { min: 8,  emoji: '💪', title: '¡Muy bien!', msg: 'Solid score. Locals will actually understand you. ¡Guay!' },
  { min: 7,  emoji: '👏', title: '¡Bastante bien!', msg: 'You\'ll get by. Keep studying, tío — practice makes perfect.' },
  { min: 6,  emoji: '🙌', title: '¡Venga, tú puedes!', msg: 'Halfway there. A few more sessions and you\'ll be set.' },
  { min: 4,  emoji: '💫', title: '¡Ánimo!', msg: 'Room to grow! Hit the flashcards again and try tomorrow.' },
  { min: 0,  emoji: '🥘', title: 'Al menos hay paella...', msg: 'The locals might struggle to understand you, but the food will be amazing regardless.' },
]

function getScoreResult(score) {
  return SCORE_MESSAGES.find(m => score >= m.min) ?? SCORE_MESSAGES.at(-1)
}

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#c60b1e', '#ffc400', '#fff', '#ff6b6b', '#ffd93d'][i % 5],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    size: `${8 + Math.random() * 8}px`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece animate-confetti-fall"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, refreshUser } = useAuth()
  const { score = 0, total = 10, topic = '', answers = [] } = location.state ?? {}
  const result = getScoreResult(score)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [updatedStreak, setUpdatedStreak] = useState(null)

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }
    // Refresh user to get updated streak
    refreshUser().then(() => {
      setUpdatedStreak(user?.streak)
    })
  }, [])

  const pct = Math.round((score / total) * 100)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {score >= 8 && <Confetti />}

      <div className="text-center mb-8">
        <div className="text-7xl mb-3 animate-bounce-in">{result.emoji}</div>
        <h1 className="text-3xl font-['Playfair_Display'] text-spain-red mb-1">{result.title}</h1>
        <p className="text-gray-600">{result.msg}</p>
      </div>

      {/* Score card */}
      <div className="bg-gradient-to-br from-spain-red to-spain-dark rounded-2xl p-6 text-white text-center mb-6 shadow-lg">
        <p className="text-white/70 text-sm uppercase tracking-widest mb-2">Your Score</p>
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-6xl font-bold">{score}</span>
          <span className="text-2xl text-white/60">/ {total}</span>
        </div>
        <div className="bg-white/20 rounded-full h-3 w-48 mx-auto">
          <div
            className="bg-spain-yellow h-3 rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-white/80 text-sm mt-2">{pct}% correct — {topic}</p>
      </div>

      {/* Streak update */}
      {user?.streak > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center mb-6">
          <p className="text-2xl mb-1">🔥</p>
          <p className="font-bold text-orange-700">{user.streak}-day streak!</p>
          {user.streak === 1
            ? <p className="text-orange-500 text-sm">Great start — come back tomorrow!</p>
            : <p className="text-orange-500 text-sm">Don't break it — see you tomorrow!</p>
          }
        </div>
      )}

      {/* Answer breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Answer breakdown</h3>
        <div className="flex gap-1 flex-wrap">
          {answers.map((correct, i) => (
            <div
              key={i}
              title={`Q${i + 1}: ${correct ? 'Correct' : 'Wrong'}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {correct ? '✓' : '✗'}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <button
          onClick={() => setShowLeaderboard(v => !v)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-gray-700">🏆 Today's Leaderboard</h3>
          <span className="text-gray-400">{showLeaderboard ? '▲' : '▼'}</span>
        </button>
        {showLeaderboard && (
          <div className="mt-4">
            <Leaderboard />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/study')}
          className="w-full py-3.5 border-2 border-spain-red text-spain-red font-bold rounded-2xl hover:bg-red-50 transition-colors"
        >
          📚 Review Flashcards Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 bg-spain-red text-white font-bold rounded-2xl hover:bg-spain-dark transition-colors"
        >
          🏠 Back to Home
        </button>
      </div>
    </div>
  )
}
