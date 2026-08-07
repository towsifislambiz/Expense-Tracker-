import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB1rwKUX26xmyNvoZscYW5eGOrOE6JB5ys",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "expense-tracker-c8331.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "expense-tracker-c8331",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "expense-tracker-c8331.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "889683600097",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:889683600097:web:912ccb8776f278e46c8da0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
