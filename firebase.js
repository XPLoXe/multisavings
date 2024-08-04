// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Function to initialize Firebase
export function initializeFirebase() {
  if (typeof window !== 'undefined') {  // Ensure this runs only in the browser
    // eslint-disable-next-line no-undef
    const config = useRuntimeConfig();

    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
      measurementId: config.public.firebaseMeasurementId,
    };

    const app = initializeApp(firebaseConfig);
    return getFirestore(app);
  }
  return null;
}

export const db = initializeFirebase();
