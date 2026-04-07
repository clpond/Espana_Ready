import { useState } from 'react'

export default function Flashcard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="card-3d w-full h-64 cursor-pointer" onClick={() => setFlipped(f => !f)}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="card-face bg-white border-2 border-spain-yellow shadow-xl">
          <div className="absolute top-3 right-3 text-xs text-gray-400 font-mono">
            {index + 1}/{total}
          </div>
          <p className="text-xs uppercase tracking-widest text-spain-red font-semibold mb-3">
            English
          </p>
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{card.front}</h3>
          <p className="text-sm text-gray-400 mt-4 italic">tap to flip</p>
        </div>

        {/* Back */}
        <div className="card-face card-back bg-spain-red shadow-xl">
          <div className="absolute top-3 right-3 text-xs text-white/50 font-mono">
            {index + 1}/{total}
          </div>
          <p className="text-xs uppercase tracking-widest text-spain-yellow font-semibold mb-3">
            Español 🇪🇸
          </p>
          <h3 className="text-2xl font-bold text-center text-white mb-1">{card.back}</h3>
          {card.pronunciation && (
            <p className="text-spain-yellow text-sm font-mono mt-1">
              "{card.pronunciation}"
            </p>
          )}
          {card.tip && (
            <p className="text-white/80 text-xs text-center mt-3 px-2 leading-relaxed">
              {card.tip}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
