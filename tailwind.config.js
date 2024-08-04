/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['pixel-regular', 'ui-sans-serif', 'system-ui'],
        serif: ['pixel-bold', 'ui-serif', 'Georgia'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite', // Define a slower spin animation
        'spin-half': 'spin-half 0.2s linear forwards', // Define a single spin animation
        'spin-once': 'spin-once 0.5s linear forwards', // Define a single spin animation
      },
      keyframes: {
        'spin-half': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
        'spin-once': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

