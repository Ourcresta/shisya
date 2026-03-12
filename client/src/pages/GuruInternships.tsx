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
  Users,
  UserCheck,
  Layers,
  Sparkles,
  Loader2,
  MessageSquarePlus,
  ChevronDown,
  ChevronRight,
  ListTree,
  Wrench,
  BookOpen,
  Rocket,
  Clock,
  Code2,
  LayoutList,
  GraduationCap,
  ClipboardList,
  Zap,
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

interface Subtask {
  id: number;
  taskId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  status: string;
  createdAt: string;
}

interface Task {
  id: number;
  internshipId: number;
  title: string;
  description: string | null;
  status: string;
  orderIndex: number;
  createdAt: string;
  subtasks?: Subtask[];
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

interface BatchData {
  batch: {
    id: number;
    internshipId: number;
    batchNumber: number;
    status: string;
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
  };
  internship: {
    id: number;
    title: string;
    domain: string | null;
  } | null;
}

interface BatchMember {
  member: {
    id: number;
    batchId: number;
    userId: string;
    role: string;
    skillScore: number;
    performanceScore: number;
    taskCompletionRate: number;
    deadlineCompliance: number;
    qualityScore: number;
    collaborationScore: number;
  };
  profile: {
    fullName: string | null;
  } | null;
}

interface HrUser {
  id: number;
  email: string;
  name: string;
  companyName: string;
  companyWebsite: string | null;
  designation: string | null;
  phone: string | null;
  isApproved: boolean;
  isActive: boolean;
  approvedAt: string | null;
  createdAt: string;
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

  const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiSkillLevel, setAiSkillLevel] = useState("beginner");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [aiExtraInstructions, setAiExtraInstructions] = useState("");

  const [expandedTaskIndexes, setExpandedTaskIndexes] = useState<Set<number>>(new Set());
  const [expandedAdminTaskIds, setExpandedAdminTaskIds] = useState<Set<number>>(new Set());
  const [subtaskForms, setSubtaskForms] = useState<Record<number, { title: string; description: string }>>({});
  const [expandedPreviewNodes, setExpandedPreviewNodes] = useState<Set<string>>(new Set());
  const [expandedGuideFeatures, setExpandedGuideFeatures] = useState<Set<number>>(new Set([0]));
  const [expandedGuideTasks, setExpandedGuideTasks] = useState<Set<string>>(new Set());
  const [showProjectGuide, setShowProjectGuide] = useState(true);

