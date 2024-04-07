// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-b0b5e.firebaseapp.com",
  projectId: "mern-estate-b0b5e",
  storageBucket: "mern-estate-b0b5e.appspot.com",
  messagingSenderId: "476944894679",
  appId: "1:476944894679:web:641ba8bfe587cbaa033e92"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);