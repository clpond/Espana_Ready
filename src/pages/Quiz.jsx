import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authFetch } from '../lib/api.js'
import QuizQuestion from '../components/QuizQuestion.jsx'

export default function Quiz() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [topic, setTopic] = useState('')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    authFetch(`/api/quiz/today?level=${user?.level ?? 'beginner'}`)
      .then(data => {
        setQuestions(data.questions)
        setTopic(data.topic)
        setState('ready')
      })
      .catch(e => {
        setError(e.message)
        setState('error')
      })
  }, [user?.level])

  function handleAnswer(isCorrect) {
    const next = [...answers, isCorrect]
    setAnswers(next)

    if (current + 1 >= questions.length) {
      const score = next.filter(Boolean).length
      // Submit score then navigate to results
      authFetch('/api/scores/submit', {
        method: 'POST',
        body: { score, total: questions.length },
      }).catch(console.error)

      navigate('/results', { state: { score, total: questions.length, topic, answers: next } })
    } else {
      setCurrent(c => c + 1)
    }
  }

  if (state === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-5xl animate-bounce">🎯</div>
      <p className="text-gray-500 font-medium">Building your quiz with AI...</p>
      <p className="text-sm text-gray-400">(This takes about 10 seconds the first time)</p>
    </div>
  )

  if (state === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-5xl">😕</div>
      <p className="text-gray-700 font-medium text-center">{error}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-spain-red text-white rounded-xl font-semibold">
        Try Again
      </button>
    </div>
  )

  const progress = (current / questions.length) * 100
  const correctSoFar = answers.filter(Boolean).length

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-spain-red text-sm font-medium flex items-center gap-1 mb-3">
          ← Home
        </button>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-['Playfair_Display'] text-gray-800">Daily Quiz</h1>
            <p className="text-sm text-gray-500">{topic}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-spain-red">{correctSoFar}</span>
            <span className="text-gray-400 text-sm">/{answers.length} correct</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-spain-red h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <QuizQuestion
        key={current}
        question={questions[current]}
        number={current + 1}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
