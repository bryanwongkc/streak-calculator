import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

export const ensureAnonymousUser = () => new Promise((resolve, reject) => {
  if (!auth) {
    resolve(null);
    return;
  }

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    unsubscribe();

    if (user) {
      resolve(user);
      return;
    }

    try {
      const credential = await signInAnonymously(auth);
      resolve(credential.user);
    } catch (error) {
      reject(error);
    }
  });
});
