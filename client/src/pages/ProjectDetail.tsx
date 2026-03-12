import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, Redirect } from "wouter";
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  CheckCircle2, 
  Github,
  ExternalLink,
  FileText,
  ClipboardList,
  Award,
  ChevronDown,
  ChevronRight,
  Wrench,
  ListChecks
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DifficultyBadge, ProjectStatusBadge } from "@/components/project/ProjectStatusBadge";
import { ProjectSubmissionForm } from "@/components/project/ProjectSubmissionForm";
import { 
  getProjectSubmission, 
  isProjectSubmitted, 
  saveProjectSubmission 
} from "@/lib/submissions";
import { apiRequest } from "@/lib/queryClient";
import { UshaAvatar } from "@/components/usha";
import { useAuth } from "@/contexts/AuthContext";
import type { Project, ProjectSubmission, Course } from "@shared/schema";

type AiTask = {
  title: string;
  tools: string[];
  process: string;
  steps: string[];
  checklist: string[];
};

function parseRequirementsField(raw: any): { type: "object"; data: any } | { type: "tasks"; data: AiTask[] } | { type: "text"; data: string } | null {
  if (!raw) return null;
  if (typeof raw === "object") return { type: "object", data: raw };
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return { type: "tasks", data: parsed as AiTask[] };
      }
    } catch { /* not JSON */ }
    return { type: "text", data: raw };
  }
  return null;
}

