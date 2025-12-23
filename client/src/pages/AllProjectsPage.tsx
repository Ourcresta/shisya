import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderGit2, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getAllSubmissions } from "@/lib/submissions";
import type { Course, Project, ProjectSubmission } from "@shared/schema";

interface ProjectWithCourse extends Project {
  courseName: string;
  submission?: ProjectSubmission;
}

export default function AllProjectsPage() {
  const [, setLocation] = useLocation();
  const [allProjects, setAllProjects] = useState<ProjectWithCourse[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  useEffect(() => {
    if (coursesLoading || courses.length === 0) return;

    const fetchAllProjects = async () => {
      setIsLoadingProjects(true);
      const submissions = getAllSubmissions();
      const submissionMap: Record<string, ProjectSubmission> = {};
      submissions.forEach((sub) => {
        submissionMap[`${sub.courseId}-${sub.projectId}`] = sub;
      });

      // Show projects from all published courses
      const projectPromises = courses.map(async (course) => {
        try {
          const response = await fetch(`/api/courses/${course.id}/projects`);
          if (!response.ok) return [];
          const projects: Project[] = await response.json();
          return projects.map((project) => ({
            ...project,
            courseName: course.title,
            submission: submissionMap[`${course.id}-${project.id}`],
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(projectPromises);
      const flatProjects = results.flat();
      setAllProjects(flatProjects);
      setIsLoadingProjects(false);
    };

    fetchAllProjects();
  }, [courses, coursesLoading]);

  const isLoading = coursesLoading || isLoadingProjects;

  const getStatusBadge = (project: ProjectWithCourse) => {
    if (project.submission?.submitted) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
      <Badge variant="outline" className={colors[difficulty] || ""}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="all-projects-page">
        <PageHeader
          title="All Projects"
          description="View and submit projects from all available courses"
          icon={FolderGit2}
        />

        {isLoading ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : allProjects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No Projects Available"
            description="There are no projects available at the moment. Check back later!"
            action={{
              label: "Browse Courses",
              onClick: () => setLocation("/courses"),
            }}
          />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderGit2 className="w-5 h-5" />
                Projects ({allProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {allProjects.map((project) => (
                  <div
                    key={`${project.courseId}-${project.id}`}
                    className="p-4 flex items-center gap-4 hover-elevate cursor-pointer transition-colors"
                    onClick={() => setLocation(`/shishya/projects/${project.courseId}/${project.id}`)}
                    data-testid={`row-project-${project.id}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FolderGit2 className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" data-testid={`text-project-title-${project.id}`}>
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.courseName}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      {getDifficultyBadge(project.difficulty)}
                      {project.estimatedHours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.estimatedHours}h
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(project)}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
