"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/lib/hooks/useBudget";
import { useGoals } from "@/lib/hooks/useGoals";
import { useIncomeSources } from "@/lib/hooks/useIncomeSources";
import { useIncomeLog } from "@/lib/hooks/useIncomeLog";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { currentMonthKey } from "@/lib/utils/dates";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const monthKey = currentMonthKey();
  const { budget } = useBudget(user?.uid, monthKey);
  const { goals } = useGoals(user?.uid);
  const { sources } = useIncomeSources(user?.uid);
  const { loggedSourceIds } = useIncomeLog(user?.uid, monthKey);

  const { notifications, dismiss, dismissAll } = useNotifications({
    sources,
    goals,
    budgetIncome: budget?.income ?? 0,
    loggedSourceIds,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar notificationBell={
        <NotificationBell
          notifications={notifications}
          onDismiss={dismiss}
          onDismissAll={dismissAll}
        />
      } />
      <main className="flex-1 overflow-auto pt-12 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav notificationCount={notifications.length} bell={
        <NotificationBell
          notifications={notifications}
          onDismiss={dismiss}
          onDismissAll={dismissAll}
        />
      } />
    </div>
  );
}
