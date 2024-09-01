import { createPinia } from 'pinia'
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
   head: {
     title: 'Multisavings',
     link: [
       { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
     ],
   },
 },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  plugins: [
    '@/plugins/fontawesome.js',
    '@/plugins/global-components.js',
  ],

  vite: {
    optimizeDeps: {
      include: [
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
        '@fortawesome/vue-fontawesome',
      ],
    },
  },

  css: [
    '@/assets/css/input.css',
    '@/assets/css/fonts.css',
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },

  modules: ['@pinia/nuxt'],

   pinia: {
    autoImports: ['defineStore', 'storeToRefs'], // automatically import `defineStore`
  },
});