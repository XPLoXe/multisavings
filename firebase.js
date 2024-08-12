// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

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
    const db = getFirestore(app);
    const auth = getAuth(app);  // Initialize Firebase Authentication
    const provider = new GoogleAuthProvider();  // Google Auth Provider

    return { db, auth, provider };
  }
  return null;
}

// Initialize Firebase services
const firebaseServices = initializeFirebase();

// Export individual services for use in other parts of the app
export const db = firebaseServices?.db || null;
export const auth = firebaseServices?.auth || null;
export const provider = firebaseServices?.provider || null;

// Sign in with Google function
export async function signInWithGoogle() {
  try {
    if (!auth || !provider) throw new Error('Firebase is not initialized properly');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign out function
export async function signOutUser() {
  try {
    if (!auth) throw new Error('Firebase is not initialized properly');
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}