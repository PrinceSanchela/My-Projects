import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZmP0AZhev7Z3SNWHe5nz43IGvBiF7SkU",
  authDomain: "fitflow-f4c91.firebaseapp.com",
  projectId: "fitflow-f4c91",
  storageBucket: "fitflow-f4c91.firebasestorage.app",
  messagingSenderId: "1045306829595",
  appId: "1:1045306829595:web:ca4161f6caf1b1ff0d41be",
  measurementId: "G-HLKQNEN6N3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Export helper actions
export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const updateUserProfile = async (name: string) => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
};
