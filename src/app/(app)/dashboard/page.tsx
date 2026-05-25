"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/lib/hooks/useBudget";
import { useGoals } from "@/lib/hooks/useGoals";
import { useStats } from "@/lib/hooks/useStats";
import { useIncomeSources } from "@/lib/hooks/useIncomeSources";
import { useIncomeLog } from "@/lib/hooks/useIncomeLog";
import { currentMonthKey, monthKeyToLabel } from "@/lib/utils/dates";
import { getPendingSources, requestNotificationPermission, fireBrowserNotification } from "@/lib/utils/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PointsBadge } from "@/components/gamification/PointsBadge";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { PaydayBanner } from "@/components/income/PaydayBanner";
import { ArrowRight, Wallet, Target } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const monthKey = currentMonthKey();
  const { budget } = useBudget(user?.uid, monthKey);
  const { goals } = useGoals(user?.uid);
  const { stats } = useStats(user?.uid);
  const { sources } = useIncomeSources(user?.uid);
  const { loggedSourceIds, logIncome } = useIncomeLog(user?.uid, monthKey);

  const pendingSources = getPendingSources(sources, loggedSourceIds);

  // Request notification permission and fire browser notification on payday
  useEffect(() => {
    if (pendingSources.length === 0) return;
    requestNotificationPermission().then((permission) => {
      if (permission === "granted") {
        fireBrowserNotification(
          "Time to log your income!",
          `You have ${pendingSources.length} income source${pendingSources.length > 1 ? "s" : ""} to log for this month.`
        );
      }
    });
  }, [pendingSources.length]);

  const totalExpenses = budget?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0;
  const income = budget?.income ?? 0;
  const remaining = income - totalExpenses;
  const budgetPct = income > 0 ? Math.min((totalExpenses / income) * 100, 100) : 0;
  const onBudget = income > 0 && totalExpenses <= income;

  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{monthKeyToLabel(monthKey)}</p>
        </div>
        <PointsBadge points={stats.points} />
      </div>

      {/* Payday banner */}
      <PaydayBanner
        pendingSources={pendingSources}
        loggedSourceIds={loggedSourceIds}
        onLog={logIncome}
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <StreakCounter streak={stats.currentBudgetStreak} label="Budget streak" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <StreakCounter streak={stats.currentGoalStreak} label="Goal streak" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div>
              <p className="text-2xl font-bold leading-none">{stats.longestBudgetStreak}</p>
              <p className="text-xs text-muted-foreground">Best streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Budget Health — {monthKeyToLabel(monthKey)}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/budget">Edit <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {income === 0 ? (
            <p className="text-sm text-muted-foreground">
              No budget set for this month.{" "}
              <Link href="/budget" className="underline">Set it up</Link>
            </p>
          ) : (
            <>
              <Progress value={budgetPct} className={`h-3 ${!onBudget ? "[&>div]:bg-destructive" : ""}`} />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">${income.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Income</p>
                </div>
                <div>
                  <p className="text-lg font-bold">${totalExpenses.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Budgeted</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
                    ${Math.abs(remaining).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{remaining < 0 ? "Over" : "Remaining"}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active Goals
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals">All goals <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active goals.{" "}
              <Link href="/goals" className="underline">Create one</Link>
            </p>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((g) => (
                <div key={g.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-muted-foreground">${g.targetAmount.toLocaleString()}</span>
                  </div>
                  <GoalProgress current={g.currentAmount} target={g.targetAmount} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
