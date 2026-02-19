import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: "beginner" | "intermediate" | "advanced" | "masters";
  className?: string;
}

const levelConfig = {
  beginner: {
    label: "Beginner",
    className: "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white border-emerald-600 dark:border-emerald-700",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-amber-500 text-white dark:bg-amber-600 dark:text-white border-amber-600 dark:border-amber-700",
  },
  advanced: {
    label: "Advanced",
    className: "bg-rose-500 text-white dark:bg-rose-600 dark:text-white border-rose-600 dark:border-rose-700",
  },
  masters: {
    label: "Masters",
    className: "bg-purple-500 text-white dark:bg-purple-600 dark:text-white border-purple-600 dark:border-purple-700",
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
