import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [level, setLevel] = useState('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(name, password, level)
      } else {
        await login(name, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{
      background: 'linear-gradient(135deg, #c60b1e 0%, #8b0000 50%, #ffc400 100%)'
    }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🇪🇸</div>
        <h1 className="text-4xl font-['Playfair_Display'] text-white font-bold text-shadow">
          España Ready
        </h1>
        <p className="text-white/80 mt-2 text-lg">Learn Spanish before your trip!</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'login' ? 'bg-white shadow text-spain-red' : 'text-gray-500'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'register' ? 'bg-white shadow text-spain-red' : 'text-gray-500'
            }`}
          >
            Join the Group
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={20}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-spain-red focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              minLength={4}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-spain-red focus:outline-none font-medium"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Spanish level
              </label>
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
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-spain-red text-white font-bold rounded-xl hover:bg-spain-dark transition-colors disabled:opacity-60 text-base mt-1"
          >
            {loading ? '⏳ Loading...' : mode === 'login' ? '¡Hola! Sign In' : '¡Venga! Join Up'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          No email needed — just your name and a password
        </p>
      </div>
    </div>
  )
}
