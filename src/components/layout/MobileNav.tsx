"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Target, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/leaderboard", label: "Rank", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

type Props = {
  notificationCount?: number;
  bell?: ReactNode;
};

export function MobileNav({ bell }: Props) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar with bell */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12 border-b bg-card">
        <span className="font-bold tracking-tight">BudgetTool</span>
        {bell}
      </div>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card flex">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-2 text-xs gap-1 transition-colors",
              pathname === href
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
