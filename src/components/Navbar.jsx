import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const loc = useLocation()

  const link = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        loc.pathname === to
          ? 'bg-spain-yellow text-spain-dark font-bold'
          : 'text-white/80 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-spain-red shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🇪🇸</span>
          <span className="font-['Playfair_Display'] text-white text-xl font-bold tracking-wide">
            España Ready
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {link('/', 'Home')}
          {link('/study', 'Study')}
          {link('/quiz', 'Quiz')}

          <div className="ml-3 flex items-center gap-2 text-white/90 text-sm border-l border-white/20 pl-3">
            <span className="hidden sm:inline">
              👋 <span className="font-semibold">{user?.displayName}</span>
            </span>
            {user?.streak > 0 && (
              <span className="bg-spain-yellow text-spain-dark text-xs px-2 py-0.5 rounded-full font-bold">
                🔥 {user.streak}
              </span>
            )}
            <button
              onClick={logout}
              className="text-white/60 hover:text-white text-xs ml-1 transition-colors"
            >
              out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
