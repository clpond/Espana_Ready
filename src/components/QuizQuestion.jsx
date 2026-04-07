import { useState, useEffect } from 'react'

const CORRECT_REACTIONS = ['¡Perfecto! 🎉', '¡Guay! 🌟', '¡Exacto! 💪', '¡Genial! 🥳', 'Mola mogollón! ✨']
const WRONG_REACTIONS = ['¡Venga, no pasa nada! 💪', 'Casi casi... 🤏', '¡Inténtalo de nuevo! 💫', '¡Ánimo, tío! 🙌']

function getReaction(correct) {
  const arr = correct ? CORRECT_REACTIONS : WRONG_REACTIONS
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function QuizQuestion({ question, number, total, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [fillValue, setFillValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [reaction, setReaction] = useState('')

  useEffect(() => {
    setSelected(null)
    setFillValue('')
    setSubmitted(false)
    setIsCorrect(null)
    setReaction('')
  }, [question])

  function checkAnswer(userAnswer) {
    const correct = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
    setIsCorrect(correct)
    setReaction(getReaction(correct))
    setSubmitted(true)
    return correct
  }

  function handleMultipleChoice(opt) {
    if (submitted) return
    setSelected(opt)
    checkAnswer(opt)
  }

  function handleFillSubmit(e) {
    e.preventDefault()
    if (submitted || !fillValue.trim()) return
    checkAnswer(fillValue)
  }

  function handleNext() {
    onAnswer(isCorrect)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">
          Question {number} of {total}
        </span>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          question.type === 'multiple-choice' ? 'bg-blue-100 text-blue-700' :
          question.type === 'fill-blank' ? 'bg-purple-100 text-purple-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {question.type === 'multiple-choice' ? '🅐 Multiple Choice' :
           question.type === 'fill-blank' ? '✏️ Fill the Blank' :
           '🎭 Scenario'}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-lg font-semibold text-gray-800 leading-relaxed">{question.question}</p>
      </div>

      {/* Multiple choice */}
      {question.type === 'multiple-choice' && (
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt, i) => {
            let style = 'border-2 border-gray-200 bg-white text-gray-700 hover:border-spain-red hover:bg-red-50'
            if (submitted) {
              if (opt === question.answer) {
                style = 'border-2 border-green-500 bg-green-50 text-green-800'
              } else if (opt === selected) {
                style = 'border-2 border-red-500 bg-red-50 text-red-800'
              } else {
                style = 'border-2 border-gray-100 bg-gray-50 text-gray-400'
              }
            } else if (opt === selected) {
              style = 'border-2 border-spain-red bg-red-50 text-spain-red'
            }

            return (
              <button
                key={i}
                onClick={() => handleMultipleChoice(opt)}
                disabled={submitted}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${style} ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                } ${opt === selected && !submitted ? 'animate-bounce-in' : ''}`}
              >
                <span className="text-gray-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Fill in the blank */}
      {(question.type === 'fill-blank' || question.type === 'scenario') && (
        <form onSubmit={handleFillSubmit} className="flex gap-3">
          <input
            type="text"
            value={fillValue}
            onChange={e => setFillValue(e.target.value)}
            disabled={submitted}
            placeholder={question.type === 'fill-blank' ? 'Type the missing word(s)...' : 'Write your Spanish phrase...'}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-spain-red focus:outline-none font-medium disabled:bg-gray-50 disabled:text-gray-500"
          />
          {!submitted && (
            <button
              type="submit"
              disabled={!fillValue.trim()}
              className="px-5 py-3 bg-spain-red text-white rounded-xl font-semibold hover:bg-spain-dark transition-colors disabled:opacity-40"
            >
              Check
            </button>
          )}
        </form>
      )}

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-300'} ${isCorrect ? 'animate-bounce-in' : 'animate-shake'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="font-bold text-lg mb-1">{reaction}</p>
              {!isCorrect && (
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Correct answer: </span>
                  <span className="text-spain-red font-bold">{question.answer}</span>
                </p>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">
                💡 {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {submitted && (
        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-spain-red text-white font-bold rounded-xl hover:bg-spain-dark transition-colors text-lg mt-1"
        >
          {number < total ? 'Next Question →' : 'See Results 🎊'}
        </button>
      )}
    </div>
  )
}
