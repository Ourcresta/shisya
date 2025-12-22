import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import LabInstructions from "@/components/lab/LabInstructions";
import CodeEditor from "@/components/lab/CodeEditor";
import OutputConsole from "@/components/lab/OutputConsole";
import { MithraAvatar } from "@/components/mithra";
import { useToast } from "@/hooks/use-toast";
import { 
  isLabCompleted, 
  markLabCompleted, 
  getSavedLabCode, 
  saveLabCode 
} from "@/lib/labProgress";
import { executeJavaScript, compareOutput } from "@/lib/labRunner";
import type { Lab, Course } from "@shared/schema";
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Lock,
  FlaskConical
} from "lucide-react";

export default function LabPractice() {
  const [, params] = useRoute("/shishya/labs/:courseId/:labId");
  const courseId = params?.courseId ? parseInt(params.courseId, 10) : 0;
  const labId = params?.labId ? parseInt(params.labId, 10) : 0;

  const { toast } = useToast();
  
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [completed, setCompleted] = useState(false);

  const { data: lab, isLoading } = useQuery<Lab>({
    queryKey: ["/api/labs", labId],
    enabled: labId > 0,
  });

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses", courseId.toString()],
    enabled: courseId > 0,
  });

  useEffect(() => {
    if (lab) {
      const savedCode = getSavedLabCode(courseId, labId);
      setCode(savedCode || lab.starterCode);
      setCompleted(isLabCompleted(courseId, labId));
    }
  }, [lab, courseId, labId]);

  const handleRunCode = () => {
    if (!lab) return;
    
    setIsRunning(true);
    setOutput("");
    setError(null);
    setIsMatch(null);
    
    setTimeout(() => {
      const result = executeJavaScript(code);
      
      setOutput(result.output);
      setError(result.error);
      setExecutionTime(result.executionTime);
      setIsRunning(false);
      
      if (result.success) {
        const matched = compareOutput(result.output, lab.expectedOutput);
        setIsMatch(matched);
        
        if (matched && !completed) {
          toast({
            title: "Output matched!",
            description: "Great job! You can now mark this lab as completed.",
          });
        } else if (!matched) {
          toast({
            title: "Output does not match",
            description: "Check your code and try again.",
            variant: "destructive",
          });
        }
      }
      
      saveLabCode(courseId, labId, code);
    }, 100);
  };

  const handleResetCode = () => {
    if (!lab) return;
    setCode(lab.starterCode);
    setOutput("");
    setError(null);
    setIsMatch(null);
    setExecutionTime(undefined);
    
    toast({
      title: "Code reset",
      description: "Starter code has been restored.",
    });
  };

  const handleMarkCompleted = () => {
    markLabCompleted(courseId, labId, code);
    setCompleted(true);
    
    toast({
      title: "Lab completed!",
      description: "Great work! This lab has been marked as completed.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Lab Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This lab doesn't exist or may have been removed.
          </p>
          <Link href={`/shishya/labs/${courseId}`}>
            <Button data-testid="button-back-to-labs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Labs
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6" data-testid="lab-practice-page">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/shishya/labs/${courseId}`}>
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Labs
            </Button>
          </Link>
          
          {completed && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <LabInstructions lab={lab} />
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <CodeEditor 
                  code={code} 
                  onChange={setCode}
                  language="javascript"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex-1 min-w-[120px]"
                    data-testid="button-run-code"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleResetCode}
                    disabled={isRunning}
                    data-testid="button-reset-code"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  
                  {isMatch === true && !completed && (
                    <Button 
                      variant="default"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleMarkCompleted}
                      data-testid="button-mark-complete"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <OutputConsole 
              output={output}
              error={error}
              isRunning={isRunning}
              isMatch={isMatch}
              executionTime={executionTime}
            />

            {completed && (
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
                <CardContent className="flex items-center gap-3 py-4">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-700 dark:text-emerald-400">
                      Lab Completed
                    </p>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                      You've successfully completed this practice lab.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {lab && (
        <MithraAvatar
          context={{
            courseId,
            labId,
            pageType: "lab",
            courseTitle: course?.title,
            labTitle: lab.title,
          }}
        />
      )}
    </div>
  );
}
