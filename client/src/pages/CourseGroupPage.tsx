import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, Layers, Trophy, Coins,
  ChevronRight, Search, Star, Users
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LevelBadge } from "@/components/ui/level-badge";
import type { Course } from "@shared/schema";

const C = {
  bgPrimary: "#0B1D3A",
  cardBg: "rgba(255,255,255,0.05)",
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
  price: number;
  aggregatedSkills: string;
  courses: Course[];
}

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CourseCard({ course }: { course: Course }) {
  const isTrack = course.isFree || !course.creditCost;

  return (
    <motion.div variants={staggerItem}>
      <div
        className="rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-1"
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          boxShadow: "0 4px 24px -6px rgba(0,0,0,0.3)",
        }}
        data-testid={`card-group-course-${course.id}`}
      >
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[rgba(0,245,255,0.05)] to-[rgba(124,58,237,0.05)]">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
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
            {course.isFree || !course.creditCost ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>
                FREE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}>
                {course.creditCost} Credits
              </span>
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
              <span className="px-2 py-0.5 rounded-full text-xs capitalize" style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af" }}>
                {course.language}
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
            <Link href={`/courses/${course.id}`}>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(0,245,255,0.08)",
                  color: C.teal,
                  border: "1px solid rgba(0,245,255,0.2)",
                }}
                data-testid={`button-start-course-${course.id}`}
              >
                View Course
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
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

  const { data: group, isLoading } = useQuery<GroupDetail>({
    queryKey: ["/api/course-groups", id],
    queryFn: () => fetch(`/api/course-groups/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const isTrack = group?.groupType === "track";

  const filteredCourses = (group?.courses || []).filter(c => {
    const matchLevel = levelFilter === "all" || c.level === levelFilter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || "").toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: C.bgPrimary }}>
        <LandingNavbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 rounded-xl w-64" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="h-48 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bgPrimary }}>
        <LandingNavbar />
        <div className="text-center">
          <p className="text-gray-400">Group not found.</p>
          <Link href="/courses" className="mt-4 inline-block text-teal-400 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.bgPrimary }}>
      <LandingNavbar />

      <div className="pt-20">
        <div
          className="relative py-16 md:py-20 overflow-hidden"
          style={{ background: "linear-gradient(180deg, rgba(11,29,58,0) 0%, rgba(11,29,58,1) 100%)" }}
        >
          {group.thumbnailUrl && (
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `url(${group.thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px)",
              }}
            />
          )}
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: isTrack ? "radial-gradient(ellipse at 30% 50%, rgba(0,245,255,0.12), transparent 70%)" : "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.15), transparent 70%)" }}
          />

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <Link href="/courses">
              <button className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white" style={{ color: C.textSecondary }} data-testid="button-back-to-catalog">
                <ArrowLeft className="w-4 h-4" />
                Back to Course Catalog
              </button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{
                  background: isTrack ? "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(6,182,212,0.08))" : "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(139,92,246,0.1))",
                  border: isTrack ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(124,58,237,0.3)",
                }}
              >
                {group.thumbnailUrl ? (
                  <img src={group.thumbnailUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  isTrack
                    ? <Layers className="w-12 h-12 md:w-16 md:h-16" style={{ color: C.teal }} />
                    : <Trophy className="w-12 h-12 md:w-16 md:h-16" style={{ color: "#A78BFA" }} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                    style={{ background: isTrack ? "rgba(0,245,255,0.12)" : "rgba(124,58,237,0.15)", color: isTrack ? C.teal : "#A78BFA", border: isTrack ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(124,58,237,0.3)" }}
                    data-testid="badge-group-type"
                  >
                    {isTrack ? "🛤 Track" : "🎓 Program"}
                  </span>
                  <span className="capitalize px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.07)", color: C.textSecondary }}>
                    {group.level}
                  </span>
                </div>

                <h1
                  className="text-3xl md:text-4xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-group-name"
                >
                  {group.name}
                </h1>

                {group.description && (
                  <p className="text-lg mb-4" style={{ color: C.textSecondary }}>{group.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2" style={{ color: C.textSecondary }}>
                    <BookOpen className="w-4 h-4" style={{ color: C.teal }} />
                    <strong className="text-white">{group.courses.length}</strong> Courses
                  </span>
                  {group.price > 0 ? (
                    <span className="flex items-center gap-2" style={{ color: C.textSecondary }}>
                      <Coins className="w-4 h-4" style={{ color: "#F59E0B" }} />
                      <strong className="text-white">{group.price}</strong> Credits for full pack
                    </span>
                  ) : (
                    <span className="flex items-center gap-2" style={{ color: "#10B981" }}>
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Free Access
                    </span>
                  )}
                </div>
              </div>
            </div>

            {group.aggregatedSkills && (
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-xs mr-1" style={{ color: C.textSecondary }}>Skills you'll gain:</span>
                {group.aggregatedSkills.split(",").map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(0,245,255,0.08)", color: "#67E8F9", border: "1px solid rgba(0,245,255,0.15)" }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div
              className="flex items-center gap-2 flex-1 rounded-xl px-4 py-2.5"
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

            <div className="flex gap-2 flex-wrap">
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={levelFilter === lvl
                    ? { background: isTrack ? "rgba(0,245,255,0.15)" : "rgba(124,58,237,0.18)", color: isTrack ? C.teal : "#A78BFA", border: isTrack ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(124,58,237,0.35)" }
                    : { background: "rgba(255,255,255,0.05)", color: C.textSecondary, border: "1px solid rgba(255,255,255,0.08)" }
                  }
                  data-testid={`filter-level-${lvl}`}
                >
                  {lvl === "all" ? "All Levels" : lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 text-sm" style={{ color: C.textSecondary }}>
            Showing <span className="text-white font-medium">{filteredCourses.length}</span> of <span className="text-white font-medium">{group.courses.length}</span> courses
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: C.textSecondary }}>No courses match your filters.</p>
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
    </div>
  );
}
