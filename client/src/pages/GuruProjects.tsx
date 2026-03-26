import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FolderKanban, Sparkles, Loader2, CheckCircle2, ChevronDown, ChevronRight, Wrench, BookOpen, ClipboardList, CheckCircle, Zap } from "lucide-react";
import { AiGenerateDialog } from "@/components/guru/AiGenerateDialog";
import { Label } from "@/components/ui/label";

interface ProjectItem {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  difficulty: string;
  requirements: string | null;
  resources: string | null;
  estimatedHours: number | null;
  createdAt: string;
  courseTitle: string;
}

interface CourseOption {
  id: number;
  title: string;
}

interface ProjectForm {
  courseId: number | null;
  title: string;
  description: string;
  difficulty: string;
  requirements: string;
  resources: string;
  estimatedHours: string;
}

const defaultForm: ProjectForm = {
  courseId: null,
  title: "",
  description: "",
  difficulty: "medium",
  requirements: "",
  resources: "",
  estimatedHours: "",
};

interface AIProjectTask {
  title: string;
  tools: string[];
  process: string;
  steps: string[];
  checklist: string[];
}

interface AIGeneratedProject {
  title: string;
  description: string;
  difficulty: string;
  requirements?: string;
  resources?: string;
  estimatedHours: number;
  tools?: string[];
  tasks?: AIProjectTask[];
}

