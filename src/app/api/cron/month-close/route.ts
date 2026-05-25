import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { previousMonthKey } from "@/lib/utils/dates";

// Allow up to 60s — iterating over all users can take time
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

function calcPoints(streak: number): number {
  let pts = 100;
  if (streak >= 3) pts += 25;
  return pts;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const monthKey = previousMonthKey(); // closes the month that just ended

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
        const current = statsSnap.exists ? { ...DEFAULT_STATS, ...statsSnap.data() } : { ...DEFAULT_STATS };

        if (current.lastRecordedMonth === monthKey) {
          results[uid] = "skip — already recorded";
          return;
        }

        const budget = budgetSnap.data()!;
        const totalExpenses =
          ((budget.expenses ?? []) as { amount: number }[]).reduce((s, e) => s + e.amount, 0) +
          (budget.savings ?? 0);
        const onBudget = budget.income > 0 && totalExpenses <= budget.income;

        const newStreak = onBudget ? current.currentBudgetStreak + 1 : 0;
        const newLongest = Math.max(current.longestBudgetStreak, newStreak);
        const earned = onBudget ? calcPoints(newStreak) : 0;

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
