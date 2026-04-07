import { useState, useEffect } from 'react'

function getTimeLeft(tripDate) {
  const now = new Date()
  const trip = new Date(tripDate + 'T00:00:00')
  const diff = trip - now

  if (diff <= 0) return null

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-spain-red text-white rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-bold font-mono shadow-lg">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function Countdown() {
  const tripDate = import.meta.env.VITE_TRIP_DATE || '2025-07-15'
  const [time, setTime] = useState(() => getTimeLeft(tripDate))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(tripDate)), 1000)
    return () => clearInterval(id)
  }, [tripDate])

  if (!time) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl">🎉 ¡Ya estáis en España!</p>
        <p className="text-gray-600 mt-1">Enjoy the trip, tíos!</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 uppercase tracking-widest mb-3 font-medium">
        ✈️ Time until España
      </p>
      <div className="flex items-center justify-center gap-3">
        <Unit value={time.days} label="days" />
        <span className="text-2xl text-spain-red font-bold mb-4">:</span>
        <Unit value={time.hours} label="hrs" />
        <span className="text-2xl text-spain-red font-bold mb-4">:</span>
        <Unit value={time.minutes} label="min" />
        <span className="text-2xl text-spain-red font-bold mb-4">:</span>
        <Unit value={time.seconds} label="sec" />
      </div>
    </div>
  )
}
