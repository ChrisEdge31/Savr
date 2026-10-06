"use client";

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Pencil, Trash2, Check, X, Briefcase, Laptop, Home, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IncomeSource } from "@/lib/firebase/firestore";

const TYPE_ICONS: Record<string, LucideIcon> = {
  salary: Briefcase,
  freelance: Laptop,
  rental: Home,
  investment: TrendingUp,
  other: Wallet,
};

type Props = {
  source: IncomeSource & { id: string };
  onUpdate: (id: string, data: Partial<IncomeSource>) => void;
  onRemove: (id: string) => void;
};

export function IncomeSourceCard({ source, onUpdate, onRemove }: Props) {
  const { format, symbol, inputPadClass } = useCurrency();
  const TypeIcon = TYPE_ICONS[source.type] ?? Wallet;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(source.name);
  const [amount, setAmount] = useState(String(source.expectedAmount));
  const [payDay, setPayDay] = useState(String(source.payDay));

  function handleSave() {
    onUpdate(source.id, {
      name,
      expectedAmount: parseFloat(amount) || 0,
      payDay: Math.min(31, Math.max(1, parseInt(payDay) || 25)),
    });
    setEditing(false);
  }

  function handleCancel() {
    setName(source.name);
    setAmount(String(source.expectedAmount));
    setPayDay(String(source.payDay));
    setEditing(false);
  }

  return (
    <Card className={source.active ? "" : "opacity-50"}>
      <CardContent className="pt-4">
        {editing ? (
          <div className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Source name" />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{symbol}</span>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputPadClass} placeholder="Amount" />
              </div>
              <div className="relative">
                <Input type="number" min={1} max={31} value={payDay} onChange={(e) => setPayDay(e.target.value)} placeholder="Pay day" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">th</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="flex-1"><Check className="h-3 w-3 mr-1" />Save</Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="flex-1"><X className="h-3 w-3 mr-1" />Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <TypeIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{source.name}</p>
                <Badge variant="outline" className="text-xs shrink-0">
                  {source.payDay === 31 ? "Last day" : `${source.payDay}th`}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{format(source.expectedAmount)} / month</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Switch
                checked={source.active}
                onCheckedChange={(checked) => onUpdate(source.id, { active: checked })}
                aria-label="Toggle source"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onRemove(source.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
