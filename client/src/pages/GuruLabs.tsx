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
import { Plus, Pencil, Trash2, FlaskConical, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { AiGenerateDialog } from "@/components/guru/AiGenerateDialog";
import { Label } from "@/components/ui/label";

interface LabItem {
  id: number;
  courseId: number;
  title: string;
  instructions: string | null;
  starterCode: string | null;
  expectedOutput: string | null;
  solutionCode: string | null;
  language: string;
  orderIndex: number;
  createdAt: string;
  courseTitle: string;
}

interface CourseOption {
  id: number;
  title: string;
}

interface LabForm {
  courseId: number | null;
  title: string;
  instructions: string;
  starterCode: string;
  expectedOutput: string;
  solutionCode: string;
  language: string;
  orderIndex: number;
}

const defaultForm: LabForm = {
  courseId: null,
  title: "",
  instructions: "",
  starterCode: "",
  expectedOutput: "",
  solutionCode: "",
  language: "javascript",
  orderIndex: 0,
};

interface AIGeneratedLab {
  title: string;
  instructions: string;
  starterCode: string;
  expectedOutput: string;
  solutionCode: string;
  language: string;
}

export default function GuruLabs() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabItem | null>(null);
  const [form, setForm] = useState<LabForm>(defaultForm);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiLanguage, setAiLanguage] = useState("javascript");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIGeneratedLab | null>(null);
  const [aiSelectedCourseId, setAiSelectedCourseId] = useState<number | null>(null);

  const { data: labList, isLoading } = useQuery<LabItem[]>({
    queryKey: ["/api/guru/labs"],
  });

  const { data: courseOptions } = useQuery<CourseOption[]>({
    queryKey: ["/api/guru/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/guru/labs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/labs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      setCreateOpen(false);
      setForm(defaultForm);
      toast({ title: "Lab created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create lab", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/guru/labs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/labs"] });
      setEditOpen(false);
      setSelectedLab(null);
      toast({ title: "Lab updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update lab", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/labs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/labs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      setDeleteOpen(false);
      setSelectedLab(null);
      toast({ title: "Lab deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete lab", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmitCreate = () => {
    if (!form.courseId || !form.title || !form.instructions) return;
    createMutation.mutate({
      courseId: form.courseId,
      title: form.title,
      instructions: form.instructions,
      starterCode: form.starterCode || null,
      expectedOutput: form.expectedOutput || null,
      solutionCode: form.solutionCode || null,
      language: form.language,
      orderIndex: form.orderIndex,
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedLab || !form.title || !form.instructions) return;
    updateMutation.mutate({
      id: selectedLab.id,
      data: {
        title: form.title,
        instructions: form.instructions,
        starterCode: form.starterCode || null,
        expectedOutput: form.expectedOutput || null,
        solutionCode: form.solutionCode || null,
        language: form.language,
        orderIndex: form.orderIndex,
      },
    });
  };

  const openEdit = (lab: LabItem) => {
    setSelectedLab(lab);
    setForm({
      courseId: lab.courseId,
      title: lab.title,
      instructions: lab.instructions || "",
      starterCode: lab.starterCode || "",
      expectedOutput: lab.expectedOutput || "",
      solutionCode: lab.solutionCode || "",
      language: lab.language || "javascript",
      orderIndex: lab.orderIndex || 0,
    });
    setEditOpen(true);
  };

  const openDelete = (lab: LabItem) => {
    setSelectedLab(lab);
    setDeleteOpen(true);
  };

  const handleAiGenerate = async ({ courseId, level, extraInstructions }: { courseId: number; level: string; extraInstructions: string }) => {
    const course = (courseOptions || []).find((c) => c.id === courseId);
    if (!course) return;

    setAiGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/guru/ai/generate-lab", {
        courseTitle: course.title,
        level,
        language: aiLanguage,
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
      instructions: aiResult.instructions,
      starterCode: aiResult.starterCode || null,
      expectedOutput: aiResult.expectedOutput || null,
      solutionCode: aiResult.solutionCode || null,
      language: aiResult.language || "javascript",
      orderIndex: 0,
    });
    setAiPreviewOpen(false);
    setAiResult(null);
  };

  const langColors: Record<string, string> = {
    javascript: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    python: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    html: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    css: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-labs-title">
            Practice Labs
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-labs-subtitle">
            Build and manage coding exercises
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => { setAiLanguage("javascript"); setAiDialogOpen(true); }}
            data-testid="button-ai-generate-lab"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button
            onClick={() => { setForm(defaultForm); setCreateOpen(true); }}
            data-testid="button-create-lab"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Lab
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
      ) : labList && labList.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labList.map((lab) => (
                  <TableRow key={lab.id} data-testid={`row-lab-${lab.id}`}>
                    <TableCell>
                      <span className="font-medium" data-testid={`text-lab-title-${lab.id}`}>
                        {lab.title}
                      </span>
                    </TableCell>
                    <TableCell data-testid={`text-lab-course-${lab.id}`}>
                      {lab.courseTitle}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`no-default-hover-elevate no-default-active-elevate ${langColors[lab.language] || ""}`}
                        data-testid={`badge-lab-language-${lab.id}`}
                      >
                        {lab.language}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-lab-order-${lab.id}`}>
                      {lab.orderIndex}
                    </TableCell>
                    <TableCell data-testid={`text-lab-created-${lab.id}`}>
                      {new Date(lab.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(lab)}
                          data-testid={`button-edit-lab-${lab.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(lab)}
                          data-testid={`button-delete-lab-${lab.id}`}
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
        <Card data-testid="empty-labs">
          <CardContent className="p-8 text-center">
            <FlaskConical className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No labs yet. Create your first lab to get started.
            </p>
            <Button onClick={() => { setForm(defaultForm); setCreateOpen(true); }} data-testid="button-create-first-lab">
              <Plus className="w-4 h-4 mr-2" />
              Create Lab
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-create-lab-dialog-title">Create Lab</DialogTitle>
            <DialogDescription>Build a new coding exercise</DialogDescription>
          </DialogHeader>
          <LabFormFields form={form} setForm={setForm} courses={courseOptions || []} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-create-lab">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={!form.title || !form.courseId || !form.instructions || createMutation.isPending}
              data-testid="button-submit-create-lab"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-lab-dialog-title">Edit Lab</DialogTitle>
            <DialogDescription>Update lab details</DialogDescription>
          </DialogHeader>
          <LabFormFields form={form} setForm={setForm} courses={courseOptions || []} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit-lab">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={!form.title || !form.instructions || updateMutation.isPending}
              data-testid="button-submit-edit-lab"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-lab-dialog-title">Delete Lab</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedLab?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-lab">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedLab && deleteMutation.mutate(selectedLab.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-lab"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AiGenerateDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        title="AI Generate Lab"
        description="Select a course, language, and difficulty. AI will create a coding exercise automatically."
        courses={courseOptions || []}
        onGenerate={handleAiGenerate}
        isGenerating={aiGenerating}
        testIdPrefix="ai-lab"
        extraFields={() => (
          <div>
            <Label>Programming Language</Label>
            <Select value={aiLanguage} onValueChange={setAiLanguage}>
              <SelectTrigger data-testid="select-ai-lab-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-ai-preview-lab-title">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                AI Generated Lab Preview
              </div>
            </DialogTitle>
            <DialogDescription>
              Review the generated lab. You can save it as-is or discard and try again.
            </DialogDescription>
          </DialogHeader>
          {aiResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium" data-testid="text-ai-preview-lab-name">{aiResult.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Course</Label>
                  <p className="font-medium" data-testid="text-ai-preview-lab-course">
                    {(courseOptions || []).find((c) => c.id === aiSelectedCourseId)?.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className={`no-default-hover-elevate no-default-active-elevate ${langColors[aiResult.language] || ""}`}
                >
                  {aiResult.language}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Instructions</Label>
                <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-preview-lab-instructions">{aiResult.instructions}</p>
              </div>
              {aiResult.starterCode && (
                <div>
                  <Label className="text-muted-foreground text-xs">Starter Code</Label>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto font-mono whitespace-pre-wrap" data-testid="text-ai-preview-lab-starter">
                    {aiResult.starterCode}
                  </pre>
                </div>
              )}
              {aiResult.expectedOutput && (
                <div>
                  <Label className="text-muted-foreground text-xs">Expected Output</Label>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto font-mono whitespace-pre-wrap" data-testid="text-ai-preview-lab-output">
                    {aiResult.expectedOutput}
                  </pre>
                </div>
              )}
              {aiResult.solutionCode && (
                <div>
                  <Label className="text-muted-foreground text-xs">Solution Code</Label>
                  <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto font-mono whitespace-pre-wrap" data-testid="text-ai-preview-lab-solution">
                    {aiResult.solutionCode}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAiPreviewOpen(false); setAiResult(null); }} data-testid="button-discard-ai-lab">
              Discard
            </Button>
            <Button
              onClick={handleAiSave}
              disabled={createMutation.isPending}
              data-testid="button-save-ai-lab"
            >
              {createMutation.isPending ? "Saving..." : "Save Lab"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabFormFields({
  form, setForm, courses,
}: {
  form: LabForm;
  setForm: (f: LabForm) => void;
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
          <SelectTrigger data-testid="select-lab-course">
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
        <Label htmlFor="lab-title">Title *</Label>
        <Input
          id="lab-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Lab title"
          data-testid="input-lab-title"
        />
      </div>
      <div>
        <Label htmlFor="lab-instructions">Instructions *</Label>
        <Textarea
          id="lab-instructions"
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          placeholder="Lab instructions"
          rows={3}
          data-testid="input-lab-instructions"
        />
      </div>
      <div>
        <Label htmlFor="lab-starter-code">Starter Code</Label>
        <Textarea
          id="lab-starter-code"
          value={form.starterCode}
          onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
          placeholder="Starter code"
          rows={3}
          className="font-mono text-sm"
          data-testid="input-lab-starter-code"
        />
      </div>
      <div>
        <Label htmlFor="lab-expected-output">Expected Output</Label>
        <Textarea
          id="lab-expected-output"
          value={form.expectedOutput}
          onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })}
          placeholder="Expected output"
          rows={2}
          data-testid="input-lab-expected-output"
        />
      </div>
      <div>
        <Label htmlFor="lab-solution-code">Solution Code</Label>
        <Textarea
          id="lab-solution-code"
          value={form.solutionCode}
          onChange={(e) => setForm({ ...form, solutionCode: e.target.value })}
          placeholder="Solution code"
          rows={3}
          className="font-mono text-sm"
          data-testid="input-lab-solution-code"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Language</Label>
          <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
            <SelectTrigger data-testid="select-lab-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lab-order">Order Index</Label>
          <Input
            id="lab-order"
            type="number"
            value={form.orderIndex}
            onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
            data-testid="input-lab-order"
          />
        </div>
      </div>
    </div>
  );
}