export default function ProjectDetail() {
  const { courseId, projectId } = useParams<{ courseId: string; projectId: string }>();
  const courseIdNum = parseInt(courseId || "0", 10);
  const projectIdNum = parseInt(projectId || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});

  // Track submission state locally for immediate UI updates
  const [localSubmission, setLocalSubmission] = useState<ProjectSubmission | null>(() => 
    getProjectSubmission(courseIdNum, projectIdNum)
  );

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { githubUrl: string; liveUrl?: string; notes?: string }) => {
      // Save to localStorage first
      const submission = saveProjectSubmission(courseIdNum, projectIdNum, data);
      setLocalSubmission(submission);
      
      // Also notify the backend (for future integration)
      await apiRequest("POST", `/api/projects/${projectId}/submissions`, data);
      
      return submission;
    },
    onSuccess: () => {
      toast({
        title: "Project Submitted!",
        description: "Your project has been submitted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Saved Locally",
        description: "Your submission has been saved. It will sync when the server is available.",
      });
    },
  });

  const isSubmitted = localSubmission?.submitted || isProjectSubmitted(courseIdNum, projectIdNum);
  const submission = localSubmission || getProjectSubmission(courseIdNum, projectIdNum);

  if (error) {
    return <Redirect to={`/shishya/projects/${courseId}`} />;
  }

  return (
    <Layout>
      {isLoading ? (
        <ProjectDetailSkeleton />
      ) : project ? (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Navigation */}
          <Link href={`/shishya/projects/${courseId}`}>
            <Button variant="ghost" size="sm" className="gap-2 -ml-2" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>

          {/* Project Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <DifficultyBadge difficulty={project.difficulty} />
              <ProjectStatusBadge submitted={isSubmitted} />
            </div>
            
            <h1 
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-project-title"
            >
              {project.title}
            </h1>

            {project.estimatedHours && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{project.estimatedHours} hours estimated</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Project Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  Project Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed" data-testid="text-description">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Learning Outcomes */}
          {project.learningOutcomes && project.learningOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Learning Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-outcomes">
                  {project.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements / AI Tasks */}
          {(() => {
            const parsed = parseRequirementsField((project as any).requirements);
            if (!parsed) return null;

            if (parsed.type === "object") {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ClipboardList className="w-5 h-5 text-amber-500" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2" data-testid="list-requirements">
                      <li className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-muted-foreground" />
                        <span>GitHub repository: </span>
                        <Badge variant={parsed.data.githubRequired ? "default" : "secondary"}>
                          {parsed.data.githubRequired ? "Required" : "Optional"}
                        </Badge>
                      </li>
                      <li className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <span>Live URL: </span>
                        <Badge variant={parsed.data.liveUrlRequired ? "default" : "secondary"}>
                          {parsed.data.liveUrlRequired ? "Required" : "Optional"}
                        </Badge>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>Documentation: </span>
                        <Badge variant={parsed.data.documentationRequired ? "default" : "secondary"}>
                          {parsed.data.documentationRequired ? "Required" : "Optional"}
                        </Badge>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              );
            }

            if (parsed.type === "tasks") {
              return (
                <div className="space-y-3" data-testid="list-ai-tasks">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-amber-500" />
                    Project Tasks ({parsed.data.length})
                  </h2>
                  {parsed.data.map((task, ti) => (
                    <Card key={ti} className="border-amber-200 dark:border-amber-800/40">
                      <CardHeader
                        className="pb-2 cursor-pointer select-none"
                        onClick={() => setExpandedTasks(prev => ({ ...prev, [ti]: !prev[ti] }))}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center font-bold">
                              {ti + 1}
                            </span>
                            <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
                          </div>
                          {expandedTasks[ti] ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                        </div>
                        {task.tools?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 ml-8">
                            {task.tools.map((t, i) => {
                              const name = t.split(" (")[0].trim();
                              const urlMatch = t.match(/\((https?:\/\/[^)]+)\)/);
                              return urlMatch ? (
                                <a key={i} href={urlMatch[1]} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                  <Badge variant="outline" className="text-xs text-teal-600 border-teal-300 dark:text-teal-400 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20">{name}</Badge>
                                </a>
                              ) : (
                                <Badge key={i} variant="outline" className="text-xs text-teal-600 border-teal-300 dark:text-teal-400 dark:border-teal-700">{name}</Badge>
                              );
                            })}
                          </div>
                        )}
                      </CardHeader>
                      {expandedTasks[ti] && (
                        <CardContent className="pt-0 space-y-4">
                          {task.process && (
                            <p className="text-sm text-muted-foreground bg-muted/50 rounded p-3 leading-relaxed">{task.process}</p>
                          )}
                          {task.steps?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Steps</p>
                              <ol className="space-y-2">
                                {task.steps.map((step, si) => (
                                  <li key={si} className="flex gap-2 text-sm">
                                    <span className="flex-shrink-0 w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-mono font-bold mt-0.5">{si + 1}</span>
                                    <span className="leading-relaxed">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {task.checklist?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Checklist</p>
                              <ul className="space-y-1.5">
                                {task.checklist.map((item, ci) => (
                                  <li key={ci} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              );
            }

            // Plain text
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="text-requirements">{parsed.data}</p>
                </CardContent>
              </Card>
            );
          })()}

          {/* Resources / Tools (for local DB projects) */}
          {(project as any).resources && typeof (project as any).resources === "string" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5 text-teal-500" />
                  Tools &amp; Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" data-testid="list-resources">
                  {(project as any).resources.split("\n").filter(Boolean).map((tool: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-sm">{tool.trim()}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evaluation Criteria */}
          {project.evaluationCriteria && project.evaluationCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  Evaluation Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal list-inside" data-testid="list-criteria">
                  {project.evaluationCriteria.map((criterion, index) => (
                    <li key={index} className="text-foreground">
                      {criterion}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {project.skills && project.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills Validated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" data-testid="list-skills">
                  {project.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Submission Section */}
          <div className="space-y-4">
            <h2 
              className="text-xl font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {isSubmitted ? "Your Submission" : "Submit Your Project"}
            </h2>

            {isSubmitted && submission ? (
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Project Submitted</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">GitHub Repository</p>
                      <a 
                        href={submission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                        data-testid="link-submitted-github"
                      >
                        <Github className="w-4 h-4" />
                        {submission.githubUrl}
                      </a>
                    </div>

                    {submission.liveUrl && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Live Demo</p>
                        <a 
                          href={submission.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                          data-testid="link-submitted-live"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {submission.liveUrl}
                        </a>
                      </div>
                    )}

                    {submission.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="text-foreground" data-testid="text-submitted-notes">
                          {submission.notes}
                        </p>
                      </div>
                    )}

                    {submission.submittedAt && (
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <ProjectSubmissionForm
                    onSubmit={(data) => submitMutation.mutate(data)}
                    isSubmitting={submitMutation.isPending}
                    liveUrlRequired={project.requirements?.liveUrlRequired}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="pb-8">
            <Link href={`/shishya/projects/${courseId}`}>
              <Button variant="outline" className="gap-2" data-testid="button-back-bottom">
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Usha AI Tutor Avatar */}
      {user && project && (
        <UshaAvatar
          context={{
            courseId: courseIdNum,
            projectId: projectIdNum,
            pageType: "project",
            courseTitle: course?.title,
            projectTitle: project.title,
          }}
        />
      )}
    </Layout>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Skeleton className="h-9 w-32" />
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-32" />
      </div>

      <Separator />

      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-5 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
