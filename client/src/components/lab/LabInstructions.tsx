import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lab } from "@shared/schema";
import { ListChecks, Clock, Code2, Target } from "lucide-react";

interface LabInstructionsProps {
  lab: Lab;
}

export default function LabInstructions({ lab }: LabInstructionsProps) {
  const difficultyColor = {
    beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <div className="space-y-4" data-testid="lab-instructions">
      <div>
        <h1 className="text-2xl font-bold mb-2" data-testid="text-lab-title">
          {lab.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={difficultyColor[lab.difficulty]}>
            {lab.difficulty.charAt(0).toUpperCase() + lab.difficulty.slice(1)}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {lab.estimatedTime} min
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Code2 className="w-4 h-4" />
            JavaScript
          </span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objective
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground" data-testid="text-lab-description">
            {lab.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2" data-testid="list-instructions">
            {lab.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-muted-foreground pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
