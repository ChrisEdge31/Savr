"use client";

import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";

type Props = {
  current: number;
  target: number;
};

export function GoalProgress({ current, target }: Props) {
  const { format } = useCurrency();
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <Progress value={pct} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(current)} saved</span>
        <span>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
