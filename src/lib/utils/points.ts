import { GoalDoc } from "@/lib/firebase/firestore";

/** +50 base + 10 per streak month (rewards consistency over time) */
export function calcPointsForBudget(streak: number): number {
  return 50 + streak * 10;
}

/** +1 point per whole percentage point of savings rate, capped at 50 */
export function calcPointsForSavings(savingsRate: number): number {
  return Math.min(Math.floor(savingsRate), 50);
}

/** +20 base, +10 if completed before deadline */
export function calcPointsForGoal(goal: GoalDoc): number {
  let pts = 20;
  if (goal.deadline && goal.completedAt) {
    if (goal.completedAt < new Date(goal.deadline).getTime()) pts += 10;
  }
  return pts;
}
