/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spain: {
          red: '#c60b1e',
          yellow: '#ffc400',
          dark: '#8b0000',
        },
      },
      keyframes: {
        'flip-in': {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,196,0,0.7)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,196,0,0)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'flip-in': 'flip-in 0.4s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-gold': 'pulse-gold 1.5s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 1.5s ease-in forwards',
      },
    },
  },
  plugins: [],
}
