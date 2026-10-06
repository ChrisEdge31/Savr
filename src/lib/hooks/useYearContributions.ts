"use client";

import { useState, useEffect } from "react";
import { getDoc } from "firebase/firestore";
import { budgetDoc } from "@/lib/firebase/firestore";
import { currentMonthKey } from "@/lib/utils/dates";

/**
 * Sums each savings account's allocations across the current calendar year's budgets (Jan → this month).
 * Pass `excludeMonth` to leave out a month whose allocations are still being edited.
 */
export function useYearContributions(uid: string | undefined, excludeMonth?: string) {
  const [byAccount, setByAccount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!uid) return;
    const [year, month] = currentMonthKey().split("-").map(Number);
    const keys = Array.from({ length: month }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
      .filter((k) => k !== excludeMonth);

    Promise.all(keys.map((k) => getDoc(budgetDoc(uid, k)))).then((snaps) => {
      const totals: Record<string, number> = {};
      for (const snap of snaps) {
        for (const a of snap.data()?.savingsAllocations ?? []) {
          totals[a.accountId] = (totals[a.accountId] ?? 0) + a.amount;
        }
      }
      setByAccount(totals);
    });
  }, [uid, excludeMonth]);

  return byAccount;
}
