import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface ProjectStatusBadgeProps {
  submitted: boolean;
}

export function ProjectStatusBadge({ submitted }: ProjectStatusBadgeProps) {
  if (submitted) {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Submitted
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <Circle className="w-3 h-3" />
      Not Submitted
    </Badge>
  );
}

interface DifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced";
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variants: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  const labels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };

  return (
    <Badge variant="outline" className={variants[difficulty]}>
      {labels[difficulty]}
    </Badge>
  );
}
