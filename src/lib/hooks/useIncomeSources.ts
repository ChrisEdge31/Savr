"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { incomeSourcesCol, incomeSourceDoc, IncomeSource } from "@/lib/firebase/firestore";

export function useIncomeSources(uid: string | undefined) {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const snap = await getDocs(query(incomeSourcesCol(uid), orderBy("createdAt", "asc")));
    setSources(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const addSource = useCallback(
    async (data: Omit<IncomeSource, "id" | "createdAt">) => {
      if (!uid) return;
      await addDoc(incomeSourcesCol(uid), { ...data, createdAt: Date.now() });
      fetch();
    },
    [uid, fetch]
  );

  const updateSource = useCallback(
    async (id: string, data: Partial<IncomeSource>) => {
      if (!uid) return;
      await updateDoc(incomeSourceDoc(uid, id), data as Record<string, unknown>);
      fetch();
    },
    [uid, fetch]
  );

  const removeSource = useCallback(
    async (id: string) => {
      if (!uid) return;
      await deleteDoc(incomeSourceDoc(uid, id));
      fetch();
    },
    [uid, fetch]
  );

  const totalExpected = sources
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.expectedAmount, 0);

  return { sources, loading, addSource, updateSource, removeSource, totalExpected, refetch: fetch };
}
