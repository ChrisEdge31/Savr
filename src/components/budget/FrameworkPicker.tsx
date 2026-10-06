"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type BudgetFrameworkId, FRAMEWORKS } from "@/lib/utils/frameworks";

type Props = {
	value: BudgetFrameworkId;
	onChange: (id: BudgetFrameworkId) => void;
};

export function FrameworkPicker({ value, onChange }: Props) {
	return (
		<div className="grid sm:grid-cols-2 gap-3">
			{FRAMEWORKS.map((f) => {
				const selected = value === f.id;
				return (
					<button
						key={f.id}
						type="button"
						onClick={() => onChange(f.id)}
						className={cn(
							"relative text-left rounded-lg border p-4 transition-all",
							"hover:border-primary/60 hover:bg-accent/50",
							selected
								? "border-primary bg-primary/5 ring-1 ring-primary"
								: "border-border bg-card",
						)}
					>
						{selected && (
							<CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary" />
						)}
						<div className="flex items-center gap-2 mb-2">
							<span className="font-semibold text-sm">{f.name}</span>
						</div>
						<p className="text-xs text-muted-foreground mb-2">
							{f.description}
						</p>
						<div className="flex flex-wrap gap-1.5">
							<Badge variant="secondary" className="text-xs">
								{f.split}
							</Badge>
							<Badge variant="outline" className="text-xs">
								Best for: {f.bestFor}
							</Badge>
						</div>
					</button>
				);
			})}
		</div>
	);
}
