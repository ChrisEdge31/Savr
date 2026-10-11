# Savr

**Budget smarter, compete together.**

Savr is a full-stack budgeting web app that turns monthly budgeting into a habit. Users plan each month with a proven budgeting framework, track savings and goals, and earn points for staying on budget. A friendly leaderboard keeps them motivated, and it never shows anyone's actual money.

**Live demo:** _add link_ · **Built with:** Next.js 16, React 19, TypeScript, Firebase, Tailwind CSS

<!-- Add screenshots: docs/screenshots/dashboard.png, budget.png, leaderboard.png -->

## Why I built it

Most budgeting apps are good at tracking but bad at keeping people coming back. I wanted to see whether light gamification could make budgeting stick. The catch was that comparing yourself to others usually means comparing incomes. Savr's leaderboard ranks people on **consistency**, so someone on a small budget who sticks to their plan can beat someone who earns far more.

## Features

- **Monthly budgets** that carry recurring expenses into the next month, while one-off expenses stay put.
- **Four budgeting frameworks** (50/30/20, Zero-Based, Pay Yourself First, Envelope), each showing how your plan compares to its target split.
- **Income sources and payday reminders** that pre-fill the budget and prompt users to log what was actually paid.
- **Savings accounts** with interest rates, monthly contributions and yearly contribution limits (e.g. a TFSA).
- **Goals with deadlines**, funded from the monthly budget, with bonus points for finishing early.
- **Points, streaks and badges** that reward consistency month after month.
- **A privacy-first leaderboard**: only names, points, streaks and badges are public.
- **Onboarding flow**, **21 display currencies**, and a responsive layout with a separate mobile nav.

## Technical highlights

- **Scheduled server-side scoring.** A Vercel Cron job ([route.ts](src/app/api/cron/month-close/route.ts)) runs on the 1st of each month. It uses the Firebase Admin SDK to close out the previous month for every user: it scores the budget, updates streaks and syncs the leaderboard. The job is protected by a bearer secret, and it's **idempotent**: each user's last recorded month is stored, so a retried run never awards points twice.
- **Public and private data kept apart.** Financial data lives under `users/{uid}`. Only a cut-down `leaderboard/{uid}` document, with no amounts, is ever shared between users.
- **Typed data layer.** Typed Firestore collection and document helpers ([firestore.ts](src/lib/firebase/firestore.ts)) are wrapped in feature-specific React hooks (`useBudget`, `useGoals`, `useStats`, …), so pages contain no raw database calls.
- **Budgeting logic as plain modules.** Frameworks, point rules, dates and currency formatting live in [src/lib/utils](src/lib/utils) as small, testable functions that don't depend on React.
- **Backward-compatible data.** When new fields are added (e.g. recurring vs. one-off expenses), defaults are applied as old documents are read, so existing users don't need a migration.
- **Validated forms** using React Hook Form and Zod schemas, on top of accessible shadcn/ui (Radix) components.

### Point rules

| Action          | Points                                      |
| --------------- | ------------------------------------------- |
| Month on budget | 50 + 10 × current streak                    |
| Savings rate    | 1 per whole percent saved (max 50)          |
| Goal completed  | 20, plus 10 if finished before the deadline |

## Architecture

```
src/
├── app/
│   ├── (app)/          # Authenticated pages: dashboard, budget, savings, goals, leaderboard, settings
│   ├── auth/           # Login and registration
│   ├── onboarding/     # First-run setup
│   ├── api/cron/       # Month-close job (Firebase Admin)
│   └── page.tsx        # Marketing landing page
├── components/         # Feature components + shadcn/ui primitives
├── context/            # Auth and currency providers
└── lib/
    ├── firebase/       # Client config, auth, typed Firestore helpers, admin SDK
    ├── hooks/          # Data hooks per feature
    └── utils/          # Frameworks, points, dates, currency, savings
```

```
users/{uid}
  ├── budgets/{YYYY-MM}
  ├── goals/{goalId}
  ├── incomeSources/{sourceId}
  ├── incomeLogs/{YYYY-MM}_{sourceId}
  ├── savingsAccounts/{accountId}
  └── stats/main
leaderboard/{uid}       # Public: name, points, streaks, badges
```

## What I'd do next

- Unit tests for the scoring and date utilities, and an end-to-end test of the month-close job against the Firestore emulator
- Firestore security rules kept in the repo and deployed from it
- Friend groups so leaderboards can be private to a group
- Charts showing spending and savings trends over time

## Author

**Christopher Edge**: [GitHub](https://github.com/ChrisEdge31)
