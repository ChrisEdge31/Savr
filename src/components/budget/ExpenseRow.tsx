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
		<div className="flex gap-2 items-center">
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
				className="flex-1"
				disabled={disabled}
			/>
			<Select
				value={expense.category}
				onValueChange={(v) => onChange({ ...expense, category: v })}
				disabled={disabled}
			>
				<SelectTrigger className="w-40">
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
				className="w-28"
				disabled={disabled}
			/>
			<Button
				variant="ghost"
				size="icon"
				onClick={onRemove}
				disabled={disabled}
				className="text-muted-foreground hover:text-destructive shrink-0"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}
