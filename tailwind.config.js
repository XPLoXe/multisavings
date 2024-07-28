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
    },
  },
  plugins: [],
}

