"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/context/CurrencyContext";
import type { SavingsAccount } from "@/lib/firebase/firestore";
import {
	monthlyInterest,
	projectBalance,
	SAVINGS_TYPE_ICONS,
	SAVINGS_TYPE_LABELS,
} from "@/lib/utils/savings";
import { SavingsAccountForm } from "./SavingsAccountForm";

type Props = {
	account: SavingsAccount & { id: string };
	contributedThisYear: number;
	onUpdate: (id: string, data: Partial<SavingsAccount>) => Promise<void>;
	onRemove: (id: string) => void;
};

export function SavingsAccountCard({
	account,
	contributedThisYear,
	onUpdate,
	onRemove,
}: Props) {
	const { format } = useCurrency();
	const TypeIcon = SAVINGS_TYPE_ICONS[account.type];
	const interest = monthlyInterest(account.balance, account.interestRate);
	const inAYear = projectBalance(
		account.balance,
		account.interestRate,
		account.monthlyContribution,
		12,
	);
	const limit = account.annualLimit;
	const limitPct = limit
		? Math.min((contributedThisYear / limit) * 100, 100)
		: 0;
	const overLimit = limit !== null && contributedThisYear > limit;

	return (
		<Card className={account.active ? "" : "opacity-50"}>
			<CardContent className="pt-4 space-y-3">
				<div className="flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
						<TypeIcon className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<p className="font-medium truncate">{account.name}</p>
							<Badge variant="outline" className="text-xs shrink-0">
								{SAVINGS_TYPE_LABELS[account.type]}
							</Badge>
							{account.interestRate > 0 && (
								<Badge variant="secondary" className="text-xs shrink-0">
									{account.interestRate}% / yr
								</Badge>
							)}
						</div>
						<p className="text-xl font-bold leading-tight mt-1">
							{format(account.balance)}
						</p>
						<p className="text-xs text-muted-foreground">
							{format(account.monthlyContribution)} / month
							{interest > 0 && (
								<>
									{" "}
									· earning ~{format(Math.round(interest * 100) / 100)} / month
								</>
							)}
						</p>
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<Switch
							checked={account.active}
							onCheckedChange={(checked) =>
								onUpdate(account.id, { active: checked })
							}
							aria-label="Include in budget"
						/>
						<SavingsAccountForm
							account={account}
							onSubmit={(data) => onUpdate(account.id, data)}
							trigger={
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7"
									aria-label="Edit account"
								>
									<Pencil className="h-3.5 w-3.5" />
								</Button>
							}
						/>
						<Button
							size="icon"
							variant="ghost"
							className="h-7 w-7 text-muted-foreground hover:text-destructive"
							aria-label="Delete account"
							onClick={() => {
								if (
									confirm(
										`Delete "${account.name}"? Its balance and settings will be lost.`,
									)
								)
									onRemove(account.id);
							}}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>

				{limit !== null && (
					<div className="space-y-1">
						<Progress
							value={limitPct}
							className={overLimit ? "h-1.5 [&>div]:bg-destructive" : "h-1.5"}
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>
								{format(contributedThisYear)} of {format(limit)} contributed
								this year
							</span>
							<span className={overLimit ? "text-destructive font-medium" : ""}>
								{overLimit
									? `${format(contributedThisYear - limit)} over`
									: `${format(limit - contributedThisYear)} left`}
							</span>
						</div>
					</div>
				)}

				{(account.monthlyContribution > 0 || account.interestRate > 0) && (
					<p className="text-xs text-muted-foreground">
						Projected in 12 months:{" "}
						<span className="font-medium text-foreground">
							{format(Math.round(inAYear))}
						</span>
					</p>
				)}
			</CardContent>
		</Card>
	);
}
