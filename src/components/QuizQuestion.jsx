import { useState, useEffect } from 'react'

const CORRECT_REACTIONS = ['¡Perfecto! 🎉', '¡Guay! 🌟', '¡Exacto! 💪', '¡Genial! 🥳', 'Mola mogollón! ✨']
const WRONG_REACTIONS = ['¡Venga, no pasa nada! 💪', 'Casi casi... 🤏', '¡Inténtalo de nuevo! 💫', '¡Ánimo, tío! 🙌']

function getReaction(correct) {
  const arr = correct ? CORRECT_REACTIONS : WRONG_REACTIONS
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TYPE_BADGE = {
  'multiple-choice': { label: '🅐 Multiple Choice', cls: 'bg-blue-100 text-blue-700' },
  'tap-blank':       { label: '👆 Tap the Word',    cls: 'bg-purple-100 text-purple-700' },
  'reorder':         { label: '🔀 Reorder',          cls: 'bg-amber-100 text-amber-700' },
  'match-pairs':     { label: '🔗 Match Pairs',      cls: 'bg-green-100 text-green-700' },
}

export default function QuizQuestion({ question, number, total, onAnswer }) {
  // multiple-choice
  const [selected, setSelected] = useState(null)
  // tap-blank
  const [tapped, setTapped] = useState(null)
  // reorder
  const [placed, setPlaced] = useState([])
  const [remaining, setRemaining] = useState([])
  // match-pairs
  const [selSpanish, setSelSpanish] = useState(null)
  const [selEnglish, setSelEnglish] = useState(null)
  const [matched, setMatched] = useState([])
  const [shuffledEnglish, setShuffledEnglish] = useState([])
  const [wrongFlash, setWrongFlash] = useState(false)
  // shared
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [reaction, setReaction] = useState('')

  useEffect(() => {
    setSelected(null)
    setTapped(null)
    setPlaced([])
    setRemaining(question.type === 'reorder' ? shuffle(question.words ?? []) : [])
    setSelSpanish(null)
    setSelEnglish(null)
    setMatched([])
    setShuffledEnglish(question.type === 'match-pairs' ? shuffle((question.pairs ?? []).map(p => p.english)) : [])
    setWrongFlash(false)
    setSubmitted(false)
    setIsCorrect(null)
    setReaction('')
  }, [question])

  function resolve(correct) {
    setIsCorrect(correct)
    setReaction(getReaction(correct))
    setSubmitted(true)
  }

  // --- Multiple choice ---
  function handleMultipleChoice(opt) {
    if (submitted) return
    setSelected(opt)
    resolve(opt.trim().toLowerCase() === question.answer.trim().toLowerCase())
  }

  // --- Tap blank ---
  function handleTapBlank(word) {
    if (submitted || tapped) return
    setTapped(word)
    resolve(word.trim().toLowerCase() === question.answer.trim().toLowerCase())
  }

  // --- Reorder ---
  function handlePlaceWord(word, idx) {
    if (submitted) return
    const next = [...remaining]
    next.splice(idx, 1)
    setRemaining(next)
    setPlaced([...placed, word])
  }

  function handleRemoveWord(word, idx) {
    if (submitted) return
    const next = [...placed]
    next.splice(idx, 1)
    setPlaced(next)
    setRemaining([...remaining, word])
  }

  function handleReorderSubmit() {
    if (submitted) return
    resolve(placed.join(' ').trim().toLowerCase() === question.answer.trim().toLowerCase())
  }

  // --- Match pairs ---
  function handleMatchSpanish(spanish) {
    if (submitted || matched.find(m => m.spanish === spanish)) return
    setSelSpanish(spanish)
    tryMatch(spanish, selEnglish)
  }

  function handleMatchEnglish(english) {
    if (submitted || matched.find(m => m.english === english)) return
    setSelEnglish(english)
    tryMatch(selSpanish, english)
  }

  function tryMatch(spanish, english) {
    if (!spanish || !english) return
    const pair = (question.pairs ?? []).find(p => p.spanish === spanish)
    if (pair && pair.english === english) {
      const newMatched = [...matched, { spanish, english }]
      setMatched(newMatched)
      setSelSpanish(null)
      setSelEnglish(null)
      if (newMatched.length === (question.pairs ?? []).length) {
        resolve(true)
      }
    } else {
      setWrongFlash(true)
      setTimeout(() => {
        setWrongFlash(false)
        setSelSpanish(null)
        setSelEnglish(null)
      }, 600)
    }
  }

  const badge = TYPE_BADGE[question.type] ?? { label: question.type, cls: 'bg-gray-100 text-gray-700' }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">Question {number} of {total}</span>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        {question.type === 'tap-blank' ? (
          // Render sentence with inline blank
          <p className="text-lg font-semibold text-gray-800 leading-relaxed">
            {(question.question ?? '').split('___').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className={`inline-block min-w-[80px] border-b-2 text-center px-2 mx-1 transition-colors ${
                    tapped
                      ? isCorrect ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
                      : 'border-spain-red text-spain-red'
                  }`}>
                    {tapped || '\u00A0\u00A0\u00A0\u00A0'}
                  </span>
                )}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-lg font-semibold text-gray-800 leading-relaxed">{question.question}</p>
        )}
      </div>

      {/* Multiple choice options */}
      {question.type === 'multiple-choice' && (
        <div className="grid grid-cols-1 gap-3">
          {(question.options ?? []).map((opt, i) => {
            let style = 'border-2 border-gray-200 bg-white text-gray-700 hover:border-spain-red hover:bg-red-50'
            if (submitted) {
              if (opt === question.answer) style = 'border-2 border-green-500 bg-green-50 text-green-800'
              else if (opt === selected) style = 'border-2 border-red-500 bg-red-50 text-red-800'
              else style = 'border-2 border-gray-100 bg-gray-50 text-gray-400'
            } else if (opt === selected) {
              style = 'border-2 border-spain-red bg-red-50 text-spain-red'
            }
            return (
              <button key={i} onClick={() => handleMultipleChoice(opt)} disabled={submitted}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${style} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                <span className="text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Tap the blank — word options */}
      {question.type === 'tap-blank' && (
        <div className="flex flex-wrap gap-3 justify-center pt-1">
          {(question.options ?? []).map((word, i) => {
            const isTapped = tapped === word
            let style = 'border-2 border-spain-red text-spain-red bg-white hover:bg-red-50'
            if (submitted && isTapped) {
              style = isCorrect
                ? 'border-2 border-green-500 bg-green-50 text-green-800'
                : 'border-2 border-red-500 bg-red-50 text-red-800'
            } else if (submitted && word === question.answer) {
              style = 'border-2 border-green-500 bg-green-50 text-green-800'
            } else if (submitted) {
              style = 'border-2 border-gray-200 bg-gray-50 text-gray-400'
            }
            return (
              <button key={i} onClick={() => handleTapBlank(word)} disabled={submitted || !!tapped}
                className={`px-5 py-2.5 rounded-xl font-semibold text-base transition-all ${style} ${submitted || tapped ? 'cursor-default' : 'cursor-pointer'}`}>
                {word}
              </button>
            )
          })}
        </div>
      )}

      {/* Reorder */}
      {question.type === 'reorder' && (
        <div className="flex flex-col gap-3">
          {/* Answer area */}
          <div className="min-h-[52px] bg-white rounded-xl border-2 border-dashed border-gray-300 p-3 flex flex-wrap gap-2 items-center">
            {placed.length === 0 && (
              <span className="text-gray-400 text-sm">Tap words below to build the sentence...</span>
            )}
            {placed.map((word, i) => (
              <button key={i} onClick={() => handleRemoveWord(word, i)} disabled={submitted}
                className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                  submitted
                    ? isCorrect
                      ? 'bg-green-100 text-green-800 border-2 border-green-400 cursor-default'
                      : 'bg-red-100 text-red-800 border-2 border-red-400 cursor-default'
                    : 'bg-spain-red text-white hover:bg-spain-dark cursor-pointer'
                }`}>
                {word}
              </button>
            ))}
          </div>

          {/* Correct answer shown after wrong submission */}
          {submitted && !isCorrect && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Correct order: </span>
              <span className="text-spain-red font-bold">{question.answer}</span>
            </p>
          )}

          {/* Word bank */}
          {!submitted && (
            <div className="flex flex-wrap gap-2 justify-center">
              {remaining.map((word, i) => (
                <button key={i} onClick={() => handlePlaceWord(word, i)}
                  className="px-4 py-2 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold text-sm hover:border-spain-red hover:text-spain-red transition-all cursor-pointer">
                  {word}
                </button>
              ))}
            </div>
          )}

          {/* Submit reorder */}
          {!submitted && placed.length > 0 && placed.length === (question.words ?? []).length && (
            <button onClick={handleReorderSubmit}
              className="w-full py-3 bg-spain-red text-white font-bold rounded-xl hover:bg-spain-dark transition-colors">
              Check Order ✓
            </button>
          )}
        </div>
      )}

      {/* Match pairs */}
      {question.type === 'match-pairs' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">Spanish</p>
            {(question.pairs ?? []).map((pair, i) => {
              const isMatched = matched.find(m => m.spanish === pair.spanish)
              const isSel = selSpanish === pair.spanish
              const isFlashing = wrongFlash && isSel
              return (
                <button key={i} onClick={() => handleMatchSpanish(pair.spanish)}
                  disabled={!!isMatched || submitted}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-center transition-all border-2 ${
                    isMatched   ? 'border-green-400 bg-green-50 text-green-800 cursor-default' :
                    isFlashing  ? 'border-red-400 bg-red-50 text-red-700' :
                    isSel       ? 'border-spain-red bg-red-50 text-spain-red' :
                    submitted   ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-default' :
                                  'border-gray-200 bg-white text-gray-700 hover:border-spain-red cursor-pointer'
                  }`}>
                  {pair.spanish}
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center">English</p>
            {shuffledEnglish.map((english, i) => {
              const isMatched = matched.find(m => m.english === english)
              const isSel = selEnglish === english
              const isFlashing = wrongFlash && isSel
              return (
                <button key={i} onClick={() => handleMatchEnglish(english)}
                  disabled={!!isMatched || submitted}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-center transition-all border-2 ${
                    isMatched   ? 'border-green-400 bg-green-50 text-green-800 cursor-default' :
                    isFlashing  ? 'border-red-400 bg-red-50 text-red-700' :
                    isSel       ? 'border-spain-red bg-red-50 text-spain-red' :
                    submitted   ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-default' :
                                  'border-gray-200 bg-white text-gray-700 hover:border-spain-red cursor-pointer'
                  }`}>
                  {english}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-300'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="font-bold text-lg mb-1">{reaction}</p>
              {!isCorrect && question.type === 'multiple-choice' && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Correct answer: </span>
                  <span className="text-spain-red font-bold">{question.answer}</span>
                </p>
              )}
              {!isCorrect && question.type === 'tap-blank' && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">The missing word: </span>
                  <span className="text-spain-red font-bold">{question.answer}</span>
                </p>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">💡 {question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {submitted && (
        <button onClick={() => onAnswer(isCorrect)}
          className="w-full py-3.5 bg-spain-red text-white font-bold rounded-xl hover:bg-spain-dark transition-colors text-lg mt-1">
          {number < total ? 'Next Question →' : 'See Results 🎊'}
        </button>
      )}
    </div>
  )
}
