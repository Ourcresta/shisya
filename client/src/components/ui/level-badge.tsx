import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: "beginner" | "intermediate" | "advanced";
  className?: string;
}

const levelConfig = {
  beginner: {
    label: "Beginner",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  advanced: {
    label: "Advanced",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
};

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const config = levelConfig[level];
  
  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs font-medium border", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
