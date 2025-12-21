import { cn } from "@/lib/utils";

interface SkillTagProps {
  skill: string;
  className?: string;
}

export function SkillTag({ skill, className }: SkillTagProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {skill}
    </span>
  );
}
