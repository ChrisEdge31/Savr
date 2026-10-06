import { IncomeSource } from "@/lib/firebase/firestore";
import { monthKeyOf } from "@/lib/utils/dates";

/** How many days after payday the "log your income" reminder stays up if it hasn't been logged. */
export const INCOME_REMINDER_DAYS = 7;

export type PendingIncome = IncomeSource & {
  payDate: Date;
  payMonth: string; // YYYY-MM the pay date fell in — the month the log is recorded against
};

/** The pay date in a given month. Pay days past the end of the month fall on its last day (31 → 28 Feb). */
export function payDateInMonth(payDay: number, year: number, month: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(payDay, lastDay));
}

/** The most recent pay date strictly before `today` — this month's if it has passed, otherwise last month's. */
export function mostRecentPayDate(payDay: number, today: Date = new Date()): Date {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const thisMonth = payDateInMonth(payDay, today.getFullYear(), today.getMonth());
  if (thisMonth < startOfToday) return thisMonth;
  return payDateInMonth(payDay, today.getFullYear(), today.getMonth() - 1);
}

/**
 * Sources whose most recent payday was 1–INCOME_REMINDER_DAYS days ago and haven't been logged for that pay month.
 * `isLogged` must be able to answer for both this month and last month, since a payday on the last day of
 * the month is only reminded about once the next month has started.
 */
export function getPendingSources(
  sources: IncomeSource[],
  isLogged: (sourceId: string, monthKey: string) => boolean,
  today: Date = new Date()
): PendingIncome[] {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return sources.flatMap((s) => {
    if (!s.active || !s.id) return [];
    const payDate = mostRecentPayDate(s.payDay, today);
    const daysSince = Math.round((startOfToday.getTime() - payDate.getTime()) / 86_400_000);
    if (daysSince < 1 || daysSince > INCOME_REMINDER_DAYS) return [];
    const payMonth = monthKeyOf(payDate);
    if (isLogged(s.id, payMonth)) return [];
    return [{ ...s, payDate, payMonth }];
  });
}

/** Request browser notification permission. Returns the permission state. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

/** Fire a browser notification if permission is granted. */
export function fireBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: "income-reminder",
  });
}
