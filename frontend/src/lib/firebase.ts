import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/** Firebase client configuration — populated from .env.local */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyFakeKeyForBuildAndLocalTesting123456',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ecotrack-ai-fake.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ecotrack-ai-fake',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ecotrack-ai-fake.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

// Prevent re-initializing on hot-reload in development
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const isMockMode = firebaseConfig.apiKey === 'AIzaSyFakeKeyForBuildAndLocalTesting123456';
export default app;