  const togglePreviewNode = (key: string) => {
    setExpandedPreviewNodes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAiTaskExpand = (idx: number) => {
    setExpandedTaskIndexes((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleAdminTaskExpand = (taskId: number) => {
    setExpandedAdminTaskIds((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  const [membersDialogBatchId, setMembersDialogBatchId] = useState<number | null>(null);
  const [editingMemberRole, setEditingMemberRole] = useState<{ memberId: number; role: string } | null>(null);
  const [editingMemberScores, setEditingMemberScores] = useState<{
    memberId: number;
    performanceScore: number;
    taskCompletionRate: number;
    deadlineCompliance: number;
    qualityScore: number;
    collaborationScore: number;
  } | null>(null);

  const { data: internships, isLoading } = useQuery<Internship[]>({
    queryKey: ["/api/udyog/admin/internships"],
  });

  const { data: internshipDetail } = useQuery<Internship & { tasks: Task[]; projectStructure?: string | null; introduction?: string | null; goal?: string | null; finalIntegration?: string | null; testing?: string | null; deployment?: string | null; liveProjectOutput?: string | null; requiredSkills?: string | null; milestones?: string | null; batchSize?: number | null }>({
    queryKey: ["/api/udyog/internships", selectedInternshipId],
    enabled: !!selectedInternshipId,
  });

  const { data: submissions, isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ["/api/udyog/admin/submissions"],
  });

  const { data: batches, isLoading: batchesLoading } = useQuery<BatchData[]>({
    queryKey: ["/api/udyog/admin/batches"],
  });

  const { data: batchMembers, isLoading: membersLoading } = useQuery<BatchMember[]>({
    queryKey: ["/api/udyog/admin/batch", membersDialogBatchId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/udyog/admin/batch/${membersDialogBatchId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!membersDialogBatchId,
  });

  const { data: hrUsers, isLoading: hrUsersLoading } = useQuery<HrUser[]>({
    queryKey: ["/api/udyog/admin/hr-users"],
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

  const addSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, title, description }: { taskId: number; title: string; description: string }) => {
      const res = await apiRequest("POST", `/api/udyog/admin/tasks/${taskId}/subtasks`, { title, description, orderIndex: 0 });
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/internships", selectedInternshipId] });
      setSubtaskForms((prev) => ({ ...prev, [variables.taskId]: { title: "", description: "" } }));
      toast({ title: "Sub-task added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add sub-task", description: error.message, variant: "destructive" });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: number) => {
      const res = await apiRequest("DELETE", `/api/udyog/admin/subtasks/${subtaskId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/internships", selectedInternshipId] });
      toast({ title: "Sub-task deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete sub-task", description: error.message, variant: "destructive" });
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/udyog/admin/batch-member/${memberId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/batch", membersDialogBatchId, "members"] });
      setEditingMemberRole(null);
      toast({ title: "Role updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    },
  });

  const updateScoresMutation = useMutation({
    mutationFn: async ({ memberId, scores }: { memberId: number; scores: { performanceScore: number; taskCompletionRate: number; deadlineCompliance: number; qualityScore: number; collaborationScore: number } }) => {
      const res = await apiRequest("PATCH", `/api/udyog/admin/batch-member/${memberId}/scores`, scores);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/batch", membersDialogBatchId, "members"] });
      setEditingMemberScores(null);
      toast({ title: "Scores updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update scores", description: error.message, variant: "destructive" });
    },
  });

  const approveHrMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/udyog/admin/hr-users/${id}/approve`, { approved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/hr-users"] });
      toast({ title: "HR user status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update HR user", description: error.message, variant: "destructive" });
    },
  });

  const handleAiGenerate = async () => {
    if (!aiTitle.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    setAiGenerating(true);
    setAiPreview(null);
    try {
      const res = await apiRequest("POST", "/api/udyog/admin/ai/generate-internship", {
        title: aiTitle,
        skillLevel: aiSkillLevel,
        extraInstructions: aiExtraInstructions,
      });
      const data = await res.json();
      setAiPreview(data);
    } catch (error: any) {
      toast({ title: "AI generation failed", description: error.message, variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAiCreateInternship = async () => {
    if (!aiPreview) return;
    const internshipData: InternshipForm = {
      title: aiPreview.title,
      description: aiPreview.description,
      shortDescription: aiPreview.shortDescription || "",
      skillLevel: aiPreview.skillLevel || aiSkillLevel,
      domain: aiPreview.domain || "",
      duration: aiPreview.duration || "4 weeks",
      isActive: true,
    };
    createMutation.mutate(internshipData, {
      onSuccess: async () => {
        const latestInternships = await fetch("/api/udyog/admin/internships").then(r => r.json());
        const newest = latestInternships[0];
        if (newest) {
          try {
            await apiRequest("PUT", `/api/udyog/admin/internships/${newest.id}`, {
              introduction: aiPreview.introduction || null,
              goal: aiPreview.goal || null,
              projectStructure: aiPreview.features ? JSON.stringify({ features: aiPreview.features }) : (aiPreview.initiatives ? JSON.stringify({ initiatives: aiPreview.initiatives }) : null),
              finalIntegration: aiPreview.finalIntegration || null,
              testing: aiPreview.testing || null,
              deployment: aiPreview.deployment || null,
              liveProjectOutput: aiPreview.liveProjectOutput || null,
            });
          } catch {}

          const allTasks: Array<{ title: string; description: string; orderIndex: number; subtasks: any[] }> = [];
          let orderIdx = 1;
          if (aiPreview.features && Array.isArray(aiPreview.features)) {
            for (const feature of aiPreview.features) {
              for (const task of (feature.tasks || [])) {
                const toolsStr = Array.isArray(task.tools) ? `Tools: ${task.tools.join(", ")}\n` : "";
                allTasks.push({
                  title: task.title,
                  description: [toolsStr, task.description || ""].filter(Boolean).join(""),
                  orderIndex: orderIdx++,
                  subtasks: (task.steps || []).map((step: string, si: number) => ({
                    title: step.substring(0, 120),
                    description: "",
                    orderIndex: si + 1,
                  })),
                });
              }
            }
          } else if (aiPreview.initiatives && Array.isArray(aiPreview.initiatives)) {
            for (const initiative of aiPreview.initiatives) {
              for (const epic of (initiative.epics || [])) {
                for (const feature of (epic.features || [])) {
                  for (const task of (feature.tasks || [])) {
                    allTasks.push({
                      title: task.title,
                      description: task.description || "",
                      orderIndex: task.orderIndex || orderIdx++,
                      subtasks: (task.subtasks || []).map((s: any) => ({
                        title: s.title,
                        description: [s.subtaskProcess, s.steps ? s.steps.join(" | ") : ""].filter(Boolean).join("\n") || s.description || "",
                        orderIndex: s.orderIndex || 0,
                      })),
                    });
                  }
                }
              }
            }
          } else if (aiPreview.tasks && Array.isArray(aiPreview.tasks)) {
            for (const task of aiPreview.tasks) {
              allTasks.push({ title: task.title, description: task.description || "", orderIndex: task.orderIndex || 0, subtasks: task.subtasks || [] });
            }
          }

          for (const task of allTasks) {
            try {
              await apiRequest("POST", `/api/udyog/admin/internships/${newest.id}/tasks`, task);
            } catch {}
          }
          queryClient.invalidateQueries({ queryKey: ["/api/udyog/internships"] });
        }
        setAiBuilderOpen(false);
        setAiPreview(null);
        setAiTitle("");
        setAiSkillLevel("beginner");
        setAiExtraInstructions("");
        setExpandedTaskIndexes(new Set());
        setExpandedPreviewNodes(new Set());
        toast({ title: "Internship created with full project guide!" });
      },
    });
  };

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
          <TabsTrigger value="batches" data-testid="tab-batches">
            <Layers className="w-4 h-4 mr-2" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="hr-users" data-testid="tab-hr-users">
            <UserCheck className="w-4 h-4 mr-2" />
            HR Users
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
              variant="outline"
              onClick={() => { setAiPreview(null); setAiTitle(""); setAiSkillLevel("beginner"); setAiExtraInstructions(""); setAiBuilderOpen(true); }}
              data-testid="button-ai-internship-builder"
              className="border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Builder
            </Button>
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
              <Select value={selectedInternshipId} onValueChange={(v) => { setSelectedInternshipId(v); setExpandedGuideFeatures(new Set([0])); setExpandedGuideTasks(new Set()); setShowProjectGuide(true); }}>
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

          {selectedInternshipId ? (() => {
            const parsedStructure = (() => {
              try { return internshipDetail?.projectStructure ? JSON.parse(internshipDetail.projectStructure) : null; } catch { return null; }
            })();
            const guideFeatures: any[] = parsedStructure?.features || [];
            const featurePalettes = [
              { border: "border-teal-500", bg: "bg-teal-500/10", text: "text-teal-700 dark:text-teal-400", badge: "bg-teal-500/20 text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
              { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
              { border: "border-purple-500", bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
            ];
            return (
            <div className="space-y-4">

              {/* Internship Overview Header */}
              {internshipDetail && (
                <Card className="border-l-4 border-l-primary" data-testid="internship-overview-header">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate" data-testid="text-detail-title">{internshipDetail.title}</h3>
                        {internshipDetail.goal && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{internshipDetail.goal}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <Badge variant="outline" className="capitalize gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {internshipDetail.skillLevel}
                        </Badge>
                        {internshipDetail.domain && (
                          <Badge variant="outline" className="gap-1">
                            <Code2 className="w-3 h-3" />
                            {internshipDetail.domain}
                          </Badge>
                        )}
                        {internshipDetail.duration && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {internshipDetail.duration}
                          </Badge>
                        )}
                        {guideFeatures.length > 0 && (
                          <Badge className="gap-1 bg-primary/10 text-primary border-primary/30">
                            <LayoutList className="w-3 h-3" />
                            {guideFeatures.length} Features · {guideFeatures.reduce((a: number, f: any) => a + (f.tasks?.length || 0), 0)} Tasks
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Project Guide */}
              {guideFeatures.length > 0 && (
                <div className="space-y-3" data-testid="project-guide-section">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">AI Project Guide</h3>
                      <Badge variant="secondary" className="text-xs">{guideFeatures.length} Features</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProjectGuide(v => !v)}
                      className="text-xs text-muted-foreground h-7"
                      data-testid="button-toggle-project-guide"
                    >
                      {showProjectGuide ? <><ChevronDown className="w-3 h-3 mr-1" />Hide Guide</> : <><ChevronRight className="w-3 h-3 mr-1" />Show Guide</>}
                    </Button>
                  </div>

                  {showProjectGuide && (
                    <div className="space-y-3">
                      {guideFeatures.map((feature: any, fi: number) => {
                        const pal = featurePalettes[fi % featurePalettes.length];
                        const isFeatureOpen = expandedGuideFeatures.has(fi);
                        const tasks: any[] = feature.tasks || [];
                        return (
                          <div key={fi} className={`rounded-xl border-2 ${pal.border} overflow-hidden`} data-testid={`guide-feature-${fi}`}>
                            <button
                              type="button"
                              className={`w-full flex items-center gap-3 p-4 text-left ${pal.bg} hover:brightness-95 transition-all`}
                              onClick={() => setExpandedGuideFeatures(prev => {
                                const next = new Set(prev);
                                next.has(fi) ? next.delete(fi) : next.add(fi);
                                return next;
                              })}
                            >
                              <div className={`w-6 h-6 rounded-full ${pal.dot} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                {fi + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${pal.text}`}>{feature.title}</p>
                                {feature.description && !isFeatureOpen && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{feature.description}</p>
                                )}
                              </div>
                              <Badge variant="outline" className={`text-xs shrink-0 ${pal.badge}`}>
                                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                              </Badge>
                              {isFeatureOpen
                                ? <ChevronDown className={`w-4 h-4 shrink-0 ${pal.text}`} />
                                : <ChevronRight className={`w-4 h-4 shrink-0 text-muted-foreground`} />
                              }
                            </button>

                            {isFeatureOpen && (
                              <div className="p-3 space-y-2 bg-background/60">
                                {feature.description && (
                                  <p className="text-sm text-muted-foreground px-1 pb-1 border-b">{feature.description}</p>
                                )}
                                {tasks.map((task: any, ti: number) => {
                                  const taskKey = `${fi}-${ti}`;
                                  const isTaskOpen = expandedGuideTasks.has(taskKey);
                                  return (
                                    <div key={ti} className="rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden" data-testid={`guide-task-${fi}-${ti}`}>
                                      <button
                                        type="button"
                                        className="w-full flex items-center gap-3 p-3 text-left bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                        onClick={() => setExpandedGuideTasks(prev => {
                                          const next = new Set(prev);
                                          next.has(taskKey) ? next.delete(taskKey) : next.add(taskKey);
                                          return next;
                                        })}
                                      >
                                        <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                          {ti + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm text-amber-800 dark:text-amber-200">{task.title}</p>
                                          {(task.tools || []).length > 0 && !isTaskOpen && (
                                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                                              {(task.tools || []).slice(0, 3).map((tool: string, tli: number) => (
                                                <span key={tli} className="text-xs bg-teal-500/15 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded">
                                                  {tool.split(" (")[0]}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        {isTaskOpen
                                          ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                          : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                        }
                                      </button>

                                      {isTaskOpen && (
                                        <div className="p-4 space-y-4 bg-background">
                                          {/* Tool Badges */}
                                          {(task.tools || []).length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <Wrench className="w-3 h-3" /> Tools
                                              </p>
                                              <div className="flex flex-wrap gap-1.5">
                                                {(task.tools || []).map((tool: string, tli: number) => {
                                                  const [name, urlPart] = tool.split(" (");
                                                  const url = urlPart ? urlPart.replace(")", "") : null;
                                                  return url ? (
                                                    <a key={tli} href={url} target="_blank" rel="noopener noreferrer"
                                                      className="text-xs bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full hover:bg-teal-500/20 transition-colors">
                                                      {name}
                                                    </a>
                                                  ) : (
                                                    <span key={tli} className="text-xs bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full">
                                                      {name}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}

                                          {/* Process */}
                                          {task.process && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> Process
                                              </p>
                                              <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 rounded-lg p-3">{task.process}</p>
                                            </div>
                                          )}

                                          {/* Steps */}
                                          {(task.steps || []).length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <ClipboardList className="w-3 h-3" /> Steps
                                              </p>
                                              <div className="space-y-2">
                                                {(task.steps || []).map((step: string, si: number) => (
                                                  <div key={si} className="flex gap-3 items-start">
                                                    <div className="w-6 h-6 rounded-full bg-slate-700 dark:bg-slate-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                      {si + 1}
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-snug font-mono text-xs bg-slate-50 dark:bg-slate-900 border rounded p-2 flex-1">
                                                      {step}
                                                    </p>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Checklist */}
                                          {(task.checklist || []).length > 0 && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-green-600" /> Checklist
                                              </p>
                                              <div className="space-y-1 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                                                {(task.checklist || []).map((item: string, ci: number) => (
                                                  <div key={ci} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                    <span className="text-foreground/80">{item.replace(/^\[\s*\]\s*/, "")}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Practice */}
                                          {task.practice && (
                                            <div className="space-y-1">
                                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-purple-600" /> Practice Exercise
                                              </p>
                                              <p className="text-sm italic text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg p-3 leading-relaxed">
                                                {task.practice}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Closing Sections */}
                      {(internshipDetail?.finalIntegration || internshipDetail?.testing || internshipDetail?.deployment) && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                          {internshipDetail.finalIntegration && (
                            <div className="rounded-lg border p-3 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800">
                              <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1 mb-1"><Rocket className="w-3 h-3" />Final Integration</p>
                              <p className="text-xs text-foreground/70 line-clamp-3">{internshipDetail.finalIntegration}</p>
                            </div>
                          )}
                          {internshipDetail.testing && (
                            <div className="rounded-lg border p-3 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
                              <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1 mb-1"><ClipboardList className="w-3 h-3" />Testing</p>
                              <p className="text-xs text-foreground/70 line-clamp-3">{internshipDetail.testing}</p>
                            </div>
                          )}
                          {internshipDetail.deployment && (
                            <div className="rounded-lg border p-3 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mb-1"><Rocket className="w-3 h-3" />Deployment</p>
                              <p className="text-xs text-foreground/70 line-clamp-3">{internshipDetail.deployment}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Kanban Task Management */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Kanban Tasks</h3>
                  <Badge variant="secondary" className="text-xs">{internshipDetail?.tasks?.length || 0} tasks</Badge>
                </div>

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
                <div className="space-y-3" data-testid="task-accordion-list">
                  {internshipDetail.tasks.map((task) => {
                    const isExpanded = expandedAdminTaskIds.has(task.id);
                    const subtaskCount = task.subtasks?.length || 0;
                    const subtaskForm = subtaskForms[task.id] || { title: "", description: "" };
                    return (
                      <Card key={task.id} data-testid={`card-task-${task.id}`}>
                        <button
                          type="button"
                          className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-t-lg"
                          onClick={() => toggleAdminTaskExpand(task.id)}
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-purple-500 shrink-0 mt-1" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                          }
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground font-mono">#{task.orderIndex}</span>
                              <span className="font-medium text-sm" data-testid={`text-task-title-${task.id}`}>{task.title}</span>
                              <Badge variant="outline" className="capitalize text-xs" data-testid={`badge-task-status-${task.id}`}>
                                {task.status}
                              </Badge>
                              <Badge variant="secondary" className="text-xs px-1.5">
                                <ListTree className="w-3 h-3 mr-1" />
                                {subtaskCount} sub-task{subtaskCount !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            {task.description && !isExpanded && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <CardContent className="pt-0 border-t">
                            {task.description && (
                              <p className="text-sm text-muted-foreground py-3">{task.description}</p>
                            )}

                            <div className="space-y-2 mb-4">
                              {task.subtasks && task.subtasks.length > 0 ? (
                                task.subtasks.map((sub, idx) => (
                                  <div key={sub.id} className="flex items-start gap-2 pl-2 border-l-2 border-purple-200 dark:border-purple-800 py-1" data-testid={`subtask-${sub.id}`}>
                                    <span className="text-purple-500 font-mono text-xs shrink-0 mt-0.5">{idx + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium">{sub.title}</p>
                                      {sub.description && (
                                        <p className="text-xs text-muted-foreground">{sub.description}</p>
                                      )}
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                                      onClick={() => deleteSubtaskMutation.mutate(sub.id)}
                                      disabled={deleteSubtaskMutation.isPending}
                                      data-testid={`button-delete-subtask-${sub.id}`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground pl-2 py-1">No sub-tasks yet.</p>
                              )}
                            </div>

                            <div className="border-t pt-3 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Add Sub-task</p>
                              <Input
                                placeholder="Sub-task title"
                                value={subtaskForm.title}
                                onChange={(e) => setSubtaskForms((prev) => ({
                                  ...prev,
                                  [task.id]: { ...subtaskForm, title: e.target.value }
                                }))}
                                className="h-8 text-sm"
                                data-testid={`input-subtask-title-${task.id}`}
                              />
                              <Input
                                placeholder="Sub-task description (optional)"
                                value={subtaskForm.description}
                                onChange={(e) => setSubtaskForms((prev) => ({
                                  ...prev,
                                  [task.id]: { ...subtaskForm, description: e.target.value }
                                }))}
                                className="h-8 text-sm"
                                data-testid={`input-subtask-desc-${task.id}`}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!subtaskForm.title.trim()) return;
                                  addSubtaskMutation.mutate({
                                    taskId: task.id,
                                    title: subtaskForm.title.trim(),
                                    description: subtaskForm.description.trim(),
                                  });
                                }}
                                disabled={!subtaskForm.title.trim() || addSubtaskMutation.isPending}
                                className="h-8"
                                data-testid={`button-add-subtask-${task.id}`}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Sub-task
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card data-testid="empty-tasks" className="border-dashed">
                  <CardContent className="p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <ListChecks className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-base mb-1">No Kanban tasks yet</p>
                    <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                      {guideFeatures.length > 0
                        ? "This internship has an AI project guide above. Tasks are auto-created when you generate an internship with the AI Builder."
                        : "Add your first task using the form above, or generate a full project plan with the AI Builder."}
                    </p>
                    {guideFeatures.length === 0 && (
                      <Button variant="outline" size="sm" onClick={() => setAiBuilderOpen(true)} data-testid="button-open-ai-builder-from-empty">
                        <Sparkles className="w-4 h-4 mr-2 text-primary" />
                        Open AI Builder
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          );
        })() : (
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

        <TabsContent value="batches" className="space-y-4">
          {batchesLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : batches && batches.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch #</TableHead>
                      <TableHead>Internship</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((b) => (
                      <TableRow key={b.batch.id} data-testid={`row-batch-${b.batch.id}`}>
                        <TableCell className="tabular-nums font-medium" data-testid={`text-batch-number-${b.batch.id}`}>
                          {b.batch.batchNumber}
                        </TableCell>
                        <TableCell data-testid={`text-batch-internship-${b.batch.id}`}>
                          {b.internship?.title || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              b.batch.status === "active" ? "default" :
                              b.batch.status === "completed" ? "default" :
                              "secondary"
                            }
                            className={
                              b.batch.status === "active"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                                : b.batch.status === "completed"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 no-default-hover-elevate no-default-active-elevate"
                                : b.batch.status === "forming"
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 no-default-hover-elevate no-default-active-elevate"
                                : ""
                            }
                            data-testid={`badge-batch-status-${b.batch.id}`}
                          >
                            {b.batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMembersDialogBatchId(b.batch.id)}
                            data-testid={`button-view-members-${b.batch.id}`}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Members
                          </Button>
                        </TableCell>
                        <TableCell data-testid={`text-batch-start-${b.batch.id}`}>
                          {b.batch.startDate ? new Date(b.batch.startDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell data-testid={`text-batch-end-${b.batch.id}`}>
                          {b.batch.endDate ? new Date(b.batch.endDate).toLocaleDateString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="empty-batches">
              <CardContent className="p-8 text-center">
                <Layers className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No batches found.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hr-users" className="space-y-4">
          {hrUsersLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : hrUsers && hrUsers.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hrUsers.map((hr) => (
                      <TableRow key={hr.id} data-testid={`row-hr-user-${hr.id}`}>
                        <TableCell>
                          <span className="font-medium" data-testid={`text-hr-company-${hr.id}`}>
                            {hr.companyName}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`text-hr-contact-${hr.id}`}>
                          {hr.name}
                        </TableCell>
                        <TableCell data-testid={`text-hr-email-${hr.id}`}>
                          {hr.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={hr.isApproved ? "default" : "secondary"}
                            className={
                              hr.isApproved
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 no-default-hover-elevate no-default-active-elevate"
                            }
                            data-testid={`badge-hr-status-${hr.id}`}
                          >
                            {hr.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!hr.isApproved && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                onClick={() => approveHrMutation.mutate({ id: hr.id, approved: true })}
                                disabled={approveHrMutation.isPending}
                                className="bg-green-600 text-white"
                                data-testid={`button-approve-hr-${hr.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => approveHrMutation.mutate({ id: hr.id, approved: false })}
                                disabled={approveHrMutation.isPending}
                                data-testid={`button-reject-hr-${hr.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="empty-hr-users">
              <CardContent className="p-8 text-center">
                <UserCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No HR users registered yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!membersDialogBatchId} onOpenChange={(open) => { if (!open) { setMembersDialogBatchId(null); setEditingMemberRole(null); setEditingMemberScores(null); } }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-members-dialog-title">Batch Members</DialogTitle>
            <DialogDescription>View and manage members of this batch</DialogDescription>
          </DialogHeader>
          {membersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : batchMembers && batchMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Skill Score</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Task Completion %</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchMembers.map((bm) => (
                  <TableRow key={bm.member.id} data-testid={`row-member-${bm.member.id}`}>
                    <TableCell>
                      <span className="font-medium" data-testid={`text-member-name-${bm.member.id}`}>
                        {bm.profile?.fullName || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingMemberRole?.memberId === bm.member.id ? (
                        <div className="flex items-center gap-1">
                          <Select
                            value={editingMemberRole.role}
                            onValueChange={(v) => setEditingMemberRole({ ...editingMemberRole, role: v })}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-role-${bm.member.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Team Lead">Team Lead</SelectItem>
                              <SelectItem value="Developer">Developer</SelectItem>
                              <SelectItem value="QA/Tester">QA/Tester</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => updateRoleMutation.mutate({ memberId: bm.member.id, role: editingMemberRole.role })}
                            disabled={updateRoleMutation.isPending}
                            data-testid={`button-save-role-${bm.member.id}`}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingMemberRole(null)}
                            data-testid={`button-cancel-role-${bm.member.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              bm.member.role === "Team Lead"
                                ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 no-default-hover-elevate no-default-active-elevate"
                                : bm.member.role === "Developer"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 no-default-hover-elevate no-default-active-elevate"
                                : "bg-orange-500/10 text-orange-700 dark:text-orange-400 no-default-hover-elevate no-default-active-elevate"
                            }
                            data-testid={`badge-member-role-${bm.member.id}`}
                          >
                            {bm.member.role}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingMemberRole({ memberId: bm.member.id, role: bm.member.role })}
                            data-testid={`button-edit-role-${bm.member.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums" data-testid={`text-member-skill-${bm.member.id}`}>
                      {bm.member.skillScore}
                    </TableCell>
                    <TableCell className="tabular-nums" data-testid={`text-member-performance-${bm.member.id}`}>
                      {bm.member.performanceScore}
                    </TableCell>
                    <TableCell className="tabular-nums" data-testid={`text-member-completion-${bm.member.id}`}>
                      {bm.member.taskCompletionRate}%
                    </TableCell>
                    <TableCell className="text-right">
                      {editingMemberScores?.memberId === bm.member.id ? (
                        <div className="space-y-2 text-left">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Quality</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editingMemberScores.qualityScore}
                                onChange={(e) => setEditingMemberScores({ ...editingMemberScores, qualityScore: parseInt(e.target.value) || 0 })}
                                data-testid={`input-quality-score-${bm.member.id}`}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Collaboration</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editingMemberScores.collaborationScore}
                                onChange={(e) => setEditingMemberScores({ ...editingMemberScores, collaborationScore: parseInt(e.target.value) || 0 })}
                                data-testid={`input-collab-score-${bm.member.id}`}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Task Completion</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editingMemberScores.taskCompletionRate}
                                onChange={(e) => setEditingMemberScores({ ...editingMemberScores, taskCompletionRate: parseInt(e.target.value) || 0 })}
                                data-testid={`input-task-completion-${bm.member.id}`}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Deadline</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editingMemberScores.deadlineCompliance}
                                onChange={(e) => setEditingMemberScores({ ...editingMemberScores, deadlineCompliance: parseInt(e.target.value) || 0 })}
                                data-testid={`input-deadline-score-${bm.member.id}`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateScoresMutation.mutate({
                                memberId: bm.member.id,
                                scores: {
                                  performanceScore: editingMemberScores.performanceScore,
                                  taskCompletionRate: editingMemberScores.taskCompletionRate,
                                  deadlineCompliance: editingMemberScores.deadlineCompliance,
                                  qualityScore: editingMemberScores.qualityScore,
                                  collaborationScore: editingMemberScores.collaborationScore,
                                },
                              })}
                              disabled={updateScoresMutation.isPending}
                              data-testid={`button-save-scores-${bm.member.id}`}
                            >
                              {updateScoresMutation.isPending ? "Saving..." : "Save Scores"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMemberScores(null)}
                              data-testid={`button-cancel-scores-${bm.member.id}`}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMemberScores({
                            memberId: bm.member.id,
                            performanceScore: bm.member.performanceScore,
                            taskCompletionRate: bm.member.taskCompletionRate,
                            deadlineCompliance: bm.member.deadlineCompliance,
                            qualityScore: bm.member.qualityScore,
                            collaborationScore: bm.member.collaborationScore,
                          })}
                          data-testid={`button-edit-scores-${bm.member.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground" data-testid="text-no-members">
                No members in this batch.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMembersDialogBatchId(null); setEditingMemberRole(null); setEditingMemberScores(null); }} data-testid="button-close-members-dialog">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={aiBuilderOpen} onOpenChange={setAiBuilderOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-ai-internship-builder-title" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Internship Builder
            </DialogTitle>
            <DialogDescription>Enter a title and skill level — AI generates a complete project guide with exact commands, steps, checklists, and deployment instructions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-internship-title">Internship Title *</Label>
              <Input
                id="ai-internship-title"
                value={aiTitle}
                onChange={(e) => setAiTitle(e.target.value)}
                placeholder="e.g., Full Stack Web Development, Data Science with Python"
                data-testid="input-ai-internship-title"
              />
            </div>
            <div>
              <Label htmlFor="ai-skill-level">Skill Level *</Label>
              <Select value={aiSkillLevel} onValueChange={setAiSkillLevel}>
                <SelectTrigger data-testid="select-ai-skill-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (Score &lt; 40)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Score 40-75)</SelectItem>
                  <SelectItem value="advanced">Advanced (Score &gt; 75)</SelectItem>
                  <SelectItem value="mastery">Mastery (Expert)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Extra Instructions
              </Label>
              <Textarea
                value={aiExtraInstructions}
                onChange={(e) => setAiExtraInstructions(e.target.value)}
                placeholder="Add any specific requirements, topics to focus on, or guidelines for the AI..."
                rows={3}
                className="mt-1 text-sm"
                data-testid="textarea-ai-internship-extra-instructions"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional: Guide the AI with additional context or preferences</p>
            </div>
            <Button
              onClick={handleAiGenerate}
              disabled={aiGenerating || !aiTitle.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-ai-generate-internship"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Internship
                </>
              )}
            </Button>
          </div>

          {aiPreview && (
            <div className="mt-4 space-y-4 border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-400">AI Generated Preview</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Title</Label>
                  <p className="font-medium" data-testid="ai-preview-title">{aiPreview.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm whitespace-pre-wrap rounded border p-2 bg-background" data-testid="ai-preview-description">{aiPreview.description}</p>
                </div>
                {aiPreview.shortDescription && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Short Description</Label>
                    <p className="text-sm" data-testid="ai-preview-short-desc">{aiPreview.shortDescription}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Domain</Label>
                    <p className="text-sm font-medium">{aiPreview.domain}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Skill Level</Label>
                    <Badge variant="outline" className="capitalize">{aiPreview.skillLevel}</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Duration</Label>
                    <p className="text-sm font-medium">{aiPreview.duration}</p>
                  </div>
                </div>
                {aiPreview.requiredSkills && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Required Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiPreview.requiredSkills.split(",").map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {aiPreview.milestones && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Milestones</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiPreview.milestones.split(",").map((m: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{m.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {aiPreview.introduction && (
                  <div className="rounded-lg border-l-4 border-purple-400 bg-purple-50 dark:bg-purple-950/30 p-3">
                    <Label className="text-purple-700 dark:text-purple-400 text-xs font-semibold uppercase tracking-wide">Project Introduction</Label>
                    <p className="text-sm mt-1 text-foreground/80 whitespace-pre-wrap">{aiPreview.introduction}</p>
                  </div>
                )}
                {aiPreview.goal && (
                  <div className="rounded-lg border-l-4 border-teal-400 bg-teal-50 dark:bg-teal-950/30 p-3">
                    <Label className="text-teal-700 dark:text-teal-400 text-xs font-semibold uppercase tracking-wide">Goal</Label>
                    <p className="text-sm mt-1 text-foreground/80">{aiPreview.goal}</p>
                  </div>
                )}
                {aiPreview.features && aiPreview.features.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ListTree className="w-4 h-4 text-teal-600" />
                      <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                        Project Features ({aiPreview.features.length} Features · {aiPreview.features.reduce((a: number, f: any) => a + (f.tasks?.length || 0), 0)} Tasks)
                      </Label>
                    </div>
                    <div className="space-y-2">
                      {aiPreview.features.map((feature: any, fi: number) => {
                        const fKey = `f${fi}`;
                        const fExpanded = expandedPreviewNodes.has(fKey);
                        const featureColors = [
                          { dot: "bg-teal-500", text: "text-teal-700 dark:text-teal-300", hover: "hover:bg-teal-50 dark:hover:bg-teal-950/20", badge: "border-teal-300 text-teal-700 dark:text-teal-400" },
                          { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300", hover: "hover:bg-blue-50 dark:hover:bg-blue-950/20", badge: "border-blue-300 text-blue-700 dark:text-blue-400" },
                          { dot: "bg-purple-500", text: "text-purple-700 dark:text-purple-300", hover: "hover:bg-purple-50 dark:hover:bg-purple-950/20", badge: "border-purple-300 text-purple-700 dark:text-purple-400" },
                        ];
                        const fc = featureColors[fi % featureColors.length];
                        return (
                          <div key={fi} className="border rounded-lg overflow-hidden bg-background">
                            <button type="button" className={`w-full flex items-center gap-2 p-3 text-left ${fc.hover} transition-colors`} onClick={() => togglePreviewNode(fKey)}>
                              {fExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                              <div className={`w-2 h-2 rounded-full ${fc.dot} shrink-0`} />
                              <span className={`font-semibold text-sm ${fc.text}`}>{feature.title}</span>
                              <Badge variant="outline" className={`text-xs ml-auto ${fc.badge}`}>{feature.tasks?.length || 0} tasks</Badge>
                            </button>
                            {fExpanded && (
                              <div className="border-t bg-muted/10 p-3 space-y-3">
                                {feature.description && <p className="text-xs text-muted-foreground">{feature.description}</p>}
                                {(feature.tasks || []).map((task: any, ti: number) => {
                                  const tKey = `f${fi}-t${ti}`;
                                  const tExpanded = expandedPreviewNodes.has(tKey);
                                  return (
                                    <div key={ti} className="border rounded-lg overflow-hidden bg-background">
                                      <button type="button" className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors" onClick={() => togglePreviewNode(tKey)}>
                                        {tExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                        <span className="text-muted-foreground font-mono text-[10px] shrink-0">{fi + 1}.{ti + 1}</span>
                                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300 flex-1 min-w-0">{task.title}</span>
                                        <Badge variant="outline" className="text-[10px] border-amber-300 py-0 shrink-0">{task.steps?.length || 0} steps</Badge>
                                      </button>
                                      {tExpanded && (
                                        <div className="border-t px-3 py-3 space-y-3 bg-muted/5">
                                          {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                                          {task.tools && task.tools.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide self-center mr-1">Tools:</span>
                                              {task.tools.map((tool: string, toi: number) => (
                                                <Badge key={toi} variant="secondary" className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">{tool}</Badge>
                                              ))}
                                            </div>
                                          )}
                                          {task.process && (
                                            <div className="rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2">
                                              <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Process</p>
                                              <p className="text-xs text-foreground/80">{task.process}</p>
                                            </div>
                                          )}
                                          {task.steps && task.steps.length > 0 && (
                                            <div>
                                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Steps</p>
                                              <ol className="space-y-1.5">
                                                {task.steps.map((step: string, si: number) => (
                                                  <li key={si} className="flex gap-2 text-xs">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold">{si + 1}</span>
                                                    <span className="text-foreground/80 pt-0.5">{step}</span>
                                                  </li>
                                                ))}
                                              </ol>
                                            </div>
                                          )}
                                          {task.checklist && task.checklist.length > 0 && (
                                            <div>
                                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Checklist</p>
                                              <ul className="space-y-1">
                                                {task.checklist.map((item: string, ci: number) => (
                                                  <li key={ci} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                                    <span className="shrink-0 text-green-500 mt-px">☐</span>
                                                    <span>{item.replace(/^\[\s*\]\s*/, "")}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {task.practice && (
                                            <div className="rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-2">
                                              <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-0.5">Practice Exercise</p>
                                              <p className="text-xs text-foreground/80">{task.practice}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {[
                  { key: "finalIntegration", label: "Final Integration", color: "blue" },
                  { key: "testing", label: "Testing", color: "yellow" },
                  { key: "deployment", label: "Deployment", color: "orange" },
                  { key: "liveProjectOutput", label: "Live Project Output", color: "green" },
                ].map(({ key, label, color }) => aiPreview[key] ? (
                  <div key={key} className="border rounded-lg overflow-hidden bg-background">
                    <button type="button" className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/30 transition-colors" onClick={() => togglePreviewNode(`section-${key}`)}>
                      {expandedPreviewNodes.has(`section-${key}`) ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="font-medium text-sm">{label}</span>
                    </button>
                    {expandedPreviewNodes.has(`section-${key}`) && (
                      <div className="border-t px-4 py-3 bg-muted/10">
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{aiPreview[key]}</p>
                      </div>
                    )}
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAiBuilderOpen(false)} data-testid="button-cancel-ai-builder">
              Cancel
            </Button>
            {aiPreview && (
              <Button
                onClick={handleAiCreateInternship}
                disabled={createMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                data-testid="button-create-ai-internship"
              >
                {createMutation.isPending ? "Creating..." : "Create This Internship"}
              </Button>
            )}
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
              <SelectItem value="mastery">Mastery</SelectItem>
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