export default function GuruProjects() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [form, setForm] = useState<ProjectForm>(defaultForm);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIGeneratedProject | null>(null);
  const [aiSelectedCourseId, setAiSelectedCourseId] = useState<number | null>(null);
  const [expandedPreviewTasks, setExpandedPreviewTasks] = useState<Set<number>>(new Set([0]));

  const { data: projectList, isLoading } = useQuery<ProjectItem[]>({
    queryKey: ["/api/guru/projects"],
  });

  const { data: courseOptions } = useQuery<CourseOption[]>({
    queryKey: ["/api/guru/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/guru/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      setCreateOpen(false);
      setForm(defaultForm);
      toast({ title: "Project created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create project", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/guru/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/projects"] });
      setEditOpen(false);
      setSelectedProject(null);
      toast({ title: "Project updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update project", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/projects/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      setDeleteOpen(false);
      setSelectedProject(null);
      toast({ title: "Project deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete project", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmitCreate = () => {
    if (!form.courseId || !form.title || !form.description) return;
    createMutation.mutate({
      courseId: form.courseId,
      title: form.title,
      description: form.description,
      difficulty: form.difficulty,
      requirements: form.requirements || null,
      resources: form.resources || null,
      estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : null,
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedProject || !form.title || !form.description) return;
    updateMutation.mutate({
      id: selectedProject.id,
      data: {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        requirements: form.requirements || null,
        resources: form.resources || null,
        estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : null,
      },
    });
  };

  const openEdit = (project: ProjectItem) => {
    setSelectedProject(project);
    setForm({
      courseId: project.courseId,
      title: project.title,
      description: project.description || "",
      difficulty: project.difficulty || "medium",
      requirements: project.requirements || "",
      resources: project.resources || "",
      estimatedHours: project.estimatedHours ? String(project.estimatedHours) : "",
    });
    setEditOpen(true);
  };

  const openDelete = (project: ProjectItem) => {
    setSelectedProject(project);
    setDeleteOpen(true);
  };

  const handleAiGenerate = async ({ courseId, level, extraInstructions }: { courseId: number; level: string; extraInstructions: string }) => {
    const course = (courseOptions || []).find((c) => c.id === courseId);
    if (!course) return;

    setAiGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/guru/ai/generate-project", {
        courseTitle: course.title,
        level,
        extraInstructions,
      });
      const data = await res.json();
      setAiResult(data);
      setAiSelectedCourseId(courseId);
      setExpandedPreviewTasks(new Set([0]));
      setAiDialogOpen(false);
      setAiPreviewOpen(true);
    } catch (error: any) {
      toast({ title: "AI generation failed", description: error.message, variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiSave = () => {
    if (!aiResult || !aiSelectedCourseId) return;
    const tasks = aiResult.tasks || [];
    const requirementsData = tasks.length > 0 ? JSON.stringify(tasks) : (aiResult.requirements || null);
    let allTools = aiResult.tools || [];
    if (allTools.length === 0 && Array.isArray(aiResult.tasks)) {
      const taskToolSet = new Set<string>();
      aiResult.tasks.forEach((t: any) => {
        if (Array.isArray(t.tools)) t.tools.forEach((tool: string) => taskToolSet.add(tool));
      });
      allTools = Array.from(taskToolSet);
    }
    const resourcesData = allTools.length > 0
      ? allTools.map((t: string) => t.split(" (")[0].trim()).join("\n")
      : (aiResult.resources || null);
    createMutation.mutate({
      courseId: aiSelectedCourseId,
      title: aiResult.title,
      description: aiResult.description,
      difficulty: aiResult.difficulty || "medium",
      requirements: requirementsData,
      resources: resourcesData,
      estimatedHours: aiResult.estimatedHours || null,
    });
    setAiPreviewOpen(false);
    setAiResult(null);
  };

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-500/10 text-green-700 dark:text-green-400",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    hard: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-projects-title">
            Projects
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-projects-subtitle">
            Manage capstone assignments
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setAiDialogOpen(true)}
            data-testid="button-ai-generate-project"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button
            onClick={() => { setForm(defaultForm); setCreateOpen(true); }}
            data-testid="button-create-project"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : projectList && projectList.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectList.map((project) => (
                  <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                    <TableCell>
                      <span className="font-medium" data-testid={`text-project-title-${project.id}`}>
                        {project.title}
                      </span>
                    </TableCell>
                    <TableCell data-testid={`text-project-course-${project.id}`}>
                      {project.courseTitle}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`capitalize no-default-hover-elevate no-default-active-elevate ${difficultyColors[project.difficulty] || ""}`}
                        data-testid={`badge-project-difficulty-${project.id}`}
                      >
                        {project.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-project-hours-${project.id}`}>
                      {project.estimatedHours ?? "-"}
                    </TableCell>
                    <TableCell data-testid={`text-project-created-${project.id}`}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(project)}
                          data-testid={`button-edit-project-${project.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(project)}
                          data-testid={`button-delete-project-${project.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="empty-projects">
          <CardContent className="p-8 text-center">
            <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No projects yet. Create your first project to get started.
            </p>
            <Button onClick={() => { setForm(defaultForm); setCreateOpen(true); }} data-testid="button-create-first-project">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-create-project-dialog-title">Create Project</DialogTitle>
            <DialogDescription>Add a new capstone assignment</DialogDescription>
          </DialogHeader>
          <ProjectFormFields form={form} setForm={setForm} courses={courseOptions || []} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-create-project">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={!form.title || !form.courseId || !form.description || createMutation.isPending}
              data-testid="button-submit-create-project"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-project-dialog-title">Edit Project</DialogTitle>
            <DialogDescription>Update project details</DialogDescription>
          </DialogHeader>
          <ProjectFormFields form={form} setForm={setForm} courses={courseOptions || []} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit-project">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={!form.title || !form.description || updateMutation.isPending}
              data-testid="button-submit-edit-project"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-project-dialog-title">Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-project">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProject && deleteMutation.mutate(selectedProject.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-project"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AiGenerateDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        title="AI Generate Project"
        description="Select a course and difficulty level. AI will design a project automatically."
        courses={courseOptions || []}
        onGenerate={handleAiGenerate}
        isGenerating={aiGenerating}
        testIdPrefix="ai-project"
      />

      <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-ai-preview-project-title">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                AI Generated Project Preview
              </div>
            </DialogTitle>
            <DialogDescription>
              Review the generated project with its structured tasks, steps, and tools. Save it or discard.
            </DialogDescription>
          </DialogHeader>
          {aiResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium" data-testid="text-ai-preview-project-name">{aiResult.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Course</Label>
                  <p className="font-medium" data-testid="text-ai-preview-project-course">
                    {(courseOptions || []).find((c) => c.id === aiSelectedCourseId)?.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className={`capitalize no-default-hover-elevate no-default-active-elevate ${difficultyColors[aiResult.difficulty] || ""}`}
                >
                  {aiResult.difficulty}
                </Badge>
                {aiResult.estimatedHours && (
                  <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                    {aiResult.estimatedHours} hours
                  </Badge>
                )}
                {(aiResult.tasks || []).length > 0 && (
                  <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">
                    {aiResult.tasks!.length} tasks
                  </Badge>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-preview-project-desc">{aiResult.description}</p>
              </div>

              {(aiResult.tools || []).length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1 mb-1.5">
                    <Wrench className="w-3 h-3" /> Free Tools Used
                  </Label>
                  <div className="flex flex-wrap gap-1.5" data-testid="ai-preview-tools">
                    {(aiResult.tools || []).map((tool, i) => {
                      const [name, urlPart] = tool.split(" (");
                      const url = urlPart ? urlPart.replace(")", "") : null;
                      return url ? (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-full hover:bg-violet-500/20 transition-colors">
                          {name.trim()}
                        </a>
                      ) : (
                        <span key={i} className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-full">
                          {name.trim()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {(aiResult.tasks || []).length > 0 && (
                <div className="space-y-2" data-testid="ai-preview-tasks">
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" /> Project Tasks
                  </Label>
                  {(aiResult.tasks || []).map((task, ti) => {
                    const isOpen = expandedPreviewTasks.has(ti);
                    return (
                      <div key={ti} className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden" data-testid={`ai-preview-task-${ti}`}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 p-3 text-left bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                          onClick={() => setExpandedPreviewTasks(prev => {
                            const next = new Set(prev);
                            next.has(ti) ? next.delete(ti) : next.add(ti);
                            return next;
                          })}
                        >
                          <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {ti + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-amber-800 dark:text-amber-200">{task.title}</p>
                            {(task.tools || []).length > 0 && !isOpen && (
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {(task.tools || []).slice(0, 3).map((tool, tli) => (
                                  <span key={tli} className="text-xs bg-violet-500/15 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded">
                                    {tool.split(" (")[0]}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isOpen
                            ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          }
                        </button>

                        {isOpen && (
                          <div className="p-4 space-y-4 bg-background">
                            {(task.tools || []).length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                  <Wrench className="w-3 h-3" /> Tools
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {(task.tools || []).map((tool, tli) => {
                                    const [name, urlPart] = tool.split(" (");
                                    const url = urlPart ? urlPart.replace(")", "") : null;
                                    return url ? (
                                      <a key={tli} href={url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-full hover:bg-violet-500/20 transition-colors">
                                        {name.trim()}
                                      </a>
                                    ) : (
                                      <span key={tli} className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-full">
                                        {name.trim()}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {task.process && (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" /> Process
                                </p>
                                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 rounded-lg p-3">{task.process}</p>
                              </div>
                            )}

                            {(task.steps || []).length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                  <ClipboardList className="w-3 h-3" /> Steps
                                </p>
                                <div className="space-y-2">
                                  {(task.steps || []).map((step, si) => (
                                    <div key={si} className="flex gap-3 items-start">
                                      <div className="w-6 h-6 rounded-full bg-slate-700 dark:bg-slate-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {si + 1}
                                      </div>
                                      <p className="text-foreground/80 leading-snug font-mono text-xs bg-slate-50 dark:bg-slate-900 border rounded p-2 flex-1">
                                        {step}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(task.checklist || []).length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-600" /> Checklist
                                </p>
                                <div className="space-y-1 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                                  {(task.checklist || []).map((item, ci) => (
                                    <div key={ci} className="flex items-start gap-2 text-sm">
                                      <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                      <span className="text-foreground/80">{item.replace(/^\[\s*\]\s*/, "")}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {aiResult.requirements && !(aiResult.tasks || []).length && (
                <div>
                  <Label className="text-muted-foreground text-xs">Requirements</Label>
                  <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-preview-project-reqs">{aiResult.requirements}</p>
                </div>
              )}
              {aiResult.resources && !(aiResult.tools || []).length && (
                <div>
                  <Label className="text-muted-foreground text-xs">Resources</Label>
                  <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-preview-project-resources">{aiResult.resources}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAiPreviewOpen(false); setAiResult(null); }} data-testid="button-discard-ai-project">
              Discard
            </Button>
            <Button
              onClick={handleAiSave}
              disabled={createMutation.isPending}
              data-testid="button-save-ai-project"
            >
              {createMutation.isPending ? "Saving..." : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectFormFields({
  form, setForm, courses,
}: {
  form: ProjectForm;
  setForm: (f: ProjectForm) => void;
  courses: CourseOption[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Course *</Label>
        <Select
          value={form.courseId ? String(form.courseId) : ""}
          onValueChange={(v) => setForm({ ...form, courseId: parseInt(v) })}
        >
          <SelectTrigger data-testid="select-project-course">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="project-title">Title *</Label>
        <Input
          id="project-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Project title"
          data-testid="input-project-title"
        />
      </div>
      <div>
        <Label htmlFor="project-description">Description *</Label>
        <Textarea
          id="project-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Project description"
          rows={3}
          data-testid="input-project-description"
        />
      </div>
      <div>
        <Label>Difficulty</Label>
        <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
          <SelectTrigger data-testid="select-project-difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="project-requirements">Requirements</Label>
        <Textarea
          id="project-requirements"
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          placeholder="Project requirements"
          rows={3}
          data-testid="input-project-requirements"
        />
      </div>
      <div>
        <Label htmlFor="project-resources">Resources</Label>
        <Textarea
          id="project-resources"
          value={form.resources}
          onChange={(e) => setForm({ ...form, resources: e.target.value })}
          placeholder="Helpful resources or links"
          rows={2}
          data-testid="input-project-resources"
        />
      </div>
      <div>
        <Label htmlFor="project-hours">Estimated Hours</Label>
        <Input
          id="project-hours"
          type="number"
          value={form.estimatedHours}
          onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
          placeholder="e.g. 10"
          data-testid="input-project-hours"
        />
      </div>
    </div>
  );
}
