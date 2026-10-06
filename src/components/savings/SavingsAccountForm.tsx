"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/CurrencyContext";
import {
	SAVINGS_ACCOUNT_TYPES,
	type SavingsAccount,
} from "@/lib/firebase/firestore";
import { SAVINGS_TYPE_ICONS, SAVINGS_TYPE_LABELS } from "@/lib/utils/savings";

type AccountInput = Omit<SavingsAccount, "id" | "createdAt" | "active">;

type Props = {
	/** When set, the form edits this account instead of creating a new one. */
	account?: SavingsAccount;
	onSubmit: (data: AccountInput) => Promise<void>;
	trigger?: React.ReactNode;
};

function toField(n: number | null | undefined) {
	return n ? String(n) : "";
}

export function SavingsAccountForm({ account, onSubmit, trigger }: Props) {
	const { symbol, inputPadClass } = useCurrency();
	const isEdit = !!account;
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(account?.name ?? "");
	const [type, setType] = useState<SavingsAccount["type"]>(
		account?.type ?? "tfsa",
	);
	const [balance, setBalance] = useState(toField(account?.balance));
	const [interestRate, setInterestRate] = useState(
		toField(account?.interestRate),
	);
	const [monthlyContribution, setMonthlyContribution] = useState(
		toField(account?.monthlyContribution),
	);
	const [annualLimit, setAnnualLimit] = useState(toField(account?.annualLimit));
	const [saving, setSaving] = useState(false);

	function reset() {
		setName(account?.name ?? "");
		setType(account?.type ?? "tfsa");
		setBalance(toField(account?.balance));
		setInterestRate(toField(account?.interestRate));
		setMonthlyContribution(toField(account?.monthlyContribution));
		setAnnualLimit(toField(account?.annualLimit));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		setSaving(true);
		try {
			await onSubmit({
				name: name.trim(),
				type,
				balance: parseFloat(balance) || 0,
				interestRate: Math.max(0, parseFloat(interestRate) || 0),
				monthlyContribution: Math.max(0, parseFloat(monthlyContribution) || 0),
				annualLimit:
					parseFloat(annualLimit) > 0 ? parseFloat(annualLimit) : null,
			});
			if (!isEdit) reset();
			setOpen(false);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (o) reset();
			}}
		>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button size="sm">
						<Plus className="h-4 w-4 mr-1" />
						Add Account
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Savings Account" : "Add Savings Account"}
					</DialogTitle>
					<DialogDescription>
						The monthly contribution is pre-filled into each month&apos;s
						budget, and the balance updates when you save it.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label htmlFor="account-name">Name</Label>
							<Input
								id="account-name"
								placeholder="e.g. My TFSA"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-1">
							<Label>Type</Label>
							<Select
								value={type}
								onValueChange={(v) => setType(v as SavingsAccount["type"])}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SAVINGS_ACCOUNT_TYPES.map((t) => {
										const Icon = SAVINGS_TYPE_ICONS[t];
										return (
											<SelectItem key={t} value={t}>
												<Icon className="h-4 w-4 text-muted-foreground" />
												{SAVINGS_TYPE_LABELS[t]}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label htmlFor="account-balance">Current balance</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									{symbol}
								</span>
								<Input
									id="account-balance"
									type="number"
									min={0}
									step="0.01"
									placeholder="0"
									value={balance}
									onChange={(e) => setBalance(e.target.value)}
									className={inputPadClass}
								/>
							</div>
						</div>
						<div className="space-y-1">
							<Label htmlFor="account-rate">Interest rate</Label>
							<div className="relative">
								<Input
									id="account-rate"
									type="number"
									min={0}
									step="0.01"
									placeholder="0"
									value={interestRate}
									onChange={(e) => setInterestRate(e.target.value)}
									className="pr-16"
								/>
								<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
									% / year
								</span>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<Label htmlFor="account-monthly">Monthly contribution</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									{symbol}
								</span>
								<Input
									id="account-monthly"
									type="number"
									min={0}
									placeholder="0"
									value={monthlyContribution}
									onChange={(e) => setMonthlyContribution(e.target.value)}
									className={inputPadClass}
								/>
							</div>
						</div>
						<div className="space-y-1">
							<Label htmlFor="account-limit">Yearly limit</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									{symbol}
								</span>
								<Input
									id="account-limit"
									type="number"
									min={0}
									placeholder="No limit"
									value={annualLimit}
									onChange={(e) => setAnnualLimit(e.target.value)}
									className={inputPadClass}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								Contribution room for this calendar year
							</p>
						</div>
					</div>
					<div className="flex gap-3 pt-1">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" className="flex-1" disabled={saving}>
							{saving ? "Saving..." : isEdit ? "Save Changes" : "Add Account"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
