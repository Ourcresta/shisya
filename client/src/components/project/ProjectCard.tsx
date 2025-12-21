import { Link } from "wouter";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge, DifficultyBadge } from "./ProjectStatusBadge";
import type { Project } from "@shared/schema";

interface ProjectCardProps {
  project: Project;
  courseId: number;
  isSubmitted: boolean;
}

export function ProjectCard({ project, courseId, isSubmitted }: ProjectCardProps) {
  return (
    <Card 
      className="flex flex-col h-full hover-elevate"
      data-testid={`card-project-${project.id}`}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <DifficultyBadge difficulty={project.difficulty} />
          <ProjectStatusBadge submitted={isSubmitted} />
        </div>
        <CardTitle 
          className="text-lg leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {project.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Estimated Time */}
        {project.estimatedHours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{project.estimatedHours} hours estimated</span>
          </div>
        )}

        {/* Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.skills.slice(0, 4).map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {skill}
              </Badge>
            ))}
            {project.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{project.skills.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${courseId}/projects/${project.id}`} className="w-full">
          <Button 
            className="w-full gap-2" 
            variant={isSubmitted ? "secondary" : "default"}
            data-testid={`button-view-project-${project.id}`}
          >
            {isSubmitted ? "View Submission" : "View Project"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-9 w-full bg-muted rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
