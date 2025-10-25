// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔹 Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZmP0AZhev7Z3SNWHe5nz43IGvBiF7SkU",
  authDomain: "fitflow-f4c91.firebaseapp.com",
  projectId: "fitflow-f4c91",
  storageBucket: "fitflow-f4c91.firebasestorage.app",
  messagingSenderId: "1045306829595",
  appId: "1:1045306829595:web:ca4161f6caf1b1ff0d41be",
  measurementId: "G-HLKQNEN6N3"
};

// 🔹 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 🔹 Initialize Authentication + Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// (optional) Customize Google Sign-In popup behavior
googleProvider.setCustomParameters({
  prompt: "select_account" // always ask user to choose an account
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
