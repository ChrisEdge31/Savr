import { BudgetDoc, GoalDoc, StatsDoc } from "@/lib/firebase/firestore";

export const BADGE_DEFS = {
  "first-budget": { label: "First Budget", icon: "📊", description: "Set up your first budget" },
  "on-track-3": { label: "On Track", icon: "🎯", description: "Stayed under budget 3 months in a row" },
  "goal-getter": { label: "Goal Getter", icon: "🏆", description: "Completed your first goal" },
  "streak-5": { label: "Streak Master", icon: "🔥", description: "5-month budget streak" },
  "century": { label: "Century", icon: "💯", description: "Reached 100 points" },
  "early-bird": { label: "Early Bird", icon: "⚡", description: "Completed a goal before its deadline" },
} as const;

export type BadgeId = keyof typeof BADGE_DEFS;

export function calcPointsForBudget(_budget: BudgetDoc | { income: number }, streak: number): number {
  let pts = 100;
  if (streak >= 3) pts += 25;
  return pts;
}

export function calcPointsForGoal(goal: GoalDoc): number {
  let pts = 50;
  if (goal.deadline && goal.completedAt) {
    const deadline = new Date(goal.deadline).getTime();
    if (goal.completedAt < deadline) pts += 25;
  }
  return pts;
}

export function checkBadges(stats: StatsDoc, event: "budget" | "goal"): BadgeId[] {
  const earned: BadgeId[] = [];
  const existing = new Set(stats.badges);

  if (event === "budget") {
    if (!existing.has("first-budget")) earned.push("first-budget");
    if (stats.currentBudgetStreak >= 3 && !existing.has("on-track-3")) earned.push("on-track-3");
    if (stats.currentBudgetStreak >= 5 && !existing.has("streak-5")) earned.push("streak-5");
  }
  if (event === "goal") {
    if (!existing.has("goal-getter")) earned.push("goal-getter");
  }
  if (stats.points >= 100 && !existing.has("century")) earned.push("century");

  return earned;
}
