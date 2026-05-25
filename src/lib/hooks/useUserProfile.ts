"use client";

import { useState, useEffect, useCallback } from "react";
import { getDoc, setDoc } from "firebase/firestore";
import { userDoc, leaderboardDoc } from "@/lib/firebase/firestore";
import { BudgetFrameworkId, DEFAULT_FRAMEWORK } from "@/lib/utils/frameworks";

export function useUserProfile(uid: string | undefined) {
  const [framework, setFramework] = useState<BudgetFrameworkId>(DEFAULT_FRAMEWORK);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const snap = await getDoc(userDoc(uid));
    if (snap.exists()) {
      setFramework((snap.data().budgetFramework as BudgetFrameworkId) ?? DEFAULT_FRAMEWORK);
    }
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const saveFramework = useCallback(
    async (id: BudgetFrameworkId) => {
      if (!uid) return;
      setFramework(id);
      await setDoc(userDoc(uid), { budgetFramework: id } as Parameters<typeof setDoc>[1], { merge: true });
      await setDoc(leaderboardDoc(uid), { budgetFramework: id } as Parameters<typeof setDoc>[1], { merge: true });
    },
    [uid]
  );

  return { framework, loading, saveFramework };
}
