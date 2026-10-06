export const FRAMEWORK_IDS = [
	"50-30-20",
	"zero-based",
	"pay-yourself-first",
	"envelope",
] as const;
export type BudgetFrameworkId = (typeof FRAMEWORK_IDS)[number];

export type FrameworkAllocation = {
	label: string;
	pct: number; // target percentage of income
	color: string; // tailwind bg class
	categories: string[]; // expense category names that belong here
};

export type BudgetFramework = {
	id: BudgetFrameworkId;
	name: string;
	split: string;
	bestFor: string;
	description: string;
	allocations: FrameworkAllocation[];
};

export const FRAMEWORKS: BudgetFramework[] = [
	{
		id: "50-30-20",
		name: "50/30/20",
		split: "Needs / Wants / Savings",
		bestFor: "Beginners",
		description:
			"Split your income into 50% needs, 30% wants, and 20% savings. Simple and flexible.",
		allocations: [
			{
				label: "Needs",
				pct: 50,
				color: "bg-blue-500",
				categories: ["Housing", "Transportation", "Utilities", "Healthcare"],
			},
			{
				label: "Wants",
				pct: 30,
				color: "bg-purple-500",
				categories: ["Food & Dining", "Entertainment", "Shopping"],
			},
			{
				label: "Savings",
				pct: 20,
				color: "bg-green-500",
				categories: ["Savings", "Education"],
			},
		],
	},
	{
		id: "zero-based",
		name: "Zero-Based",
		split: "Every rand allocated",
		bestFor: "Detail-oriented people",
		description:
			"Assign every rand of income to a category. Income minus all allocations equals zero.",
		allocations: [
			{
				label: "Allocated",
				pct: 100,
				color: "bg-orange-500",
				categories: [],
			},
		],
	},
	{
		id: "pay-yourself-first",
		name: "Pay Yourself First",
		split: "Savings out immediately",
		bestFor: "Impulse spenders",
		description:
			"Move savings and investments out first. Spend the rest however you like.",
		allocations: [
			{
				label: "Savings first",
				pct: 20,
				color: "bg-green-500",
				categories: ["Savings"],
			},
			{
				label: "Live on the rest",
				pct: 80,
				color: "bg-slate-400",
				categories: [],
			},
		],
	},
	{
		id: "envelope",
		name: "Envelope Method",
		split: "Cash per category",
		bestFor: "Overspenders",
		description:
			"Set a hard limit for each spending category. When the envelope is empty, stop spending.",
		allocations: [
			{
				label: "Per envelope",
				pct: 100,
				color: "bg-amber-500",
				categories: [],
			},
		],
	},
];

export const FRAMEWORK_MAP = Object.fromEntries(
	FRAMEWORKS.map((f) => [f.id, f]),
) as Record<BudgetFrameworkId, BudgetFramework>;

export const DEFAULT_FRAMEWORK: BudgetFrameworkId = "50-30-20";

/** Given a framework and income, compute target dollar amounts per allocation bucket. */
export function getAllocationTargets(
	framework: BudgetFramework,
	income: number,
): Array<FrameworkAllocation & { target: number }> {
	return framework.allocations.map((a) => ({
		...a,
		target: Math.round((income * a.pct) / 100),
	}));
}

/** Sum expenses by framework bucket. Goal contribution expenses (goalId set) have category "Savings" and route naturally. */
export function sumByAllocation(
	allocations: FrameworkAllocation[],
	expenses: { category: string; amount: number }[],
): Record<string, number> {
	const result: Record<string, number> = {};
	for (const a of allocations) {
		result[a.label] = 0;
	}
	const catchAll =
		allocations.find((a) => a.categories.length === 0) ??
		allocations[allocations.length - 1];

	for (const expense of expenses) {
		const bucket =
			allocations.find((a) => a.categories.includes(expense.category)) ??
			catchAll;
		result[bucket.label] = (result[bucket.label] ?? 0) + expense.amount;
	}

	return result;
}
