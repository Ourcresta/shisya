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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Pencil, Trash2, ClipboardCheck, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface TestItem {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  passingPercentage: number;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  createdAt: string;
  courseTitle: string;
  questions?: string;
}

interface CourseOption {
  id: number;
  title: string;
}

interface QuestionItem {
  question: string;
  type: string;
  options: string[];
  correctAnswer: number;
}

interface TestForm {
  courseId: number | null;
  title: string;
  description: string;
  durationMinutes: number;
  passingPercentage: number;
  maxAttempts: string;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
}

const defaultForm: TestForm = {
  courseId: null,
  title: "",
  description: "",
  durationMinutes: 30,
  passingPercentage: 60,
  maxAttempts: "",
  shuffleQuestions: false,
  showCorrectAnswers: false,
};

const defaultQuestion: QuestionItem = {
  question: "",
  type: "mcq",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

function parseQuestions(q: string | undefined | null): QuestionItem[] {
  if (!q) return [];
  try {
    const parsed = JSON.parse(q);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function GuruTests() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [form, setForm] = useState<TestForm>(defaultForm);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  const { data: testList, isLoading } = useQuery<TestItem[]>({
    queryKey: ["/api/guru/tests"],
  });

  const { data: courseOptions } = useQuery<CourseOption[]>({
    queryKey: ["/api/guru/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/guru/tests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      setCreateOpen(false);
      setForm(defaultForm);
      setQuestions([]);
      toast({ title: "Test created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create test", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/guru/tests/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/tests"] });
      setEditOpen(false);
      setSelectedTest(null);
      toast({ title: "Test updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update test", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/tests/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      setDeleteOpen(false);
      setSelectedTest(null);
      toast({ title: "Test deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete test", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmitCreate = () => {
    if (!form.courseId || !form.title) return;
    createMutation.mutate({
      courseId: form.courseId,
      title: form.title,
      description: form.description || null,
      durationMinutes: form.durationMinutes,
      passingPercentage: form.passingPercentage,
      maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts) : null,
      shuffleQuestions: form.shuffleQuestions,
      showCorrectAnswers: form.showCorrectAnswers,
      questions: JSON.stringify(questions),
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedTest || !form.title) return;
    updateMutation.mutate({
      id: selectedTest.id,
      data: {
        title: form.title,
        description: form.description || null,
        durationMinutes: form.durationMinutes,
        passingPercentage: form.passingPercentage,
        maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts) : null,
        shuffleQuestions: form.shuffleQuestions,
        showCorrectAnswers: form.showCorrectAnswers,
        questions: JSON.stringify(questions),
      },
    });
  };

  const openEdit = (test: TestItem) => {
    setSelectedTest(test);
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/guru/tests/${test.id}`, { credentials: "include" });
        const full = await res.json();
        setForm({
          courseId: full.courseId,
          title: full.title,
          description: full.description || "",
          durationMinutes: full.durationMinutes || 30,
          passingPercentage: full.passingPercentage || 60,
          maxAttempts: full.maxAttempts ? String(full.maxAttempts) : "",
          shuffleQuestions: full.shuffleQuestions || false,
          showCorrectAnswers: full.showCorrectAnswers || false,
        });
        setQuestions(parseQuestions(full.questions));
        setEditOpen(true);
      } catch {
        toast({ title: "Failed to load test details", variant: "destructive" });
      }
    };
    fetchTest();
  };

  const openDelete = (test: TestItem) => {
    setSelectedTest(test);
    setDeleteOpen(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion, options: ["", "", "", ""] }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-tests-title">
            Tests
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-tests-subtitle">
            Build and manage assessments
          </p>
        </div>
        <Button
          onClick={() => { setForm(defaultForm); setQuestions([]); setCreateOpen(true); }}
          data-testid="button-create-test"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : testList && testList.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Duration (min)</TableHead>
                  <TableHead>Passing %</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testList.map((test) => {
                  const qCount = parseQuestions(test.questions).length;
                  return (
                    <TableRow key={test.id} data-testid={`row-test-${test.id}`}>
                      <TableCell>
                        <span className="font-medium" data-testid={`text-test-title-${test.id}`}>
                          {test.title}
                        </span>
                      </TableCell>
                      <TableCell data-testid={`text-test-course-${test.id}`}>
                        {test.courseTitle}
                      </TableCell>
                      <TableCell data-testid={`text-test-duration-${test.id}`}>
                        {test.durationMinutes}
                      </TableCell>
                      <TableCell data-testid={`text-test-passing-${test.id}`}>
                        {test.passingPercentage}%
                      </TableCell>
                      <TableCell data-testid={`text-test-questions-${test.id}`}>
                        {qCount}
                      </TableCell>
                      <TableCell data-testid={`text-test-created-${test.id}`}>
                        {new Date(test.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(test)}
                            data-testid={`button-edit-test-${test.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDelete(test)}
                            data-testid={`button-delete-test-${test.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="empty-tests">
          <CardContent className="p-8 text-center">
            <ClipboardCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              No tests yet. Create your first test to get started.
            </p>
            <Button onClick={() => { setForm(defaultForm); setQuestions([]); setCreateOpen(true); }} data-testid="button-create-first-test">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-create-test-dialog-title">Create Test</DialogTitle>
            <DialogDescription>Build a new assessment</DialogDescription>
          </DialogHeader>
          <TestFormFields form={form} setForm={setForm} courses={courseOptions || []} />
          <QuestionsEditor questions={questions} addQuestion={addQuestion} removeQuestion={removeQuestion} updateQuestion={updateQuestion} updateOption={updateOption} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-create-test">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={!form.title || !form.courseId || createMutation.isPending}
              data-testid="button-submit-create-test"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-test-dialog-title">Edit Test</DialogTitle>
            <DialogDescription>Update test details</DialogDescription>
          </DialogHeader>
          <TestFormFields form={form} setForm={setForm} courses={courseOptions || []} />
          <QuestionsEditor questions={questions} addQuestion={addQuestion} removeQuestion={removeQuestion} updateQuestion={updateQuestion} updateOption={updateOption} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit-test">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={!form.title || updateMutation.isPending}
              data-testid="button-submit-edit-test"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-test-dialog-title">Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTest?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-test">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTest && deleteMutation.mutate(selectedTest.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-test"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TestFormFields({
  form, setForm, courses,
}: {
  form: TestForm;
  setForm: (f: TestForm) => void;
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
          <SelectTrigger data-testid="select-test-course">
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
        <Label htmlFor="test-title">Title *</Label>
        <Input
          id="test-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Test title"
          data-testid="input-test-title"
        />
      </div>
      <div>
        <Label htmlFor="test-description">Description</Label>
        <Textarea
          id="test-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Test description"
          rows={2}
          data-testid="input-test-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="test-duration">Duration (minutes)</Label>
          <Input
            id="test-duration"
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 30 })}
            data-testid="input-test-duration"
          />
        </div>
        <div>
          <Label htmlFor="test-passing">Passing %</Label>
          <Input
            id="test-passing"
            type="number"
            value={form.passingPercentage}
            onChange={(e) => setForm({ ...form, passingPercentage: parseInt(e.target.value) || 60 })}
            data-testid="input-test-passing"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="test-max-attempts">Max Attempts (optional)</Label>
        <Input
          id="test-max-attempts"
          type="number"
          value={form.maxAttempts}
          onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
          placeholder="Unlimited"
          data-testid="input-test-max-attempts"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="test-shuffle"
            checked={form.shuffleQuestions}
            onCheckedChange={(c) => setForm({ ...form, shuffleQuestions: !!c })}
            data-testid="checkbox-test-shuffle"
          />
          <Label htmlFor="test-shuffle" className="cursor-pointer">Shuffle questions</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="test-show-answers"
            checked={form.showCorrectAnswers}
            onCheckedChange={(c) => setForm({ ...form, showCorrectAnswers: !!c })}
            data-testid="checkbox-test-show-answers"
          />
          <Label htmlFor="test-show-answers" className="cursor-pointer">Show correct answers after submission</Label>
        </div>
      </div>
    </div>
  );
}

function QuestionsEditor({
  questions, addQuestion, removeQuestion, updateQuestion, updateOption,
}: {
  questions: QuestionItem[];
  addQuestion: () => void;
  removeQuestion: (idx: number) => void;
  updateQuestion: (idx: number, field: string, value: any) => void;
  updateOption: (qIdx: number, oIdx: number, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Label className="text-base font-semibold">Questions ({questions.length})</Label>
        <Button variant="outline" size="sm" onClick={addQuestion} data-testid="button-add-question">
          <Plus className="w-4 h-4 mr-1" />
          Add Question
        </Button>
      </div>
      {questions.map((q, qIdx) => (
        <Card key={qIdx} data-testid={`card-question-${qIdx}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Question {qIdx + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(qIdx)}
                data-testid={`button-remove-question-${qIdx}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={q.question}
              onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
              placeholder="Question text"
              data-testid={`input-question-text-${qIdx}`}
            />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => (
                <Input
                  key={oIdx}
                  value={opt}
                  onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                  placeholder={`Option ${oIdx + 1}`}
                  data-testid={`input-option-${qIdx}-${oIdx}`}
                />
              ))}
            </div>
            <div>
              <Label>Correct Answer</Label>
              <Select
                value={String(q.correctAnswer)}
                onValueChange={(v) => updateQuestion(qIdx, "correctAnswer", parseInt(v))}
              >
                <SelectTrigger data-testid={`select-correct-answer-${qIdx}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Option 1</SelectItem>
                  <SelectItem value="1">Option 2</SelectItem>
                  <SelectItem value="2">Option 3</SelectItem>
                  <SelectItem value="3">Option 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
