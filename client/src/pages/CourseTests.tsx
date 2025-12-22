import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileQuestion, Percent, CheckCircle, XCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Test, Course } from "@shared/schema";
import { useTestAttempts } from "@/contexts/TestAttemptContext";

function TestStatusBadge({ status }: { status: "not_attempted" | "passed" | "failed" }) {
  if (status === "passed") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        Passed
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Circle className="w-3 h-3 mr-1" />
      Not Attempted
    </Badge>
  );
}

function TestCard({ test, courseId }: { test: Test; courseId: string }) {
  const { getStatus, getAttempt } = useTestAttempts();
  const status = getStatus(test.id);
  const attempt = getAttempt(test.id);

  return (
    <Card className="hover-elevate" data-testid={`card-test-${test.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg" data-testid={`text-test-title-${test.id}`}>
            {test.title}
          </CardTitle>
          <TestStatusBadge status={status} />
        </div>
        <CardDescription className="line-clamp-2">
          {test.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileQuestion className="w-4 h-4" />
            <span>{test.questionCount} questions</span>
          </div>
          {test.timeLimit && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{test.timeLimit} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Percent className="w-4 h-4" />
            <span>{test.passingPercentage}% to pass</span>
          </div>
        </div>

        {attempt && (
          <div className="text-sm">
            <span className="text-muted-foreground">Your score: </span>
            <span className={attempt.passed ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
              {attempt.scorePercentage}%
            </span>
          </div>
        )}

        <div className="pt-2">
          {status === "not_attempted" ? (
            <Link href={`/shisya/tests/${courseId}/${test.id}`}>
              <Button className="w-full" data-testid={`button-start-test-${test.id}`}>
                Start Test
              </Button>
            </Link>
          ) : (
            <Link href={`/shisya/tests/${courseId}/${test.id}/result`}>
              <Button variant="outline" className="w-full" data-testid={`button-view-result-${test.id}`}>
                View Result
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TestCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export default function CourseTests() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: tests, isLoading: testsLoading } = useQuery<Test[]>({
    queryKey: ["/api/courses", courseId, "tests"],
  });

  const isLoading = courseLoading || testsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          {courseLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <h1 className="text-2xl font-bold font-heading" data-testid="text-page-title">
              Course Tests
            </h1>
          )}
          {course && (
            <p className="text-muted-foreground mt-1" data-testid="text-course-name">
              {course.title}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            <TestCardSkeleton />
            <TestCardSkeleton />
          </div>
        ) : tests && tests.length > 0 ? (
          <div className="grid gap-4" data-testid="tests-grid">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} courseId={courseId!} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tests Available</h3>
              <p className="text-muted-foreground">
                There are no tests assigned to this course yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
