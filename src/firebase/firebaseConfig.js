import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB1rwKUX26xmyNvoZscYW5eGOrOE6JB5ys",
  authDomain: "expense-tracker-c8331.firebaseapp.com",
  projectId: "expense-tracker-c8331",
  storageBucket: "expense-tracker-c8331.firebasestorage.app",
  messagingSenderId: "889683600097",
  appId: "1:889683600097:web:912ccb8776f278e46c8da0"
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
