import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [joining, setJoining] = useState(false)
  const [name, setName] = useState('')
  const [level, setLevel] = useState('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/auth/users')
      .then(data => setUsers(data.users ?? []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
  }, [])

  async function handleSelectUser(username) {
    setError('')
    setLoading(true)
    try {
      await login(username)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, level)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12" style={{
      background: 'linear-gradient(135deg, #c60b1e 0%, #8b0000 50%, #ffc400 100%)'
    }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🇪🇸</div>
        <h1 className="text-4xl font-['Playfair_Display'] text-white font-bold text-shadow">
          España Ready
        </h1>
        <p className="text-white/80 mt-2 text-lg">Vamos a España</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        {loadingUsers ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : users.length > 0 && !joining ? (
          <>
            <h2 className="text-center font-bold text-gray-700 mb-5 text-lg">Who's learning today?</h2>

            <div className="flex flex-col gap-3">
              {users.map(u => (
                <button
                  key={u.username}
                  onClick={() => handleSelectUser(u.username)}
                  disabled={loading}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-spain-red hover:bg-red-50 transition-all text-left disabled:opacity-50 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{u.avatar}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{u.displayName}</div>
                    <div className="text-xs text-gray-400">
                      {u.streak > 0 ? `🔥 ${u.streak} day streak` : 'Just getting started'}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-spain-red transition-colors">→</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}
              <button
                onClick={() => { setJoining(true); setError('') }}
                className="w-full text-center text-sm text-spain-red font-semibold hover:underline"
              >
                + I'm not on the list yet
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center font-bold text-gray-700 mb-5 text-lg">
              {users.length === 0 ? '¡Hola! Who are you?' : 'Join the group'}
            </h2>

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  maxLength={20}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-spain-red focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Spanish level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLevel('beginner')}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      level === 'beginner'
                        ? 'border-spain-red bg-red-50 text-spain-red'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌱</div>
                    Beginner
                    <div className="text-xs font-normal text-gray-500 mt-0.5">Just basics</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevel('some-experience')}
                    className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      level === 'some-experience'
                        ? 'border-spain-red bg-red-50 text-spain-red'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">💬</div>
                    Some Experience
                    <div className="text-xs font-normal text-gray-500 mt-0.5">Learned before</div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-spain-red text-white font-bold rounded-xl hover:bg-spain-dark transition-colors disabled:opacity-60 text-base"
              >
                {loading ? '⏳ Loading...' : '¡Venga! Join Up'}
              </button>

              {users.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setJoining(false); setError('') }}
                  className="text-sm text-gray-400 hover:text-gray-600 text-center"
                >
                  ← Back to the list
                </button>
              )}
            </form>
          </>
        )}
      </div>

      <p className="text-white/50 text-xs mt-6">No passwords. No fuss. Just Spanish.</p>
    </div>
  )
}
