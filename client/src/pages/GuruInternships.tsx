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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  Pencil,
  Trash2,
  Briefcase,
  ListChecks,
  FileCheck,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface Internship {
  id: number;
  title: string;
  description: string;
  shortDescription: string | null;
  skillLevel: string;
  domain: string | null;
  duration: string;
  maxParticipants: number | null;
  isActive: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface InternshipForm {
  title: string;
  description: string;
  shortDescription: string;
  skillLevel: string;
  domain: string;
  duration: string;
  isActive: boolean;
}

interface Task {
  id: number;
  internshipId: number;
  title: string;
  description: string | null;
  status: string;
  orderIndex: number;
  createdAt: string;
}

interface TaskForm {
  title: string;
  description: string;
  orderIndex: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  taskId: number | null;
  content: string | null;
  fileUrl: string | null;
  feedback: string | null;
  aiFeedback: string | null;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
}

const defaultInternshipForm: InternshipForm = {
  title: "",
  description: "",
  shortDescription: "",
  skillLevel: "beginner",
  domain: "",
  duration: "4 weeks",
  isActive: true,
};

const defaultTaskForm: TaskForm = {
  title: "",
  description: "",
  orderIndex: 0,
};

export default function GuruInternships() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [form, setForm] = useState<InternshipForm>(defaultInternshipForm);

  const [selectedInternshipId, setSelectedInternshipId] = useState<string>("");
  const [taskForm, setTaskForm] = useState<TaskForm>(defaultTaskForm);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingInternship, setViewingInternship] = useState<Internship | null>(null);
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");

  const { data: internships, isLoading } = useQuery<Internship[]>({
    queryKey: ["/api/udyog/admin/internships"],
  });

  const { data: internshipDetail } = useQuery<{ tasks: Task[] }>({
    queryKey: ["/api/udyog/internships", selectedInternshipId],
    enabled: !!selectedInternshipId,
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ["/api/udyog/admin/submissions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InternshipForm) => {
      const res = await apiRequest("POST", "/api/udyog/admin/internships", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/internships"] });
      setCreateOpen(false);
      setForm(defaultInternshipForm);
      toast({ title: "Internship created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create internship", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InternshipForm }) => {
      const res = await apiRequest("PUT", `/api/udyog/admin/internships/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/internships"] });
      setEditOpen(false);
      setSelectedInternship(null);
      toast({ title: "Internship updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update internship", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/udyog/admin/internships/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/internships"] });
      setDeleteOpen(false);
      setSelectedInternship(null);
      toast({ title: "Internship deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete internship", description: error.message, variant: "destructive" });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async ({ internshipId, data }: { internshipId: number; data: TaskForm }) => {
      const res = await apiRequest("POST", `/api/udyog/admin/internships/${internshipId}/tasks`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/internships", selectedInternshipId] });
      setTaskForm(defaultTaskForm);
      toast({ title: "Task added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add task", description: error.message, variant: "destructive" });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number; status: string; feedback: string }) => {
      const res = await apiRequest("PATCH", `/api/udyog/admin/submissions/${id}`, { status, feedback });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/submissions"] });
      setReviewingSubmission(null);
      setReviewFeedback("");
      toast({ title: "Submission reviewed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to review submission", description: error.message, variant: "destructive" });
    },
  });

  const filteredInternships = internships?.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (internship: Internship) => {
    setSelectedInternship(internship);
    setForm({
      title: internship.title,
      description: internship.description,
      shortDescription: internship.shortDescription || "",
      skillLevel: internship.skillLevel,
      domain: internship.domain || "",
      duration: internship.duration,
      isActive: internship.isActive,
    });
    setEditOpen(true);
  };

  const openDelete = (internship: Internship) => {
    setSelectedInternship(internship);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-internships-title">
          Udyog Internships
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-internships-subtitle">
          Manage virtual internships, tasks, and student submissions
        </p>
      </div>

      <Tabs defaultValue="internships" data-testid="tabs-internships">
        <TabsList>
          <TabsTrigger value="internships" data-testid="tab-internships">
            <Briefcase className="w-4 h-4 mr-2" />
            Internships
          </TabsTrigger>
          <TabsTrigger value="tasks" data-testid="tab-tasks">
            <ListChecks className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="submissions" data-testid="tab-submissions">
            <FileCheck className="w-4 h-4 mr-2" />
            Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internships" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search internships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-internships"
              />
            </div>
            <Button
              onClick={() => { setForm(defaultInternshipForm); setCreateOpen(true); }}
              data-testid="button-create-internship"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Internship
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : filteredInternships && filteredInternships.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Skill Level</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInternships.map((internship) => (
                      <TableRow key={internship.id} data-testid={`row-internship-${internship.id}`}>
                        <TableCell className="text-muted-foreground tabular-nums" data-testid={`text-internship-id-${internship.id}`}>
                          {internship.id}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium" data-testid={`text-internship-title-${internship.id}`}>
                            {internship.title}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize" data-testid={`badge-skill-level-${internship.id}`}>
                            {internship.skillLevel}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-domain-${internship.id}`}>
                          {internship.domain || "-"}
                        </TableCell>
                        <TableCell data-testid={`text-duration-${internship.id}`}>
                          {internship.duration}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={internship.isActive ? "default" : "secondary"}
                            className={
                              internship.isActive
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                                : ""
                            }
                            data-testid={`badge-active-${internship.id}`}
                          >
                            {internship.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setViewingInternship(internship); setViewOpen(true); }}
                              data-testid={`button-view-internship-${internship.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(internship)}
                              data-testid={`button-edit-internship-${internship.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(internship)}
                              data-testid={`button-delete-internship-${internship.id}`}
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
            <Card data-testid="empty-internships">
              <CardContent className="p-8 text-center">
                <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {search ? "No internships match your search." : "No internships yet. Create your first internship to get started."}
                </p>
                {!search && (
                  <Button onClick={() => { setForm(defaultInternshipForm); setCreateOpen(true); }} data-testid="button-create-first-internship">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Internship
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-72">
              <Label>Select Internship</Label>
              <Select value={selectedInternshipId} onValueChange={setSelectedInternshipId}>
                <SelectTrigger data-testid="select-internship-for-tasks">
                  <SelectValue placeholder="Choose an internship" />
                </SelectTrigger>
                <SelectContent>
                  {internships?.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedInternshipId ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold" data-testid="text-add-task-title">Add New Task</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="task-title">Title *</Label>
                      <Input
                        id="task-title"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        placeholder="Task title"
                        data-testid="input-task-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-description">Description</Label>
                      <Input
                        id="task-description"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        placeholder="Task description"
                        data-testid="input-task-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-order">Order Index</Label>
                      <Input
                        id="task-order"
                        type="number"
                        value={taskForm.orderIndex}
                        onChange={(e) => setTaskForm({ ...taskForm, orderIndex: parseInt(e.target.value) || 0 })}
                        data-testid="input-task-order"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => addTaskMutation.mutate({ internshipId: parseInt(selectedInternshipId), data: taskForm })}
                    disabled={!taskForm.title || addTaskMutation.isPending}
                    data-testid="button-add-task"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {addTaskMutation.isPending ? "Adding..." : "Add Task"}
                  </Button>
                </CardContent>
              </Card>

              {internshipDetail?.tasks && internshipDetail.tasks.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {internshipDetail.tasks.map((task) => (
                          <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                            <TableCell className="text-muted-foreground tabular-nums" data-testid={`text-task-order-${task.id}`}>
                              {task.orderIndex}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium" data-testid={`text-task-title-${task.id}`}>
                                {task.title}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate" data-testid={`text-task-desc-${task.id}`}>
                              {task.description || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize" data-testid={`badge-task-status-${task.id}`}>
                                {task.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card data-testid="empty-tasks">
                  <CardContent className="p-8 text-center">
                    <ListChecks className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No tasks for this internship yet. Add your first task above.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card data-testid="no-internship-selected">
              <CardContent className="p-8 text-center">
                <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Select an internship to manage its tasks.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissionsLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : submissions && submissions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id} data-testid={`row-submission-${sub.id}`}>
                        <TableCell className="text-muted-foreground tabular-nums" data-testid={`text-submission-id-${sub.id}`}>
                          {sub.id}
                        </TableCell>
                        <TableCell data-testid={`text-submission-assignment-${sub.id}`}>
                          #{sub.assignmentId}
                        </TableCell>
                        <TableCell data-testid={`text-submission-task-${sub.id}`}>
                          {sub.taskId ? `#${sub.taskId}` : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" data-testid={`text-submission-content-${sub.id}`}>
                          {sub.content || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sub.status === "approved" ? "default" :
                              sub.status === "rejected" ? "destructive" :
                              "secondary"
                            }
                            className={
                              sub.status === "approved"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                                : sub.status === "rejected"
                                ? "no-default-hover-elevate no-default-active-elevate"
                                : ""
                            }
                            data-testid={`badge-submission-status-${sub.id}`}
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-submission-date-${sub.id}`}>
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {sub.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setReviewingSubmission(sub); setReviewFeedback(""); }}
                                  data-testid={`button-review-${sub.id}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => reviewMutation.mutate({ id: sub.id, status: "approved", feedback: "" })}
                                  disabled={reviewMutation.isPending}
                                  data-testid={`button-approve-${sub.id}`}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => reviewMutation.mutate({ id: sub.id, status: "rejected", feedback: "" })}
                                  disabled={reviewMutation.isPending}
                                  data-testid={`button-reject-${sub.id}`}
                                >
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="empty-submissions">
              <CardContent className="p-8 text-center">
                <FileCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No submissions yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-create-internship-dialog-title">Create Internship</DialogTitle>
            <DialogDescription>Add a new virtual internship</DialogDescription>
          </DialogHeader>
          <InternshipFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-create-internship">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.title || !form.description || createMutation.isPending}
              data-testid="button-submit-create-internship"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-internship-dialog-title">Edit Internship</DialogTitle>
            <DialogDescription>Update internship details</DialogDescription>
          </DialogHeader>
          <InternshipFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit-internship">
              Cancel
            </Button>
            <Button
              onClick={() => selectedInternship && updateMutation.mutate({ id: selectedInternship.id, data: form })}
              disabled={!form.title || !form.description || updateMutation.isPending}
              data-testid="button-submit-edit-internship"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-internship-dialog-title">Delete Internship</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedInternship?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-internship">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedInternship && deleteMutation.mutate(selectedInternship.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-internship"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-view-internship-dialog-title">Internship Details</DialogTitle>
            <DialogDescription>Full details of the selected internship</DialogDescription>
          </DialogHeader>
          {viewingInternship && (
            <div className="space-y-4" data-testid="view-internship-details">
              <div>
                <Label className="text-muted-foreground text-xs">Title</Label>
                <p className="mt-1 font-medium" data-testid="view-internship-title">{viewingInternship.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap rounded-lg border p-3" data-testid="view-internship-description">{viewingInternship.description}</p>
              </div>
              {viewingInternship.shortDescription && (
                <div>
                  <Label className="text-muted-foreground text-xs">Short Description</Label>
                  <p className="mt-1 text-sm" data-testid="view-internship-short-desc">{viewingInternship.shortDescription}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Skill Level</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize" data-testid="view-internship-skill-level">{viewingInternship.skillLevel}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Domain</Label>
                  <p className="mt-1 text-sm" data-testid="view-internship-domain">{viewingInternship.domain || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Duration</Label>
                  <p className="mt-1 text-sm" data-testid="view-internship-duration">{viewingInternship.duration}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">
                    <Badge
                      variant={viewingInternship.isActive ? "default" : "secondary"}
                      className={viewingInternship.isActive ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate" : ""}
                      data-testid="view-internship-status"
                    >
                      {viewingInternship.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Created</Label>
                <p className="mt-1 text-sm" data-testid="view-internship-created">{new Date(viewingInternship.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)} data-testid="button-close-view-internship">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewingSubmission} onOpenChange={(open) => { if (!open) { setReviewingSubmission(null); setReviewFeedback(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-review-dialog-title">Review Submission</DialogTitle>
            <DialogDescription>Provide feedback and approve or reject this submission</DialogDescription>
          </DialogHeader>
          {reviewingSubmission && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Submission Content</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap rounded-lg border p-3" data-testid="text-review-content">
                  {reviewingSubmission.content || "No content"}
                </p>
              </div>
              <div>
                <Label htmlFor="review-feedback">Feedback</Label>
                <Textarea
                  id="review-feedback"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Add reviewer comments..."
                  rows={3}
                  data-testid="input-review-feedback"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewingSubmission(null); setReviewFeedback(""); }} data-testid="button-cancel-review">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => reviewingSubmission && reviewMutation.mutate({ id: reviewingSubmission.id, status: "rejected", feedback: reviewFeedback })}
              disabled={reviewMutation.isPending}
              data-testid="button-reject-review"
            >
              Reject
            </Button>
            <Button
              onClick={() => reviewingSubmission && reviewMutation.mutate({ id: reviewingSubmission.id, status: "approved", feedback: reviewFeedback })}
              disabled={reviewMutation.isPending}
              data-testid="button-approve-review"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InternshipFormFields({
  form,
  setForm,
}: {
  form: InternshipForm;
  setForm: (f: InternshipForm) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="internship-title">Title *</Label>
        <Input
          id="internship-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Internship title"
          data-testid="input-internship-title"
        />
      </div>
      <div>
        <Label htmlFor="internship-description">Description *</Label>
        <Textarea
          id="internship-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Internship description"
          rows={3}
          data-testid="input-internship-description"
        />
      </div>
      <div>
        <Label htmlFor="internship-short-description">Short Description</Label>
        <Input
          id="internship-short-description"
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          placeholder="Brief summary"
          data-testid="input-internship-short-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Skill Level</Label>
          <Select value={form.skillLevel} onValueChange={(v) => setForm({ ...form, skillLevel: v })}>
            <SelectTrigger data-testid="select-internship-skill-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="internship-domain">Domain</Label>
          <Input
            id="internship-domain"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            placeholder="e.g. Web Development"
            data-testid="input-internship-domain"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="internship-duration">Duration</Label>
        <Input
          id="internship-duration"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          placeholder="e.g. 4 weeks"
          data-testid="input-internship-duration"
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="internship-active"
          checked={form.isActive}
          onCheckedChange={(c) => setForm({ ...form, isActive: !!c })}
          data-testid="checkbox-internship-active"
        />
        <Label htmlFor="internship-active" className="cursor-pointer">Active</Label>
      </div>
    </div>
  );
}
