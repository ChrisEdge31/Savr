"use client";

import { useMemo, useEffect, useState } from "react";
import { IncomeSource, GoalDoc } from "@/lib/firebase/firestore";
import { getPendingSources } from "@/lib/utils/notifications";
import { currentMonthKey } from "@/lib/utils/dates";

export type AppNotification = {
  id: string;
  type: "income_due" | "goal_deadline" | "budget_missing";
  title: string;
  description: string;
  href: string;
};

export function useNotifications({
  sources,
  goals,
  budgetIncome,
  loggedSourceIds,
}: {
  sources: IncomeSource[];
  goals: GoalDoc[];
  budgetIncome: number;
  loggedSourceIds: Set<string>;
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("dismissed_notifications");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Reset dismissals on new month
  useEffect(() => {
    const month = currentMonthKey();
    const key = `notif_month`;
    const stored = localStorage.getItem(key);
    if (stored !== month) {
      localStorage.removeItem("dismissed_notifications");
      localStorage.setItem(key, month);
      setDismissed(new Set());
    }
  }, []);

  const all = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];

    // Income due notifications
    const pending = getPendingSources(sources, loggedSourceIds);
    for (const s of pending) {
      items.push({
        id: `income_${s.id}`,
        type: "income_due",
        title: "Log your income",
        description: `${s.name} — payday was yesterday. Log what you received.`,
        href: "/budget",
      });
    }

    // Goal deadline notifications (due within 7 days)
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    for (const g of goals) {
      if (g.status !== "active" || !g.deadline) continue;
      const deadline = new Date(g.deadline).getTime();
      const daysLeft = Math.ceil((deadline - now) / 86400000);
      if (daysLeft >= 0 && daysLeft <= 7) {
        items.push({
          id: `goal_${g.id}`,
          type: "goal_deadline",
          title: "Goal deadline approaching",
          description: `"${g.title}" is due in ${daysLeft === 0 ? "today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}.`,
          href: "/goals",
        });
      }
    }

    // Budget not set (after 5th of the month)
    const today = new Date();
    if (today.getDate() > 5 && budgetIncome === 0) {
      items.push({
        id: `budget_${currentMonthKey()}`,
        type: "budget_missing",
        title: "Budget not set",
        description: "You haven't set a budget for this month yet.",
        href: "/budget",
      });
    }

    return items;
  }, [sources, goals, budgetIncome, loggedSourceIds]);

  const visible = useMemo(
    () => all.filter((n) => !dismissed.has(n.id)),
    [all, dismissed]
  );

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("dismissed_notifications", JSON.stringify([...next]));
      return next;
    });
  }

  function dismissAll() {
    const ids = all.map((n) => n.id);
    setDismissed((prev) => {
      const next = new Set([...prev, ...ids]);
      localStorage.setItem("dismissed_notifications", JSON.stringify([...next]));
      return next;
    });
  }

  return { notifications: visible, total: visible.length, dismiss, dismissAll };
}
