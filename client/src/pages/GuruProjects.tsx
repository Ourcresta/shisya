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
import { Plus, Pencil, Trash2, FolderKanban, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
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

interface AIGeneratedProject {
  title: string;
  description: string;
  difficulty: string;
  requirements: string;
  resources: string;
  estimatedHours: number;
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
    createMutation.mutate({
      courseId: aiSelectedCourseId,
      title: aiResult.title,
      description: aiResult.description,
      difficulty: aiResult.difficulty || "medium",
      requirements: aiResult.requirements || null,
      resources: aiResult.resources || null,
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-ai-preview-project-title">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                AI Generated Project Preview
              </div>
            </DialogTitle>
            <DialogDescription>
              Review the generated project. You can save it as-is or close and make manual changes.
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
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-preview-project-desc">{aiResult.description}</p>
              </div>
              {aiResult.requirements && (
                <div>
                  <Label className="text-muted-foreground text-xs">Requirements</Label>
                  <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-preview-project-reqs">{aiResult.requirements}</p>
                </div>
              )}
              {aiResult.resources && (
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
