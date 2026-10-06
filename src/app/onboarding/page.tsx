"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Landmark, PiggyBank, Plus, Target, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { updateDisplayName } from "@/lib/firebase/auth";
import type { IncomeSource } from "@/lib/firebase/firestore";
import { useGoals } from "@/lib/hooks/useGoals";
import { useIncomeSources } from "@/lib/hooks/useIncomeSources";
import { useSavingsAccounts } from "@/lib/hooks/useSavingsAccounts";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { CURRENCIES, type CurrencyCode, currencySymbol } from "@/lib/utils/currency";
import { FRAMEWORK_MAP } from "@/lib/utils/frameworks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FrameworkPicker } from "@/components/budget/FrameworkPicker";
import { GoalForm } from "@/components/goals/GoalForm";
import { IncomeSourceCard } from "@/components/income/IncomeSourceCard";
import { IncomeSourceForm } from "@/components/income/IncomeSourceForm";
import { SavingsAccountCard } from "@/components/savings/SavingsAccountCard";
import { SavingsAccountForm } from "@/components/savings/SavingsAccountForm";

const STEPS = [
  { title: "Welcome to Savr", description: "Let's get the basics right. This takes about three minutes." },
  { title: "Where does your money come from?", description: "Add your income sources. We'll pre-fill your budget from them and remind you to log what actually lands on payday." },
  { title: "Pick a budgeting style", description: "A framework gives your budget a shape. You can change it any time in Settings." },
  { title: "Set up your savings accounts", description: "Add a TFSA, emergency fund or investment account with a monthly contribution and yearly limit. Optional." },
  { title: "Set your first goal", description: "Saving for something specific? Goals track progress and earn bonus points when you hit them. Optional." },
  { title: "You're all set", description: "Here's what you've set up. Next, plan your first month." },
] as const;

const LAST_STEP = STEPS.length - 1;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();
  const { format, currency, saveCurrency } = useCurrency();
  const { sources, addSource, updateSource, removeSource, totalExpected } = useIncomeSources(user?.uid);
  const { framework, saveFramework } = useUserProfile(user?.uid);
  const { accounts, addAccount, updateAccount, removeAccount } = useSavingsAccounts(user?.uid);
  const { goals, addGoal } = useGoals(user?.uid);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(
    user?.displayName && user.displayName !== "Anonymous" ? user.displayName : ""
  );
  const [busy, setBusy] = useState(false);

  const optionalAndEmpty =
    (step === 1 && sources.length === 0) ||
    (step === 3 && accounts.length === 0) ||
    (step === 4 && goals.length === 0);

  async function next() {
    if (step === 0) {
      const name = displayName.trim();
      if (!name) {
        toast.error("Please enter a name for the leaderboard.");
        return;
      }
      if (user && name !== user.displayName) {
        setBusy(true);
        try {
          await updateDisplayName(user.uid, name);
        } catch {
          toast.error("Couldn't save your name. You can change it later in Settings.");
        } finally {
          setBusy(false);
        }
      }
    }
    setStep((s) => Math.min(s + 1, LAST_STEP));
  }

  async function finish(destination: "/dashboard" | "/budget") {
    setBusy(true);
    try {
      await completeOnboarding();
      router.replace(destination);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
              <PiggyBank className="h-4 w-4" />
            </span>
            Savr
          </div>
          {step < LAST_STEP && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => finish("/dashboard")}>
              Skip setup
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}</span>
            {(step === 3 || step === 4) && <span>Optional</span>}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{STEPS[step].title}</h1>
          <p className="text-muted-foreground">{STEPS[step].description}</p>
        </div>

        {/* Step content */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="onboarding-name">Your name</Label>
              <Input
                id="onboarding-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Thandi"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Shown on the leaderboard. Your amounts never are.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(code) => saveCurrency(code as CurrencyCode)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {currencySymbol(c.code)} · {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {sources.map((s) => (
              <IncomeSourceCard
                key={s.id}
                source={s as IncomeSource & { id: string }}
                onUpdate={updateSource}
                onRemove={removeSource}
              />
            ))}
            {sources.length > 0 && (
              <div className="flex justify-between text-sm font-medium px-1">
                <span>Expected monthly income</span>
                <span>{format(totalExpected)}</span>
              </div>
            )}
            <IncomeSourceForm
              onAdd={addSource}
              trigger={
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="h-4 w-4" />
                  {sources.length === 0 ? "Add your first income source" : "Add another source"}
                </Button>
              }
            />
          </div>
        )}

        {step === 2 && (
          <FrameworkPicker
            value={framework}
            onChange={(id) => {
              saveFramework(id);
            }}
          />
        )}

        {step === 3 && (
          <div className="space-y-3">
            {accounts.map((a) => (
              <SavingsAccountCard
                key={a.id}
                account={a}
                contributedThisYear={0}
                onUpdate={updateAccount}
                onRemove={removeAccount}
              />
            ))}
            <SavingsAccountForm
              onSubmit={(data) => addAccount({ ...data, active: true })}
              trigger={
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="h-4 w-4" />
                  {accounts.length === 0 ? "Add a savings account" : "Add another account"}
                </Button>
              }
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {goals.map((g) => (
              <Card key={g.id}>
                <CardContent className="pt-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{g.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(g.currentAmount)} of {format(g.targetAmount)}
                      {g.deadline && ` · by ${new Date(g.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <GoalForm onAdd={addGoal} />
          </div>
        )}

        {step === LAST_STEP && (
          <div className="space-y-3">
            <SummaryRow
              icon={Wallet}
              done={sources.length > 0}
              label="Income"
              value={
                sources.length > 0
                  ? `${sources.length} source${sources.length === 1 ? "" : "s"} · ${format(totalExpected)} / month`
                  : "Not added yet"
              }
            />
            <SummaryRow icon={Check} done label="Framework" value={FRAMEWORK_MAP[framework].name} />
            <SummaryRow
              icon={Landmark}
              done={accounts.length > 0}
              label="Savings accounts"
              value={accounts.length > 0 ? accounts.map((a) => a.name).join(", ") : "None yet"}
            />
            <SummaryRow
              icon={Target}
              done={goals.length > 0}
              label="Goals"
              value={goals.length > 0 ? goals.map((g) => g.title).join(", ") : "None yet"}
            />
          </div>
        )}
      </main>

      {/* Footer navigation */}
      <footer className="border-t sticky bottom-0 bg-background">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" disabled={busy} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < LAST_STEP ? (
            <Button disabled={busy} onClick={next} variant={optionalAndEmpty ? "outline" : "default"}>
              {optionalAndEmpty ? "Skip for now" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" disabled={busy} onClick={() => finish("/dashboard")}>
                Go to dashboard
              </Button>
              <Button disabled={busy} onClick={() => finish("/budget")}>
                Plan my first budget
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  done,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  done: boolean;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-sm font-medium truncate">{value}</p>
        </div>
        {done && <Check className="h-4 w-4 text-green-600 shrink-0" />}
      </CardContent>
    </Card>
  );
}
