'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isMockMode } from '@/lib/firebase';

/** Shape of the auth context */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  getIdToken: () => Promise<string>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Hook to access auth context safely */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Creates the user Firestore profile document on first sign-in */
async function ensureUserProfile(user: User): Promise<void> {
  if (isMockMode) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName ?? 'Eco Warrior',
      email: user.email,
      createdAt: serverTimestamp(),
      totalXp: 0,
      level: 1,
      streakCount: 0,
      lastActive: serverTimestamp(),
      persona: 'eco_conscious',
      preferences: {
        dietPreference: 'average',
        electricitySource: 'standard',
        primaryTransport: 'car',
      },
    });
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem('mock_user');
      if (stored) {
        setUser(JSON.parse(stored) as User);
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await ensureUserProfile(firebaseUser);
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isMockMode) {
      const mockUser = {
        uid: 'mock-user-123',
        email: email,
        displayName: email.split('@')[0],
        getIdToken: async () => 'mock-student-uid',
      } as unknown as User;
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isMockMode) {
      const mockUser = {
        uid: 'mock-user-123',
        email: email,
        displayName: name || email.split('@')[0],
        getIdToken: async () => 'mock-student-uid',
      } as unknown as User;
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await ensureUserProfile(cred.user);
  };

  const signInWithGoogle = async () => {
    if (isMockMode) {
      const mockUser = {
        uid: 'mock-user-123',
        email: 'googlewarrior@ecotrack.ai',
        displayName: 'Google Eco Warrior',
        getIdToken: async () => 'mock-student-uid',
      } as unknown as User;
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    if (isMockMode) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  const getIdToken = async (): Promise<string> => {
    if (isMockMode) return 'mock-student-uid';
    if (!user) return 'mock-anonymous';
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logOut, getIdToken, isMockMode }}>
      {children}
    </AuthContext.Provider>
  );
}
