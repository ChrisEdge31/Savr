import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  streak: number;
  label?: string;
  className?: string;
};

export function StreakCounter({ streak, label = "Budget streak", className }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Flame className={cn("h-5 w-5", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
      <div>
        <p className="text-2xl font-bold leading-none">{streak}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
