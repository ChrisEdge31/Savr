import { BADGE_DEFS, BadgeId } from "@/lib/utils/points";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  badges: string[];
  max?: number;
};

export function BadgeDisplay({ badges, max }: Props) {
  const shown = max ? badges.slice(0, max) : badges;
  if (shown.length === 0) return <span className="text-xs text-muted-foreground">No badges yet</span>;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {shown.map((id) => {
          const def = BADGE_DEFS[id as BadgeId];
          if (!def) return null;
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <span className="text-xl cursor-default" role="img" aria-label={def.label}>
                  {def.icon}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{def.label}</p>
                <p className="text-xs text-muted-foreground">{def.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
