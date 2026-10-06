"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { setDoc, getDoc } from "firebase/firestore";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { userDoc, statsDoc, leaderboardDoc } from "@/lib/firebase/firestore";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /** True for users who signed up but haven't finished (or skipped) onboarding. */
  needsOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  needsOnboarding: false,
  completeOnboarding: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      setNeedsOnboarding(false);
      if (firebaseUser) {
        // Stay in the loading state until we know whether to route to onboarding
        setLoading(true);
        try {
          setNeedsOnboarding(await ensureUserDocs(firebaseUser));
        } catch (err) {
          console.error("ensureUserDocs failed:", err);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    await setDoc(userDoc(user.uid), { onboardingCompleted: true } as Parameters<typeof setDoc>[1], { merge: true });
    setNeedsOnboarding(false);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, needsOnboarding, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Creates the user's docs on first sign-in. Returns whether the user still needs onboarding. */
async function ensureUserDocs(user: User): Promise<boolean> {
  const uRef = userDoc(user.uid);
  const snap = await getDoc(uRef);
  if (snap.exists()) {
    // Accounts created before onboarding existed have no flag — treat them as done
    return snap.data().onboardingCompleted === false;
  }

  const now = Date.now();
  await setDoc(uRef, {
    displayName: user.displayName ?? "Anonymous",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    createdAt: now,
    onboardingCompleted: false,
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
  return true;
}
