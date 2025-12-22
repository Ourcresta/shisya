import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import QuestionCard from "@/components/test/QuestionCard";
import TestTimer from "@/components/test/TestTimer";
import TestProgress from "@/components/test/TestProgress";
import { MithraAvatar } from "@/components/mithra/MithraAvatar";
import type { TestWithQuestionsUI, TestAttemptAnswer } from "@shared/schema";
import { useTestAttempts } from "@/contexts/TestAttemptContext";
import { apiRequest } from "@/lib/queryClient";

export default function TestAttempt() {
  const { courseId, testId } = useParams<{ courseId: string; testId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { recordAttempt, getStatus } = useTestAttempts();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [startTime] = useState(Date.now());

  const { data: test, isLoading } = useQuery<TestWithQuestionsUI>({
    queryKey: ["/api/tests", testId],
  });

  const submitMutation = useMutation({
    mutationFn: async (submitAnswers: TestAttemptAnswer[]) => {
      const response = await apiRequest("POST", `/api/tests/${testId}/submit`, {
        answers: submitAnswers,
        courseId: parseInt(courseId!, 10),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.result) {
        recordAttempt(
          parseInt(testId!, 10),
          parseInt(courseId!, 10),
          Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          })),
          data.result.scorePercentage,
          data.result.passed
        );
        navigate(`/shishya/tests/${courseId}/${testId}/result`);
      }
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your test. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if already attempted
  const status = testId ? getStatus(parseInt(testId, 10)) : "not_attempted";
  useEffect(() => {
    if (status !== "not_attempted") {
      navigate(`/shishya/tests/${courseId}/${testId}/result`);
    }
  }, [status, courseId, testId, navigate]);

  // Prevent page refresh during test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleSelectOption = useCallback((optionId: string) => {
    if (!test) return;
    const questionId = test.questions[currentQuestionIndex].id;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, [test, currentQuestionIndex]);

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!test) return;
    setCurrentQuestionIndex((prev) => Math.min(test.questions.length - 1, prev + 1));
  };

  const handleNavigate = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleTimeUp = useCallback(() => {
    toast({
      title: "Time's Up!",
      description: "Your test will be submitted automatically.",
      variant: "destructive",
    });
    handleSubmit();
  }, []);

  const handleSubmit = () => {
    if (!test) return;
    const submitAnswers: TestAttemptAnswer[] = test.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id] || "",
    }));
    submitMutation.mutate(submitAnswers);
  };

  const answeredQuestions = test
    ? test.questions
        .map((q, i) => (answers[q.id] ? i : -1))
        .filter((i) => i !== -1)
    : [];

  const allAnswered = test
    ? test.questions.every((q) => answers[q.id])
    : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Skeleton className="h-10 w-full mb-6" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-24 w-full mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Test Unavailable</h2>
          <p className="text-muted-foreground mb-4">This test cannot be loaded.</p>
          <Link href={`/shishya/tests/${courseId}`}>
            <Button>Back to Tests</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id] || null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="font-medium truncate" data-testid="text-test-title">
              {test.title}
            </h1>
            {test.timeLimit && (
              <TestTimer
                timeLimitMinutes={test.timeLimit}
                onTimeUp={handleTimeUp}
                startTime={startTime}
              />
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <TestProgress
            totalQuestions={test.questions.length}
            answeredQuestions={answeredQuestions}
            currentQuestion={currentQuestionIndex}
            onNavigate={handleNavigate}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={test.questions.length}
          selectedOptionId={currentAnswer}
          onSelectOption={handleSelectOption}
        />

        <div className="flex items-center justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            data-testid="button-previous"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <Button onClick={handleNext} data-testid="button-next">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={!allAnswered}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-submit"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Test
              </Button>
            )}
          </div>
        </div>

        {!allAnswered && isLastQuestion && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Please answer all questions before submitting.
          </p>
        )}
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your test? You have answered{" "}
              {answeredQuestions.length} of {test.questions.length} questions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              data-testid="button-confirm-submit"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MithraAvatar
        context={{
          courseId: parseInt(courseId!, 10),
          pageType: "lesson",
          courseTitle: test.title,
        }}
        disabled={true}
        disabledMessage="Mithra is unavailable during tests"
      />
    </div>
  );
}
