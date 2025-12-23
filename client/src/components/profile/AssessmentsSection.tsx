import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ShieldCheck, Trophy, Target } from "lucide-react";
import type { TestAttempt } from "@shared/schema";
import { format } from "date-fns";

interface AssessmentsSectionProps {
  testAttempts: TestAttempt[];
  showEmpty?: boolean;
  isPublicView?: boolean;
}

export default function AssessmentsSection({ 
  testAttempts, 
  showEmpty = true,
  isPublicView = false 
}: AssessmentsSectionProps) {
  const passedTests = testAttempts.filter(t => t.passed);
  
  if (passedTests.length === 0 && !showEmpty) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (score >= 75) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    return "Passed";
  };

  return (
    <div data-testid="assessments-section">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Assessments & Validation</h3>
        {passedTests.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {passedTests.length} {passedTests.length === 1 ? 'test' : 'tests'} passed
          </Badge>
        )}
      </div>

      {passedTests.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {passedTests.map((attempt, index) => (
            <Card key={`test-${attempt.testId}-${index}`} className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium" data-testid={`assessment-title-${attempt.testId}`}>
                      Course Assessment #{attempt.testId}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className={getScoreColor(attempt.scorePercentage)}>
                        <Trophy className="w-3 h-3 mr-1" />
                        {attempt.scorePercentage}% - {getScoreLabel(attempt.scorePercentage)}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Passed on {format(new Date(attempt.attemptedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No assessments completed yet</p>
            {!isPublicView && (
              <p className="text-sm text-muted-foreground mt-1">
                Complete course tests to validate your skills
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
