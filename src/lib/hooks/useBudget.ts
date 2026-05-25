"use client";

import { useState, useEffect, useCallback } from "react";
import { getDoc, setDoc } from "firebase/firestore";
import { budgetDoc, BudgetDoc, ExpenseItem } from "@/lib/firebase/firestore";
import { currentMonthKey, previousMonths } from "@/lib/utils/dates";
import { v4 as uuid } from "uuid";

const EMPTY_BUDGET: BudgetDoc = { income: 0, expenses: [], savings: 0, updatedAt: 0 };

export function useBudget(uid: string | undefined, monthKey?: string) {
  const key = monthKey ?? currentMonthKey();
  const [budget, setBudget] = useState<BudgetDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [seededFromPrevious, setSeededFromPrevious] = useState(false);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);

    const snap = await getDoc(budgetDoc(uid, key));

    if (snap.exists()) {
      const data = snap.data();
      // Back-compat: old expenses without `recurring` default to true
      const expenses = (data.expenses ?? []).map((e: ExpenseItem) => ({
        ...e,
        recurring: e.recurring ?? true,
      }));
      setBudget({ ...EMPTY_BUDGET, ...data, expenses });
      setSeededFromPrevious(false);
    } else {
      // New month — seed recurring items from last month
      const lastMonthKey = previousMonths(2)[1];
      const prevSnap = await getDoc(budgetDoc(uid, lastMonthKey));

      if (prevSnap.exists()) {
        const prev = prevSnap.data();
        const recurringExpenses = (prev.expenses ?? [])
          .filter((e: ExpenseItem) => e.recurring)
          .map((e: ExpenseItem) => ({ ...e, id: uuid() })); // fresh IDs
        setBudget({ income: prev.income, expenses: recurringExpenses, savings: prev.savings ?? 0, updatedAt: 0 });
        setSeededFromPrevious(true);
      } else {
        setBudget(EMPTY_BUDGET);
        setSeededFromPrevious(false);
      }
    }

    setLoading(false);
  }, [uid, key]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = useCallback(
    async (data: { income: number; expenses: ExpenseItem[]; savings: number }) => {
      if (!uid) return;
      const doc = { ...data, updatedAt: Date.now() };
      await setDoc(budgetDoc(uid, key), doc);
      setBudget(doc);
      setSeededFromPrevious(false);
    },
    [uid, key]
  );

  return { budget, loading, save, seededFromPrevious, refetch: fetch };
}
