import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, Layers, Trophy, Coins,
  ChevronRight, Search, Users, Star, Globe, Infinity,
  Play, CheckCircle2, Lock, Zap
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LevelBadge } from "@/components/ui/level-badge";
import { GroupEnrollmentModal } from "@/components/GroupEnrollmentModal";
import type { Course } from "@shared/schema";

const C = {
  bgPrimary: "#0B1D3A",
  bgCard: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  teal: "#00F5FF",
  purple: "#7C3AED",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
};

interface GroupDetail {
  id: number;
  name: string;
  description: string | null;
  level: string;
  groupType: string;
  thumbnailUrl: string | null;
  youtubeUrl: string | null;
  price: number;
  aggregatedSkills: string;
  courses: Course[];
}

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

function getYoutubeEmbed(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
}

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CourseCard({ course }: { course: Course }) {
  const [, navigate] = useLocation();

  return (
    <motion.div variants={staggerItem}>
      <div
        className="rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-1"
        style={{
          background: C.bgCard,
          border: `1px solid ${C.cardBorder}`,
          boxShadow: "0 4px 24px -6px rgba(0,0,0,0.3)",
        }}
        data-testid={`card-group-course-${course.id}`}
      >
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.05), rgba(124,58,237,0.05))" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.2)" }}
              >
                <BookOpen className="w-7 h-7" style={{ color: C.teal }} />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/60 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            {!course.creditCost || course.creditCost === 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>FREE</span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}>{course.creditCost} Credits</span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5 gap-3">
          <div>
            <h3 className="text-white font-semibold text-base leading-snug mb-1 line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
              {course.title}
            </h3>
            {course.description && (
              <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <LevelBadge level={(course.level || "beginner") as "beginner" | "intermediate" | "advanced"} />
            {course.duration && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {course.duration}
              </span>
            )}
            {course.language && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Globe className="w-3.5 h-3.5" />
                {course.language.toUpperCase()}
              </span>
            )}
          </div>

          {course.skills && (
            <div className="flex flex-wrap gap-1">
              {course.skills.split(",").slice(0, 3).map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(0,245,255,0.08)", color: "#67E8F9", border: "1px solid rgba(0,245,255,0.15)" }}>
                  {s.trim()}
                </span>
              ))}
              {course.skills.split(",").length > 3 && (
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af" }}>
                  +{course.skills.split(",").length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-2">
            <button
              onClick={() => navigate(`/courses/${course.id}`)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(0,245,255,0.08)", color: C.teal, border: "1px solid rgba(0,245,255,0.2)" }}
              data-testid={`button-view-course-${course.id}`}
            >
              View Course
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CourseGroupPage() {
  const { id } = useParams<{ id: string }>();
  const [levelFilter, setLevelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [enrollOpen, setEnrollOpen] = useState(false);

  const { data: group, isLoading } = useQuery<GroupDetail>({
    queryKey: ["/api/course-groups", id],
    queryFn: () => fetch(`/api/course-groups/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const isTrack = group?.groupType === "track";
  const accentColor = isTrack ? C.teal : "#A78BFA";
  const embedUrl = group?.youtubeUrl ? getYoutubeEmbed(group.youtubeUrl) : null;

  const filteredCourses = (group?.courses || []).filter(c => {
    const matchLevel = levelFilter === "all" || c.level === levelFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: C.bgPrimary }}>
        <LandingNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16 animate-pulse space-y-6">
          <div className="h-8 rounded-xl w-64" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-10 rounded-xl w-3/4" style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="h-20 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
              <div className="h-12 rounded-xl w-1/2" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            <div className="aspect-video rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: C.bgPrimary }}>
        <LandingNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Group not found.</p>
            <Link href="/courses">
              <button className="px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(0,245,255,0.1)", color: C.teal, border: "1px solid rgba(0,245,255,0.2)" }}>
                Back to Courses
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalDurationMinutes = group.courses.reduce((sum, c) => {
    if (!c.duration) return sum;
    const match = c.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  const skillsList = group.aggregatedSkills ? group.aggregatedSkills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen" style={{ background: C.bgPrimary }}>
      <LandingNavbar />

      <div className="pt-20">
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, rgba(11,29,58,0.95) 0%, rgba(11,29,58,1) 100%)" }}
        >
          {group.thumbnailUrl && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url(${group.thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(30px)",
              }}
            />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: isTrack ? "radial-gradient(ellipse at 20% 50%, rgba(0,245,255,0.06), transparent 60%)" : "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,0.08), transparent 60%)" }}
          />

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10">
            <Link href="/courses">
              <button className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white" style={{ color: C.textSecondary }} data-testid="button-back-to-catalog">
                <ArrowLeft className="w-4 h-4" />
                Back to Course Catalog
              </button>
            </Link>

            <div className="grid lg:grid-cols-[1fr_480px] gap-10 items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: isTrack ? "rgba(0,245,255,0.12)" : "rgba(124,58,237,0.15)", color: accentColor, border: `1px solid ${isTrack ? "rgba(0,245,255,0.25)" : "rgba(124,58,237,0.3)"}` }}
                    data-testid="badge-group-type"
                  >
                    {isTrack ? <Layers className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
                    {isTrack ? "Learning Track" : "Program"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs capitalize" style={{ background: "rgba(255,255,255,0.07)", color: C.textSecondary }}>
                    {group.level}
                  </span>
                </div>

                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-group-name"
                >
                  {group.name}
                </h1>

                {group.description && (
                  <p className="text-lg leading-relaxed" style={{ color: C.textSecondary }}>{group.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-5 text-sm">
                  <div className="flex items-center gap-2" style={{ color: C.textSecondary }}>
                    <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
                    <strong className="text-white">{group.courses.length}</strong> Courses
                  </div>
                  {totalDurationMinutes > 0 && (
                    <div className="flex items-center gap-2" style={{ color: C.textSecondary }}>
                      <Clock className="w-4 h-4" style={{ color: accentColor }} />
                      <strong className="text-white">{totalDurationMinutes}+ hrs</strong> Content
                    </div>
                  )}
                  <div className="flex items-center gap-2" style={{ color: C.textSecondary }}>
                    <Infinity className="w-4 h-4" style={{ color: accentColor }} />
                    <strong className="text-white">Lifetime</strong> Access
                  </div>
                  <div className="flex items-center gap-2" style={{ color: C.textSecondary }}>
                    <Zap className="w-4 h-4" style={{ color: accentColor }} />
                    <strong className="text-white">Self Paced</strong>
                  </div>
                </div>

                {skillsList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: C.textSecondary }}>Skills You'll Gain</p>
                    <div className="flex flex-wrap gap-2">
                      {skillsList.slice(0, 8).map((s, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(0,245,255,0.07)", color: "#67E8F9", border: "1px solid rgba(0,245,255,0.14)" }}>
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          {s}
                        </span>
                      ))}
                      {skillsList.length > 8 && (
                        <span className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af" }}>
                          +{skillsList.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  {group.price > 0 ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <Coins className="w-4 h-4" />
                      {group.price} Credits for full pack
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <CheckCircle2 className="w-4 h-4" />
                      Free Access
                    </div>
                  )}
                  <button
                    onClick={() => setEnrollOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{
                      background: isTrack ? `linear-gradient(135deg, rgba(0,245,255,0.9), rgba(6,182,212,0.85))` : `linear-gradient(135deg, rgba(124,58,237,0.9), rgba(139,92,246,0.85))`,
                      color: "#fff",
                      boxShadow: isTrack ? "0 4px 20px -4px rgba(0,245,255,0.35)" : "0 4px 20px -4px rgba(124,58,237,0.4)",
                    }}
                    data-testid="button-start-learning"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Learning
                  </button>
                </div>
              </div>

              <div className="w-full">
                {embedUrl ? (
                  <div
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: isTrack ? "0 20px 60px -12px rgba(0,245,255,0.2)" : "0 20px 60px -12px rgba(124,58,237,0.25)" }}
                    data-testid="container-youtube-embed"
                  >
                    <div className="aspect-video">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={`${group.name} preview`}
                        data-testid="iframe-youtube-embed"
                      />
                    </div>
                    <div className="p-4 flex items-center gap-3" style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: isTrack ? "rgba(0,245,255,0.15)" : "rgba(124,58,237,0.18)" }}>
                        {isTrack ? <Layers className="w-4 h-4" style={{ color: C.teal }} /> : <Trophy className="w-4 h-4" style={{ color: "#A78BFA" }} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{group.name} Preview</p>
                        <p className="text-xs" style={{ color: C.textSecondary }}>Watch on YouTube</p>
                      </div>
                    </div>
                  </div>
                ) : group.thumbnailUrl ? (
                  <div
                    className="rounded-2xl overflow-hidden aspect-video"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px -12px rgba(0,0,0,0.5)" }}
                  >
                    <img src={group.thumbnailUrl} alt={group.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="rounded-2xl aspect-video flex flex-col items-center justify-center gap-4"
                    style={{
                      background: isTrack ? "linear-gradient(135deg, rgba(0,245,255,0.06), rgba(6,182,212,0.03))" : "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(139,92,246,0.05))",
                      border: `1px solid ${isTrack ? "rgba(0,245,255,0.15)" : "rgba(124,58,237,0.2)"}`,
                    }}
                  >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: isTrack ? "rgba(0,245,255,0.1)" : "rgba(124,58,237,0.15)" }}>
                      {isTrack ? <Layers className="w-10 h-10" style={{ color: C.teal }} /> : <Trophy className="w-10 h-10" style={{ color: "#A78BFA" }} />}
                    </div>
                    <p className="text-sm" style={{ color: C.textSecondary }}>No preview video available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="border-y"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Courses Included", value: `${group.courses.length}`, icon: BookOpen },
                { label: "Total Content", value: totalDurationMinutes > 0 ? `${totalDurationMinutes}+ Hrs` : "—", icon: Clock },
                { label: "Access Type", value: "Lifetime", icon: Infinity },
                { label: "Learning Style", value: "Self Paced", icon: Zap },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <stat.icon className="w-5 h-5 mb-1" style={{ color: accentColor }} />
                  <p className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: C.textSecondary }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 pb-20">
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Courses in this {isTrack ? "Track" : "Program"}
              <span className="ml-2 text-base font-normal" style={{ color: C.textSecondary }}>({filteredCourses.length})</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 flex-1 sm:w-60"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: C.textSecondary }} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
                  data-testid="input-search-courses"
                />
              </div>

              <div className="flex gap-2">
                {LEVELS.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap"
                    style={levelFilter === lvl
                      ? { background: isTrack ? "rgba(0,245,255,0.15)" : "rgba(124,58,237,0.18)", color: accentColor, border: `1px solid ${isTrack ? "rgba(0,245,255,0.3)" : "rgba(124,58,237,0.35)"}` }
                      : { background: "rgba(255,255,255,0.05)", color: C.textSecondary, border: "1px solid rgba(255,255,255,0.08)" }
                    }
                    data-testid={`filter-level-${lvl}`}
                  >
                    {lvl === "all" ? "All" : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: C.textSecondary }} />
              <p className="text-white font-medium mb-1">No courses match your search</p>
              <p className="text-sm" style={{ color: C.textSecondary }}>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              data-testid="grid-group-courses"
            >
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <GroupEnrollmentModal
        group={group}
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        onEnrollmentSuccess={() => {}}
      />
    </div>
  );
}
