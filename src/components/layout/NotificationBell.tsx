"use client";

import Link from "next/link";
import { Bell, X, DollarSign, Target, Wallet, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppNotification } from "@/lib/hooks/useNotifications";

const TYPE_ICON: Record<AppNotification["type"], React.ReactNode> = {
  income_due: <DollarSign className="h-4 w-4 text-green-600" />,
  goal_deadline: <Target className="h-4 w-4 text-orange-500" />,
  budget_missing: <Wallet className="h-4 w-4 text-blue-500" />,
};

type Props = {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
};

export function NotificationBell({ notifications, onDismiss, onDismissAll }: Props) {
  const count = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="font-semibold text-sm">Notifications</p>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={onDismissAll}
            >
              <CheckCheck className="h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">You&apos;re all caught up</p>
            <p className="text-xs">No notifications right now</p>
          </div>
        ) : (
          <ul className="divide-y max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="mt-0.5 shrink-0 rounded-full bg-muted p-1.5">
                  {TYPE_ICON[n.type]}
                </div>
                <Link href={n.href} className="flex-1 min-w-0 group" onClick={() => onDismiss(n.id)}>
                  <p className="text-sm font-medium group-hover:underline leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.description}</p>
                </Link>
                <button
                  onClick={() => onDismiss(n.id)}
                  className={cn(
                    "shrink-0 mt-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
