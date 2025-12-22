import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, Github, ExternalLink, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import type { ProjectSubmission, Project } from "@shared/schema";
import { format } from "date-fns";

interface ProjectWithDetails extends ProjectSubmission {
  projectTitle?: string;
  courseTitle?: string;
  skills?: string[];
}

interface PortfolioProjectsProps {
  projects: ProjectWithDetails[];
  showEmpty?: boolean;
  isPublicView?: boolean;
}

export default function PortfolioProjects({ 
  projects, 
  showEmpty = true,
  isPublicView = false 
}: PortfolioProjectsProps) {
  if (projects.length === 0 && !showEmpty) {
    return null;
  }

  return (
    <div data-testid="portfolio-projects">
      <div className="flex items-center gap-2 mb-4">
        <FolderKanban className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Projects Portfolio</h3>
        {projects.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{projects.length} projects</Badge>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card key={`${project.courseId}-${project.projectId}`} className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate" data-testid={`project-title-${project.projectId}`}>
                        {project.projectTitle || `Project #${project.projectId}`}
                      </h4>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Submitted
                      </Badge>
                    </div>
                    
                    {project.courseTitle && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.courseTitle}
                      </p>
                    )}

                    {project.skills && project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
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

                    {project.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.notes}
                      </p>
                    )}

                    {project.submittedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Submitted {format(new Date(project.submittedAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-github-${project.projectId}`}>
                          <Github className="w-4 h-4 mr-1" />
                          Code
                        </a>
                      </Button>
                    )}
                    
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" data-testid={`link-live-${project.projectId}`}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Demo
                        </a>
                      </Button>
                    )}

                    {!isPublicView && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/shishya/projects/${project.courseId}/${project.projectId}`} data-testid={`link-view-project-${project.projectId}`}>
                          View
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FolderKanban className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No projects submitted yet</p>
            {!isPublicView && (
              <p className="text-sm text-muted-foreground mt-1">
                Complete a course project to showcase your work
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
