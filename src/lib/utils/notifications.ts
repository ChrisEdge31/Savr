import { IncomeSource } from "@/lib/firebase/firestore";

/** Returns the date the notification should fire (day after payday). */
export function getNotificationDate(payDay: number, referenceDate: Date = new Date()): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const effectivePayDay = Math.min(payDay, lastDay);

  if (effectivePayDay >= lastDay) {
    // Payday is last day of month → notify on 1st of next month
    return new Date(year, month + 1, 1);
  }
  return new Date(year, month, effectivePayDay + 1);
}

/** Returns true if today is the notification day for this pay day. */
export function isNotificationDay(payDay: number, today: Date = new Date()): boolean {
  const notifDate = getNotificationDate(payDay, today);
  return (
    today.getDate() === notifDate.getDate() &&
    today.getMonth() === notifDate.getMonth() &&
    today.getFullYear() === notifDate.getFullYear()
  );
}

/** Returns sources that are due for income logging today and haven't been logged yet. */
export function getPendingSources(
  sources: IncomeSource[],
  loggedSourceIds: Set<string>
): IncomeSource[] {
  return sources.filter(
    (s) => s.active && isNotificationDay(s.payDay) && !loggedSourceIds.has(s.id ?? "")
  );
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
