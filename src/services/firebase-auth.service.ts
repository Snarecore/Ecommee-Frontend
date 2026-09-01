import {
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
  UserCredential
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../config/firebase";
import { User } from "../store/user-store";
import { setCookie } from "../utils/cookie-utils";
import apiConfig from "../config/api.json";

export interface FirebaseAuthResult {
  success: boolean;
  user?: User;
  firebaseUser?: FirebaseUser;
  token?: string;
  error?: string;
  code?: string;
}

/**
 * Enterprise-grade mapping of Firebase Auth error codes to user-friendly messages.
 */
export const mapFirebaseError = (error: any): { message: string; isWarning: boolean } => {
  const code = error?.code || "";

  switch (code) {
    case "auth/popup-closed-by-user":
      return { message: "Sign-in popup was closed before completing.", isWarning: true };
    case "auth/popup-blocked":
      return { message: "Sign-in popup was blocked by your browser. Please allow popups for this site.", isWarning: false };
    case "auth/cancelled-popup-request":
      return { message: "Another sign-in popup is already open. Please complete or close it.", isWarning: true };
    case "auth/unauthorized-domain":
      return { message: "This domain is not authorized for Google Sign-In in your Firebase Console.", isWarning: false };
    case "auth/operation-not-allowed":
      return { message: "Google Sign-In is not enabled in your Firebase Authentication settings.", isWarning: false };
    case "auth/account-exists-with-different-credential":
      return { message: "An account already exists with this email using a different sign-in method.", isWarning: false };
    case "auth/network-request-failed":
      return { message: "Network connection error. Please check your internet connection.", isWarning: false };
    case "auth/too-many-requests":
      return { message: "Too many sign-in attempts. Please wait a moment and try again.", isWarning: false };
    case "auth/user-disabled":
      return { message: "This account has been disabled. Please contact support.", isWarning: false };
    default:
      return { message: error?.message || "An error occurred during Google sign-in. Please try again.", isWarning: false };
  }
};

/**
 * Syncs the Firebase authenticated user with the backend API.
 * If backend has a social-login endpoint, exchanges ID token for authoritative backend session.
 * Otherwise creates a standard customer session.
 */
const syncUserWithBackend = async (firebaseUser: FirebaseUser, idToken: string): Promise<User> => {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || (apiConfig as any)?.baseUrl || "http://localhost:5000/api/v1/").replace(/\/$/, "");

  const payload = {
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
    photoURL: firebaseUser.photoURL || "",
    firebaseUid: firebaseUser.uid,
    idToken: idToken,
    role: "CUSTOMER"
  };

  // Attempt to exchange with backend if endpoint is available
  const potentialEndpoints = [
    `${baseUrl}/auth/google-login`,
    `${baseUrl}/auth/social-login`,
    `${baseUrl}/auth/firebase-login`,
    `${baseUrl}/auth/google`
  ];

  for (const endpoint of potentialEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        const serverUser = data?.data?.user || data?.data || data?.user;
        const serverToken = data?.data?.accessToken || data?.accessToken || data?.data?.token || data?.token;

        if (serverUser && typeof serverUser === "object") {
          return {
            ...serverUser,
            token: serverToken || idToken
          };
        }
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }

  // Graceful fallback to client session model
  return {
    id: firebaseUser.uid,
    _id: firebaseUser.uid,
    name: payload.name,
    fullName: firebaseUser.displayName || payload.name,
    email: payload.email,
    photoURL: payload.photoURL,
    role: "CUSTOMER",
    token: idToken,
    provider: "google"
  };
};

/**
 * Enterprise Google Sign-In handler with persistence, token retrieval, and backend sync.
 */
export const loginWithGoogle = async (): Promise<FirebaseAuthResult> => {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      error: "Firebase is not configured. Please add your NEXT_PUBLIC_FIREBASE_* keys to .env."
    };
  }

  const instance = getFirebaseAuth();
  if (!instance) {
    return {
      success: false,
      error: "Failed to initialize Firebase Auth instance."
    };
  }

  const { auth, googleProvider } = instance;

  try {
    // 1. Ensure local persistence across browser restarts
    await setPersistence(auth, browserLocalPersistence).catch(() => null);

    // 2. Trigger Google OAuth Popup
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      return {
        success: false,
        error: "No user returned from Google Authentication."
      };
    }

    // 3. Obtain fresh Firebase JWT ID token
    const idToken = await firebaseUser.getIdToken(true);

    // 4. Sync with Backend / Construct User Model
    const fullUserData = await syncUserWithBackend(firebaseUser, idToken);

    // 5. Store Cookie Session (7 days expiry)
    setCookie("user", JSON.stringify(fullUserData), 7);

    return {
      success: true,
      user: fullUserData,
      firebaseUser,
      token: idToken
    };
  } catch (error: any) {
    const { message, isWarning } = mapFirebaseError(error);
    return {
      success: false,
      code: error?.code,
      error: isWarning ? undefined : message
    };
  }
};

/**
 * Cleanly signs out the Firebase Auth session.
 */
export const logoutFirebaseUser = async (): Promise<void> => {
  try {
    const instance = getFirebaseAuth();
    if (instance?.auth) {
      await signOut(instance.auth);
    }
  } catch {
    // ignore
  }
};
