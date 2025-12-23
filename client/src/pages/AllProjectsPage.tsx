import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderGit2, Clock, CheckCircle2, AlertCircle, Lock, BookOpen } from "lucide-react";
import { getCourseProgress } from "@/lib/progress";
import { getAllSubmissions } from "@/lib/submissions";
import type { Course, Project, ProjectSubmission, Module } from "@shared/schema";

interface ProjectWithCourse extends Project {
  courseName: string;
  courseId: number;
  isLocked: boolean;
  courseProgress: number;
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

      const projectPromises = courses.map(async (course) => {
        try {
          // Fetch projects and modules in parallel
          const [projectsRes, modulesRes] = await Promise.all([
            fetch(`/api/courses/${course.id}/projects`),
            fetch(`/api/courses/${course.id}/modules-with-lessons`),
          ]);

          if (!projectsRes.ok) return [];

          const projects: Project[] = await projectsRes.json();
          const modules: Module[] = modulesRes.ok ? await modulesRes.json() : [];

          // Calculate total lessons and completion
          const totalLessons = modules.reduce(
            (acc, mod) => acc + ((mod as any).lessons?.length || 0),
            0
          );
          const progress = getCourseProgress(course.id);
          const completedLessons = progress.completedLessons.length;
          const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          const isCourseComplete = totalLessons > 0 && completedLessons >= totalLessons;

          return projects.map((project) => ({
            ...project,
            courseId: course.id,
            courseName: course.title,
            isLocked: !isCourseComplete,
            courseProgress,
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

  const handleProjectClick = (project: ProjectWithCourse) => {
    if (project.isLocked) return;
    setLocation(`/shishya/projects/${project.courseId}/${project.id}`);
  };

  const getStatusBadge = (project: ProjectWithCourse) => {
    if (project.isLocked) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Lock className="w-3 h-3" />
          Locked
        </Badge>
      );
    }
    if (project.submission?.submitted) {
      return (
        <Badge variant="default" className="bg-green-600 text-white gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Submitted
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle className="w-3 h-3" />
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
          description="View and submit projects from all available courses. Complete courses to unlock projects."
          icon={FolderGit2}
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allProjects.map((project) => (
              <Card
                key={`${project.courseId}-${project.id}`}
                className={`relative overflow-visible transition-all ${
                  project.isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover-elevate cursor-pointer"
                }`}
                onClick={() => handleProjectClick(project)}
                data-testid={`card-project-${project.id}`}
              >
                {project.isLocked && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate" data-testid={`text-project-title-${project.id}`}>
                        {project.title}
                      </CardTitle>
                      <CardDescription className="truncate mt-1">
                        {project.courseName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {getDifficultyBadge(project.difficulty)}
                    {project.estimatedHours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.estimatedHours}h
                      </span>
                    )}
                  </div>

                  {project.isLocked && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span>Complete course to unlock ({project.courseProgress}% done)</span>
                    </div>
                  )}

                  <div className="pt-1">
                    {getStatusBadge(project)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
