// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2XNaV-FhbVhykg_isq6Z7WwzBHRvVY_E",
  authDomain: "saving-project-cbd1e.firebaseapp.com",
  projectId: "saving-project-cbd1e",
  storageBucket: "saving-project-cbd1e.appspot.com",
  messagingSenderId: "37770475569",
  appId: "1:37770475569:web:d6db68adf772562e63bd10",
  measurementId: "G-ZT1Z2L19WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const db = getFirestore(app);

export { db };