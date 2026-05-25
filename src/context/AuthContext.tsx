"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { setDoc, getDoc } from "firebase/firestore";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { userDoc, statsDoc, leaderboardDoc } from "@/lib/firebase/firestore";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await ensureUserDocs(firebaseUser);
        } catch (err) {
          console.error("ensureUserDocs failed:", err);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

async function ensureUserDocs(user: User) {
  const uRef = userDoc(user.uid);
  const snap = await getDoc(uRef);
  if (!snap.exists()) {
    const now = Date.now();
    await setDoc(uRef, {
      displayName: user.displayName ?? "Anonymous",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      createdAt: now,
    });
    await setDoc(statsDoc(user.uid), {
      points: 0,
      currentBudgetStreak: 0,
      longestBudgetStreak: 0,
      currentGoalStreak: 0,
      badges: [],
      lastUpdated: now,
    });
    await setDoc(leaderboardDoc(user.uid), {
      displayName: user.displayName ?? "Anonymous",
      avatarUrl: user.photoURL ?? "",
      points: 0,
      currentBudgetStreak: 0,
      longestBudgetStreak: 0,
      badges: [],
      updatedAt: now,
    });
  }
}
