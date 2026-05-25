import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { previousMonthKey } from "@/lib/utils/dates";
import { calcPointsForBudget, calcPointsForSavings } from "@/lib/utils/points";

export const maxDuration = 60;

const DEFAULT_STATS = {
  points: 0,
  currentBudgetStreak: 0,
  longestBudgetStreak: 0,
  currentGoalStreak: 0,
  badges: [] as string[],
  lastUpdated: 0,
  lastRecordedMonth: undefined as string | undefined,
};

/** Returns [monthStart, monthEnd) timestamps for a YYYY-MM key */
function monthBounds(monthKey: string): [number, number] {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 1).getTime();
  return [start, end];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const monthKey = previousMonthKey();
  const [monthStart, monthEnd] = monthBounds(monthKey);

  const usersSnap = await db.collection("users").get();
  const results: Record<string, string> = {};

  await Promise.all(
    usersSnap.docs.map(async (userDoc) => {
      const uid = userDoc.id;
      try {
        const budgetSnap = await db.doc(`users/${uid}/budgets/${monthKey}`).get();
        if (!budgetSnap.exists) {
          results[uid] = "skip — no budget";
          return;
        }

        const statsSnap = await db.doc(`users/${uid}/stats/main`).get();
        const current = statsSnap.exists
          ? { ...DEFAULT_STATS, ...statsSnap.data() }
          : { ...DEFAULT_STATS };

        if (current.lastRecordedMonth === monthKey) {
          results[uid] = "skip — already recorded";
          return;
        }

        const budget = budgetSnap.data()!;
        const updatedAt: number = budget.updatedAt ?? 0;

        // AFK check: user must have saved their budget during the closed month
        // and must have at least one expense or savings entry
        const savedThisMonth = updatedAt >= monthStart && updatedAt < monthEnd;
        type ExpenseRow = { amount: number; goalId?: string };
        const expenses = (budget.expenses ?? []) as ExpenseRow[];
        const savings: number = budget.savings ?? 0;
        const hasActivity = expenses.some((e) => e.amount > 0) || savings > 0;

        if (!savedThisMonth || !hasActivity) {
          // Break streak but don't award points
          const newStats = {
            ...current,
            currentBudgetStreak: 0,
            lastRecordedMonth: monthKey,
            lastUpdated: Date.now(),
          };
          await db.doc(`users/${uid}/stats/main`).set(newStats);
          results[uid] = !savedThisMonth ? "afk — streak reset" : "no activity — streak reset";
          return;
        }

        const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0) + savings;
        const income: number = budget.income ?? 0;
        const onBudget = income > 0 && totalExpenses <= income;

        const newStreak = onBudget ? current.currentBudgetStreak + 1 : 0;
        const newLongest = Math.max(current.longestBudgetStreak, newStreak);

        let earned = 0;
        if (onBudget) {
          earned += calcPointsForBudget(newStreak);
          const goalTotal = expenses.filter((e) => e.goalId).reduce((s, e) => s + e.amount, 0);
          const savingsRate = income > 0 ? ((savings + goalTotal) / income) * 100 : 0;
          earned += calcPointsForSavings(savingsRate);
        }

        const newStats = {
          ...current,
          points: current.points + earned,
          currentBudgetStreak: newStreak,
          longestBudgetStreak: newLongest,
          lastRecordedMonth: monthKey,
          lastUpdated: Date.now(),
        };

        await db.doc(`users/${uid}/stats/main`).set(newStats);

        const userData = userDoc.data();
        await db.doc(`leaderboard/${uid}`).set(
          {
            displayName: userData.displayName ?? "Anonymous",
            avatarUrl: userData.photoURL ?? "",
            points: newStats.points,
            currentBudgetStreak: newStats.currentBudgetStreak,
            longestBudgetStreak: newStats.longestBudgetStreak,
            badges: newStats.badges,
            updatedAt: Date.now(),
          },
          { merge: true }
        );

        results[uid] = onBudget
          ? `+${earned} pts, streak ${newStreak}`
          : "over budget — streak reset";
      } catch (err) {
        results[uid] = `error: ${err}`;
      }
    })
  );

  return NextResponse.json({ month: monthKey, results });
}
