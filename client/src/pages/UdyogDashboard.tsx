import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, CheckCircle2, Clock, Send, MessageSquare, Award,
  ChevronRight, User, LayoutDashboard, ListTodo, Upload, Bot,
  Medal, AlertCircle, Users, Calendar, Star, Bell,
  BarChart3, FileText, FolderKanban, BookOpen, Video, ExternalLink, Home, Plus,
  Shield, ArrowRight, Zap, TrendingUp, Target, Download, Eye, X
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const sidebarItems = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "project", label: "My Project", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "daily-log", label: "Daily Log", icon: FileText },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "resources", label: "Resources", icon: BookOpen },
  { key: "mentor", label: "AI Mentor", icon: Bot },
  { key: "certification", label: "Certificate", icon: Medal },
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

interface DailyLog {
  id: string;
  date: string;
  hours: number;
  description: string;
  link: string;
}

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

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
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logHours, setLogHours] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logLink, setLogLink] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

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

  const { data: assessments = [] } = useQuery<any[]>({
    queryKey: ["/api/udyog/assessments"],
  });

  useEffect(() => {
    if (assignmentId) {
      const stored = localStorage.getItem(`udyog_daily_logs_${assignmentId}`);
      if (stored) {
        try { setDailyLogs(JSON.parse(stored)); } catch {}
      }
    }
  }, [assignmentId]);

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

  const handleAddLog = () => {
    if (!logDesc.trim()) {
      toast({ title: "Required", description: "Please enter a description.", variant: "destructive" });
      return;
    }
    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: logDate,
      hours: parseFloat(logHours) || 0,
      description: logDesc.trim(),
      link: logLink.trim(),
    };
    const updated = [newLog, ...dailyLogs];
    setDailyLogs(updated);
    if (assignmentId) {
      localStorage.setItem(`udyog_daily_logs_${assignmentId}`, JSON.stringify(updated));
    }
    setLogDesc("");
    setLogHours("");
    setLogLink("");
    toast({ title: "Log Added", description: "Daily log entry saved." });
  };

  const completedTasksCount = tasks.filter((t: any) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t: any) => t.status === "in_progress").length;
  const reviewCount = tasks.filter((t: any) => t.status === "review").length;
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

  const totalDays = internship?.duration ? parseDurationDays(internship.duration) : 30;
  const daysActive = Math.max(0, totalDays - daysRemaining);

  const currentUserMember = batchMembers.find((m: any) => m.member?.userId === user?.id);
  const performanceScore = currentUserMember?.member?.performanceScore;

  const username = user?.fullName || (user?.email ? user.email.split("@")[0] : "Intern");
  const userInitial = username.charAt(0).toUpperCase();

  const currentLabel = sidebarItems.find((s) => s.key === activeTab)?.label || "Dashboard";

  if (assignmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #050A18, #0B1D3A, #0F172A)" }}>
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ border: "2px solid #00F5FF", borderTopColor: "transparent", animation: "spin 1s linear infinite" }}>
            <Briefcase className="w-6 h-6" style={{ color: "#00F5FF" }} />
          </div>
          <p style={{ color: "#94A3B8" }} className="text-sm">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (!assignment && !assignmentData) {
    const hasAssessments = assessments.length > 0;
    const bestAssessment = hasAssessments
      ? assessments.reduce((best: any, curr: any) => (!best || curr.score > best.score) ? curr : best, null)
      : null;

    const assessmentLevelColors: Record<string, { bg: string; text: string; border: string }> = {
      beginner: { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.3)" },
      intermediate: { bg: "rgba(234,179,8,0.15)", text: "#facc15", border: "rgba(234,179,8,0.3)" },
      advanced: { bg: "rgba(34,197,94,0.15)", text: "#4ade80", border: "rgba(34,197,94,0.3)" },
    };

    return (
      <div className="min-h-screen px-4 py-12" style={{ background: "linear-gradient(135deg, #050A18, #0B1D3A, #0F172A)" }}>
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: "radial-gradient(circle, rgba(0,245,255,0.15), transparent)", border: "2px solid rgba(0,245,255,0.3)" }}
            >
              <Briefcase className="w-10 h-10" style={{ color: "#00F5FF" }} />
            </div>
            <h1
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}
              data-testid="text-no-assignment"
            >
              {hasAssessments ? "Your Internship Dashboard" : "Welcome to Our Udyog"}
            </h1>
            <p style={{ color: "#94A3B8" }} className="max-w-md mx-auto" data-testid="text-no-assignment-desc">
              {hasAssessments
                ? "You've completed your skill assessment. Browse internships and apply to get started."
                : "Take a skill assessment to get matched with the perfect virtual internship."}
            </p>
          </motion.div>

          {hasAssessments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6"
              style={{ ...glassCard }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(14,165,233,0.15))", border: "1px solid rgba(0,245,255,0.3)" }}
                >
                  <Target className="w-5 h-5" style={{ color: "#00F5FF" }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>
                    Assessment Scores
                  </h2>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>Your AI-evaluated skill results</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {assessments.map((a: any, idx: number) => {
                  const levelStyle = assessmentLevelColors[a.level?.toLowerCase()] || assessmentLevelColors.beginner;
                  return (
                    <motion.div
                      key={a.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.08 }}
                      className="rounded-xl p-4"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                      data-testid={`dashboard-assessment-${a.id || idx}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{a.domain}</span>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                          style={{ background: levelStyle.bg, color: levelStyle.text, border: `1px solid ${levelStyle.border}` }}
                        >
                          {a.level}
                        </span>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold" style={{ color: "#FFFFFF" }}>{a.score}</span>
                        <span className="text-sm mb-1" style={{ color: "#64748B" }}>/ 100</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${levelStyle.text}, #00F5FF)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${a.score}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                        />
                      </div>
                      <p className="text-[10px] mt-2" style={{ color: "#64748B" }}>
                        {a.assessedAt ? new Date(a.assessedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {bestAssessment && (
                <div
                  className="rounded-xl p-4 flex flex-wrap items-center gap-4"
                  style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.15)" }}
                  data-testid="best-assessment-summary-dashboard"
                >
                  <Award className="w-8 h-8 shrink-0" style={{ color: "#00F5FF" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
                      Best Score: <span style={{ color: "#00F5FF" }}>{bestAssessment.score}%</span> in {bestAssessment.domain}
                    </p>
                    <p className="text-xs" style={{ color: "#94A3B8" }}>
                      Level: <span className="capitalize">{bestAssessment.level}</span> — You qualify as{" "}
                      <span style={{ color: "#00F5FF" }} className="font-medium">
                        {bestAssessment.score >= 80 ? "Lead Developer" : bestAssessment.score >= 40 ? "Project Associate" : "Junior Intern"}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasAssessments ? 0.4 : 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/shishya/udyog/hub">
              <button
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all"
                style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
                data-testid="button-browse-internships"
              >
                Browse Internships
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/shishya/udyog/assess">
              <button
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
                data-testid="button-start-assessment"
              >
                {hasAssessments ? "Retake Assessment" : "Take Assessment"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const CircularProgress = ({ value, size = 72, stroke = 6 }: { value: number; size?: number; stroke?: number }) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#progressGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const SkillBar = ({ label, value, color = "#00F5FF" }: { label: string; value: number; color?: string }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm" style={{ color: "#94A3B8" }}>{label}</span>
        <span className="text-sm font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  const renderOverview = () => {
    const statsCards = [
      { label: "Tasks Assigned", value: tasks.length, icon: Target, color: "#00F5FF" },
      { label: "In Progress", value: inProgressCount, icon: Zap, color: "#0EA5E9" },
      { label: "Under Review", value: reviewCount, icon: Clock, color: "#F59E0B" },
      { label: "Performance", value: performanceScore ?? Math.round(overallProgress), icon: TrendingUp, color: "#10B981" },
    ];

    return (
      <motion.div key="overview" {...fadeInUp} className="space-y-6">
        <div className="rounded-2xl p-6 md:p-8 relative overflow-visible" style={{ ...glassCard, background: "linear-gradient(135deg, rgba(0,245,255,0.06), rgba(14,165,233,0.04), rgba(124,58,237,0.03))" }}>
          <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(0,245,255,0.08), transparent 60%)", pointerEvents: "none" }} />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-welcome-header">
                {getGreeting()}, {username}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {assignment.assignedRole && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.25)" }} data-testid="badge-assigned-role">
                    {assignment.assignedRole}
                  </span>
                )}
                {hasBatch && batch && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.25)" }} data-testid="badge-batch-status">
                    Batch #{batch.batchNumber} &middot; {batch.status}
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: "#94A3B8" }} data-testid="text-internship-title">
                {internship?.title || "Virtual Internship"} &middot; {daysRemaining} days remaining
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <CircularProgress value={overallProgress} size={80} stroke={6} />
                <span className="absolute text-lg font-bold" style={{ color: "#FFFFFF" }} data-testid="text-progress-percent">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" variants={stagger} initial="initial" animate="animate">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={cardItem}
                className="rounded-xl p-5 transition-all cursor-default"
                style={{ ...glassCard }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${stat.color}40`; e.currentTarget.style.boxShadow = `0 8px 32px ${stat.color}15`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}10)` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="rounded-xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Current Project</h3>
              <p className="text-sm" style={{ color: "#94A3B8" }}>{internship?.title || "Virtual Internship"}</p>
            </div>
            <button
              onClick={() => setActiveTab("tasks")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.2)" }}
              data-testid="button-open-tasks"
            >
              Open Tasks <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {internship?.description && (
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }} data-testid="text-internship-desc">{internship.description}</p>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#94A3B8" }}>Progress</span>
            <span className="text-xs font-medium" style={{ color: "#00F5FF" }}>{overallProgress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00F5FF, #0EA5E9)" }} initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1 }} />
          </div>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <span className="text-xs" style={{ color: "#64748B" }}>
              {assignment?.startedAt ? `Started ${new Date(assignment.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
            </span>
            <span className="text-xs" style={{ color: "#64748B" }}>{daysRemaining} days remaining</span>
          </div>
        </div>

        <div className="rounded-xl p-6" style={glassCard}>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: "#00F5FF" }} />
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Team Members</h3>
          </div>
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
                    style={{ background: isCurrentUser ? "rgba(0,245,255,0.06)" : "rgba(255,255,255,0.03)", border: isCurrentUser ? "1px solid rgba(0,245,255,0.15)" : "1px solid transparent" }}
                    data-testid={`team-member-${displayName.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: "#FFFFFF" }}>
                        {displayName}{isCurrentUser ? " (You)" : ""}
                      </p>
                      <p className="text-xs" style={{ color }}>{role}</p>
                    </div>
                    {m.member?.performanceScore !== undefined && m.member?.performanceScore !== null && (
                      <span className="text-xs shrink-0 px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }} data-testid={`member-score-${m.member?.id}`}>
                        {m.member.performanceScore}pts
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 mx-auto mb-2" style={{ color: "#475569" }} />
              <p className="text-sm" style={{ color: "#94A3B8" }} data-testid="text-no-team">
                {batch?.status === "forming" ? "Batch is forming — team members will appear once the batch is full." : "No team members yet."}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderProject = () => (
    <motion.div key="project" {...fadeInUp} className="space-y-6">
      <div className="rounded-2xl p-6 md:p-8 relative overflow-visible" style={{ ...glassCard, background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(0,245,255,0.04))" }}>
        <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse at 80% 30%, rgba(124,58,237,0.1), transparent 60%)", pointerEvents: "none" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-5 h-5" style={{ color: "#A78BFA" }} />
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>
              {internship?.level || "Intermediate"}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-project-title">
            {internship?.title || "Virtual Internship"}
          </h2>
          {internship?.description && (
            <p className="text-sm mb-4" style={{ color: "#94A3B8" }}>{internship.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mb-4">
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
              Duration: {internship?.duration || "4 weeks"}
            </span>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
              Tasks: {tasks.length}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "#94A3B8" }}>Overall Progress</span>
            <span className="text-xs font-medium" style={{ color: "#00F5FF" }}>{overallProgress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00F5FF, #0EA5E9)" }} initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6" style={glassCard}>
        <h3 className="font-semibold mb-6" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Milestones</h3>
        {tasks.length > 0 ? (
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="space-y-5">
              {tasks.map((task: any, idx: number) => {
                const isCompleted = task.status === "completed";
                const isInProgress = task.status === "in_progress";
                return (
                  <div key={task.id} className="flex items-start gap-4 relative" data-testid={`milestone-${task.id}`}>
                    <div className="relative z-10 shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)", border: "2px solid #10B981" }}>
                          <CheckCircle2 className="w-4 h-4" style={{ color: "#10B981" }} />
                        </div>
                      ) : isInProgress ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,245,255,0.15)", border: "2px solid #00F5FF" }}>
                          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#00F5FF" }} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.15)" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: "#475569" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm font-medium" style={{ color: isCompleted ? "#10B981" : "#FFFFFF" }}>{task.title}</p>
                      {task.description && <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{task.description}</p>}
                      <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full" style={{ background: `${statusColors[task.status]}20`, color: statusColors[task.status] }}>
                        {statusLabels[task.status] || task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderKanban className="w-8 h-8 mx-auto mb-2" style={{ color: "#475569" }} />
            <p className="text-sm" style={{ color: "#94A3B8" }}>No milestones yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderTasks = () => (
    <motion.div key="tasks" {...fadeInUp} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-tasks-header">
          Task Board
        </h2>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF" }}>
          {completedTasksCount}/{tasks.length} completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusColumns.map((col) => {
          const colTasks = tasks.filter((t: any) => t.status === col);
          return (
            <div key={col} className="space-y-3">
              <div className="flex items-center gap-2 px-1 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[col] }} />
                <span className="text-sm font-medium" style={{ color: "#E2E8F0" }}>{statusLabels[col]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto font-medium" style={{ background: `${statusColors[col]}20`, color: statusColors[col] }}>
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[120px]">
                {colTasks.map((task: any) => {
                  const assignedMember = task.assignedTo ? batchMembers.find((m: any) => m.member?.userId === task.assignedTo) : null;
                  const assignedName = assignedMember ? getMemberDisplayName(assignedMember) : null;
                  return (
                    <div key={task.id} className="rounded-xl p-4 transition-all" style={glassCard} data-testid={`task-card-${task.id}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{task.title}</h4>
                        {task.score !== undefined && task.score !== null && task.status === "completed" && (
                          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }} data-testid={`task-score-${task.id}`}>
                            {task.score}pts
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs mb-2 line-clamp-2" style={{ color: "#64748B" }}>{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }} data-testid={`task-due-${task.id}`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                        {assignedName && (
                          <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "#94A3B8" }} data-testid={`task-assigned-${task.id}`}>
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: getRoleColor(getMemberRole(assignedMember!)), color: "#FFFFFF" }}>
                              {getInitials(assignedName).slice(0, 1)}
                            </span>
                            {assignedName.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {statusColumns
                          .filter((s) => s !== col)
                          .map((newStatus) => (
                            <button
                              key={newStatus}
                              onClick={() => taskStatusMutation.mutate({ taskId: task.id, status: newStatus })}
                              className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                              style={{ background: `${statusColors[newStatus]}15`, color: statusColors[newStatus], border: `1px solid ${statusColors[newStatus]}30` }}
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
                  <div className="rounded-xl p-6 text-center" style={{ border: "2px dashed rgba(255,255,255,0.08)" }}>
                    <p className="text-xs" style={{ color: "#475569" }}>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl p-6" style={glassCard}>
        <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-submissions-header">Submit Work</h3>
        {tasks.length > 0 && (
          <div className="mb-3">
            <label className="text-xs mb-1.5 block" style={{ color: "#94A3B8" }}>Select Task (optional)</label>
            <select
              value={selectedTaskId || ""}
              onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
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
          className="w-full rounded-lg px-4 py-3 text-sm resize-none min-h-[120px]"
          style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
          data-testid="textarea-submission"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              if (!submissionContent.trim()) {
                toast({ title: "Required", description: "Please enter submission content.", variant: "destructive" });
                return;
              }
              submitWorkMutation.mutate({ assignmentId: assignmentId!, taskId: selectedTaskId, content: submissionContent });
            }}
            disabled={submitWorkMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
            data-testid="button-submit-work"
          >
            <Send className="w-4 h-4" />
            {submitWorkMutation.isPending ? "Submitting..." : "Submit Work"}
          </button>
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Previous Submissions</h3>
          {submissions.map((sub: any, idx: number) => {
            const statusStyle = submissionStatusColors[sub.status] || submissionStatusColors.pending;
            return (
              <div key={sub.id || idx} className="rounded-xl p-5" style={glassCard} data-testid={`submission-card-${sub.id || idx}`}>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-sm" style={{ color: "#94A3B8" }}>
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : ""}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: statusStyle.bg, color: statusStyle.text }} data-testid={`badge-submission-status-${sub.id || idx}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "#CBD5E1" }}>{sub.content}</p>
                {sub.aiFeedback && (
                  <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#00F5FF" }}>AI Feedback</p>
                    <p className="text-xs" style={{ color: "#CBD5E1" }}>{sub.aiFeedback}</p>
                  </div>
                )}
                {sub.feedback && (
                  <div className="mt-2 p-3 rounded-lg" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <p className="text-xs font-medium mb-1" style={{ color: "#10B981" }}>Reviewer Feedback</p>
                    <p className="text-xs" style={{ color: "#CBD5E1" }}>{sub.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  const renderDailyLog = () => (
    <motion.div key="daily-log" {...fadeInUp} className="space-y-6">
      <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Daily Log</h2>

      <div className="rounded-xl p-6" style={glassCard}>
        <h3 className="font-semibold mb-4" style={{ color: "#FFFFFF" }}>Add New Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: "#94A3B8" }}>Date</label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none", colorScheme: "dark" }}
              data-testid="input-log-date"
            />
          </div>
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: "#94A3B8" }}>Hours Worked</label>
            <input
              type="number"
              value={logHours}
              onChange={(e) => setLogHours(e.target.value)}
              placeholder="e.g. 4"
              min="0" max="24" step="0.5"
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
              data-testid="input-log-hours"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs mb-1.5 block" style={{ color: "#94A3B8" }}>Description</label>
          <textarea
            value={logDesc}
            onChange={(e) => setLogDesc(e.target.value)}
            placeholder="What did you work on today?"
            className="w-full rounded-lg px-4 py-3 text-sm resize-none min-h-[100px]"
            style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            data-testid="textarea-log-desc"
          />
        </div>
        <div className="mb-4">
          <label className="text-xs mb-1.5 block" style={{ color: "#94A3B8" }}>Link (GitHub/Drive URL)</label>
          <input
            type="url"
            value={logLink}
            onChange={(e) => setLogLink(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full rounded-lg px-3 py-2.5 text-sm"
            style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
            data-testid="input-log-link"
          />
        </div>
        <button
          onClick={handleAddLog}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
          data-testid="button-add-log"
        >
          <Plus className="w-4 h-4" />
          Add Log Entry
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={glassCard}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="font-semibold" style={{ color: "#FFFFFF" }}>Log History</h3>
        </div>
        {dailyLogs.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {dailyLogs.map((log) => (
              <div key={log.id} className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }} data-testid={`log-entry-${log.id}`}>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{new Date(log.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF" }}>{log.hours}h</span>
                </div>
                <p className="text-sm" style={{ color: "#94A3B8" }}>{log.description}</p>
                {log.link && (
                  <a href={log.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs" style={{ color: "#0EA5E9" }}>
                    <ExternalLink className="w-3 h-3" /> View Link
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#475569" }} />
            <p className="text-sm" style={{ color: "#94A3B8" }}>No log entries yet. Start tracking your daily work above.</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderPerformance = () => {
    const techSkill = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
    const communication = 75;
    const teamwork = batchMembers.length > 1 ? 80 : 60;
    const problemSolving = Math.min(100, submissions.length * 20);
    const overallScore = performanceScore ?? Math.round((techSkill + communication + teamwork + problemSolving) / 4);
    const feedbackSub = submissions.find((s: any) => s.feedback);

    return (
      <motion.div key="performance" {...fadeInUp} className="space-y-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Performance</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-xl p-6" style={glassCard}>
            <h3 className="font-semibold mb-6" style={{ color: "#FFFFFF" }}>Skill Ratings</h3>
            <SkillBar label="Technical Skills" value={techSkill} color="#00F5FF" />
            <SkillBar label="Communication" value={communication} color="#0EA5E9" />
            <SkillBar label="Teamwork" value={teamwork} color="#7C3AED" />
            <SkillBar label="Problem Solving" value={problemSolving} color="#10B981" />
          </div>

          <div className="rounded-xl p-6 flex flex-col items-center justify-center" style={glassCard}>
            <p className="text-xs mb-3 uppercase tracking-wider" style={{ color: "#94A3B8" }}>Overall Score</p>
            <div className="relative flex items-center justify-center mb-3">
              <CircularProgress value={overallScore} size={120} stroke={8} />
              <span className="absolute text-3xl font-bold" style={{ color: "#FFFFFF" }}>{overallScore}</span>
            </div>
            <p className="text-xs" style={{ color: "#64748B" }}>out of 100</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-6" style={glassCard}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" style={{ color: "#F59E0B" }} />
              <h3 className="font-semibold" style={{ color: "#FFFFFF" }}>Attendance</h3>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold" style={{ color: "#FFFFFF" }}>{daysActive}</span>
              <span className="text-sm mb-1" style={{ color: "#94A3B8" }}>/ {totalDays} days</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #F59E0B, #F97316)" }} initial={{ width: 0 }} animate={{ width: `${totalDays > 0 ? (daysActive / totalDays) * 100 : 0}%` }} transition={{ duration: 1 }} />
            </div>
          </div>

          <div className="rounded-xl p-6" style={glassCard}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" style={{ color: "#10B981" }} />
              <h3 className="font-semibold" style={{ color: "#FFFFFF" }}>Leader Feedback</h3>
            </div>
            {feedbackSub ? (
              <div className="p-3 rounded-lg" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-sm" style={{ color: "#CBD5E1" }}>{feedbackSub.feedback}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#64748B" }}>Awaiting feedback from your mentor or team lead.</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderResources = () => {
    const resources = [
      { icon: FileText, title: "Project Documentation", desc: "Access project briefs and requirements", color: "#00F5FF" },
      { icon: Shield, title: "Company Guidelines", desc: "Workplace policies and best practices", color: "#7C3AED" },
      { icon: BookOpen, title: "Learning Modules", desc: "Skill development resources", color: "#0EA5E9" },
      { icon: Video, title: "Meeting Recordings", desc: "Past team meeting archives", color: "#F59E0B" },
    ];

    return (
      <motion.div key="resources" {...fadeInUp} className="space-y-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>Resources</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="initial" animate="animate">
          {resources.map((res) => {
            const Icon = res.icon;
            return (
              <motion.div
                key={res.title}
                variants={cardItem}
                className="rounded-xl p-6 transition-all cursor-default"
                style={glassCard}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${res.color}10`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                data-testid={`resource-${res.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${res.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: res.color }} />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>Coming Soon</span>
                </div>
                <h4 className="font-semibold mb-1" style={{ color: "#FFFFFF" }}>{res.title}</h4>
                <p className="text-sm" style={{ color: "#64748B" }}>{res.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    );
  };

  const renderMentor = () => (
    <motion.div key="mentor" {...fadeInUp} className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="flex items-center gap-3 mb-4 p-4 rounded-xl" style={glassCard}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)" }}>
          <Bot className="w-5 h-5" style={{ color: "#050A18" }} />
        </div>
        <div>
          <h2 className="font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-mentor-header">
            Usha AI Mentor
          </h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
            <span className="text-xs" style={{ color: "#10B981" }}>Online</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto rounded-xl p-4 space-y-3 mb-4"
        style={glassCard}
        data-testid="chat-messages-container"
      >
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3"
              style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #00F5FF, #0EA5E9)"
                  : "rgba(255,255,255,0.06)",
                border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
              data-testid={`chat-message-${idx}`}
            >
              <p className="text-sm" style={{ color: msg.role === "user" ? "#050A18" : "#CBD5E1" }}>
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
          className="flex-1 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(255,255,255,0.05)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
          data-testid="input-chat"
        />
        <button
          onClick={handleSendChat}
          className="px-4 py-3 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
          data-testid="button-send-chat"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        removeContainer: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      const certId = assignment?.certificate?.certificateId || "UDYOG-CERT";
      pdf.save(`${certId}-certificate.pdf`);
      toast({ title: "Certificate Downloaded", description: "Your certificate PDF has been saved." });
    } catch (err) {
      toast({ title: "Download Failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const renderCertificateBody = (attachRef: boolean) => {
    const certIdVal = assignment?.certificate?.certificateId || "UDYOG-XXXXXXXX";
    const studentName = username;
    const programTitle = internship?.title || "Virtual Internship";
    const role = assignment?.assignedRole || "Intern";
    const domain = internship?.domain || "";
    const completionDateStr = assignment?.completedAt ? new Date(assignment.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    return (
      <div
        ref={attachRef ? certificateRef : undefined}
        style={{
          width: "800px",
          height: "566px",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
        data-testid="certificate-preview"
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, #00F5FF, #0EA5E9, #7C3AED, #00F5FF)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, #00F5FF, #0EA5E9, #7C3AED, #00F5FF)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "6px", background: "linear-gradient(180deg, #00F5FF, #0EA5E9, #7C3AED, #00F5FF)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "6px", background: "linear-gradient(180deg, #00F5FF, #0EA5E9, #7C3AED, #00F5FF)" }} />

        <div style={{ position: "absolute", top: "30px", left: "30px", width: "120px", height: "120px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,255,0.08), transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "30px", right: "30px", width: "150px", height: "150px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)" }} />

        <div style={{ position: "relative", padding: "40px 50px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A" }}>U</span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#E2E8F0", letterSpacing: "2px", textTransform: "uppercase" }}>Our Udyog</span>
            </div>
            <p style={{ fontSize: "11px", color: "#64748B", letterSpacing: "4px", textTransform: "uppercase", margin: 0 }}>Certificate of Completion</p>
          </div>

          <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "8px", letterSpacing: "1px" }}>This is to certify that</p>
            <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px", fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              {studentName}
            </h1>
            <p style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "20px" }}>
              has successfully completed the internship program
            </p>
            <div style={{ display: "inline-block", margin: "0 auto", padding: "10px 28px", borderRadius: "8px", background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#00F5FF", margin: 0, fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
                {programTitle}
              </h2>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginTop: "18px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "#64748B", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>Role</p>
                <p style={{ fontSize: "13px", color: "#E2E8F0", fontWeight: 600 }}>{role}</p>
              </div>
              {domain && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "10px", color: "#64748B", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>Domain</p>
                  <p style={{ fontSize: "13px", color: "#E2E8F0", fontWeight: 600 }}>{domain}</p>
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "#64748B", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "1px" }}>Tasks Completed</p>
                <p style={{ fontSize: "13px", color: "#E2E8F0", fontWeight: 600 }}>{completedTasksCount}/{tasks.length}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ width: "120px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "6px" }}>
                <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>Program Director</p>
                <p style={{ fontSize: "11px", color: "#E2E8F0", fontWeight: 600, margin: "2px 0 0 0" }}>OurShiksha</p>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#64748B", margin: 0 }}>{completionDateStr}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "9px", color: "#475569", margin: 0 }}>Certificate ID</p>
              <p style={{ fontSize: "11px", color: "#00F5FF", fontWeight: 600, fontFamily: "monospace", margin: "2px 0 0 0" }}>{certIdVal}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCertification = () => {
    const remainingTasks = tasks.filter((t: any) => t.status !== "completed");
    const certProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
    const hasCertificate = !!assignment?.certificate;
    const certId = assignment?.certificate?.certificateId || "";
    const completionDate = assignment?.completedAt
      ? new Date(assignment.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    return (
      <motion.div key="certification" {...fadeInUp} className="space-y-6">
        {allTasksCompleted ? (
          <div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
              {!hasCertificate && (
                <div className="text-center py-10 mb-6">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,245,255,0.2), transparent 70%)", filter: "blur(20px)" }} />
                    <div className="w-20 h-20 rounded-full flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(14,165,233,0.15))", border: "2px solid rgba(0,245,255,0.4)" }}>
                      <Award className="w-10 h-10" style={{ color: "#00F5FF" }} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-congratulations">
                    Congratulations!
                  </h2>
                  <p className="mb-6 max-w-md mx-auto text-sm" style={{ color: "#94A3B8" }}>
                    You have completed all tasks. Generate your official certificate to showcase your achievement.
                  </p>
                  <button
                    onClick={() => generateCertMutation.mutate()}
                    disabled={generateCertMutation.isPending}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all text-lg"
                    style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
                    data-testid="button-generate-certificate"
                  >
                    <Award className="w-5 h-5" />
                    {generateCertMutation.isPending ? "Generating..." : "Generate Certificate"}
                  </button>
                </div>
              )}

              {hasCertificate && (
                <div className="space-y-6">
                  <div className="rounded-2xl overflow-hidden" style={{ ...glassCard, borderColor: "rgba(0,245,255,0.15)" }} data-testid="certificate-card">
                    <div className="relative p-1.5" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.08))" }}>
                      <div className="rounded-xl p-6" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)" }}>
                        <div className="flex items-start gap-5">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(14,165,233,0.15))", border: "1px solid rgba(0,245,255,0.3)" }}>
                            <Award className="w-8 h-8" style={{ color: "#00F5FF" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                                Verified
                              </span>
                            </div>
                            <h3 className="text-lg font-bold truncate" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>
                              {internship?.title || "Virtual Internship"}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
                              Certificate of Completion
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>Certificate ID</p>
                            <p className="text-xs font-semibold" style={{ color: "#00F5FF", fontFamily: "monospace" }}>{certId}</p>
                          </div>
                          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>Role</p>
                            <p className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>{assignment.assignedRole}</p>
                          </div>
                          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>Tasks Done</p>
                            <p className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>{completedTasksCount}/{tasks.length}</p>
                          </div>
                          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>Date</p>
                            <p className="text-xs font-semibold" style={{ color: "#E2E8F0" }}>{completionDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-5">
                          <button
                            onClick={() => setViewCertificate(true)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90"
                            style={{ border: "1px solid rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.08)", color: "#00F5FF" }}
                            data-testid="button-view-certificate"
                          >
                            <Eye className="w-4 h-4" />
                            View Certificate
                          </button>
                          <button
                            onClick={handleDownloadCertificate}
                            disabled={downloading}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
                            data-testid="button-download-pdf"
                          >
                            <Download className="w-4 h-4" />
                            {downloading ? "Generating..." : "Download PDF"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl p-4 text-center" style={glassCard}>
                      <Award className="w-6 h-6 mx-auto mb-2" style={{ color: "#00F5FF" }} />
                      <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{internship?.title}</p>
                      <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Program</p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={glassCard}>
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: "#10B981" }} />
                      <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{completedTasksCount}/{tasks.length} Tasks</p>
                      <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Completed</p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={glassCard}>
                      <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: "#A78BFA" }} />
                      <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{assignment.assignedRole}</p>
                      <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Role</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }} data-testid="text-certification-progress">
              Certification Progress
            </h2>

            <div className="rounded-xl p-6 mb-6" style={glassCard}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm" style={{ color: "#94A3B8" }}>Completion</span>
                <span className="text-sm font-semibold" style={{ color: "#00F5FF" }}>
                  {completedTasksCount}/{tasks.length} tasks
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #00F5FF, #0EA5E9)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${certProgress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: "#94A3B8" }}>Remaining Tasks</h3>
              {remainingTasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ ...glassCard }} data-testid={`remaining-task-${task.id}`}>
                  <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#F59E0B" }} />
                  <span className="text-sm flex-1" style={{ color: "#CBD5E1" }}>{task.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${statusColors[task.status]}20`, color: statusColors[task.status] }}>
                    {statusLabels[task.status] || task.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-5 text-center" style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)" }}>
              <Zap className="w-5 h-5 mx-auto mb-2" style={{ color: "#00F5FF" }} />
              <p className="text-sm font-medium" style={{ color: "#00F5FF" }} data-testid="text-motivational">
                You're {certProgress}% there! Keep pushing — your certificate awaits.
              </p>
            </div>
          </div>
        )}

        {hasCertificate && (
          <div style={{ position: "absolute", left: "-9999px", top: 0 }} aria-hidden="true">
            {renderCertificateBody(true)}
          </div>
        )}

        <AnimatePresence>
          {viewCertificate && hasCertificate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
              onClick={() => setViewCertificate(false)}
              data-testid="certificate-modal-overlay"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-w-[860px] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewCertificate(false)}
                  className="absolute -top-12 right-0 p-2 rounded-full transition-all hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF" }}
                  data-testid="button-close-certificate"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(0,245,255,0.15)" }}>
                  {renderCertificateBody(false)}
                </div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={downloading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }}
                    data-testid="button-modal-download-pdf"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? "Generating PDF..." : "Download PDF"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "project": return renderProject();
      case "tasks": return renderTasks();
      case "daily-log": return renderDailyLog();
      case "performance": return renderPerformance();
      case "resources": return renderResources();
      case "mentor": return renderMentor();
      case "certification": return renderCertification();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "linear-gradient(180deg, #050A18, #0B1D3A, #0F172A)" }}>
      <div
        className="hidden md:flex flex-col w-64 shrink-0 fixed top-0 left-0 h-screen z-30"
        style={{ background: "rgba(5,10,24,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)" }}>
              <Briefcase className="w-4.5 h-4.5" style={{ color: "#050A18" }} />
            </div>
            <span className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>
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
                  background: isActive ? "rgba(0,245,255,0.1)" : "transparent",
                  borderLeft: isActive ? "3px solid #00F5FF" : "3px solid transparent",
                  color: isActive ? "#00F5FF" : "#94A3B8",
                  boxShadow: isActive ? "inset 0 0 20px rgba(0,245,255,0.05)" : "none",
                }}
                data-testid={`sidebar-item-${item.key}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/shishya/dashboard">
            <div className="flex items-center gap-2 text-xs cursor-pointer transition-all" style={{ color: "#64748B" }} data-testid="link-back-dashboard">
              <Home className="w-3.5 h-3.5" />
              <span>Back to SHISHYA</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="md:hidden overflow-x-auto" style={{ background: "rgba(5,10,24,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
                  background: isActive ? "rgba(0,245,255,0.15)" : "transparent",
                  color: isActive ? "#00F5FF" : "#94A3B8",
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

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div
          className="sticky top-0 z-20 hidden md:flex items-center justify-between px-8 py-4"
          style={{ background: "rgba(5,10,24,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "#FFFFFF" }}>{currentLabel}</span>
            <ChevronRight className="w-4 h-4" style={{ color: "#475569" }} />
            <span className="text-sm" style={{ color: "#94A3B8" }}>{internship?.title || "Workspace"}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg transition-all" style={{ background: "rgba(255,255,255,0.04)" }} data-testid="button-notifications">
              <Bell className="w-5 h-5" style={{ color: "#94A3B8" }} />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #00F5FF, #0EA5E9)", color: "#050A18" }} data-testid="avatar-user">
              {userInitial}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-6xl">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}