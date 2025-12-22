import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect } from "wouter";
import { ChevronRight, Clock, CheckCircle2, Circle, BookOpen, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCourseProgress } from "@/contexts/ProgressContext";
import type { Course, ModuleWithLessons } from "@shared/schema";

export default function LearnView() {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNum = parseInt(courseId || "0", 10);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: modules, isLoading: modulesLoading } = useQuery<ModuleWithLessons[]>({
    queryKey: ["/api/courses", courseId, "modules-with-lessons"],
    enabled: !!course,
  });

  // Use centralized progress context for reactive updates
  const { completedCount, isLessonCompleted } = useCourseProgress(courseIdNum);

  const isLoading = courseLoading || modulesLoading;

  if (!isLoading && course && course.status !== "published") {
    return <Redirect to="/" />;
  }

  // Calculate total lessons
  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <Layout fullWidth>
      {isLoading ? (
        <LearnViewSkeleton />
      ) : course && modules ? (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
          {/* Sidebar - Modules */}
          <aside className="w-full lg:w-80 xl:w-96 border-r bg-card/50 lg:min-h-full">
            <div className="p-4 lg:p-6 space-y-6 sticky top-16">
              {/* Course Title & Progress */}
              <div className="space-y-4">
                <Link href={`/courses/${course.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                  </Button>
                </Link>
                
                <h2 
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-course-title"
                >
                  {course.title}
                </h2>

                {/* Progress Indicator */}
                <div className="flex items-center gap-4">
                  <ProgressRing progress={progressPercent} size={56} />
                  <div>
                    <p className="text-sm font-medium" data-testid="text-progress">
                      {completedCount} / {totalLessons} lessons
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progressPercent === 100 ? "Completed!" : "In progress"}
                    </p>
                  </div>
                </div>

                <Progress value={progressPercent} className="h-2" />
              </div>

              {/* Modules Accordion */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Course Content
                </h3>
                
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No modules available yet.
                  </p>
                ) : (
                  <Accordion 
                    type="multiple" 
                    defaultValue={modules.map(m => `module-${m.id}`)}
                    className="space-y-2"
                  >
                    {modules.map((module) => (
                      <ModuleAccordionItem 
                        key={module.id} 
                        module={module} 
                        courseId={courseIdNum}
                        isLessonCompleted={isLessonCompleted}
                      />
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-3xl mx-auto">
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Select a Lesson
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose a lesson from the sidebar to begin learning. 
                    Track your progress as you complete each lesson.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      ) : null}
    </Layout>
  );
}

interface ModuleAccordionItemProps {
  module: ModuleWithLessons;
  courseId: number;
  isLessonCompleted: (lessonId: number) => boolean;
}

function ModuleAccordionItem({ module, courseId, isLessonCompleted }: ModuleAccordionItemProps) {
  const lessons = module.lessons || [];
  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;

  return (
    <AccordionItem 
      value={`module-${module.id}`}
      className="border rounded-lg overflow-hidden"
      data-testid={`accordion-module-${module.id}`}
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
        <div className="flex-1 text-left space-y-1">
          <p className="font-medium text-sm" data-testid={`text-module-title-${module.id}`}>
            {module.title}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {module.estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {module.estimatedTime}
              </span>
            )}
            <span>{completedCount}/{lessons.length} completed</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0 pb-2">
        <ul className="space-y-1 px-2">
          {lessons.map((lesson) => (
            <LessonListItem 
              key={lesson.id} 
              lesson={lesson} 
              courseId={courseId}
              isCompleted={isLessonCompleted(lesson.id)}
            />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

interface LessonListItemProps {
  lesson: {
    id: number;
    title: string;
    estimatedTime: string | null;
  };
  courseId: number;
  isCompleted: boolean;
}

function LessonListItem({ lesson, courseId, isCompleted }: LessonListItemProps) {
  return (
    <li>
      <Link 
        href={`/shisya/learn/${courseId}/${lesson.id}`}
        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover-elevate active-elevate-2 transition-colors group"
        data-testid={`link-lesson-${lesson.id}`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isCompleted ? "text-muted-foreground" : ""}`}>
            {lesson.title}
          </p>
          {lesson.estimatedTime && (
            <p className="text-xs text-muted-foreground">{lesson.estimatedTime}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </Link>
    </li>
  );
}

function LearnViewSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
      <aside className="w-full lg:w-80 xl:w-96 border-r bg-card/50 p-4 lg:p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-full" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Skeleton className="h-48 max-w-3xl mx-auto rounded-lg" />
      </main>
    </div>
  );
}
