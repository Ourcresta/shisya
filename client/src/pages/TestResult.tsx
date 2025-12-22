import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { Test, Course } from "@shared/schema";
import { useTestAttempts } from "@/contexts/TestAttemptContext";
import { format } from "date-fns";

export default function TestResult() {
  const { courseId, testId } = useParams<{ courseId: string; testId: string }>();
  const { getAttempt } = useTestAttempts();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: test, isLoading: testLoading } = useQuery<Test>({
    queryKey: ["/api/tests", testId],
  });

  const attempt = testId ? getAttempt(parseInt(testId, 10)) : null;
  const isLoading = courseLoading || testLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No Result Found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't attempted this test yet.
          </p>
          <Link href={`/shishya/tests/${courseId}/${testId}`}>
            <Button>View Test</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const passed = attempt.passed;
  const scorePercentage = attempt.scorePercentage;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <Link href={`/shishya/tests/${courseId}`}>
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Tests
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              {passed ? (
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-rose-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl" data-testid="text-result-status">
              {passed ? "Congratulations! You Passed!" : "Test Not Passed"}
            </CardTitle>
            {test && (
              <CardDescription data-testid="text-test-title">
                {test.title}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div
                className={`text-5xl font-bold mb-2 ${
                  passed ? "text-emerald-600" : "text-rose-600"
                }`}
                data-testid="text-score"
              >
                {scorePercentage}%
              </div>
              <p className="text-muted-foreground">Your Score</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score Progress</span>
                <span>{scorePercentage}%</span>
              </div>
              <Progress
                value={scorePercentage}
                className={`h-3 ${
                  passed
                    ? "[&>div]:bg-emerald-600"
                    : "[&>div]:bg-rose-600"
                }`}
              />
              {test && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="flex items-center gap-1">
                    <span>Passing: {test.passingPercentage}%</span>
                  </span>
                  <span>100%</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="text-correct-count">
                  {Math.round((scorePercentage / 100) * (test?.questionCount || 0))}
                </div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="text-incorrect-count">
                  {(test?.questionCount || 0) -
                    Math.round((scorePercentage / 100) * (test?.questionCount || 0))}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect Answers</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              {passed ? (
                <div className="p-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-emerald-800 dark:text-emerald-200">
                        Certificate Eligibility
                      </h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        You are eligible for certification (subject to project completion if required).
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-md bg-muted">
                  <h4 className="font-medium mb-1">Don't give up!</h4>
                  <p className="text-sm text-muted-foreground">
                    Review the course material and try again when you're ready. Retaking tests is not available in this version.
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Attempted on {format(new Date(attempt.attemptedAt), "MMMM d, yyyy 'at' h:mm a")}
            </div>

            <div className="flex gap-4 pt-4">
              <Link href={`/shishya/tests/${courseId}`} className="flex-1">
                <Button variant="outline" className="w-full" data-testid="button-back-tests">
                  View All Tests
                </Button>
              </Link>
              <Link href={`/courses/${courseId}`} className="flex-1">
                <Button className="w-full" data-testid="button-back-course">
                  Back to Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
