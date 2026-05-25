import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function PointsBadge({ points }: { points: number }) {
  return (
    <Badge variant="secondary" className="gap-1 text-sm font-semibold px-3 py-1">
      <Star className="h-3.5 w-3.5 fill-current" />
      {points.toLocaleString()} pts
    </Badge>
  );
}
