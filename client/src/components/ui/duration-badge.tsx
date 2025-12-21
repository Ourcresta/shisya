import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DurationBadgeProps {
  duration: string | null;
  className?: string;
}

export function DurationBadge({ duration, className }: DurationBadgeProps) {
  if (!duration) return null;
  
  return (
    <div className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      <Clock className="w-3.5 h-3.5" />
      <span>{duration}</span>
    </div>
  );
}
