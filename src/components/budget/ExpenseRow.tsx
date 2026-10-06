"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExpenseItem } from "@/lib/firebase/firestore";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/utils/categories";

type Props = {
	expense: ExpenseItem;
	onChange: (updated: ExpenseItem) => void;
	onRemove: () => void;
	disabled?: boolean;
};

export function ExpenseRow({ expense, onChange, onRemove, disabled }: Props) {
	return (
		// [toggle][label][delete] on the first line, category + amount below — the budget column is too narrow for one row.
		<div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border border-border bg-muted/30 p-3 transition-colors focus-within:border-primary/40 px-4">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={() =>
								!disabled &&
								onChange({ ...expense, recurring: !expense.recurring })
							}
							disabled={disabled}
							className={cn(
								"shrink-0 rounded p-1.5 transition-colors",
								expense.recurring
									? "text-primary bg-primary/10 hover:bg-primary/20"
									: "text-muted-foreground hover:bg-muted",
								disabled && "pointer-events-none opacity-50",
							)}
						>
							<RefreshCw className="h-3.5 w-3.5" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">
						{expense.recurring
							? "Recurring — carries over each month"
							: "Once-off — this month only"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<Input
				placeholder="Label (e.g. Rent)"
				value={expense.label}
				onChange={(e) => onChange({ ...expense, label: e.target.value })}
				className="min-w-0"
				disabled={disabled}
			/>
			<div className="col-span-3 row-start-2 grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
				<Select
					value={expense.category}
					onValueChange={(v) => onChange({ ...expense, category: v })}
					disabled={disabled}
				>
					<SelectTrigger className="w-full min-w-0 *:data-[slot=select-value]:truncate">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						{EXPENSE_CATEGORIES.map((c) => (
							<SelectItem key={c} value={c}>
								{c}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Input
					type="number"
					placeholder="Amount"
					min={0}
					value={expense.amount || ""}
					onChange={(e) =>
						onChange({ ...expense, amount: parseFloat(e.target.value) || 0 })
					}
					className="w-full"
					disabled={disabled}
				/>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onClick={onRemove}
				disabled={disabled}
				className="col-start-3 row-start-1 text-muted-foreground hover:text-destructive shrink-0"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
