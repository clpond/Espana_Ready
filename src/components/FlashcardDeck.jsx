import { useState } from 'react'
import Flashcard from './Flashcard.jsx'

export default function FlashcardDeck({ cards, onFinish }) {
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(c => Math.max(0, c - 1))
  const next = () => {
    if (current < cards.length - 1) setCurrent(c => c + 1)
    else onFinish()
  }

  const card = cards[current]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-spain-yellow h-2 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / cards.length) * 100}%` }}
        />
      </div>

      <Flashcard key={current} card={card} index={current} total={cards.length} />

      {/* Navigation */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={prev}
          disabled={current === 0}
          className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-medium disabled:opacity-30 hover:border-spain-red hover:text-spain-red transition-colors"
        >
          ← Previous
        </button>

        {current < cards.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 py-2.5 rounded-xl bg-spain-red text-white font-semibold hover:bg-spain-dark transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onFinish}
            className="flex-1 py-2.5 rounded-xl bg-spain-yellow text-spain-dark font-bold hover:opacity-90 transition-opacity animate-pulse-gold"
          >
            Take the Quiz! 🎯
          </button>
        )}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5 flex-wrap justify-center">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-spain-red scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
