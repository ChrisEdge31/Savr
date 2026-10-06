"use client";

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Bell, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PendingIncome } from "@/lib/utils/notifications";
import { toast } from "sonner";

type Props = {
  pendingSources: PendingIncome[];
  onLog: (source: PendingIncome, amount: number) => Promise<void>;
};

export function PaydayBanner({ pendingSources, onLog }: Props) {
  const { format, symbol, inputPadClass } = useCurrency();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || pendingSources.length === 0) return null;

  async function handleLog(source: PendingIncome) {
    const id = source.id!;
    const raw = parseFloat(amounts[id] ?? "");
    if (isNaN(raw) || raw < 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSubmitting(id);
    try {
      await onLog(source, raw);
      toast.success(`${source.name} income logged!`);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">Payday recap</p>
              <Button size="icon" variant="ghost" className="h-6 w-6 -mr-1" onClick={() => setDismissed(true)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Log what you actually received for {pendingSources.length === 1 ? "this source" : "these sources"}:
            </p>
            <div className="space-y-2">
              {pendingSources.map((source) => (
                <div key={source.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-1.5 mb-1">
                      <span className="text-sm font-medium truncate">{source.name}</span>
                      <span className="text-xs text-muted-foreground">
                        paid {source.payDate.toLocaleDateString(undefined, { day: "numeric", month: "short" })} · expected {format(source.expectedAmount)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{symbol}</span>
                        <Input
                          type="number"
                          min={0}
                          placeholder={String(source.expectedAmount)}
                          value={amounts[source.id!] ?? ""}
                          onChange={(e) => setAmounts((a) => ({ ...a, [source.id!]: e.target.value }))}
                          className={`${inputPadClass} h-8 text-sm`}
                        />
                      </div>
                      <Button
                        size="sm"
                        className="h-8 shrink-0"
                        onClick={() => handleLog(source)}
                        disabled={submitting === source.id}
                      >
                        {submitting === source.id ? "..." : <><ChevronRight className="h-3 w-3" />Log</>}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
