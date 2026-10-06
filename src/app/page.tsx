import {
	ArrowRight,
	Bell,
	CalendarRange,
	EyeOff,
	Flame,
	Landmark,
	LayoutGrid,
	PiggyBank,
	ShieldCheck,
	Star,
	Target,
	Trophy,
	Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCta } from "@/components/marketing/AuthCta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_COLORS } from "@/lib/utils/categories";
import { type CurrencyCode, formatMoney } from "@/lib/utils/currency";

export const metadata: Metadata = {
	title: "Savr — Budget Smarter, Compete Together",
	description:
		"Plan every month, grow your savings and climb a leaderboard with friends — without ever sharing your numbers.",
};

// Currency used in the illustrative product mockups
const MOCK_CURRENCY: CurrencyCode = "ZAR";
const money = (n: number) => formatMoney(n, MOCK_CURRENCY);

const FEATURES = [
	{
		icon: CalendarRange,
		title: "Monthly budgets",
		body: "Recurring expenses carry over automatically, once-offs stay put. Start each month already half done.",
	},
	{
		icon: LayoutGrid,
		title: "Proven frameworks",
		body: "Pick 50/30/20, Zero-Based, Pay Yourself First or the Envelope Method and see how your plan stacks up.",
	},
	{
		icon: Landmark,
		title: "Savings accounts",
		body: "Track your TFSA, emergency fund and investments with interest rates, monthly contributions and yearly limits.",
	},
	{
		icon: Target,
		title: "Goals with deadlines",
		body: "Set a target, fund it from your budget each month and watch the progress bar fill. Finish early for bonus points.",
	},
	{
		icon: Bell,
		title: "Payday reminders",
		body: "Add your income sources and Savr nudges you to log what actually landed, so your budget stays honest.",
	},
	{
		icon: Trophy,
		title: "Points and streaks",
		body: "Stay on budget to build a streak. The longer it runs, the more every month is worth.",
	},
];

const STEPS = [
	{
		title: "Add your income",
		body: "Salary, side hustles, rental income. Savr pre-fills your budget from them every month.",
	},
	{
		title: "Plan the month",
		body: "Allocate to expenses, savings accounts and goals until every amount has a job.",
	},
	{
		title: "Stay on track",
		body: "Finish the month on budget to earn points, grow your streak and move up the leaderboard.",
	},
];

