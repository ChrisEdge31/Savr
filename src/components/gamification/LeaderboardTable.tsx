"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flame, Star } from "lucide-react";
import { RankedEntry } from "@/lib/hooks/useLeaderboard";
import { cn } from "@/lib/utils";
import { FRAMEWORK_MAP } from "@/lib/utils/frameworks";

type Props = {
  entries: RankedEntry[];
  currentUid?: string;
};

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-zinc-400",
  3: "text-amber-600",
};

const RANK_LABELS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardTable({ entries, currentUid }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-4xl mb-3">🏆</p>
        <p className="font-medium">No one on the leaderboard yet</p>
        <p className="text-sm">Save your budget to earn points and appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.uid}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
            entry.uid === currentUid && "border-primary bg-primary/5"
          )}
        >
          <span className={cn("w-7 text-center text-lg font-bold shrink-0", RANK_STYLES[entry.rank])}>
            {RANK_LABELS[entry.rank] ?? entry.rank}
          </span>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={entry.avatarUrl} />
            <AvatarFallback>{entry.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {entry.displayName}
              {entry.uid === currentUid && (
                <Badge variant="outline" className="ml-2 text-xs py-0">You</Badge>
              )}
            </p>
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {entry.currentBudgetStreak}mo streak
              </span>
              {entry.budgetFramework && FRAMEWORK_MAP[entry.budgetFramework as keyof typeof FRAMEWORK_MAP] && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 gap-0.5">
                  <span>{FRAMEWORK_MAP[entry.budgetFramework as keyof typeof FRAMEWORK_MAP].emoji}</span>
                  {FRAMEWORK_MAP[entry.budgetFramework as keyof typeof FRAMEWORK_MAP].name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 font-bold text-sm shrink-0">
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
            {entry.points.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
