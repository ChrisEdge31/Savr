import {
	Home,
	Landmark,
	LifeBuoy,
	type LucideIcon,
	ShieldCheck,
	Sunset,
	TrendingUp,
	Wallet,
} from "lucide-react";
import type {
	SavingsAccountType,
	SavingsAllocation,
} from "@/lib/firebase/firestore";

export const SAVINGS_TYPE_LABELS: Record<SavingsAccountType, string> = {
	tfsa: "TFSA",
	rrsp: "RRSP",
	fhsa: "FHSA",
	hysa: "High-Interest Savings",
	emergency: "Emergency Fund",
	brokerage: "Brokerage / Investments",
	other: "Other",
};

export const SAVINGS_TYPE_ICONS: Record<SavingsAccountType, LucideIcon> = {
	tfsa: ShieldCheck,
	rrsp: Sunset,
	fhsa: Home,
	hysa: Landmark,
	emergency: LifeBuoy,
	brokerage: TrendingUp,
	other: Wallet,
};

export function sumAllocations(
	allocations: SavingsAllocation[] | undefined,
): number {
	return (allocations ?? []).reduce((s, a) => s + a.amount, 0);
}

/** Interest earned in one month at the given annual rate (%). */
export function monthlyInterest(balance: number, annualRate: number): number {
	return balance * (annualRate / 100 / 12);
}

/** Balance after `months` of monthly compounding plus a fixed contribution at the end of each month. */
export function projectBalance(
	balance: number,
	annualRate: number,
	monthlyContribution: number,
	months: number,
): number {
	const r = annualRate / 100 / 12;
	if (r === 0) return balance + monthlyContribution * months;
	const growth = (1 + r) ** months;
	return balance * growth + monthlyContribution * ((growth - 1) / r);
}
