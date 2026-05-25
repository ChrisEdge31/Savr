"use client";

import { useState, useEffect, useCallback } from "react";
import { getDoc, setDoc } from "firebase/firestore";
import { statsDoc, leaderboardDoc, StatsDoc, GoalDoc } from "@/lib/firebase/firestore";
import { calcPointsForBudget, calcPointsForGoal, calcPointsForSavings } from "@/lib/utils/points";
import { userDoc } from "@/lib/firebase/firestore";
import { currentMonthKey } from "@/lib/utils/dates";

const DEFAULT_STATS: StatsDoc = {
  points: 0,
  currentBudgetStreak: 0,
  longestBudgetStreak: 0,
  currentGoalStreak: 0,
  badges: [],
  lastUpdated: 0,
};

export function useStats(uid: string | undefined) {
  const [stats, setStats] = useState<StatsDoc>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const snap = await getDoc(statsDoc(uid));
    setStats(snap.exists() ? snap.data() : DEFAULT_STATS);
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);

  const recordBudgetMonth = useCallback(
    async (
      budget: { income: number; expenses: { amount: number; goalId?: string }[]; savings?: number; updatedAt: number },
      monthKey?: string
    ) => {
      if (!uid) return;
      const key = monthKey ?? currentMonthKey();
      const snap = await getDoc(statsDoc(uid));
      const current = snap.exists() ? snap.data() : DEFAULT_STATS;

      // Idempotent — skip if this month was already recorded
      if (current.lastRecordedMonth === key) return;

      const savings = budget.savings ?? 0;
      const totalExpenses = budget.expenses.reduce((s, e) => s + e.amount, 0) + savings;
      const onBudget = budget.income > 0 && totalExpenses <= budget.income;

      const newStreak = onBudget ? current.currentBudgetStreak + 1 : 0;
      const newLongest = Math.max(current.longestBudgetStreak, newStreak);

      let earned = 0;
      if (onBudget) {
        earned += calcPointsForBudget(newStreak);
        const goalTotal = budget.expenses.filter((e) => e.goalId).reduce((s, e) => s + e.amount, 0);
        const savingsRate = budget.income > 0 ? ((savings + goalTotal) / budget.income) * 100 : 0;
        earned += calcPointsForSavings(savingsRate);
      }

      const newStats: StatsDoc = {
        ...current,
        points: current.points + earned,
        currentBudgetStreak: newStreak,
        longestBudgetStreak: newLongest,
        lastRecordedMonth: key,
        lastUpdated: Date.now(),
      };

      await setDoc(statsDoc(uid), newStats);
      await syncLeaderboard(uid, newStats);
      setStats(newStats);
    },
    [uid]
  );

  const recordGoalComplete = useCallback(
    async (goal: GoalDoc) => {
      if (!uid) return;
      const snap = await getDoc(statsDoc(uid));
      const current = snap.exists() ? snap.data() : DEFAULT_STATS;

      const earned = calcPointsForGoal(goal);
      const newStats: StatsDoc = {
        ...current,
        points: current.points + earned,
        currentGoalStreak: current.currentGoalStreak + 1,
        lastUpdated: Date.now(),
      };

      await setDoc(statsDoc(uid), newStats);
      await syncLeaderboard(uid, newStats);
      setStats(newStats);
    },
    [uid]
  );

  const resetStats = useCallback(async () => {
    if (!uid) return;
    await setDoc(statsDoc(uid), DEFAULT_STATS);
    await syncLeaderboard(uid, DEFAULT_STATS);
    setStats(DEFAULT_STATS);
  }, [uid]);

  return { stats, loading, recordBudgetMonth, recordGoalComplete, resetStats, refetch: fetch };
}

async function syncLeaderboard(uid: string, stats: StatsDoc) {
  const userSnap = await getDoc(userDoc(uid));
  const userData = userSnap.data();
  await setDoc(leaderboardDoc(uid), {
    displayName: userData?.displayName ?? "Anonymous",
    avatarUrl: userData?.photoURL ?? "",
    points: stats.points,
    currentBudgetStreak: stats.currentBudgetStreak,
    longestBudgetStreak: stats.longestBudgetStreak,
    badges: stats.badges,
    updatedAt: Date.now(),
  });
}
