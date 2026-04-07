import { useState, useEffect } from 'react'
import { authFetch } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const MEDALS = ['🥇', '🥈', '🥉']
const SPAIN_MESSAGES = {
  10: '¡Eres un crack! Mucho nivel, tío. 🏆',
  9: 'Casi perfecto — ¡qué guay! 🌟',
  8: '¡Muy bien! Vas a sobrevivir en España. 💪',
  7: 'Bastante bien. Sigue practicando, tía. 👏',
  6: 'Passable. ¡Venga, tú puedes! 🙌',
  0: '¡Ánimo! Mañana lo petas. 💫',
}

function getScoreMessage(score) {
  for (const [min, msg] of Object.entries(SPAIN_MESSAGES).sort((a, b) => b[0] - a[0])) {
    if (score >= Number(min)) return msg
  }
  return SPAIN_MESSAGES[0]
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    authFetch('/api/leaderboard')
      .then(data => setEntries(data.entries ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="text-center py-8 text-gray-400 text-sm animate-pulse">
      Loading leaderboard...
    </div>
  )

  if (error) return (
    <div className="text-center py-4 text-red-400 text-sm">{error}</div>
  )

  if (entries.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-4xl mb-3">🏆</p>
      <p className="font-medium">No scores yet today.</p>
      <p className="text-sm mt-1">Be the first to take the quiz!</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => {
        const isMe = entry.username === user?.username
        return (
          <div
            key={entry.username}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              isMe
                ? 'bg-spain-yellow/20 border-2 border-spain-yellow'
                : 'bg-white border border-gray-100'
            }`}
          >
            <span className="text-2xl w-8 text-center">
              {i < 3 ? MEDALS[i] : `${i + 1}.`}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{entry.displayName}</span>
                {isMe && <span className="text-xs text-spain-red font-bold">you</span>}
              </div>
              {entry.streak > 0 && (
                <span className="text-xs text-orange-500">🔥 {entry.streak} day streak</span>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-spain-red">{entry.score}/10</div>
              <div className="text-xs text-gray-400">{getScoreMessage(entry.score).split(' ')[0]}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
