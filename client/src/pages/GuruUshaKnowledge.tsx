import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookMarked, Search, Globe, BookOpen } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnswerBookEntry {
  id: number;
  courseId: number | null;
  question: string;
  answer: string;
  tags: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  title: string;
}

const emptyEntry = {
  question: "",
  answer: "",
  tags: "",
  courseId: "",
  isActive: true,
};

export default function GuruUshaKnowledge() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<AnswerBookEntry | null>(null);
  const [form, setForm] = useState(emptyEntry);

  const { data: entries = [], isLoading } = useQuery<AnswerBookEntry[]>({
    queryKey: ["/api/guru/usha/answer-book"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/guru/courses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof emptyEntry) => {
      const res = await apiRequest("POST", "/api/guru/usha/answer-book", {
        question: data.question,
        answer: data.answer,
        tags: data.tags || null,
        courseId: data.courseId ? parseInt(data.courseId) : null,
        isActive: data.isActive,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/usha/answer-book"] });
      setDialogOpen(false);
      setForm(emptyEntry);
      toast({ title: "Entry created", description: "Answer book entry has been added." });
    },
    onError: () => toast({ title: "Error", description: "Failed to create entry.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof emptyEntry }) => {
      const res = await apiRequest("PUT", `/api/guru/usha/answer-book/${id}`, {
        question: data.question,
        answer: data.answer,
        tags: data.tags || null,
        courseId: data.courseId ? parseInt(data.courseId) : null,
        isActive: data.isActive,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/usha/answer-book"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyEntry);
      toast({ title: "Entry updated", description: "Answer book entry has been updated." });
    },
    onError: () => toast({ title: "Error", description: "Failed to update entry.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/guru/usha/answer-book/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/usha/answer-book"] });
      setDeleteId(null);
      toast({ title: "Entry deleted", description: "Answer book entry has been removed." });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete entry.", variant: "destructive" }),
  });

  const filtered = entries.filter(
    (e) =>
      e.question.toLowerCase().includes(search.toLowerCase()) ||
      e.answer.toLowerCase().includes(search.toLowerCase()) ||
      (e.tags && e.tags.toLowerCase().includes(search.toLowerCase()))
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyEntry);
    setDialogOpen(true);
  }

  function openEdit(entry: AnswerBookEntry) {
    setEditing(entry);
    setForm({
      question: entry.question,
      answer: entry.answer,
      tags: entry.tags || "",
      courseId: entry.courseId ? String(entry.courseId) : "",
      isActive: entry.isActive,
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: "Validation error", description: "Question and answer are required.", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const courseMap = new Map(courses.map((c) => [c.id, c.title]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-amber-500" />
            Usha Knowledge Base
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage curated Q&amp;A pairs for Usha's Layer 1 knowledge retrieval (Answer Book).
            Entries here are matched first before any AI call is made.
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-entry">
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Search questions, answers, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-knowledge"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">
              {search ? "No entries match your search." : "No entries yet. Add your first knowledge entry."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Question</TableHead>
                <TableHead className="w-[35%]">Answer</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`} className={!entry.isActive ? "opacity-50" : ""}>
                  <TableCell className="font-medium text-sm align-top py-3">
                    <p className="line-clamp-2" data-testid={`text-question-${entry.id}`}>{entry.question}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground align-top py-3">
                    <p className="line-clamp-2" data-testid={`text-answer-${entry.id}`}>{entry.answer}</p>
                  </TableCell>
                  <TableCell className="align-top py-3">
                    {entry.courseId ? (
                      <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                        <BookOpen className="w-3 h-3" />
                        {courseMap.get(entry.courseId) || `#${entry.courseId}`}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 w-fit">
                        <Globe className="w-3 h-3" />
                        Global
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="align-top py-3">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags ? entry.tags.split(",").map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs text-amber-600 border-amber-300">
                          {tag.trim()}
                        </Badge>
                      )) : <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-3">
                    {entry.isActive
                      ? <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-0 text-xs">Active</Badge>
                      : <Badge variant="destructive" className="text-xs">Inactive</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right align-top py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(entry)}
                        data-testid={`button-edit-${entry.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(entry.id)}
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditing(null); setForm(emptyEntry); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Entry" : "Add Knowledge Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="What is a variable in programming?"
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                className="min-h-[60px] resize-y"
                data-testid="input-entry-question"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="answer">Answer * <span className="text-xs font-normal text-muted-foreground">(Markdown supported)</span></Label>
              </div>
              <Textarea
                id="answer"
                placeholder={"A variable is a named container for storing data values.\n\nIn JavaScript you declare with:\n- `let` for block-scoped mutable variables\n- `const` for constants\n- `var` (legacy) for function-scoped variables\n\n**Example:** `let name = 'Usha';`"}
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                className="min-h-[160px] resize-y font-mono text-sm leading-relaxed"
                data-testid="input-entry-answer"
              />
              <p className="text-xs text-muted-foreground">
                Use **bold**, *italic*, `code`, and bullet lists for richer answers. These will render in the student chat.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags <span className="text-xs font-normal text-muted-foreground">(comma-separated)</span></Label>
              <Input
                id="tags"
                placeholder="variable, javascript, programming basics"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                data-testid="input-entry-tags"
              />
              <p className="text-xs text-muted-foreground">Tags improve matching precision when students ask related questions.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course">Course <span className="text-xs font-normal text-muted-foreground">(leave blank for global)</span></Label>
                <select
                  id="course"
                  value={form.courseId}
                  onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  data-testid="select-entry-course"
                >
                  <option value="">Global (all courses)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
                    data-testid="switch-entry-active"
                  />
                  <Label htmlFor="isActive" className="font-normal">{form.isActive ? "Active" : "Inactive"}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); setForm(emptyEntry); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-entry"
            >
              {editing ? "Save Changes" : "Create Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this knowledge entry from Usha's answer book.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
