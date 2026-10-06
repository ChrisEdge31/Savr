"use client";

import { useCallback } from "react";
import { IncomeSource } from "@/lib/firebase/firestore";
import { useIncomeLog } from "@/lib/hooks/useIncomeLog";
import { currentMonthKey, previousMonthKey } from "@/lib/utils/dates";
import { getPendingSources, PendingIncome } from "@/lib/utils/notifications";

/**
 * Income sources waiting to be logged, plus a logger that records each one against the month it was paid in.
 * Loads last month's logs too, because pay on the last day of the month is only due once the next month starts.
 */
export function usePendingIncome(uid: string | undefined, sources: IncomeSource[]) {
  const thisMonth = currentMonthKey();
  const lastMonth = previousMonthKey(thisMonth);
  const current = useIncomeLog(uid, thisMonth);
  const previous = useIncomeLog(uid, lastMonth);

  const pendingSources = getPendingSources(sources, (sourceId, monthKey) =>
    monthKey === thisMonth
      ? current.loggedSourceIds.has(sourceId)
      : monthKey === lastMonth && previous.loggedSourceIds.has(sourceId)
  );

  const logPending = useCallback(
    (source: PendingIncome, amount: number) => {
      const log = source.payMonth === thisMonth ? current.logIncome : previous.logIncome;
      return log(source.id!, source.name, amount);
    },
    [thisMonth, current.logIncome, previous.logIncome]
  );

  return { pendingSources, logPending };
}
