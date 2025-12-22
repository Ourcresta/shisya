import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface SkillsSectionProps {
  skills: string[];
  showEmpty?: boolean;
}

export default function SkillsSection({ skills, showEmpty = true }: SkillsSectionProps) {
  const uniqueSkills = [...new Set(skills)].sort();

  if (uniqueSkills.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div data-testid="skills-section">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Skills</h3>
        <span className="text-xs text-muted-foreground">(auto-generated from learning)</span>
      </div>
      
      {uniqueSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {uniqueSkills.map((skill) => (
            <Badge 
              key={skill} 
              variant="secondary"
              className="text-sm"
              data-testid={`skill-badge-${skill.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {skill}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Complete courses and projects to build your skills portfolio
        </p>
      )}
    </div>
  );
}
