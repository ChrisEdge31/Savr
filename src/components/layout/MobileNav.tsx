"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Target, PiggyBank, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
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
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-6 w-6 items-center justify-center bg-primary text-primary-foreground">
            <PiggyBank className="h-3.5 w-3.5" />
          </span>
          Savr
        </Link>
        {bell}
      </div>

      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card flex">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 border-t-2 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors",
              pathname === href
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
