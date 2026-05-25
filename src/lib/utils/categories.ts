export const EXPENSE_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food & Dining",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Shopping",
  "Education",
  "Savings",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const GOAL_CATEGORIES = [
  "Emergency Fund",
  "Vacation",
  "Home",
  "Vehicle",
  "Education",
  "Investment",
  "Debt Payoff",
  "Other",
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  "Housing": "hsl(var(--chart-1))",
  "Transportation": "hsl(var(--chart-2))",
  "Food & Dining": "hsl(var(--chart-3))",
  "Utilities": "hsl(var(--chart-4))",
  "Healthcare": "hsl(var(--chart-5))",
  "Entertainment": "hsl(221 83% 53%)",
  "Shopping": "hsl(262 83% 58%)",
  "Education": "hsl(316 72% 50%)",
  "Savings": "hsl(142 71% 45%)",
  "Other": "hsl(var(--muted-foreground))",
};
