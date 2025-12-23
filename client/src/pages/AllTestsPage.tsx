import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck, ChevronRight, Clock, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { getCourseProgress } from "@/lib/progress";
import { getTestAttempts, type TestAttemptStore } from "@/lib/testAttempts";
import type { Course, Test } from "@shared/schema";

interface TestWithCourse extends Test {
  courseName: string;
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

      const enrolledCourses = courses.filter((course) => {
        const progress = getCourseProgress(course.id);
        return progress.completedLessons.length > 0;
      });

      const testPromises = enrolledCourses.map(async (course) => {
        try {
          const response = await fetch(`/api/courses/${course.id}/tests`);
          if (!response.ok) return [];
          const tests: Test[] = await response.json();
          return tests.map((test) => ({
            ...test,
            courseName: course.title,
            attempt: attempts[test.id] ? {
              scorePercentage: attempts[test.id].scorePercentage,
              passed: attempts[test.id].passed,
              attemptedAt: attempts[test.id].attemptedAt,
            } : undefined,
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

  const getStatusBadge = (test: TestWithCourse) => {
    if (!test.attempt) {
      return (
        <Badge variant="secondary">
          <HelpCircle className="w-3 h-3 mr-1" />
          Not Attempted
        </Badge>
      );
    }
    if (test.attempt.passed) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Passed ({test.attempt.scorePercentage}%)
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Failed ({test.attempt.scorePercentage}%)
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="all-tests-page">
        <PageHeader
          title="All Tests"
          description="View and take tests from all your enrolled courses"
          icon={ClipboardCheck}
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
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : allTests.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No Tests Yet"
            description="Start learning courses to unlock tests. Tests help validate your knowledge."
            action={{
              label: "Browse Courses",
              onClick: () => setLocation("/courses"),
            }}
          />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Tests ({allTests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {allTests.map((test) => (
                  <div
                    key={`${test.courseId}-${test.id}`}
                    className="p-4 flex items-center gap-4 hover-elevate cursor-pointer transition-colors"
                    onClick={() => setLocation(`/shishya/tests/${test.courseId}/${test.id}`)}
                    data-testid={`row-test-${test.id}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" data-testid={`text-test-title-${test.id}`}>
                        {test.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {test.courseName}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {test.questionCount} questions
                      </span>
                      {test.timeLimit && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {test.timeLimit} min
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Pass: {test.passingPercentage}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(test)}
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
