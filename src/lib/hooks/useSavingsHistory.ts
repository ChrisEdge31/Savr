"use client";

import { useState, useEffect } from "react";
import { getDoc } from "firebase/firestore";
import { budgetDoc, ExpenseItem } from "@/lib/firebase/firestore";
import { previousMonths, monthKeyToLabel } from "@/lib/utils/dates";
import { sumAllocations } from "@/lib/utils/savings";

export type MonthSavingsData = {
  month: string;
  label: string;
  savings: number; // general savings only
  accountContributions: number;
  goalContributions: number;
  income: number;
  total: number;
};

export function useSavingsHistory(uid: string | undefined, count = 6) {
  const [history, setHistory] = useState<MonthSavingsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    async function load() {
      setLoading(true);
      const keys = previousMonths(count);
      const snaps = await Promise.all(keys.map((k) => getDoc(budgetDoc(uid!, k))));

      setHistory(
        snaps.map((snap, i) => {
          const month = keys[i];
          const label = monthKeyToLabel(month);
          if (!snap.exists()) return { month, label, savings: 0, accountContributions: 0, goalContributions: 0, income: 0, total: 0 };

          const d = snap.data();
          const goalContributions = ((d.expenses ?? []) as ExpenseItem[])
            .filter((e) => e.goalId)
            .reduce((s, e) => s + e.amount, 0);
          const accountContributions = sumAllocations(d.savingsAllocations);
          const savings = (d.savings ?? 0) - accountContributions;
          return {
            month,
            label,
            savings,
            accountContributions,
            goalContributions,
            income: d.income ?? 0,
            total: savings + accountContributions + goalContributions,
          };
        })
      );
      setLoading(false);
    }

    load();
  }, [uid, count]);

  return { history, loading };
}
