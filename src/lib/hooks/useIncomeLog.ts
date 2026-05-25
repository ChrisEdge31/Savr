"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocs, setDoc, query, where } from "firebase/firestore";
import { incomeLogsCol, incomeLogDoc, IncomeLog } from "@/lib/firebase/firestore";
import { currentMonthKey } from "@/lib/utils/dates";

export function useIncomeLog(uid: string | undefined, month?: string) {
  const monthKey = month ?? currentMonthKey();
  const [logs, setLogs] = useState<IncomeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const snap = await getDocs(
      query(incomeLogsCol(uid), where("month", "==", monthKey))
    );
    setLogs(snap.docs.map((d) => d.data()));
    setLoading(false);
  }, [uid, monthKey]);

  useEffect(() => { fetch(); }, [fetch]);

  const logIncome = useCallback(
    async (sourceId: string, sourceName: string, actualAmount: number) => {
      if (!uid) return;
      const entry: IncomeLog = {
        sourceId,
        sourceName,
        actualAmount,
        month: monthKey,
        recordedAt: Date.now(),
      };
      await setDoc(incomeLogDoc(uid, monthKey, sourceId), entry);
      fetch();
    },
    [uid, monthKey, fetch]
  );

  const totalActual = logs.reduce((sum, l) => sum + l.actualAmount, 0);
  const loggedSourceIds = new Set(logs.map((l) => l.sourceId));

  return { logs, loading, logIncome, totalActual, loggedSourceIds, refetch: fetch };
}
