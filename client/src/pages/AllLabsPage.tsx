import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Code2, Clock, CheckCircle2, Lock, BookOpen, Play } from "lucide-react";
import { getCourseProgress } from "@/lib/progress";
import type { Course, Lab, Module } from "@shared/schema";

interface LabWithCourse extends Lab {
  courseName: string;
  isLocked: boolean;
  courseProgress: number;
  isCompleted: boolean;
}

// Helper to get lab progress from localStorage
function getLabProgress(courseId: number, labId: number): boolean {
  try {
    const stored = localStorage.getItem("shishya_lab_progress");
    if (!stored) return false;
    const progress = JSON.parse(stored);
    return progress[courseId]?.[labId]?.completed || false;
  } catch {
    return false;
  }
}

export default function AllLabsPage() {
  const [, setLocation] = useLocation();
  const [allLabs, setAllLabs] = useState<LabWithCourse[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(true);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  useEffect(() => {
    if (coursesLoading || courses.length === 0) return;

    const fetchAllLabs = async () => {
      setIsLoadingLabs(true);

      const labPromises = courses.map(async (course) => {
        try {
          // Fetch labs and modules in parallel
          const [labsRes, modulesRes] = await Promise.all([
            fetch(`/api/courses/${course.id}/labs`),
            fetch(`/api/courses/${course.id}/modules-with-lessons`),
          ]);

          if (!labsRes.ok) return [];

          const labs: Lab[] = await labsRes.json();
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

          return labs.map((lab) => ({
            ...lab,
            courseId: course.id,
            courseName: course.title,
            isLocked: !isCourseComplete,
            courseProgress,
            isCompleted: getLabProgress(course.id, lab.id),
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(labPromises);
      const flatLabs = results.flat();
      setAllLabs(flatLabs);
      setIsLoadingLabs(false);
    };

    fetchAllLabs();
  }, [courses, coursesLoading]);

  const isLoading = coursesLoading || isLoadingLabs;

  const handleLabClick = (lab: LabWithCourse) => {
    if (lab.isLocked) return;
    setLocation(`/shishya/labs/${lab.courseId}/${lab.id}`);
  };

  const getStatusBadge = (lab: LabWithCourse) => {
    if (lab.isLocked) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Lock className="w-3 h-3" />
          Locked
        </Badge>
      );
    }
    if (lab.isCompleted) {
      return (
        <Badge variant="default" className="bg-green-600 text-white gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Play className="w-3 h-3" />
        Ready to Practice
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
      <div className="space-y-6" data-testid="all-labs-page">
        <PageHeader
          title="All Labs"
          description="Practice coding with hands-on labs. Complete courses to unlock labs."
          icon={Code2}
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
        ) : allLabs.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No Labs Available"
            description="There are no labs available at the moment. Check back later!"
            action={{
              label: "Browse Courses",
              onClick: () => setLocation("/courses"),
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allLabs.map((lab) => (
              <Card
                key={`${lab.courseId}-${lab.id}`}
                className={`relative overflow-visible transition-all ${
                  lab.isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover-elevate cursor-pointer"
                }`}
                onClick={() => handleLabClick(lab)}
                data-testid={`card-lab-${lab.id}`}
              >
                {lab.isLocked && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate" data-testid={`text-lab-title-${lab.id}`}>
                        {lab.title}
                      </CardTitle>
                      <CardDescription className="truncate mt-1">
                        {lab.courseName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {lab.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {getDifficultyBadge(lab.difficulty)}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lab.estimatedTime} min
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {lab.language}
                    </Badge>
                  </div>

                  {lab.isLocked && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span>Complete course to unlock ({lab.courseProgress}% done)</span>
                    </div>
                  )}

                  <div className="pt-1">
                    {getStatusBadge(lab)}
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
