import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, CheckCircle2, Clock, Send, MessageSquare, Award,
  ChevronRight, User, LayoutDashboard, ListTodo, Upload, Bot,
  Medal, AlertCircle, Users, Calendar, Star
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "submissions", label: "Submissions", icon: Upload },
  { key: "mentor", label: "AI Mentor", icon: Bot },
  { key: "certification", label: "Certification", icon: Medal },
];

const roleColors: Record<string, string> = {
  "Team Lead": "#22D3EE",
  "Developer": "#14B8A6",
  "QA/Tester": "#8B5CF6",
  "developer": "#14B8A6",
  "team_lead": "#22D3EE",
  "qa_tester": "#8B5CF6",
  "Junior Intern": "#F59E0B",
  "Project Associate": "#3B82F6",
  "Lead Developer": "#22D3EE",
};

function getRoleColor(role: string): string {
  return roleColors[role] || "#14B8A6";
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getMemberDisplayName(m: any): string {
  return m.profile?.fullName || m.member?.userId?.slice(0, 8) || "Member";
}

function getMemberRole(m: any): string {
  const role = m.member?.role || "Developer";
  const roleLabels: Record<string, string> = {
    developer: "Developer",
    team_lead: "Team Lead",
    qa_tester: "QA/Tester",
  };
  return roleLabels[role] || role;
}

const statusColumns = ["todo", "in_progress", "review", "completed"];
const statusLabels: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};
const statusColors: Record<string, string> = {
  todo: "#6B7280",
  in_progress: "#3B82F6",
  review: "#F59E0B",
  completed: "#22C55E",
};

const submissionStatusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(234,179,8,0.15)", text: "#facc15" },
  approved: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  rejected: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
};

function parseDurationDays(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (!match) return 28;
  const num = parseInt(match[1]);
  if (duration.toLowerCase().includes("week")) return num * 7;
  if (duration.toLowerCase().includes("month")) return num * 30;
  return num;
}