export default function LandingPage() {
	return (
		<div className="landing-page flex flex-col min-h-screen">
			{/* Nav */}
			<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
				<div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
					<Link
						href="/"
						className="flex items-center gap-2 font-bold tracking-tight"
					>
						<span className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
							<PiggyBank className="h-4 w-4" />
						</span>
						Savr
					</Link>
					<nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-muted-foreground">
						<a
							href="#features"
							className="hover:text-foreground transition-colors"
						>
							Features
						</a>
						<a
							href="#how-it-works"
							className="hover:text-foreground transition-colors"
						>
							How it works
						</a>
						<a
							href="#privacy"
							className="hover:text-foreground transition-colors"
						>
							Privacy
						</a>
					</nav>
					<AuthCta variant="nav" />
				</div>
			</header>

			<main className="flex-1">
				{/* Hero */}
				<section className="relative overflow-hidden border-b">
					<div
						aria-hidden
						className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]"
					/>
					<div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<Badge variant="outline" className="gap-1.5">
								<Flame className="h-3 w-3 text-orange-500" />
								Budgeting with a scoreboard
							</Badge>
							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
								Budget smarter.
								<br />
								<span className="text-primary">Compete together.</span>
							</h1>
							<p className="text-base sm:text-lg text-muted-foreground max-w-xl">
								Savr turns your monthly budget into a game. Plan every rand,
								grow your savings and climb a leaderboard with friends — without
								anyone ever seeing your numbers.
							</p>
							<AuthCta variant="hero" />
							<p className="text-xs text-muted-foreground">
								Free to use. Sign up with Google or email.
							</p>
						</div>

						<HeroMockup />
					</div>
				</section>

				{/* Features */}
				<section id="features" className="scroll-mt-14 border-b">
					<div className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-12">
						<SectionHeading
							eyebrow="Features"
							title="Everything a month needs"
							body="From the first payday to the last expense, Savr keeps the whole picture in one place."
						/>
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t">
							{FEATURES.map(({ icon: Icon, title, body }) => (
								<div
									key={title}
									className="border-r border-b p-6 space-y-3 bg-background"
								>
									<span className="flex h-9 w-9 items-center justify-center bg-primary/10 text-primary">
										<Icon className="h-4 w-4" />
									</span>
									<h3 className="font-semibold">{title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{body}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* How it works */}
				<section
					id="how-it-works"
					className="scroll-mt-14 border-b bg-muted/40"
				>
					<div className="max-w-6xl mx-auto px-4 py-16 md:py-24 space-y-12">
						<SectionHeading
							eyebrow="How it works"
							title="Three steps, every month"
						/>
						<ol className="grid md:grid-cols-3 gap-6">
							{STEPS.map((step, i) => (
								<li key={step.title} className="space-y-3">
									<span className="block text-5xl font-bold text-primary leading-none">
										{String(i + 1).padStart(2, "0")}
									</span>
									<h3 className="font-semibold">{step.title}</h3>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{step.body}
									</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				{/* Privacy */}
				<section id="privacy" className="scroll-mt-14 border-b">
					<div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
						<div className="space-y-6">
							<SectionHeading
								align="left"
								eyebrow="Privacy"
								title="Compete on habits, not income"
								body="The leaderboard only shows points, streaks and badges. Your income, expenses and balances are never shared with anyone — not even your friends."
							/>
							<ul className="space-y-3 text-sm">
								{[
									{ icon: EyeOff, text: "No amounts on the leaderboard, ever" },
									{
										icon: ShieldCheck,
										text: "Points reward consistency, so a smaller budget can still win",
									},
									{
										icon: Wallet,
										text: "Your own currency, your own frameworks",
									},
								].map(({ icon: Icon, text }) => (
									<li key={text} className="flex items-center gap-3">
										<Icon className="h-4 w-4 text-primary shrink-0" />
										{text}
									</li>
								))}
							</ul>
						</div>
						<LeaderboardMockup />
					</div>
				</section>

				{/* Final CTA */}
				<section className="bg-primary text-primary-foreground">
					<div className="max-w-6xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
						<div className="space-y-2">
							<h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
								Start your streak this month.
							</h2>
							<p className="text-primary-foreground/80 text-sm">
								Set up your first budget in about five minutes.
							</p>
						</div>
						<Button asChild size="lg" variant="secondary">
							<Link href="/auth/register">
								Create your account <ArrowRight />
							</Link>
						</Button>
					</div>
				</section>
			</main>

			<footer className="border-t">
				<div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<PiggyBank className="h-3.5 w-3.5" />
						<span>Savr — budget smarter, compete together.</span>
					</div>
					<div className="flex items-center gap-6 uppercase tracking-widest">
						<Link
							href="/auth/login"
							className="hover:text-foreground transition-colors"
						>
							Sign in
						</Link>
						<Link
							href="/auth/register"
							className="hover:text-foreground transition-colors"
						>
							Sign up
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}

function SectionHeading({
	eyebrow,
	title,
	body,
	align = "center",
}: {
	eyebrow: string;
	title: string;
	body?: string;
	align?: "center" | "left";
}) {
	return (
		<div
			className={
				align === "center"
					? "text-center max-w-2xl mx-auto space-y-3"
					: "space-y-3"
			}
		>
			<p className="text-xs font-semibold uppercase tracking-widest text-primary">
				{eyebrow}
			</p>
			<h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
			{body && <p className="text-muted-foreground">{body}</p>}
		</div>
	);
}

/** Static illustration of the budget screen — not live data. */
function HeroMockup() {
	const categories = [
		{ name: "Housing", amount: 9500 },
		{ name: "Food & Dining", amount: 4200 },
		{ name: "Transportation", amount: 2800 },
		{ name: "Entertainment", amount: 1500 },
	];

	return (
		<div aria-hidden className="relative">
			<Card className="shadow-xl">
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="text-sm">October budget</CardTitle>
						<Badge variant="secondary" className="gap-1">
							<Star className="h-3 w-3 text-yellow-500 fill-current" />
							1,240 pts
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1.5">
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Allocated</span>
							<span>
								<span className="text-foreground font-medium">
									{money(24000)}
								</span>{" "}
								of {money(28000)}
							</span>
						</div>
						<Progress value={86} className="h-2" />
					</div>
					<div className="space-y-2">
						{categories.map((c) => (
							<div key={c.name} className="flex items-center gap-2 text-sm">
								<span
									className="w-2.5 h-2.5 rounded-full shrink-0"
									style={{ background: CATEGORY_COLORS[c.name] }}
								/>
								<span className="flex-1 text-muted-foreground">{c.name}</span>
								<span className="font-medium">{money(c.amount)}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-xl mt-4 sm:mt-0 sm:absolute sm:-bottom-10 sm:-left-8 sm:w-64">
				<CardContent className="pt-4 space-y-2">
					<div className="flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
							<ShieldCheck className="h-4 w-4 text-muted-foreground" />
						</span>
						<div>
							<p className="text-sm font-medium leading-tight">
								Tax-free savings
							</p>
							<p className="text-xs text-muted-foreground">
								{money(3000)} / month
							</p>
						</div>
					</div>
					<Progress value={75} className="h-1.5" />
					<p className="text-xs text-muted-foreground">
						{money(9000)} room left this year
					</p>
				</CardContent>
			</Card>

			<div className="hidden sm:flex absolute -top-4 -right-4 items-center gap-1.5 bg-background border shadow-lg px-3 py-2 text-xs font-medium">
				<Flame className="h-3.5 w-3.5 text-orange-500" />6 month streak
			</div>
		</div>
	);
}

/** Static illustration of the leaderboard — points and streaks only. */
function LeaderboardMockup() {
	const rows = [
		{
			rank: 1,
			name: "Thandi",
			points: 2180,
			streak: 11,
			framework: "Zero-Based",
			color: "text-yellow-500",
		},
		{
			rank: 2,
			name: "You",
			points: 1240,
			streak: 6,
			framework: "50/30/20",
			color: "text-zinc-400",
		},
		{
			rank: 3,
			name: "Marco",
			points: 1105,
			streak: 4,
			framework: "Envelope Method",
			color: "text-amber-600",
		},
		{
			rank: 4,
			name: "Priya",
			points: 860,
			streak: 3,
			framework: "Pay Yourself First",
			color: "text-muted-foreground",
		},
	];

	return (
		<Card aria-hidden>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm flex items-center gap-2">
					<Trophy className="h-4 w-4" />
					Leaderboard
				</CardTitle>
			</CardHeader>
			<CardContent className="divide-y">
				{rows.map((r) => (
					<div
						key={r.rank}
						className={`flex items-center gap-3 py-3 ${r.name === "You" ? "bg-primary/5 -mx-4 px-4" : ""}`}
					>
						<span className={`w-6 text-center font-bold ${r.color}`}>
							{r.rank}
						</span>
						<span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
							{r.name[0]}
						</span>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{r.name}</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<Flame className="h-3 w-3 text-orange-500" />
									{r.streak}mo streak
								</span>
								<Badge
									variant="secondary"
									className="text-[10px] py-0 px-1.5 hidden sm:inline-flex"
								>
									{r.framework}
								</Badge>
							</div>
						</div>
						<span className="flex items-center gap-1 text-sm font-bold">
							<Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
							{r.points.toLocaleString("en-US")}
						</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
