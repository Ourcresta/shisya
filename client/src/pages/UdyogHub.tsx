import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Search, MapPin, Calendar,
  Send, BadgeCheck, Building2, Clock, Eye, ArrowRight,
  Rocket, Settings, Bell, Shield, Globe, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const hubTabs = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "internship", label: "Internship", icon: Briefcase },
  { key: "jobs", label: "Jobs", icon: Building2 },
  { key: "settings", label: "Settings", icon: Settings },
];

const levelColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

const jobTypeBadgeColors: Record<string, string> = {
  "full-time": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "part-time": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "internship": "bg-green-500/20 text-green-400 border-green-500/30",
  "contract": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "freelance": "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

function getDaysLeft(deadline: string | null): { text: string; expired: boolean } {
  if (!deadline) return { text: "No deadline", expired: false };
  const end = new Date(deadline);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { text: "Expired", expired: true };
  if (diff === 0) return { text: "Last day", expired: false };
  return { text: `${diff} days left`, expired: false };
}

function parseSkills(skills: string | null): string[] {
  if (!skills) return [];
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return skills.split(",").map((s: string) => s.trim()).filter(Boolean);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function UdyogHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const ctaHref = user ? "/shishya/udyog/assess" : "/login?redirect=/shishya/udyog/assess";

  return (
    <div className="min-h-screen">
      <LandingNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-udyog-hub-title"
          >
            Our{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
            >
              Udyog
            </span>
          </h1>
          <p className="text-gray-400 text-sm">AI-Powered Virtual Internship & Career Platform</p>
        </motion.div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-1 p-1 rounded-xl border border-white/10 backdrop-blur-xl min-w-max" style={{ background: "rgba(255,255,255,0.03)" }} data-testid="udyog-hub-tabs">
            {hubTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: isActive ? "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(20,184,166,0.15))" : "transparent",
                    color: isActive ? "#22D3EE" : "#9CA3AF",
                    border: isActive ? "1px solid rgba(34,211,238,0.3)" : "1px solid transparent",
                  }}
                  data-testid={`tab-${tab.key}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && <DashboardTab key="dashboard" user={user} ctaHref={ctaHref} />}
          {activeTab === "internship" && <InternshipTab key="internship" ctaHref={ctaHref} />}
          {activeTab === "jobs" && <JobsTab key="jobs" user={user} toast={toast} />}
          {activeTab === "settings" && <SettingsTab key="settings" />}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

function DashboardTab({ user, ctaHref }: { user: any; ctaHref: string }) {
  const { data: assignmentData, isLoading } = useQuery<any>({
    queryKey: ["/api/udyog/my-assignment"],
    enabled: !!user,
  });

  const { data: batchData } = useQuery<any>({
    queryKey: ["/api/udyog/my-batch"],
    enabled: !!user,
    retry: false,
  });

  const hasBatch = !!batchData?.batch;
  const assignment = hasBatch ? batchData.assignment : assignmentData?.assignment || assignmentData;
  const internship = hasBatch ? batchData.internship : assignmentData?.internship;
  const tasks = hasBatch ? (batchData.tasks || []) : (assignmentData?.tasks || []);
  const batch = batchData?.batch;
  const batchProgress = batchData?.progress;

  const completedTasksCount = tasks.filter((t: any) => t.status === "completed").length;
  const overallProgress = hasBatch ? (batchProgress || 0) : (assignment?.progress || 0);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-center py-20 rounded-2xl border border-white/10 backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <Briefcase className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Sign In Required
        </h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          Log in to view your internship dashboard and track your progress.
        </p>
        <Link href="/login?redirect=/shishya/udyog/hub">
          <Button className="text-white border-0" style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}>
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
            <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
            <Skeleton className="h-4 w-1/2 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-2/3 bg-white/10" />
          </div>
        ))}
      </motion.div>
    );
  }

  if (!assignment && !assignmentData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-center py-20 rounded-2xl border border-white/10 backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}
        >
          <Briefcase className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }} data-testid="text-no-assignment-hub">
          No Active Internship
        </h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          Take a skill assessment to get matched with the perfect virtual internship.
        </p>
        <Link href={ctaHref}>
          <Button className="text-white border-0" style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }} data-testid="button-start-assessment-hub">
            <Rocket className="w-4 h-4 mr-2" />
            Start Assessment
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div
        className="rounded-2xl border p-6"
        style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(34,211,238,0.2)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-internship-name-hub">
              {internship?.title || "Virtual Internship"}
            </h2>
            {assignment?.assignedRole && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2"
                style={{ background: "rgba(34,211,238,0.15)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.3)" }}
                data-testid="badge-role-hub"
              >
                {assignment.assignedRole}
              </span>
            )}
          </div>
          <Link href="/shishya/udyog/dashboard">
            <Button size="sm" className="text-white border-0" style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }} data-testid="button-open-workspace">
              Open Workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs text-gray-400 mb-1">Progress</p>
            <p className="text-2xl font-bold text-cyan-400" data-testid="text-progress-hub">{overallProgress}%</p>
            <div className="w-full h-1.5 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${overallProgress}%`, background: "linear-gradient(90deg, #22D3EE, #14B8A6)" }} />
            </div>
          </div>
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs text-gray-400 mb-1">Tasks Done</p>
            <p className="text-2xl font-bold text-white">{completedTasksCount}<span className="text-sm text-gray-400">/{tasks.length}</span></p>
          </div>
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className="text-sm font-medium text-green-400 capitalize">{assignment?.status || "active"}</p>
          </div>
          {batch && (
            <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs text-gray-400 mb-1">Batch</p>
              <p className="text-sm font-medium text-white">#{batch.batchNumber}</p>
              <p className="text-xs text-gray-500 capitalize">{batch.status}</p>
            </div>
          )}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
          <h3 className="text-base font-semibold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>Recent Tasks</h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: task.status === "completed" ? "#22C55E" :
                        task.status === "in_progress" ? "#3B82F6" :
                        task.status === "review" ? "#F59E0B" : "#6B7280",
                    }}
                  />
                  <span className="text-sm text-gray-300 truncate">{task.title}</span>
                </div>
                <span className="text-xs text-gray-500 capitalize shrink-0">{task.status?.replace("_", " ")}</span>
              </div>
            ))}
          </div>
          {tasks.length > 5 && (
            <Link href="/shishya/udyog/dashboard">
              <p className="text-xs text-cyan-400 mt-3 cursor-pointer">View all {tasks.length} tasks →</p>
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}

function InternshipTab({ ctaHref }: { ctaHref: string }) {
  const [viewingInternship, setViewingInternship] = useState<any>(null);

  const { data: internships, isLoading } = useQuery<any[]>({
    queryKey: ["/api/udyog/internships"],
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }} data-testid="text-internship-programs-title">
          Available Internship Programs
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Choose from curated programs designed with industry partners
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
              <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
              <Skeleton className="h-4 w-1/2 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-2/3 mb-4 bg-white/10" />
              <Skeleton className="h-8 w-24 bg-white/10" />
            </div>
          ))}
        </div>
      ) : internships && internships.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {internships.map((internship: any) => (
            <motion.div
              key={internship.id}
              variants={itemVariants}
              className="rounded-2xl border border-white/10 p-6 backdrop-blur-xl transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.03)" }}
              whileHover={{ borderColor: "rgba(34,211,238,0.3)", boxShadow: "0 0 30px rgba(34,211,238,0.1)" }}
              data-testid={`hub-internship-${internship.id}`}
            >
              <h3 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {internship.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {internship.skillLevel && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors[internship.skillLevel?.toLowerCase()] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}`}>
                    {internship.skillLevel}
                  </span>
                )}
                {internship.domain && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                    {internship.domain}
                  </span>
                )}
              </div>
              {internship.duration && (
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{internship.duration}</span>
                </div>
              )}
              {internship.shortDescription && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{internship.shortDescription}</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  onClick={() => setViewingInternship(internship)}
                  data-testid={`hub-view-internship-${internship.id}`}
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Details
                </Button>
                <Link href={ctaHref}>
                  <Button
                    size="sm"
                    className="ml-auto text-white border-0"
                    style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                    data-testid={`hub-apply-internship-${internship.id}`}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-16 rounded-2xl border border-white/10 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.02)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Rocket className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Coming Soon
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            New internship programs are being curated. Check back soon!
          </p>
        </motion.div>
      )}

      <Dialog open={!!viewingInternship} onOpenChange={(open) => { if (!open) setViewingInternship(null); }}>
        <DialogContent className="max-w-lg border-white/10 text-white" style={{ background: "linear-gradient(180deg, #0f1629 0%, #111827 100%)" }}>
          <DialogHeader>
            <DialogTitle className="text-white" data-testid="hub-internship-detail-title">
              {viewingInternship?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">Internship Program Details</DialogDescription>
          </DialogHeader>
          {viewingInternship && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{viewingInternship.description}</p>
              <div className="flex flex-wrap gap-2">
                {viewingInternship.skillLevel && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors[viewingInternship.skillLevel?.toLowerCase()] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}`}>
                    {viewingInternship.skillLevel}
                  </span>
                )}
                {viewingInternship.domain && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                    {viewingInternship.domain}
                  </span>
                )}
              </div>
              {viewingInternship.duration && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{viewingInternship.duration}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10">
                <Link href={ctaHref}>
                  <Button className="w-full text-white border-0" style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}>
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function JobsTab({ user, toast }: { user: any; toast: any }) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobsData, isLoading } = useQuery<any[]>({
    queryKey: ["/api/udyog/jobs"],
  });

  const { data: applicationsData } = useQuery<any[]>({
    queryKey: ["/api/udyog/my-applications"],
    enabled: !!user,
  });

  const appliedJobIds = new Set(
    (applicationsData || []).map((a: any) => a.application?.jobId)
  );

  const applyMutation = useMutation({
    mutationFn: async (jobId: number) => {
      await apiRequest("POST", "/api/udyog/hr/applications", { jobId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/my-applications"] });
      toast({ title: "Application Submitted", description: "Your application has been submitted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to apply", variant: "destructive" });
    },
  });

  const handleApply = (jobId: number) => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to apply", variant: "destructive" });
      return;
    }
    applyMutation.mutate(jobId);
  };

  const filteredJobs = (jobsData || []).filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const job = item.job;
    const hr = item.hr;
    const skills = parseSkills(job.requiredSkills).join(" ").toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      hr?.companyName?.toLowerCase().includes(q) ||
      skills.includes(q)
    );
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }} data-testid="text-jobs-hub-title">
          Career{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}>
            Opportunities
          </span>
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
          Explore job openings from top companies looking for Our Udyog graduates
        </p>
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, skills, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
            data-testid="input-search-jobs-hub"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
              <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
              <Skeleton className="h-4 w-1/2 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-2/3 mb-4 bg-white/10" />
              <Skeleton className="h-10 w-28 bg-white/10" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredJobs.map((item: any) => {
            const job = item.job;
            const hr = item.hr;
            const skills = parseSkills(job.requiredSkills);
            const deadline = getDaysLeft(job.deadline);
            const isApplied = appliedJobIds.has(job.id);
            const typeClass = jobTypeBadgeColors[job.jobType] || jobTypeBadgeColors["full-time"];

            return (
              <motion.div
                key={job.id}
                variants={itemVariants}
                className="rounded-2xl border border-white/10 p-6 backdrop-blur-xl transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.03)" }}
                whileHover={{ borderColor: "rgba(34,211,238,0.3)", boxShadow: "0 0 30px rgba(34,211,238,0.1)" }}
                data-testid={`hub-job-${job.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 truncate" style={{ fontFamily: "var(--font-display)" }}>
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{hr?.companyName || "Company"}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeClass}`}>
                    {job.jobType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  )}
                  {job.salaryRange && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.salaryRange}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 ${deadline.expired ? "text-red-400" : ""}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    {deadline.text}
                  </span>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skills.slice(0, 5).map((skill: string) => (
                      <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-300 border border-white/10">
                        {skill}
                      </span>
                    ))}
                    {skills.length > 5 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-500">
                        +{skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {job.internshipRequired && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-500/15 text-teal-400 border border-teal-500/30 mb-3">
                    Internship Required
                  </span>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  {isApplied ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30" data-testid={`hub-applied-${job.id}`}>
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="text-white border-0"
                      style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                      onClick={() => handleApply(job.id)}
                      disabled={applyMutation.isPending || deadline.expired}
                      data-testid={`hub-apply-job-${job.id}`}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {applyMutation.isPending ? "Applying..." : "Apply"}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-20 rounded-2xl border border-white/10 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.02)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Briefcase className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {searchQuery ? "No matching jobs found" : "No Jobs Available"}
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search terms"
              : "New job postings are added regularly. Check back soon!"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function SettingsTab() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-500/20" style={{ background: "rgba(34,211,238,0.1)" }}>
            <Bell className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Notifications</h3>
            <p className="text-xs text-gray-400">Manage how you receive updates</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <Label className="text-sm text-gray-300">Email Notifications</Label>
              <p className="text-xs text-gray-500">Receive internship updates via email</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} data-testid="switch-email-notifications" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <Label className="text-sm text-gray-300">Task Reminders</Label>
              <p className="text-xs text-gray-500">Get reminded about upcoming deadlines</p>
            </div>
            <Switch checked={taskReminders} onCheckedChange={setTaskReminders} data-testid="switch-task-reminders" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <Label className="text-sm text-gray-300">Job Alerts</Label>
              <p className="text-xs text-gray-500">Get notified about new job postings</p>
            </div>
            <Switch checked={jobAlerts} onCheckedChange={setJobAlerts} data-testid="switch-job-alerts" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-500/20" style={{ background: "rgba(34,211,238,0.1)" }}>
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Privacy</h3>
            <p className="text-xs text-gray-400">Control your profile visibility</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <Label className="text-sm text-gray-300">Profile Visible to HR</Label>
              <p className="text-xs text-gray-500">Allow recruiters to discover your profile</p>
            </div>
            <Switch checked={profileVisibility} onCheckedChange={setProfileVisibility} data-testid="switch-profile-visibility" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-500/20" style={{ background: "rgba(34,211,238,0.1)" }}>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Quick Links</h3>
            <p className="text-xs text-gray-400">Navigate to other Udyog pages</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/shishya/udyog">
            <div className="p-3 rounded-lg border border-white/5 cursor-pointer transition-all hover:border-cyan-500/30" style={{ background: "rgba(255,255,255,0.02)" }} data-testid="link-udyog-landing">
              <p className="text-sm text-gray-300 font-medium">Our Udyog Landing</p>
              <p className="text-xs text-gray-500">View the full landing page</p>
            </div>
          </Link>
          <Link href="/shishya/udyog/assess">
            <div className="p-3 rounded-lg border border-white/5 cursor-pointer transition-all hover:border-cyan-500/30" style={{ background: "rgba(255,255,255,0.02)" }} data-testid="link-assessment">
              <p className="text-sm text-gray-300 font-medium">Skill Assessment</p>
              <p className="text-xs text-gray-500">Take or retake your AI assessment</p>
            </div>
          </Link>
          <Link href="/shishya/udyog/dashboard">
            <div className="p-3 rounded-lg border border-white/5 cursor-pointer transition-all hover:border-cyan-500/30" style={{ background: "rgba(255,255,255,0.02)" }} data-testid="link-workspace">
              <p className="text-sm text-gray-300 font-medium">Full Workspace</p>
              <p className="text-xs text-gray-500">Open the detailed intern workspace</p>
            </div>
          </Link>
          <Link href="/shishya/udyog/jobs">
            <div className="p-3 rounded-lg border border-white/5 cursor-pointer transition-all hover:border-cyan-500/30" style={{ background: "rgba(255,255,255,0.02)" }} data-testid="link-jobs-page">
              <p className="text-sm text-gray-300 font-medium">Jobs Page</p>
              <p className="text-xs text-gray-500">Browse the full jobs listing</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
