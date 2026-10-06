"use client";

import { useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/lib/hooks/useBudget";
import { useGoals } from "@/lib/hooks/useGoals";
import { useStats } from "@/lib/hooks/useStats";
import { useIncomeSources } from "@/lib/hooks/useIncomeSources";
import { useIncomeLog } from "@/lib/hooks/useIncomeLog";
import { currentMonthKey, monthKeyToLabel } from "@/lib/utils/dates";
import { sumAllocations } from "@/lib/utils/savings";
import { getPendingSources, requestNotificationPermission, fireBrowserNotification } from "@/lib/utils/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PointsBadge } from "@/components/gamification/PointsBadge";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { PaydayBanner } from "@/components/income/PaydayBanner";
import { ArrowRight, Wallet, Target, PiggyBank } from "lucide-react";

export default function DashboardPage() {
  const { format } = useCurrency();
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

  const income = budget?.income ?? 0;
  const totalExpenses = (budget?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0) + (budget?.savings ?? 0);
  const remaining = income - totalExpenses;
  const budgetPct = income > 0 ? Math.min((totalExpenses / income) * 100, 100) : 0;
  const onBudget = income > 0 && totalExpenses <= income;

  const accountContributions = sumAllocations(budget?.savingsAllocations);
  const generalSavings = (budget?.savings ?? 0) - accountContributions;
  const goalExpenses = (budget?.expenses ?? []).filter((e) => e.goalId);
  const goalContributions = goalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSavings = generalSavings + accountContributions + goalContributions;
  const savingsRate = income > 0 ? Math.round((totalSavings / income) * 100) : 0;

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
                  <p className="text-lg font-bold">{format(income)}</p>
                  <p className="text-xs text-muted-foreground">Income</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{format(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground">Budgeted</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
                    {format(Math.abs(remaining))}
                  </p>
                  <p className="text-xs text-muted-foreground">{remaining < 0 ? "Over" : "Remaining"}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Savings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PiggyBank className="h-4 w-4" />
            Savings
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/savings">Details <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {income === 0 ? (
            <p className="text-sm text-muted-foreground">Set up your budget to track savings.</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold">{format(totalSavings)}</p>
                  <p className="text-xs text-muted-foreground">Saved this month</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${savingsRate >= 20 ? "text-green-600" : ""}`}>
                    {savingsRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Savings rate</p>
                </div>
              </div>
              {totalSavings > 0 && (
                <div className="space-y-1.5 pt-1">
                  {accountContributions > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Accounts</span>
                      <span>{format(accountContributions)}</span>
                    </div>
                  )}
                  {generalSavings > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> General</span>
                      <span>{format(generalSavings)}</span>
                    </div>
                  )}
                  {goalContributions > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Goals</span>
                      <span>{format(goalContributions)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
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
              {activeGoals.map((g) => {
                const contribution = goalExpenses.find((e) => e.goalId === g.id);
                const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
                const remaining = g.targetAmount - g.currentAmount;
                const monthsLeft = contribution && contribution.amount > 0
                  ? Math.ceil(remaining / contribution.amount)
                  : null;
                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {format(g.currentAmount)} / {format(g.targetAmount)}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2 [&>div]:bg-green-500" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(pct)}% saved</span>
                      {pct >= 100
                        ? <span className="text-green-600 font-medium">Goal reached!</span>
                        : monthsLeft && <span>~{monthsLeft} month{monthsLeft !== 1 ? "s" : ""} to go</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
