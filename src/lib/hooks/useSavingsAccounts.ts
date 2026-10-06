"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { savingsAccountsCol, savingsAccountDoc, SavingsAccount } from "@/lib/firebase/firestore";

export function useSavingsAccounts(uid: string | undefined) {
  const [accounts, setAccounts] = useState<(SavingsAccount & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const snap = await getDocs(query(savingsAccountsCol(uid), orderBy("createdAt", "asc")));
    setAccounts(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const addAccount = useCallback(
    async (data: Omit<SavingsAccount, "id" | "createdAt">) => {
      if (!uid) return;
      await addDoc(savingsAccountsCol(uid), { ...data, createdAt: Date.now() });
      fetch();
    },
    [uid, fetch]
  );

  const updateAccount = useCallback(
    async (id: string, data: Partial<SavingsAccount>) => {
      if (!uid) return;
      await updateDoc(savingsAccountDoc(uid, id), data as Record<string, unknown>);
      fetch();
    },
    [uid, fetch]
  );

  const removeAccount = useCallback(
    async (id: string) => {
      if (!uid) return;
      await deleteDoc(savingsAccountDoc(uid, id));
      fetch();
    },
    [uid, fetch]
  );

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return { accounts, loading, addAccount, updateAccount, removeAccount, totalBalance, refetch: fetch };
}
