import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LabStatusBadge from "./LabStatusBadge";
import type { Lab } from "@shared/schema";
import { Clock, Code2, BookOpen, Play, Eye } from "lucide-react";

interface LabCardProps {
  lab: Lab;
  courseId: number;
  isCompleted: boolean;
  isLocked: boolean;
  linkedLessonTitle?: string;
}

export default function LabCard({ lab, courseId, isCompleted, isLocked, linkedLessonTitle }: LabCardProps) {
  const status = isCompleted ? "completed" : isLocked ? "locked" : "available";
  
  const difficultyColor = {
    beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <Card 
      className={`transition-all ${isLocked ? "opacity-60" : "hover-elevate"}`}
      data-testid={`card-lab-${lab.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {lab.title}
          </CardTitle>
          <LabStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {lab.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={difficultyColor[lab.difficulty]}>
            {lab.difficulty.charAt(0).toUpperCase() + lab.difficulty.slice(1)}
          </Badge>
          
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {lab.estimatedTime} min
          </span>
          
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Code2 className="w-3 h-3" />
            JavaScript
          </span>
        </div>

        {linkedLessonTitle && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span>Linked to: {linkedLessonTitle}</span>
          </div>
        )}

        <div className="pt-2">
          {isLocked ? (
            <Button variant="secondary" disabled className="w-full" data-testid={`button-lab-locked-${lab.id}`}>
              Complete linked lesson to unlock
            </Button>
          ) : isCompleted ? (
            <Link href={`/courses/${courseId}/labs/${lab.id}`}>
              <Button variant="outline" className="w-full" data-testid={`button-lab-view-${lab.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Solution
              </Button>
            </Link>
          ) : (
            <Link href={`/courses/${courseId}/labs/${lab.id}`}>
              <Button className="w-full" data-testid={`button-lab-start-${lab.id}`}>
                <Play className="w-4 h-4 mr-2" />
                Start Lab
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
