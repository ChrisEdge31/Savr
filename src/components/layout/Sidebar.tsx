"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wallet, Target, Trophy, Settings, LogOut, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

type Props = {
  notificationBell?: ReactNode;
};

export function Sidebar({ notificationBell }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0 border-r bg-card">
      <div className="flex items-center justify-between h-14 px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
            <PiggyBank className="h-4 w-4" />
          </span>
          Savr
        </Link>
        {notificationBell}
      </div>

      <nav className="flex-1 flex flex-col py-4">
        <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 border-l-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t px-4 py-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.photoURL ?? ""} />
          <AvatarFallback className="text-xs font-semibold">{user?.displayName?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{user?.displayName ?? "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut />
        </Button>
      </div>
    </aside>
  );
}
