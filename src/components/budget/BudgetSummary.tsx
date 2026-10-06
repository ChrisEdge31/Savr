"use client";

import { Landmark, PiggyBank, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";
import type { ExpenseItem } from "@/lib/firebase/firestore";
import { CATEGORY_COLORS } from "@/lib/utils/categories";

type Props = {
	income: number;
	expenses: ExpenseItem[];
	savings: number; // total, including account contributions
	accountRows?: { id: string; label: string; amount: number }[];
};

export function BudgetSummary({
	income,
	expenses,
	savings,
	accountRows = [],
}: Props) {
	const { format } = useCurrency();
	const accountTotal = accountRows.reduce((s, r) => s + r.amount, 0);
	const generalSavings = savings - accountTotal;
	const goalRows = expenses.filter((e) => e.goalId);
	const regularRows = expenses.filter((e) => !e.goalId);

	const total = expenses.reduce((s, e) => s + e.amount, 0) + savings;
	const remaining = income - total;
	const pct = income > 0 ? Math.min((total / income) * 100, 100) : 0;

	const grouped = regularRows.reduce<Record<string, number>>((acc, e) => {
		acc[e.category] = (acc[e.category] ?? 0) + e.amount;
		return acc;
	}, {});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Budget Summary</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Total allocated</span>
					<span className="font-medium">{format(total)}</span>
				</div>
				<Progress value={pct} className="h-2" />
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Income</span>
					<span className="font-medium">{format(income)}</span>
				</div>
				<div className="flex justify-between text-sm font-medium">
					<span>Remaining</span>
					<span
						className={remaining < 0 ? "text-destructive" : "text-green-600"}
					>
						{format(remaining)}
					</span>
				</div>

				{Object.entries(grouped).length > 0 && (
					<div className="pt-2 space-y-2">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							By category
						</p>
						{Object.entries(grouped).map(([cat, amt]) => (
							<div key={cat} className="flex items-center gap-2 text-sm">
								<span
									className="w-2.5 h-2.5 rounded-full shrink-0"
									style={{
										background:
											CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other,
									}}
								/>
								<span className="flex-1 text-muted-foreground">{cat}</span>
								<span className="font-medium">{format(amt)}</span>
							</div>
						))}
					</div>
				)}

				{(savings > 0 || goalRows.length > 0) && (
					<div className="pt-2 space-y-2">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Savings
						</p>
						{accountRows
							.filter((r) => r.amount > 0)
							.map((r) => (
								<div key={r.id} className="flex items-center gap-2 text-sm">
									<Landmark className="w-2.5 h-2.5 text-blue-500 shrink-0" />
									<span className="flex-1 text-muted-foreground truncate">
										{r.label}
									</span>
									<span className="font-medium">{format(r.amount)}</span>
								</div>
							))}
						{generalSavings > 0 && (
							<div className="flex items-center gap-2 text-sm">
								<PiggyBank className="w-2.5 h-2.5 text-blue-500 shrink-0" />
								<span className="flex-1 text-muted-foreground">
									General savings
								</span>
								<span className="font-medium">{format(generalSavings)}</span>
							</div>
						)}
						{goalRows.map((g) => (
							<div key={g.id} className="flex items-center gap-2 text-sm">
								<Target className="w-2.5 h-2.5 text-green-600 shrink-0" />
								<span className="flex-1 text-muted-foreground truncate">
									{g.label}
								</span>
								<span className="font-medium">{format(g.amount)}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
