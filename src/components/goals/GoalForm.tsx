"use client";

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { GoalDoc } from "@/lib/firebase/firestore";
import { GOAL_CATEGORIES } from "@/lib/utils/categories";

type Props = {
  onAdd: (data: Omit<GoalDoc, "id" | "createdAt" | "status">) => Promise<void>;
};

export function GoalForm({ onAdd }: Props) {
  const { format, symbol, inputPadClass } = useCurrency();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !targetAmount) return;
    setSaving(true);
    try {
      await onAdd({
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        category,
        deadline,
      });
      setTitle(""); setTargetAmount(""); setCurrentAmount(""); setDeadline(""); setCategory("Other");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="title">Goal title</Label>
            <Input id="title" placeholder="e.g. Emergency Fund" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="target">Target amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
                <Input id="target" type="number" min={1} placeholder="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className={inputPadClass} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="current">Already saved</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
                <Input id="current" type="number" min={0} placeholder="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className={inputPadClass} />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GOAL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Create Goal"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
