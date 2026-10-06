"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";
import type { ExpenseItem } from "@/lib/firebase/firestore";
import { cn } from "@/lib/utils";
import {
	type BudgetFramework,
	getAllocationTargets,
	sumByAllocation,
} from "@/lib/utils/frameworks";

type Props = {
	framework: BudgetFramework;
	income: number;
	expenses: ExpenseItem[];
	savings: number;
};

export function FrameworkGuide({
	framework,
	income,
	expenses,
	savings,
}: Props) {
	const { format } = useCurrency();
	if (income === 0) return null;

	// Treat general savings as a virtual "Savings" expense so it routes into the right bucket
	const allItems = [
		...expenses,
		...(savings > 0 ? [{ category: "Savings", amount: savings }] : []),
	];

	const targets = getAllocationTargets(framework, income);
	const actuals = sumByAllocation(framework.allocations, allItems);

	const isZeroBased = framework.id === "zero-based";
	const totalSpend = expenses.reduce((s, e) => s + e.amount, 0) + savings;
	const unallocated = income - totalSpend;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base flex items-center gap-2">
					{framework.name} Targets
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isZeroBased ? (
					// Zero-based: show single unallocated remaining bar
					<div className="space-y-1.5">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Unallocated</span>
							<span
								className={cn(
									"font-medium",
									unallocated < 0
										? "text-destructive"
										: unallocated === 0
											? "text-green-600"
											: "",
								)}
							>
								{format(Math.abs(unallocated))}
								{unallocated < 0 ? " over" : unallocated === 0 ? " balanced" : " left"}
							</span>
						</div>
						<Progress
							value={Math.min((totalSpend / income) * 100, 100)}
							className="h-2"
						/>
						<p className="text-xs text-muted-foreground">
							Allocate all {format(income)} of your income to reach zero.
						</p>
					</div>
				) : (
					// All other frameworks: show per-allocation bars
					targets.map((allocation) => {
						const actual = actuals[allocation.label] ?? 0;
						const pct =
							allocation.target > 0
								? Math.min((actual / allocation.target) * 100, 100)
								: 0;
						const over = actual > allocation.target;

						return (
							<div key={allocation.label} className="space-y-1.5">
								<div className="flex justify-between items-baseline">
									<div className="flex items-center gap-1.5">
										<span
											className={cn(
												"w-2 h-2 rounded-full shrink-0",
												allocation.color,
											)}
										/>
										<span className="text-sm font-medium">
											{allocation.label}
										</span>
										<span className="text-xs text-muted-foreground">
											({allocation.pct}%)
										</span>
									</div>
									<div className="text-xs text-right">
										<span
											className={cn(
												"font-medium",
												over ? "text-destructive" : "",
											)}
										>
											{format(actual)}
										</span>
										<span className="text-muted-foreground">
											{" "}
											/ {format(allocation.target)}
										</span>
									</div>
								</div>
								<Progress
									value={pct}
									className={cn(
										"h-1.5",
										over
											? "[&>div]:bg-destructive"
											: `[&>div]:${allocation.color}`,
									)}
								/>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
