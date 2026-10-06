"use client";

import { Bug, Coins, DollarSign, LayoutGrid, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FrameworkPicker } from "@/components/budget/FrameworkPicker";
import { IncomeSourceCard } from "@/components/income/IncomeSourceCard";
import { IncomeSourceForm } from "@/components/income/IncomeSourceForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { logout, updateDisplayName } from "@/lib/firebase/auth";
import type { IncomeSource } from "@/lib/firebase/firestore";
import { useBudget } from "@/lib/hooks/useBudget";
import { useIncomeSources } from "@/lib/hooks/useIncomeSources";
import { useStats } from "@/lib/hooks/useStats";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import {
	CURRENCIES,
	type CurrencyCode,
	currencySymbol,
} from "@/lib/utils/currency";
import {
	currentMonthKey,
	monthKeyToLabel,
	nextMonthKey,
} from "@/lib/utils/dates";
import { FRAMEWORK_MAP } from "@/lib/utils/frameworks";

export default function SettingsPage() {
	const { format, currency, saveCurrency } = useCurrency();
	const { user } = useAuth();
	const router = useRouter();
	const [displayName, setDisplayName] = useState(user?.displayName ?? "");
	const [saving, setSaving] = useState(false);
	const [debugWorking, setDebugWorking] = useState(false);
	const {
		sources,
		loading,
		addSource,
		updateSource,
		removeSource,
		totalExpected,
	} = useIncomeSources(user?.uid);
	const { framework, saveFramework } = useUserProfile(user?.uid);
	const { stats, recordBudgetMonth, resetStats } = useStats(user?.uid);
	const { budget } = useBudget(user?.uid, currentMonthKey());

	async function handleSaveName(e: React.FormEvent) {
		e.preventDefault();
		if (!user || !displayName.trim()) return;
		setSaving(true);
		try {
			await updateDisplayName(user.uid, displayName.trim());
			toast.success("Display name updated.");
		} catch {
			toast.error("Failed to update name.");
		} finally {
			setSaving(false);
		}
	}

	async function handleLogout() {
		await logout();
		router.push("/auth/login");
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground text-sm">
					Manage your account and income sources
				</p>
			</div>

			{/* Income Sources */}
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle className="text-base flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Income Sources
							</CardTitle>
							<CardDescription className="mt-1">
								Add all your income streams. You&apos;ll be reminded to log
								actual income the day after each pay day.
							</CardDescription>
						</div>
						<IncomeSourceForm onAdd={addSource} />
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{loading ? (
						<p className="text-sm text-muted-foreground">Loading...</p>
					) : sources.length === 0 ? (
						<div className="text-center py-6 text-muted-foreground">
							<Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p className="text-sm font-medium">No income sources yet</p>
							<p className="text-xs">Add your salary, side hustles, and more</p>
						</div>
					) : (
						<>
							{sources.map((s) => (
								<IncomeSourceCard
									key={s.id}
									source={s as IncomeSource & { id: string }}
									onUpdate={updateSource}
									onRemove={removeSource}
								/>
							))}
							<div className="flex justify-between items-center pt-2 border-t text-sm font-medium">
								<span>Total expected monthly</span>
								<span>{format(totalExpected)}</span>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Budget Framework */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<LayoutGrid className="h-4 w-4" />
						Budget Framework
					</CardTitle>
					<CardDescription>
						Choose how you want to structure your budget. This will show on the
						leaderboard so others can see your approach.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FrameworkPicker
						value={framework}
						onChange={async (id) => {
							await saveFramework(id);
							toast.success(`Framework changed to ${FRAMEWORK_MAP[id].name}`);
						}}
					/>
				</CardContent>
			</Card>

			{/* Currency */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Coins className="h-4 w-4" />
						Currency
					</CardTitle>
					<CardDescription>
						How amounts are displayed throughout the app. Existing amounts are
						not converted.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Select
						value={currency}
						onValueChange={async (code) => {
							await saveCurrency(code as CurrencyCode);
							toast.success(`Currency changed to ${code}`);
						}}
					>
						<SelectTrigger className="w-full sm:w-72">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CURRENCIES.map((c) => (
								<SelectItem key={c.code} value={c.code}>
									{currencySymbol(c.code)} · {c.code} — {c.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{/* Profile */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Profile</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<Avatar className="h-14 w-14">
							<AvatarImage src={user?.photoURL ?? ""} />
							<AvatarFallback className="text-lg">
								{user?.displayName?.[0] ?? "U"}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-medium">{user?.displayName}</p>
							<p className="text-sm text-muted-foreground">{user?.email}</p>
						</div>
					</div>
					<Separator />
					<form onSubmit={handleSaveName} className="space-y-3">
						<div className="space-y-1">
							<Label htmlFor="name">Display name</Label>
							<Input
								id="name"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="Your name"
								required
							/>
							<p className="text-xs text-muted-foreground">
								This is the name shown on the leaderboard.
							</p>
						</div>
						<Button type="submit" disabled={saving} size="sm">
							{saving ? "Saving..." : "Save name"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/*
      Account 
			
      <Card>
				<CardHeader>
					<CardTitle className="text-base">Account</CardTitle>
				</CardHeader>
				<CardContent>
					<Button variant="destructive" onClick={handleLogout}>
						Sign out
					</Button>
				</CardContent>
			</Card>
      */}

			{/* Developer Tools */}
			<Card className="border-dashed border-muted-foreground/30">
				<CardHeader className="pb-2">
					<CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
						<Bug className="h-4 w-4" />
						Developer Tools
					</CardTitle>
					<CardDescription>Test the points and streak system</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-3 text-sm rounded-md bg-muted/50 p-3">
						<div>
							<p className="text-xs text-muted-foreground">Points</p>
							<p className="font-bold text-lg">{stats.points}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Budget streak</p>
							<p className="font-bold text-lg">
								{stats.currentBudgetStreak} months
							</p>
						</div>
						<div className="col-span-2">
							<p className="text-xs text-muted-foreground">
								Last recorded month
							</p>
							<p className="font-medium">
								{stats.lastRecordedMonth ? (
									monthKeyToLabel(stats.lastRecordedMonth)
								) : (
									<span className="text-muted-foreground italic">none yet</span>
								)}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Button
							variant="outline"
							size="sm"
							className="w-full h-auto whitespace-normal py-2"
							disabled={debugWorking}
							onClick={async () => {
								setDebugWorking(true);
								try {
									const nextKey = nextMonthKey(
										stats.lastRecordedMonth ?? currentMonthKey(),
									);
									// Use real budget data if available, otherwise a dummy on-budget month
									const fakeBudget = budget
										? {
												income: budget.income || 1000,
												expenses: budget.expenses,
												updatedAt: Date.now(),
											}
										: { income: 1000, expenses: [], updatedAt: Date.now() };
									await recordBudgetMonth(fakeBudget, nextKey);
									toast.success(`Simulated ${monthKeyToLabel(nextKey)}`);
								} finally {
									setDebugWorking(false);
								}
							}}
						>
							Simulate next month (advance streak)
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="w-full h-auto whitespace-normal py-2 text-destructive hover:text-destructive"
							disabled={debugWorking}
							onClick={async () => {
								setDebugWorking(true);
								try {
									await resetStats();
									toast.success("Stats reset to zero");
								} finally {
									setDebugWorking(false);
								}
							}}
						>
							Reset stats to zero
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
