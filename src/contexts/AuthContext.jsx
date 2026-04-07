import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    apiFetch('/api/user/me', { token })
      .then(data => setUser(data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (name, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { name, password },
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (name, password, level = 'beginner') => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: { name, password, level },
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const updateLevel = useCallback(async (level) => {
    const token = localStorage.getItem('token')
    const data = await apiFetch('/api/user/me', {
      method: 'PATCH',
      body: { level },
      token,
    })
    setUser(prev => ({ ...prev, level: data.level }))
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const data = await apiFetch('/api/user/me', { token })
    setUser(data)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf9f0]">
        <div className="text-4xl animate-bounce">🇪🇸</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateLevel, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
