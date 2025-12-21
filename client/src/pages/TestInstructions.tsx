import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileQuestion, Percent, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Test, Course } from "@shared/schema";
import { useTestAttempts } from "@/contexts/TestAttemptContext";

export default function TestInstructions() {
  const { courseId, testId } = useParams<{ courseId: string; testId: string }>();
  const [, navigate] = useLocation();
  const { getStatus, getAttempt } = useTestAttempts();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: test, isLoading: testLoading } = useQuery<Test>({
    queryKey: ["/api/tests", testId],
  });

  const status = testId ? getStatus(parseInt(testId, 10)) : "not_attempted";
  const attempt = testId ? getAttempt(parseInt(testId, 10)) : null;
  const isLoading = courseLoading || testLoading;

  const handleStartTest = () => {
    navigate(`/courses/${courseId}/tests/${testId}/attempt`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Test Not Found</h2>
          <p className="text-muted-foreground mb-4">The test you're looking for doesn't exist.</p>
          <Link href={`/courses/${courseId}/tests`}>
            <Button>Back to Tests</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <Link href={`/courses/${courseId}/tests`}>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-test-title">
              {test.title}
            </CardTitle>
            {course && (
              <CardDescription data-testid="text-course-name">
                {course.title}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {test.description && (
              <p className="text-muted-foreground" data-testid="text-test-description">
                {test.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold" data-testid="text-question-count">
                  {test.questionCount}
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold" data-testid="text-time-limit">
                  {test.timeLimit || "No"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {test.timeLimit ? "Minutes" : "Time Limit"}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Percent className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold" data-testid="text-passing-percentage">
                  {test.passingPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">To Pass</div>
              </div>
            </div>

            {test.instructions && (
              <div>
                <h3 className="font-medium mb-2">Instructions</h3>
                <p className="text-muted-foreground text-sm" data-testid="text-instructions">
                  {test.instructions}
                </p>
              </div>
            )}

            <Alert variant="destructive" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Once started, the test must be completed in one session. Do not refresh or close the browser during the test.
              </AlertDescription>
            </Alert>

            {status !== "not_attempted" && attempt && (
              <div className="p-4 rounded-md bg-muted">
                <h3 className="font-medium mb-2">Previous Attempt</h3>
                <p className="text-sm text-muted-foreground">
                  You scored <span className={attempt.passed ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>{attempt.scorePercentage}%</span>
                  {" "}and {attempt.passed ? "passed" : "did not pass"} this test.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Retaking tests is not available in this version.
                </p>
              </div>
            )}

            <div className="pt-4">
              {status === "not_attempted" ? (
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleStartTest}
                  data-testid="button-start-test"
                >
                  Start Test
                </Button>
              ) : (
                <Link href={`/courses/${courseId}/tests/${testId}/result`}>
                  <Button variant="outline" className="w-full" size="lg" data-testid="button-view-result">
                    View Your Result
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
