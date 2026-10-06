"use client";

import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/lib/hooks/useLeaderboard";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";
import { PointsBadge } from "@/components/gamification/PointsBadge";
import { useStats } from "@/lib/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { entries, loading } = useLeaderboard(50);
  const { stats } = useStats(user?.uid);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Compete without exposing financials</p>
        </div>
        <PointsBadge points={stats.points} />
      </div>

      <Card className="border-dashed">
        <CardContent className="flex gap-3 items-start pt-4">
          <Shield className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Your income and expense details are <strong className="text-foreground">never shared</strong>.
            Only your display name, points, and streak are visible to others.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All-Time Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">Loading...</div>
          ) : (
            <LeaderboardTable entries={entries} currentUid={user?.uid} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
