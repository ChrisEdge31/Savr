"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { IncomeSource, INCOME_SOURCE_TYPES } from "@/lib/firebase/firestore";

const TYPE_LABELS: Record<string, string> = {
  salary: "Salary / Wage",
  freelance: "Freelance / Side Hustle",
  rental: "Rental Income",
  investment: "Investment / Dividends",
  other: "Other",
};

type Props = {
  onAdd: (data: Omit<IncomeSource, "id" | "createdAt">) => Promise<void>;
  trigger?: React.ReactNode;
};

export function IncomeSourceForm({ onAdd, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<IncomeSource["type"]>("salary");
  const [expectedAmount, setExpectedAmount] = useState("");
  const [payDay, setPayDay] = useState("25");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !expectedAmount) return;
    setSaving(true);
    try {
      await onAdd({
        name,
        type,
        expectedAmount: parseFloat(expectedAmount),
        payDay: Math.min(31, Math.max(1, parseInt(payDay) || 25)),
        active: true,
      });
      setName(""); setExpectedAmount(""); setPayDay("25"); setType("salary");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Source
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Main Job, Upwork, Airbnb"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as IncomeSource["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INCOME_SOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="amount">Expected monthly</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="payday">Pay day</Label>
              <div className="relative">
                <Input
                  id="payday"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="25"
                  value={payDay}
                  onChange={(e) => setPayDay(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">of month</span>
              </div>
              <p className="text-xs text-muted-foreground">You&apos;ll be reminded the day after</p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Add Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