function getDaysRemaining(startedAt: string, duration: string): number {
  const start = new Date(startedAt);
  const days = parseDurationDays(duration);
  const end = new Date(start.getTime() + days * 86400000);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export default function UdyogDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [submissionContent, setSubmissionContent] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", text: "Welcome! I'm Usha, your AI Mentor. I'm here to guide you through your internship journey. Ask me anything about your tasks, progress, or career development." },
  ]);
  const [chatInput, setChatInput] = useState("");

  const { data: assignmentData, isLoading: assignmentLoading } = useQuery<any>({
    queryKey: ["/api/udyog/my-assignment"],
  });

  const { data: batchData } = useQuery<any>({
    queryKey: ["/api/udyog/my-batch"],
    retry: false,
  });

  const hasBatch = !!batchData?.batch;
  const assignment = hasBatch ? batchData.assignment : assignmentData?.assignment || assignmentData;
  const internship = hasBatch ? batchData.internship : assignmentData?.internship;
  const tasks = hasBatch ? (batchData.tasks || []) : (assignmentData?.tasks || []);
  const batchMembers: any[] = batchData?.members || [];
  const batch = batchData?.batch;
  const batchProgress = batchData?.progress;
  const assignmentId = assignment?.id;

  const { data: submissions = [] } = useQuery<any[]>({
    queryKey: ["/api/udyog/submissions", assignmentId],
    enabled: !!assignmentId,
  });

  const taskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      await apiRequest("PATCH", `/api/udyog/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-assignment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-batch"] });
      toast({ title: "Task Updated", description: "Task status changed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    },
  });

  const submitWorkMutation = useMutation({
    mutationFn: async (data: { assignmentId: number; taskId: number | null; content: string }) => {
      await apiRequest("POST", "/api/udyog/submissions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/submissions", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-assignment"] });
      setSubmissionContent("");
      setSelectedTaskId(null);
      toast({ title: "Submitted", description: "Your work has been submitted for review." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit work.", variant: "destructive" });
    },
  });

  const generateCertMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/udyog/certificate/generate", { assignmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-assignment"] });
      toast({ title: "Certificate Generated", description: "Your internship certificate has been created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate certificate.", variant: "destructive" });
    },
  });

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Great question! Based on your current progress of ${overallProgress}%, I'd recommend focusing on your pending tasks. Keep up the consistent effort — you're building real industry skills that will set you apart. Remember, every completed task brings you closer to your certification.`,
        },
      ]);
    }, 800);
  };

  const completedTasksCount = tasks.filter((t: any) => t.status === "completed").length;
  const allTasksCompleted = tasks.length > 0 && completedTasksCount === tasks.length;
  const overallProgress = hasBatch ? (batchProgress || 0) : (assignment?.progress || 0);

  const daysRemaining = (() => {
    if (batch?.endDate) {
      const end = new Date(batch.endDate);
      const now = new Date();
      return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    }
    if (assignment && internship) {
      return getDaysRemaining(assignment.startedAt || assignment.createdAt, internship.duration);
    }
    return 0;
  })();

  const currentUserMember = batchMembers.find((m: any) => m.member?.userId === user?.id);
  const performanceScore = currentUserMember?.member?.performanceScore;

  if (assignmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (!assignment && !assignmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}
          >
            <Briefcase className="w-10 h-10 text-cyan-400" />
          </div>
          <h1
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-no-assignment"
          >
            No Active Internship
          </h1>
          <p className="text-gray-400 mb-8" data-testid="text-no-assignment-desc">
            Take a skill assessment to get started on your virtual internship journey.
          </p>
          <Link href="/shishya/udyog/assess">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all"
              style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
              data-testid="button-start-assessment"
            >
              Start Assessment
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const renderOverview = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-welcome-header"
          >
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          {assignment.assignedRole && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(34,211,238,0.15)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}
              data-testid="badge-assigned-role"
            >
              {assignment.assignedRole}
            </span>
          )}
        </div>
        <p className="text-gray-400" data-testid="text-internship-title">
          {internship?.title || "Virtual Internship"}
        </p>
      </div>

      {internship?.description && (
        <div
          className="rounded-xl p-5 border"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <p className="text-gray-300 text-sm leading-relaxed" data-testid="text-internship-desc">
            {internship.description}
          </p>
        </div>
      )}

      <div
        className="rounded-xl p-5 border"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-sm font-medium text-cyan-400" data-testid="text-progress-percent">
            {overallProgress}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #22D3EE, #14B8A6)" }}
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {hasBatch && batch && (
        <div
          className="rounded-xl p-4 border flex flex-wrap items-center gap-3"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Users className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-medium text-sm" style={{ fontFamily: "var(--font-display)" }}>
            Batch #{batch.batchNumber}
          </span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
            style={{
              background: batch.status === "active" ? "rgba(34,197,94,0.15)" : batch.status === "forming" ? "rgba(234,179,8,0.15)" : "rgba(107,114,128,0.15)",
              color: batch.status === "active" ? "#4ade80" : batch.status === "forming" ? "#facc15" : "#9CA3AF",
            }}
            data-testid="badge-batch-status"
          >
            {batch.status}
          </span>
          {performanceScore !== undefined && performanceScore !== null && (
            <div className="ml-auto flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium" data-testid="text-performance-score">
                {performanceScore}
              </span>
              <span className="text-xs text-gray-500">Performance</span>
            </div>
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 ${performanceScore !== undefined && performanceScore !== null && !hasBatch ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-4`}>
        <div
          className="rounded-xl p-5 border text-center"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          data-testid="stat-tasks-completed"
        >
          <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{completedTasksCount}/{tasks.length}</p>
          <p className="text-xs text-gray-400 mt-1">Tasks Completed</p>
        </div>
        <div
          className="rounded-xl p-5 border text-center"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          data-testid="stat-submissions"
        >
          <Upload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{submissions.length}</p>
          <p className="text-xs text-gray-400 mt-1">Submissions Made</p>
        </div>
        <div
          className="rounded-xl p-5 border text-center"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          data-testid="stat-days-remaining"
        >
          <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{daysRemaining}</p>
          <p className="text-xs text-gray-400 mt-1">Days Remaining</p>
        </div>
      </div>

      <div
        className="rounded-xl p-5 border"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Team Members
        </h3>
        {batchMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {batchMembers.map((m: any) => {
              const displayName = getMemberDisplayName(m);
              const role = getMemberRole(m);
              const color = getRoleColor(role);
              const initials = getInitials(displayName);
              const isCurrentUser = m.member?.userId === user?.id;
              return (
                <div
                  key={m.member?.id || m.member?.userId}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: isCurrentUser ? "rgba(34,211,238,0.05)" : "rgba(255,255,255,0.03)" }}
                  data-testid={`team-member-${displayName.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">
                      {displayName}{isCurrentUser ? " (You)" : ""}
                    </p>
                    <p className="text-xs" style={{ color }}>{role}</p>
                  </div>
                  {m.member?.performanceScore !== undefined && m.member?.performanceScore !== null && (
                    <span className="text-xs text-gray-500 shrink-0" data-testid={`member-score-${m.member?.id}`}>
                      {m.member.performanceScore}pts
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm" data-testid="text-no-team">
              {batch?.status === "forming" ? "Batch is forming — team members will appear once the batch is full." : "No team members yet."}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderTasks = () => (
    <motion.div
      key="tasks"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-tasks-header">
        Task Board
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusColumns.map((col) => {
          const colTasks = tasks.filter((t: any) => t.status === col);
          return (
            <div key={col} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[col] }} />
                <span className="text-sm font-medium text-gray-300">{statusLabels[col]}</span>
                <span className="text-xs text-gray-500 ml-auto">{colTasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map((task: any) => {
                  const assignedMember = task.assignedTo ? batchMembers.find((m: any) => m.member?.userId === task.assignedTo) : null;
                  const assignedName = assignedMember ? getMemberDisplayName(assignedMember) : null;
                  return (<div
                    key={task.id}
                    className="rounded-lg p-4 border transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                    data-testid={`task-card-${task.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">{task.title}</h4>
                      {task.score !== undefined && task.score !== null && task.status === "completed" && (
                        <span
                          className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}
                          data-testid={`task-score-${task.id}`}
                        >
                          {task.score}pts
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {task.dueDate && (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: "rgba(234,179,8,0.1)", color: "#facc15" }}
                          data-testid={`task-due-${task.id}`}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      {assignedName && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-gray-400"
                          data-testid={`task-assigned-${task.id}`}
                        >
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ background: getRoleColor(getMemberRole(assignedMember!)) }}
                          >
                            {getInitials(assignedName).slice(0, 1)}
                          </span>
                          {assignedName.split(" ")[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {statusColumns
                        .filter((s) => s !== col)
                        .map((newStatus) => (
                          <button
                            key={newStatus}
                            onClick={() => taskStatusMutation.mutate({ taskId: task.id, status: newStatus })}
                            className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
                            style={{
                              background: `${statusColors[newStatus]}20`,
                              color: statusColors[newStatus],
                              border: `1px solid ${statusColors[newStatus]}40`,
                            }}
                            disabled={taskStatusMutation.isPending}
                            data-testid={`button-move-task-${task.id}-${newStatus}`}
                          >
                            {statusLabels[newStatus]}
                          </button>
                        ))}
                    </div>
                  </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="rounded-lg p-4 border border-dashed text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <p className="text-xs text-gray-500">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderSubmissions = () => (
    <motion.div
      key="submissions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-submissions-header">
        Submissions
      </h2>

      <div
        className="rounded-xl p-5 border"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <h3 className="text-white font-medium mb-3">Submit New Work</h3>
        {tasks.length > 0 && (
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Select Task (optional)</label>
            <select
              value={selectedTaskId || ""}
              onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg px-3 py-2 text-sm text-white border"
              style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
              data-testid="select-task"
            >
              <option value="">General Submission</option>
              {tasks.map((t: any) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}
        <textarea
          value={submissionContent}
          onChange={(e) => setSubmissionContent(e.target.value)}
          placeholder="Describe your work, paste code, or share links..."
          className="w-full rounded-lg px-4 py-3 text-sm text-white border resize-none min-h-[120px]"
          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
          data-testid="textarea-submission"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              if (!submissionContent.trim()) {
                toast({ title: "Required", description: "Please enter submission content.", variant: "destructive" });
                return;
              }
              submitWorkMutation.mutate({
                assignmentId: assignmentId!,
                taskId: selectedTaskId,
                content: submissionContent,
              });
            }}
            disabled={submitWorkMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
            data-testid="button-submit-work"
          >
            <Send className="w-4 h-4" />
            {submitWorkMutation.isPending ? "Submitting..." : "Submit Work"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {submissions.length === 0 ? (
          <div
            className="rounded-xl p-8 border text-center"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm" data-testid="text-no-submissions">No submissions yet</p>
          </div>
        ) : (
          submissions.map((sub: any, idx: number) => {
            const statusStyle = submissionStatusColors[sub.status] || submissionStatusColors.pending;
            return (
              <div
                key={sub.id || idx}
                className="rounded-xl p-5 border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
                data-testid={`submission-card-${sub.id || idx}`}
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-sm text-gray-400">
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ""}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                    data-testid={`badge-submission-status-${sub.id || idx}`}
                  >
                    {sub.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{sub.content}</p>
                {sub.aiFeedback && (
                  <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)" }}>
                    <p className="text-xs text-cyan-400 font-medium mb-1">AI Feedback</p>
                    <p className="text-xs text-gray-300">{sub.aiFeedback}</p>
                  </div>
                )}
                {sub.feedback && (
                  <div className="mt-2 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <p className="text-xs text-green-400 font-medium mb-1">Reviewer Feedback</p>
                    <p className="text-xs text-gray-300">{sub.feedback}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );

  const renderMentor = () => (
    <motion.div
      key="mentor"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
        >
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold" style={{ fontFamily: "var(--font-display)" }} data-testid="text-mentor-header">
            Usha AI Mentor
          </h2>
          <p className="text-xs text-green-400">Online</p>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto rounded-xl p-4 border space-y-3 mb-4"
        style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
        data-testid="chat-messages-container"
      >
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] rounded-xl px-4 py-3"
              style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #22D3EE, #14B8A6)"
                  : "rgba(255,255,255,0.05)",
              }}
              data-testid={`chat-message-${idx}`}
            >
              <p className={`text-sm ${msg.role === "user" ? "text-white" : "text-gray-300"}`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
          placeholder="Ask Usha anything..."
          className="flex-1 rounded-lg px-4 py-3 text-sm text-white border"
          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
          data-testid="input-chat"
        />
        <button
          onClick={handleSendChat}
          className="px-4 py-3 rounded-lg text-white transition-all"
          style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
          data-testid="button-send-chat"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderCertification = () => {
    const remainingTasks = tasks.filter((t: any) => t.status !== "completed");

    return (
      <motion.div
        key="certification"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        {allTasksCompleted ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(20,184,166,0.2))", border: "2px solid rgba(34,211,238,0.4)" }}
              >
                <Award className="w-12 h-12 text-cyan-400" />
              </div>
              <h2
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-congratulations"
              >
                Congratulations!
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                You have completed all tasks in your internship. Generate your official certificate to showcase your achievement.
              </p>
              <button
                onClick={() => generateCertMutation.mutate()}
                disabled={generateCertMutation.isPending}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition-all"
                style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                data-testid="button-generate-certificate"
              >
                <Award className="w-5 h-5" />
                {generateCertMutation.isPending ? "Generating..." : "Generate Certificate"}
              </button>
              {assignment.certificate && (
                <div
                  className="mt-8 rounded-xl p-6 border max-w-md mx-auto"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(34,211,238,0.2)" }}
                  data-testid="certificate-details"
                >
                  <Award className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">{internship?.title}</p>
                  <p className="text-gray-400 text-sm mb-4">Certificate ID: {assignment.certificate.certificateId}</p>
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-cyan-400 border"
                    style={{ borderColor: "rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.05)" }}
                    data-testid="button-download-pdf"
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }} data-testid="text-certification-progress">
              Certification Progress
            </h2>
            <div
              className="rounded-xl p-5 border mb-6"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Completion</span>
                <span className="text-sm font-medium text-cyan-400">
                  {completedTasksCount}/{tasks.length} tasks
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #22D3EE, #14B8A6)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Remaining Tasks</h3>
              {remainingTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                  data-testid={`remaining-task-${task.id}`}
                >
                  <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-sm text-gray-300">{task.title}</span>
                  <span
                    className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: `${statusColors[task.status]}20`, color: statusColors[task.status] }}
                  >
                    {statusLabels[task.status] || task.status}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-5 border text-center"
              style={{ background: "rgba(34,211,238,0.03)", borderColor: "rgba(34,211,238,0.1)" }}
            >
              <p className="text-cyan-400 text-sm font-medium" data-testid="text-motivational">
                You're {Math.round((completedTasksCount / Math.max(tasks.length, 1)) * 100)}% there! Keep pushing — your certificate awaits.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "tasks": return renderTasks();
      case "submissions": return renderSubmissions();
      case "mentor": return renderMentor();
      case "certification": return renderCertification();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col w-60 shrink-0 fixed top-0 left-0 h-screen z-30 bg-card/80 backdrop-blur-xl border-r border-white/10">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
            >
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              Udyog Workspace
            </span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1" data-testid="sidebar-nav">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  background: isActive ? "rgba(34,211,238,0.2)" : "transparent",
                  borderLeft: isActive ? "3px solid #22D3EE" : "3px solid transparent",
                  color: isActive ? "#22D3EE" : "#9CA3AF",
                }}
                data-testid={`sidebar-item-${item.key}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/shishya/dashboard">
            <div className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer" data-testid="link-back-dashboard">
              <User className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="md:hidden overflow-x-auto border-b" style={{ background: "#111827", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex px-2 py-2 gap-1 min-w-max" data-testid="mobile-tab-bar">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: isActive ? "rgba(34,211,238,0.2)" : "transparent",
                  color: isActive ? "#22D3EE" : "#9CA3AF",
                }}
                data-testid={`mobile-tab-${item.key}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 md:ml-60">
        <div className="p-4 md:p-8 max-w-6xl">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}