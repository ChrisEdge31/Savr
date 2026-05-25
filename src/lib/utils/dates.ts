export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyToLabel(key: string): string {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

/** Returns the YYYY-MM key for the calendar month before the given key (or current month if omitted). */
export function previousMonthKey(key?: string): string {
  const base = key ?? currentMonthKey();
  const [year, month] = base.split("-").map(Number);
  const d = new Date(year, month - 2, 1); // month-2 because month is 1-based → go back one
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function nextMonthKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month, 1); // month is 1-based, so month (not month-1) gives the next month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function previousMonths(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}
