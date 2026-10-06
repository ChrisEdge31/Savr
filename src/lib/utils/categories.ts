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
  "Housing": "hsl(12 76% 61%)",
  "Transportation": "hsl(32 95% 52%)",
  "Food & Dining": "hsl(48 96% 50%)",
  "Utilities": "hsl(173 58% 39%)",
  "Healthcare": "hsl(350 80% 58%)",
  "Entertainment": "hsl(221 83% 53%)",
  "Shopping": "hsl(262 83% 58%)",
  "Education": "hsl(316 72% 50%)",
  "Savings": "hsl(142 71% 45%)",
  "Other": "hsl(215 14% 55%)",
};
