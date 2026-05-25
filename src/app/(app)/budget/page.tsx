"use client";

import { useState, useEffect } from "react";
import { Plus, Sparkles, Target, RefreshCw, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/lib/hooks/useBudget";
import { useIncomeSources } from "@/lib/hooks/useIncomeSources";
import { useIncomeLog } from "@/lib/hooks/useIncomeLog";
import { useGoals } from "@/lib/hooks/useGoals";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { ExpenseItem } from "@/lib/firebase/firestore";
import { FRAMEWORK_MAP } from "@/lib/utils/frameworks";
import { currentMonthKey, monthKeyToLabel, previousMonths } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ExpenseRow } from "@/components/budget/ExpenseRow";
import { BudgetSummary } from "@/components/budget/BudgetSummary";
import { FrameworkGuide } from "@/components/budget/FrameworkGuide";

export default function BudgetPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const isCurrentMonth = selectedMonth === currentMonthKey();

  const { budget, loading, save } = useBudget(user?.uid, selectedMonth);
  const { sources, totalExpected } = useIncomeSources(user?.uid);
  const { logs, totalActual } = useIncomeLog(user?.uid, selectedMonth);
  const { goals, updateGoal } = useGoals(user?.uid);
  const { framework } = useUserProfile(user?.uid);

  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [savings, setSavings] = useState(0);
  const [saving, setSaving] = useState(false);

  // Sync expenses from budget + active goals together so goal rows are always present
  useEffect(() => {
    if (!budget) return;

    setIncome(budget.income);
    setSavings(budget.savings ?? 0);

    const activeGoals = goals.filter((g) => g.status === "active");
    const savedGoalMap = new Map(
      budget.expenses.filter((e) => e.goalId).map((e) => [e.goalId!, e])
    );
    const regularExpenses = budget.expenses.filter((e) => !e.goalId);
    const goalExpenses: ExpenseItem[] = activeGoals.map(
      (g) =>
        savedGoalMap.get(g.id!) ?? {
          id: uuid(),
          label: g.title,
          category: "Savings",
          amount: 0,
          recurring: true,
          goalId: g.id!,
        }
    );

    setExpenses([...regularExpenses, ...goalExpenses]);
  }, [budget, goals]);

  // Pre-fill income from income sources when no budget exists yet
  useEffect(() => {
    if (isCurrentMonth && income === 0 && totalExpected > 0) {
      setIncome(totalExpected);
    }
  }, [isCurrentMonth, income, totalExpected]);

  function addExpense(recurring: boolean) {
    setExpenses((prev) => [
      ...prev,
      { id: uuid(), label: "", category: "Other", amount: 0, recurring },
    ]);
  }

  function updateExpense(id: string, updated: ExpenseItem) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function updateGoalAmount(goalId: string, amount: number) {
    setExpenses((prev) =>
      prev.map((e) => (e.goalId === goalId ? { ...e, amount } : e))
    );
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      // Compute deltas vs last-saved budget so re-saves don't double-count
      const oldGoalMap = new Map(
        (budget?.expenses ?? []).filter((e) => e.goalId).map((e) => [e.goalId!, e.amount])
      );

      await save({ income, expenses, savings });

      // Apply contribution deltas to each goal's currentAmount
      for (const exp of expenses.filter((e) => e.goalId)) {
        const delta = exp.amount - (oldGoalMap.get(exp.goalId!) ?? 0);
        if (delta === 0) continue;
        const goal = goals.find((g) => g.id === exp.goalId);
        if (!goal) continue;
        const newAmount = Math.max(0, (goal.currentAmount ?? 0) + delta);
        const isNowComplete = newAmount >= goal.targetAmount;
        await updateGoal(exp.goalId!, {
          currentAmount: newAmount,
          ...(isNowComplete ? { status: "completed", completedAt: Date.now() } : {}),
        });
      }

      toast.success("Budget saved!");
    } catch {
      toast.error("Failed to save budget.");
    } finally {
      setSaving(false);
    }
  }

  const months = previousMonths(6);
  const hasActualIncome = logs.length > 0;

  const recurringExpenses = expenses.filter((e) => e.recurring && !e.goalId);
  const onceOffExpenses = expenses.filter((e) => !e.recurring && !e.goalId);
  const goalExpenses = expenses.filter((e) => e.goalId);
  const activeGoals = goals.filter((g) => g.status === "active");

  const isZeroBased = framework === "zero-based";
  const totalAllocated = expenses.reduce((s, e) => s + e.amount, 0) + savings;
  const unallocated = income - totalAllocated;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget</h1>
          <p className="text-muted-foreground text-sm">Set your monthly income and expenses</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>{monthKeyToLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">

            {/* Income */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Income</CardTitle>
                {sources.length > 0 && <CardDescription>From your income sources</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                {sources.length > 0 && (
                  <div className="space-y-2">
                    {sources.filter((s) => s.active).map((s) => {
                      const log = logs.find((l) => l.sourceId === s.id);
                      return (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{s.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {s.payDay === 31 ? "last day" : `${s.payDay}th`}
                            </Badge>
                          </div>
                          {log ? (
                            <span className="font-medium text-green-600">
                              ${log.actualAmount.toLocaleString()}{" "}
                              <span className="text-xs text-muted-foreground">actual</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">${s.expectedAmount.toLocaleString()}</span>
                          )}
                        </div>
                      );
                    })}
                    <Separator />
                    <div className="flex justify-between text-sm font-medium">
                      <span>{hasActualIncome ? "Total actual income" : "Total expected"}</span>
                      <span>${(hasActualIncome ? totalActual : totalExpected).toLocaleString()}</span>
                    </div>
                    {isCurrentMonth && income !== totalExpected && (
                      <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => setIncome(totalExpected)}>
                        <Sparkles className="h-3 w-3" />
                        Sync from sources (${totalExpected.toLocaleString()})
                      </Button>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="income">{sources.length > 0 ? "Budget income (editable)" : "Expected income"}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="income"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={income || ""}
                      onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                      className="pl-7"
                      disabled={!isCurrentMonth}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recurring Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    Recurring Expenses
                  </CardTitle>
                  <CardDescription className="text-xs">Carry over to next month automatically</CardDescription>
                </div>
                {isCurrentMonth && (
                  <Button size="sm" variant="outline" onClick={() => addExpense(true)}>
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {recurringExpenses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No recurring expenses yet.
                  </p>
                )}
                {recurringExpenses.map((e) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    onChange={(updated) => updateExpense(e.id, updated)}
                    onRemove={() => removeExpense(e.id)}
                    disabled={!isCurrentMonth}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Once-off Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Once-off Expenses</CardTitle>
                  <CardDescription className="text-xs">This month only — won&apos;t carry over</CardDescription>
                </div>
                {isCurrentMonth && (
                  <Button size="sm" variant="outline" onClick={() => addExpense(false)}>
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {onceOffExpenses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No once-off expenses this month.
                  </p>
                )}
                {onceOffExpenses.map((e) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    onChange={(updated) => updateExpense(e.id, updated)}
                    onRemove={() => removeExpense(e.id)}
                    disabled={!isCurrentMonth}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Savings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Savings
                </CardTitle>
                <CardDescription className="text-xs">General savings set aside from income each month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isZeroBased && isCurrentMonth && unallocated !== 0 && (
                  <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <span className={unallocated < 0 ? "text-destructive" : "text-muted-foreground"}>
                      {unallocated > 0
                        ? `$${unallocated.toLocaleString()} unallocated`
                        : `$${Math.abs(unallocated).toLocaleString()} over budget`}
                    </span>
                    {unallocated > 0 && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setSavings((s) => s + unallocated)}>
                        <PiggyBank className="h-3 w-3" />
                        Allocate to savings
                      </Button>
                    )}
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={savings || ""}
                    onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                    className="pl-7"
                    disabled={!isCurrentMonth}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goal Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goal Contributions
                </CardTitle>
                <CardDescription>
                  Monthly amounts put towards each active goal — counted as savings in your budget.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No active goals. Create goals to allocate budget towards them.
                  </p>
                ) : (
                  activeGoals.map((goal) => {
                    const contribution = goalExpenses.find((e) => e.goalId === goal.id);
                    const amount = contribution?.amount ?? 0;
                    const progressPct = goal.targetAmount > 0
                      ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                      : 0;
                    const remaining = goal.targetAmount - goal.currentAmount;

                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{goal.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={progressPct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground shrink-0">
                                ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                              </span>
                            </div>
                            {remaining > 0 && amount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ~{Math.ceil(remaining / amount)} month{Math.ceil(remaining / amount) !== 1 ? "s" : ""} to reach goal
                              </p>
                            )}
                          </div>
                          <div className="relative w-28 shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={amount || ""}
                              onChange={(e) => updateGoalAmount(goal.id!, parseFloat(e.target.value) || 0)}
                              className="pl-7 h-8 text-sm"
                              disabled={!isCurrentMonth}
                            />
                          </div>
                        </div>
                        <Separator />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {isCurrentMonth && (
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Budget"}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <BudgetSummary income={income} expenses={expenses} savings={savings} />
            <FrameworkGuide
              framework={FRAMEWORK_MAP[framework]}
              income={income}
              expenses={expenses}
              savings={savings}
            />
          </div>
        </div>
      )}
    </div>
  );
}
