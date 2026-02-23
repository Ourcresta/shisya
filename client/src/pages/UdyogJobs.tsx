import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Calendar, Search, ArrowLeft, Send, BadgeCheck, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const jobTypeBadgeColors: Record<string, string> = {
  "full-time": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "part-time": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "internship": "bg-green-500/20 text-green-400 border-green-500/30",
  "contract": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
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

export default function UdyogJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobsData, isLoading: jobsLoading } = useQuery<any[]>({
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
      const msg = error?.message || "Failed to apply";
      toast({ title: "Error", description: msg, variant: "destructive" });
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
    <div className="min-h-screen">
      <LandingNavbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-16">
        <Link href="/shishya/udyog">
          <span className="inline-flex items-center gap-2 text-sm text-cyan-400 mb-8 cursor-pointer transition-colors" style={{ display: "inline-flex" }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Our Udyog
          </span>
        </Link>

        <section className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-jobs-title"
            >
              Career{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
              >
                Opportunities
              </span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
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
                data-testid="input-search-jobs"
              />
            </div>
          </motion.div>
        </section>

        {jobsLoading ? (
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
                  data-testid={`job-card-${job.id}`}
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
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-300 border border-white/10"
                        >
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
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/30"
                        data-testid={`badge-applied-${job.id}`}
                      >
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
                        data-testid={`button-apply-${job.id}`}
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
                : "New job postings from our partner companies are added regularly. Check back soon!"}
            </p>
          </motion.div>
        )}
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
