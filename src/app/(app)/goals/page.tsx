"use client";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/lib/hooks/useGoals";
import { useStats } from "@/lib/hooks/useStats";
import { GoalDoc } from "@/lib/firebase/firestore";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GoalsPage() {
  const { user } = useAuth();
  const { goals, loading, addGoal, updateGoal, removeGoal } = useGoals(user?.uid);
  const { recordGoalComplete } = useStats(user?.uid);

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");

  async function handleComplete(id: string) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const now = Date.now();
    await updateGoal(id, { status: "completed", completedAt: now });
    await recordGoalComplete({ ...goal, completedAt: now });
    toast.success("Goal completed! Points awarded.");
  }

  async function handleAdd(data: Omit<GoalDoc, "id" | "createdAt" | "status">) {
    await addGoal(data);
    toast.success("Goal created!");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-muted-foreground text-sm">Track what you&apos;re saving towards</p>
        </div>
        <GoalForm onAdd={handleAdd} />
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            {active.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-3">🎯</p>
                <p className="font-medium">No active goals</p>
                <p className="text-sm">Create your first goal to start earning points</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {active.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g as GoalDoc & { id: string }}
                    onUpdate={updateGoal}
                    onRemove={removeGoal}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            {completed.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No completed goals yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {completed.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g as GoalDoc & { id: string }}
                    onUpdate={updateGoal}
                    onRemove={removeGoal}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
