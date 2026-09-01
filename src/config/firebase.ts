import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB_X9YY0EX_3RRKuUEmrHROQwVnqxkCoRM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "e-commerce-product-a9da2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "e-commerce-product-a9da2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "e-commerce-product-a9da2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "81818890386",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:81818890386:web:6d70d0164b38ef0982b64b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-3N1GV3GKSF"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey) &&
    (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain) &&
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId)
  );
};

export const getFirebaseAuth = (): { auth: Auth; googleProvider: GoogleAuthProvider } | null => {
  if (typeof window === "undefined") return null;

  try {
    if (!app) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }
    if (!auth && app) {
      auth = getAuth(app);
    }
    if (!googleProvider) {
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: "select_account"
      });
    }
    return auth && googleProvider ? { auth, googleProvider } : null;
  } catch (error) {
    // console.error("Firebase initialization error:", error);
    return null;
  }
};

export const signInWithGoogle = async () => {
  const firebaseInstance = getFirebaseAuth();
  if (!firebaseInstance) {
    throw new Error(
      "Firebase is not configured. Please check your Firebase credentials."
    );
  }

  const { auth: currentAuth, googleProvider: currentProvider } = firebaseInstance;
  return await signInWithPopup(currentAuth, currentProvider);
};

export { app, auth, googleProvider };
