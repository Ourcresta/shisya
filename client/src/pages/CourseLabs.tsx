import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import LabCard from "@/components/lab/LabCard";
import { isLabCompleted, getCompletedLabsCount } from "@/lib/labProgress";
import { isLessonCompleted } from "@/lib/progress";
import type { Lab, Course, Lesson } from "@shared/schema";
import { ArrowLeft, FlaskConical, BookOpen } from "lucide-react";

export default function CourseLabs() {
  const [, params] = useRoute("/shishya/labs/:courseId");
  const courseId = params?.courseId ? parseInt(params.courseId, 10) : 0;

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    enabled: courseId > 0,
  });

  const { data: labs, isLoading: labsLoading } = useQuery<Lab[]>({
    queryKey: ["/api/courses", courseId, "labs"],
    enabled: courseId > 0,
  });

  const { data: lessons } = useQuery<Record<number, Lesson>>({
    queryKey: ["/api/lessons/all"],
    enabled: labs && labs.length > 0,
  });

  const isLoading = courseLoading || labsLoading;

  const completedCount = getCompletedLabsCount(courseId);
  const totalLabs = labs?.length || 0;

  const getLabStatus = (lab: Lab) => {
    const completed = isLabCompleted(courseId, lab.id);
    // Labs are always unlocked for testing/development
    const locked = false;
    
    return { completed, locked };
  };

  const getLessonTitle = (lessonId: number | null): string | undefined => {
    if (!lessonId || !lessons) return undefined;
    return lessons[lessonId]?.title;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8" data-testid="course-labs-page">
        <div className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" data-testid="text-page-title">
                    Practice Labs
                  </h1>
                  {course && (
                    <p className="text-sm text-muted-foreground">
                      {course.title}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">
                Hands-on practice to strengthen your understanding
              </p>
              
              {totalLabs > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${(completedCount / totalLabs) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {completedCount} / {totalLabs} completed
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : labs && labs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map(lab => {
              const { completed, locked } = getLabStatus(lab);
              return (
                <LabCard
                  key={lab.id}
                  lab={lab}
                  courseId={courseId}
                  isCompleted={completed}
                  isLocked={locked}
                  linkedLessonTitle={getLessonTitle(lab.lessonId)}
                />
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Labs Available</h3>
              <p className="text-muted-foreground mb-4">
                No practice labs have been created for this course yet.
              </p>
              <Link href={`/shishya/learn/${courseId}`}>
                <Button variant="outline" data-testid="button-go-learn">
                  Continue Learning
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
