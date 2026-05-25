"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { goalsCol, goalDoc, GoalDoc } from "@/lib/firebase/firestore";

export function useGoals(uid: string | undefined) {
  const [goals, setGoals] = useState<GoalDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const snap = await getDocs(query(goalsCol(uid), orderBy("createdAt", "desc")));
    setGoals(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const addGoal = useCallback(
    async (data: Omit<GoalDoc, "id" | "createdAt" | "status">) => {
      if (!uid) return;
      await addDoc(goalsCol(uid), { ...data, status: "active", createdAt: Date.now() });
      fetch();
    },
    [uid, fetch]
  );

  const updateGoal = useCallback(
    async (id: string, data: Partial<GoalDoc>) => {
      if (!uid) return;
      await updateDoc(goalDoc(uid, id), data as Record<string, unknown>);
      fetch();
    },
    [uid, fetch]
  );

  const removeGoal = useCallback(
    async (id: string) => {
      if (!uid) return;
      await deleteDoc(goalDoc(uid, id));
      fetch();
    },
    [uid, fetch]
  );

  return { goals, loading, addGoal, updateGoal, removeGoal, refetch: fetch };
}
