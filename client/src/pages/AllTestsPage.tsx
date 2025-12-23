import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck, Clock, CheckCircle2, XCircle, HelpCircle, Lock, BookOpen } from "lucide-react";
import { getCourseProgress } from "@/lib/progress";
import { getTestAttempts } from "@/lib/testAttempts";
import type { Course, Test, Module } from "@shared/schema";

interface TestWithCourse extends Test {
  courseName: string;
  courseId: number;
  isLocked: boolean;
  courseProgress: number;
  attempt?: {
    scorePercentage: number;
    passed: boolean;
    attemptedAt: string;
  };
}

export default function AllTestsPage() {
  const [, setLocation] = useLocation();
  const [allTests, setAllTests] = useState<TestWithCourse[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(true);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  useEffect(() => {
    if (coursesLoading || courses.length === 0) return;

    const fetchAllTests = async () => {
      setIsLoadingTests(true);
      const attempts = getTestAttempts();

      const testPromises = courses.map(async (course) => {
        try {
          // Fetch tests and modules in parallel
          const [testsRes, modulesRes] = await Promise.all([
            fetch(`/api/courses/${course.id}/tests`),
            fetch(`/api/courses/${course.id}/modules-with-lessons`),
          ]);

          if (!testsRes.ok) return [];

          const tests: Test[] = await testsRes.json();
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

          return tests.map((test) => ({
            ...test,
            courseId: course.id,
            courseName: course.title,
            isLocked: !isCourseComplete,
            courseProgress,
            attempt: attempts[test.id]
              ? {
                  scorePercentage: attempts[test.id].scorePercentage,
                  passed: attempts[test.id].passed,
                  attemptedAt: attempts[test.id].attemptedAt,
                }
              : undefined,
          }));
        } catch {
          return [];
        }
      });

      const results = await Promise.all(testPromises);
      const flatTests = results.flat();
      setAllTests(flatTests);
      setIsLoadingTests(false);
    };

    fetchAllTests();
  }, [courses, coursesLoading]);

  const isLoading = coursesLoading || isLoadingTests;

  const handleTestClick = (test: TestWithCourse) => {
    if (test.isLocked) return;
    setLocation(`/shishya/tests/${test.courseId}/${test.id}`);
  };

  const getStatusBadge = (test: TestWithCourse) => {
    if (test.isLocked) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Lock className="w-3 h-3" />
          Locked
        </Badge>
      );
    }
    if (!test.attempt) {
      return (
        <Badge variant="secondary" className="gap-1">
          <HelpCircle className="w-3 h-3" />
          Not Attempted
        </Badge>
      );
    }
    if (test.attempt.passed) {
      return (
        <Badge variant="default" className="bg-green-600 text-white gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Passed ({test.attempt.scorePercentage}%)
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        Failed ({test.attempt.scorePercentage}%)
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="all-tests-page">
        <PageHeader
          title="All Tests"
          description="View and take tests from all available courses. Complete courses to unlock tests."
          icon={ClipboardCheck}
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
        ) : allTests.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No Tests Available"
            description="There are no tests available at the moment. Check back later!"
            action={{
              label: "Browse Courses",
              onClick: () => setLocation("/courses"),
            }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTests.map((test) => (
              <Card
                key={`${test.courseId}-${test.id}`}
                className={`relative overflow-visible transition-all ${
                  test.isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover-elevate cursor-pointer"
                }`}
                onClick={() => handleTestClick(test)}
                data-testid={`card-test-${test.id}`}
              >
                {test.isLocked && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate" data-testid={`text-test-title-${test.id}`}>
                        {test.title}
                      </CardTitle>
                      <CardDescription className="truncate mt-1">
                        {test.courseName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClipboardCheck className="w-3 h-3" />
                      {test.questionCount} questions
                    </span>
                    {test.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.timeLimit} min
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Pass: {test.passingPercentage}%
                    </Badge>
                  </div>

                  {test.isLocked && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span>Complete course to unlock ({test.courseProgress}% done)</span>
                    </div>
                  )}

                  <div className="pt-1">
                    {getStatusBadge(test)}
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
