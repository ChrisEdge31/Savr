"use client";

import { useState } from "react";
import { CheckCircle2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalDoc } from "@/lib/firebase/firestore";
import { GoalProgress } from "./GoalProgress";

type Props = {
  goal: GoalDoc & { id: string };
  onUpdate: (id: string, data: Partial<GoalDoc>) => void;
  onRemove: (id: string) => void;
  onComplete: (id: string) => void;
};

export function GoalCard({ goal, onUpdate, onRemove, onComplete }: Props) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(goal.currentAmount);

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
    : null;

  function handleSaveProgress() {
    onUpdate(goal.id, { currentAmount: amount });
    setEditing(false);
  }

  return (
    <Card className={goal.status === "completed" ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold">{goal.title}</p>
            <p className="text-xs text-muted-foreground">{goal.category}</p>
          </div>
          <div className="flex items-center gap-1">
            {goal.status === "completed" ? (
              <Badge variant="secondary" className="text-green-600">Completed</Badge>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-green-600"
                  onClick={() => onComplete(goal.id)}
                  title="Mark complete"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(goal.id)}
                  title="Delete goal"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <GoalProgress current={goal.currentAmount} target={goal.targetAmount} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Target: ${goal.targetAmount.toLocaleString()}</span>
          {daysLeft !== null && (
            <span className={daysLeft < 7 ? "text-destructive" : ""}>
              {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
            </span>
          )}
        </div>

        {goal.status === "active" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-muted-foreground"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
              Update progress
            </Button>
            {editing && (
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Current amount saved</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      min={0}
                      value={amount || ""}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="pl-7 h-8 text-sm"
                    />
                  </div>
                </div>
                <Button size="sm" className="h-8" onClick={handleSaveProgress}>Save</Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
