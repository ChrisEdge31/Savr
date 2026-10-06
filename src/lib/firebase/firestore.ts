import { getFirestore, collection, doc, CollectionReference, DocumentReference, type Firestore } from "firebase/firestore";
import { app } from "./config";

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) _db = getFirestore(app);
  return _db;
}

export type ExpenseItem = {
  id: string;
  label: string;
  category: string;
  amount: number;
  recurring: boolean;
  goalId?: string; // set when this expense is a goal contribution
};

export type SavingsAllocation = {
  accountId: string;
  amount: number;
};

export type BudgetDoc = {
  income: number;
  expenses: ExpenseItem[];
  savings: number; // total set aside: general savings + all savingsAllocations
  savingsAllocations?: SavingsAllocation[];
  updatedAt: number;
};

export type GoalDoc = {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  status: "active" | "completed" | "abandoned";
  createdAt: number;
  completedAt?: number;
};

export type StatsDoc = {
  points: number;
  currentBudgetStreak: number;
  longestBudgetStreak: number;
  currentGoalStreak: number;
  badges: string[];
  lastUpdated: number;
  lastRecordedMonth?: string; // YYYY-MM — prevents double-counting on re-saves
};

export type LeaderboardEntry = {
  displayName: string;
  avatarUrl: string;
  points: number;
  currentBudgetStreak: number;
  longestBudgetStreak: number;
  badges: string[];
  budgetFramework?: string;
  updatedAt: number;
};

export type UserDoc = {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: number;
  budgetFramework?: string;
  currency?: string;
  onboardingCompleted?: boolean;
};

export const INCOME_SOURCE_TYPES = ["salary", "freelance", "rental", "investment", "other"] as const;
export type IncomeSourceType = (typeof INCOME_SOURCE_TYPES)[number];

export type IncomeSource = {
  id?: string;
  name: string;
  type: IncomeSourceType;
  expectedAmount: number;
  payDay: number; // 1-31, day of month
  active: boolean;
  createdAt: number;
};

export const SAVINGS_ACCOUNT_TYPES = ["tfsa", "rrsp", "fhsa", "hysa", "emergency", "brokerage", "other"] as const;
export type SavingsAccountType = (typeof SAVINGS_ACCOUNT_TYPES)[number];

export type SavingsAccount = {
  id?: string;
  name: string;
  type: SavingsAccountType;
  balance: number;
  interestRate: number; // annual %, 0 if none
  annualLimit: number | null; // max contributions per calendar year, null = no limit
  monthlyContribution: number; // default amount pre-filled into each new month's budget
  active: boolean;
  createdAt: number;
};

export type IncomeLog = {
  sourceId: string;
  sourceName: string;
  actualAmount: number;
  month: string; // YYYY-MM
  recordedAt: number;
};

// Typed collection helpers — each calls getDb() lazily at call time (client-only)
export const usersCol = () => collection(getDb(), "users") as CollectionReference<UserDoc>;
export const userDoc = (uid: string) => doc(getDb(), "users", uid) as DocumentReference<UserDoc>;
export const budgetDoc = (uid: string, monthKey: string) =>
  doc(getDb(), "users", uid, "budgets", monthKey) as DocumentReference<BudgetDoc>;
export const goalsCol = (uid: string) =>
  collection(getDb(), "users", uid, "goals") as CollectionReference<GoalDoc>;
export const goalDoc = (uid: string, goalId: string) =>
  doc(getDb(), "users", uid, "goals", goalId) as DocumentReference<GoalDoc>;
export const statsDoc = (uid: string) =>
  doc(getDb(), "users", uid, "stats", "main") as DocumentReference<StatsDoc>;
export const leaderboardDoc = (uid: string) =>
  doc(getDb(), "leaderboard", uid) as DocumentReference<LeaderboardEntry>;
export const leaderboardCol = () =>
  collection(getDb(), "leaderboard") as CollectionReference<LeaderboardEntry>;
export const incomeSourcesCol = (uid: string) =>
  collection(getDb(), "users", uid, "incomeSources") as CollectionReference<IncomeSource>;
export const incomeSourceDoc = (uid: string, sourceId: string) =>
  doc(getDb(), "users", uid, "incomeSources", sourceId) as DocumentReference<IncomeSource>;
// Income log doc ID is deterministic: YYYY-MM_sourceId
export const incomeLogDoc = (uid: string, month: string, sourceId: string) =>
  doc(getDb(), "users", uid, "incomeLogs", `${month}_${sourceId}`) as DocumentReference<IncomeLog>;
export const incomeLogsCol = (uid: string) =>
  collection(getDb(), "users", uid, "incomeLogs") as CollectionReference<IncomeLog>;
export const savingsAccountsCol = (uid: string) =>
  collection(getDb(), "users", uid, "savingsAccounts") as CollectionReference<SavingsAccount>;
export const savingsAccountDoc = (uid: string, accountId: string) =>
  doc(getDb(), "users", uid, "savingsAccounts", accountId) as DocumentReference<SavingsAccount>;
