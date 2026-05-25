"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/lib/hooks/useBudget";
import { useGoals } from "@/lib/hooks/useGoals";
import { useSavingsHistory } from "@/lib/hooks/useSavingsHistory";
import { currentMonthKey, monthKeyToLabel } from "@/lib/utils/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PiggyBank, Target, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SavingsPage() {
  const { user } = useAuth();
  const monthKey = currentMonthKey();

  const { budget } = useBudget(user?.uid, monthKey);
  const { goals } = useGoals(user?.uid);
  const { history, loading } = useSavingsHistory(user?.uid, 6);

  const income = budget?.income ?? 0;
  const generalSavings = budget?.savings ?? 0;
  const goalExpenses = (budget?.expenses ?? []).filter((e) => e.goalId);
  const goalContributions = goalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalThisMonth = generalSavings + goalContributions;
  const savingsRate = income > 0 ? Math.round((totalThisMonth / income) * 100) : 0;

  const totalSavedInGoals = goals.reduce((s, g) => s + (g.currentAmount ?? 0), 0);
  const activeGoals = goals.filter((g) => g.status === "active");

  const maxMonthTotal = Math.max(...history.map((m) => m.total), 1);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Savings</h1>
        <p className="text-muted-foreground text-sm">{monthKeyToLabel(monthKey)}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold leading-none">${totalThisMonth.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Saved this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className={cn("text-2xl font-bold leading-none", savingsRate >= 20 ? "text-green-600" : savingsRate > 0 ? "" : "text-muted-foreground")}>
              {savingsRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Savings rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold leading-none">${totalSavedInGoals.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Saved toward goals</p>
          </CardContent>
        </Card>
      </div>

      {/* This month breakdown */}
      {totalThisMonth > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {generalSavings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-muted-foreground">General savings</span>
                </div>
                <span className="font-medium">${generalSavings.toLocaleString()}</span>
              </div>
            )}
            {goalExpenses.map((e) => {
              const goal = goals.find((g) => g.id === e.goalId);
              return (
                <div key={e.goalId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="text-muted-foreground truncate">{goal?.title ?? e.label}</span>
                  </div>
                  <span className="font-medium">${e.amount.toLocaleString()}</span>
                </div>
              );
            })}
            {income > 0 && (
              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Savings rate</span>
                  <span>{savingsRate}% of ${income.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(savingsRate, 100)} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monthly history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly history</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : (
            <div className="space-y-3">
              {history.map((m) => {
                const rate = m.income > 0 ? Math.round((m.total / m.income) * 100) : 0;
                const barPct = (m.total / maxMonthTotal) * 100;
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-muted-foreground shrink-0">{m.label}</span>
                    <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                      {m.total > 0 && (
                        <div className="flex h-full">
                          {m.savings > 0 && (
                            <div
                              className="bg-blue-400 h-full"
                              style={{ width: `${(m.savings / m.total) * barPct}%` }}
                            />
                          )}
                          {m.goalContributions > 0 && (
                            <div
                              className="bg-green-500 h-full"
                              style={{ width: `${(m.goalContributions / m.total) * barPct}%` }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="w-16 text-xs font-medium text-right shrink-0">
                      ${m.total.toLocaleString()}
                    </span>
                    <span className="w-8 text-xs text-muted-foreground text-right shrink-0">
                      {rate > 0 ? `${rate}%` : "—"}
                    </span>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0" />
                  General savings
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-500 shrink-0" />
                  Goal contributions
                </div>
              </div>
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
                const pct = g.targetAmount > 0
                  ? Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                  : 0;
                const remaining = g.targetAmount - g.currentAmount;
                const monthsLeft = contribution && contribution.amount > 0
                  ? Math.ceil(remaining / contribution.amount)
                  : null;

                return (
                  <div key={g.id} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="font-medium">{g.title}</span>
                      <span className="text-muted-foreground text-xs">
                        ${g.currentAmount.toLocaleString()} / ${g.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2 [&>div]:bg-green-500" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{Math.round(pct)}% saved</span>
                      {monthsLeft !== null && monthsLeft > 0 && (
                        <span>~{monthsLeft} month{monthsLeft !== 1 ? "s" : ""} to go</span>
                      )}
                      {pct >= 100 && <span className="text-green-600 font-medium">Goal reached!</span>}
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
