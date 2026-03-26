import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Search, BookOpen, X, Mic, ChevronRight,
  Clock, Coins, Lock, Play, ArrowRight, Star,
  FolderKanban, Award, SlidersHorizontal, ArrowUpDown,
  Sparkles, UserPlus, LogIn, Layers, Trophy,
  Users, GraduationCap, ChevronDown, BarChart3
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditContext";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { Course } from "@shared/schema";
import catalogIllustration from "@assets/catalog-illustration.png";

type CatalogTab = "course" | "track" | "program";

interface CourseGroupData {
  id: number;
  name: string;
  description: string | null;
  level: string;
  groupType: string;
  thumbnailUrl: string | null;
  price: number | null;
  aggregatedSkills: string;
  totalDuration: string | null;
  courseCount: number;
  courses: Course[];
  createdAt: string;
}

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced" | "masters";
type PricingFilter = "all" | "free" | "paid";
type SortOption = "default" | "title-asc" | "title-desc" | "price-low" | "price-high" | "newest";


const CATEGORIES = [
  { id: "all", label: "All Courses" },
  { id: "General", label: "General" },
  { id: "Programming", label: "Programming" },
  { id: "AI & Data", label: "AI & Data" },
  { id: "Data Science", label: "Data Science" },
  { id: "Web Development", label: "Web Development" },
  { id: "Mobile Development", label: "Mobile" },
  { id: "DevOps", label: "DevOps" },
  { id: "Cloud", label: "Cloud" },
  { id: "Career Skills", label: "Career" },
  { id: "Business", label: "Business" },
];

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    } else if (i - 0.5 === rounded) {
      stars.push(
        <span key={i} className="relative inline-flex w-3.5 h-3.5">
          <Star className="absolute w-3.5 h-3.5 text-gray-600" />
          <span className="absolute overflow-hidden w-[50%]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-600" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

const V = "#6367FF";
const V2 = "#8494FF";
const VGLOW = "rgba(99,103,255,0.18)";
const VBORDER = "#EDE9FF";
const VBG = "rgba(99,103,255,0.07)";

function PremiumCourseCard({ course: initialCourse, languageVariants }: { course: Course; languageVariants?: Course[] }) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const course = selectedLang && languageVariants
    ? languageVariants.find(v => v.language === selectedLang) || initialCourse
    : initialCourse;

  const { user } = useAuth();
  const { balance, enrollments } = useCredits();

  const creditCost = course.creditCost || 0;
  const isFree = course.isFree || creditCost === 0;
  const isEnrolled = enrollments.some(e => e.courseId === course.id);
  const canAfford = balance >= creditCost;
  const hasThumbnail = course.thumbnailUrl && !imgError;
  const rating = course.rating ?? 0;
  const totalStudents = course.totalStudents ?? 0;
  const projectCount = course.projectCount ?? 0;

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden h-full flex flex-col bg-white"
      style={{
        border: `1px solid ${VBORDER}`,
        boxShadow: "0 2px 12px -4px rgba(99,103,255,0.08)",
      }}
      whileHover={{
        y: -5,
        boxShadow: `0 16px 40px -10px ${VGLOW}, 0 0 0 1px rgba(99,103,255,0.2)`,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      data-testid={`card-course-${course.id}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {hasThumbnail ? (
          <img
            src={course.thumbnailUrl!}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
            data-testid={`img-course-thumbnail-${course.id}`}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,103,255,0.08), rgba(132,148,255,0.05))" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(99,103,255,0.12)", border: `1px solid rgba(99,103,255,0.22)` }}
            >
              <BookOpen className="w-8 h-8" style={{ color: V }} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent" />

        {course.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: V, color: "#fff", backdropFilter: "blur(8px)" }}
              data-testid={`badge-category-${course.id}`}
            >
              {course.category}
            </span>
          </div>
        )}

        {isFree && (
          <div className="absolute top-3 right-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}
            >
              FREE
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2.5">
        <h3
          className="text-sm font-bold leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)", color: "#1E1B4B" }}
          data-testid={`text-course-title-${course.id}`}
        >
          {course.groupTitle || course.title}
        </h3>

        {rating > 0 && (
          <div className="flex items-center gap-2" data-testid={`rating-${course.id}`}>
            <StarRating rating={rating} />
            <span className="text-xs font-medium text-gray-500">{rating.toFixed(1)}</span>
            {totalStudents > 0 && (
              <span className="text-xs text-gray-400">({totalStudents.toLocaleString()})</span>
            )}
          </div>
        )}

        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" data-testid={`text-course-description-${course.id}`}>
            {course.description}
          </p>
        )}

        <LevelBadge level={course.level as any} />

        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          {!isFree && !isEnrolled && creditCost > 0 && (
            <span className="flex items-center gap-1 font-medium" style={{ color: "#F59E0B" }} data-testid={`text-price-${course.id}`}>
              <Coins className="w-3.5 h-3.5" />
              {creditCost} Credits
            </span>
          )}
          {isFree && (
            <span className="text-emerald-600 font-medium" data-testid={`text-price-${course.id}`}>Free</span>
          )}
          {isEnrolled && (
            <span className="text-emerald-600 font-medium" data-testid={`badge-enrolled-${course.id}`}>Enrolled</span>
          )}
          {projectCount > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1" data-testid={`text-projects-${course.id}`}>
                <FolderKanban className="w-3 h-3" style={{ color: V }} />
                {projectCount} Projects
              </span>
            </>
          )}
          {course.duration && (
            <>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1" data-testid={`text-duration-${course.id}`}>
                <Clock className="w-3 h-3 text-gray-400" />
                {course.duration}
              </span>
            </>
          )}
        </div>

        <div className="mt-auto pt-3" style={{ borderTop: `1px solid ${VBORDER}` }}>
          {isEnrolled ? (
            <Link href={`/courses/${course.id}`} className="block">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${V}, ${V2})`, color: "#fff", boxShadow: `0 4px 14px -3px ${VGLOW}` }}
                data-testid={`button-continue-${course.id}`}
              >
                <Play className="w-4 h-4" />
                Continue Learning
              </button>
            </Link>
          ) : isFree ? (
            <Link href={`/courses/${course.id}`} className="block">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", boxShadow: "0 4px 14px -3px rgba(16,185,129,0.35)" }}
                data-testid={`button-start-learning-${course.id}`}
              >
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          ) : !user ? (
            <Link href={`/courses/${course.id}`} className="block">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${V}, ${V2})`, color: "#fff", boxShadow: `0 4px 14px -3px ${VGLOW}` }}
                data-testid={`button-view-course-${course.id}`}
              >
                <Coins className="w-4 h-4 text-amber-200" />
                Enroll for {creditCost} Credits
              </button>
            </Link>
          ) : canAfford ? (
            <Link href={`/courses/${course.id}`} className="block">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${V}, ${V2})`, color: "#fff", boxShadow: `0 4px 14px -3px ${VGLOW}` }}
                data-testid={`button-enroll-${course.id}`}
              >
                <Coins className="w-4 h-4 text-amber-200" />
                Enroll for {creditCost} Credits
              </button>
            </Link>
          ) : (
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{ background: "#F3F4F6", color: "#9ca3af" }}
              disabled
              data-testid={`button-insufficient-${course.id}`}
            >
              <Lock className="w-4 h-4" />
              Insufficient Credits
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PremiumSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden h-full flex flex-col animate-pulse bg-white"
      style={{ border: `1px solid ${VBORDER}` }}
    >
      <div className="aspect-video" style={{ background: "#F3F4F6" }} />
      <div className="p-4 space-y-3 flex-1">
        <div className="h-5 rounded" style={{ background: "#E9EAFF", width: "75%" }} />
        <div className="space-y-2">
          <div className="h-4 rounded" style={{ background: "#F3F4F6", width: "100%" }} />
          <div className="h-4 rounded" style={{ background: "#F3F4F6", width: "60%" }} />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-md" style={{ background: "#F3F4F6" }} />
          <div className="h-6 w-20 rounded-md" style={{ background: "#F3F4F6" }} />
        </div>
        <div className="mt-auto pt-3">
          <div className="h-10 rounded-xl" style={{ background: "#E9EAFF" }} />
        </div>
      </div>
    </div>
  );
}

function GroupCatalogGrid({ groups, type, isLoading }: { groups: CourseGroupData[]; type: CatalogTab; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-white" style={{ border: `1px solid ${VBORDER}`, height: 320 }} />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: VBG, border: `1px solid rgba(99,103,255,0.18)` }}>
          {type === "track" ? <Layers className="w-10 h-10" style={{ color: V }} /> : <Trophy className="w-10 h-10" style={{ color: V }} />}
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1E1B4B" }}>
          No {type === "track" ? "Tracks" : "Programs"} yet
        </h3>
        <p className="text-gray-500 max-w-sm">
          {type === "track"
            ? "Tracks bundle related courses into a learning path. Check back soon!"
            : "Programs are comprehensive learning journeys. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      data-testid={`grid-${type}s`}
    >
      {groups.map(group => (
        <motion.div key={group.id} variants={staggerItem} data-testid={`card-${type}-${group.id}`}>
          <div
            className="rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-300 hover:-translate-y-1 bg-white"
            style={{
              border: `1px solid ${VBORDER}`,
              boxShadow: "0 2px 12px -4px rgba(99,103,255,0.08)",
            }}
          >
            <div className="relative aspect-video overflow-hidden">
              {group.thumbnailUrl ? (
                <img
                  src={group.thumbnailUrl}
                  alt={group.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(99,103,255,0.08), rgba(132,148,255,0.05))" }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: VBG, border: `1px solid rgba(99,103,255,0.22)` }}>
                    {type === "track" ? <Layers className="w-8 h-8" style={{ color: V }} /> : <Trophy className="w-8 h-8" style={{ color: V2 }} />}
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: V, color: "#fff" }}>
                  {type === "track" ? "🛤 Track" : "🎓 Program"}
                </span>
              </div>
              {group.price !== null && group.price !== undefined && group.price > 0 ? (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}>
                    {group.price} Credits
                  </span>
                </div>
              ) : (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>
                    FREE
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 p-5 gap-3">
              <div>
                <h3 className="font-semibold text-lg leading-snug mb-1" style={{ fontFamily: "var(--font-display)", color: "#1E1B4B" }}>{group.name}</h3>
                {group.description && <p className="text-gray-500 text-sm line-clamp-2">{group.description}</p>}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {group.courseCount} course{group.courseCount !== 1 ? "s" : ""}
                </span>
                {group.totalDuration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {group.totalDuration}
                  </span>
                )}
                <span className="capitalize px-2 py-0.5 rounded-full text-xs" style={{ background: VBG, color: V }}>{group.level}</span>
              </div>

              {group.aggregatedSkills && (
                <div className="flex flex-wrap gap-1">
                  {group.aggregatedSkills.split(",").slice(0, 4).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background: VBG, color: V, border: `1px solid rgba(99,103,255,0.18)` }}>
                      {s.trim()}
                    </span>
                  ))}
                  {group.aggregatedSkills.split(",").length > 4 && (
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#F3F4F6", color: "#9ca3af" }}>
                      +{group.aggregatedSkills.split(",").length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto pt-2">
                <div className="text-xs text-gray-400 mb-3">
                  {group.courses.slice(0, 3).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-1.5 mb-1">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: VBG, color: V }}>{i + 1}</span>
                      <span className="truncate">{c.title}</span>
                    </div>
                  ))}
                  {group.courseCount > 3 && <p className="text-gray-400 pl-5">+{group.courseCount - 3} more courses</p>}
                </div>
                <Link href={`/group/${group.id}`} className="block">
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${V}, ${V2})`, color: "#fff", boxShadow: `0 4px 14px -3px ${VGLOW}` }}
                    data-testid={`button-view-${type}-${group.id}`}
                  >
                    View {type === "track" ? "Track" : "Program"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function CourseCatalog() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: courseGroups, isLoading: groupsLoading } = useQuery<CourseGroupData[]>({
    queryKey: ["/api/course-groups"],
  });

  const { user } = useAuth();

  const [catalogTab, setCatalogTab] = useState<CatalogTab>("course");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");
  const [selectedPricing, setSelectedPricing] = useState<PricingFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const pillsRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    if (!courses) return [];
    const cats = new Set<string>();
    courses.forEach((c) => { if (c.category) cats.add(c.category); });
    return Array.from(cats).sort();
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    let filtered = courses.filter((course) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(searchLower) ||
        (course.description && course.description.toLowerCase().includes(searchLower)) ||
        (course.skills && (Array.isArray(course.skills)
          ? course.skills.some((s) => s.toLowerCase().includes(searchLower))
          : course.skills.toLowerCase().includes(searchLower)));

      const matchesLevel = selectedLevel === "all" || course.level.toLowerCase() === selectedLevel;
      const matchesPricing =
        selectedPricing === "all" ||
        (selectedPricing === "free" && (course.isFree || (course.creditCost ?? 0) === 0)) ||
        (selectedPricing === "paid" && !course.isFree && (course.creditCost ?? 0) > 0);
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;

      return matchesSearch && matchesLevel && matchesPricing && matchesCategory;
    });

    switch (sortBy) {
      case "title-asc": filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
      case "title-desc": filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title)); break;
      case "price-low": filtered = [...filtered].sort((a, b) => (a.creditCost ?? 0) - (b.creditCost ?? 0)); break;
      case "price-high": filtered = [...filtered].sort((a, b) => (b.creditCost ?? 0) - (a.creditCost ?? 0)); break;
      case "newest": filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }

    return filtered;
  }, [courses, searchTerm, selectedLevel, selectedPricing, selectedCategory, sortBy]);

  const groupedCourses = useMemo(() => {
    const groups = new Map<string, Course[]>();
    const ungrouped: Course[] = [];

    filteredCourses.forEach((course) => {
      const gt = course.groupTitle?.trim();
      if (gt) {
        const existing = groups.get(gt) || [];
        existing.push(course);
        groups.set(gt, existing);
      } else {
        ungrouped.push(course);
      }
    });

    const result: { primary: Course; variants: Course[] }[] = [];
    groups.forEach((coursesInGroup) => {
      result.push({ primary: coursesInGroup[0], variants: coursesInGroup });
    });
    ungrouped.forEach((course) => {
      result.push({ primary: course, variants: [course] });
    });

    return result;
  }, [filteredCourses]);

  const totalCourses = groupedCourses.length;

  const hasActiveFilters =
    selectedLevel !== "all" || selectedPricing !== "all" ||
    selectedCategory !== "all" || searchTerm !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("all");
    setSelectedPricing("all");
    setSelectedCategory("all");
    setSortBy("default");
  };

  const levelCounts = useMemo(() => {
    if (!courses) return { beginner: 0, intermediate: 0, advanced: 0, masters: 0 };
    return {
      beginner: courses.filter((c) => c.level.toLowerCase() === "beginner").length,
      intermediate: courses.filter((c) => c.level.toLowerCase() === "intermediate").length,
      advanced: courses.filter((c) => c.level.toLowerCase() === "advanced").length,
      masters: courses.filter((c) => c.level.toLowerCase() === "masters").length,
    };
  }, [courses]);

  const activeFilterCount = [selectedLevel, selectedPricing].filter(f => f !== "all").length +
    (searchTerm ? 1 : 0);

  const filterSidebarContent = (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>Skill Level</h4>
        <div className="space-y-1">
          {[
            { id: "all" as LevelFilter, label: "All Levels" },
            { id: "beginner" as LevelFilter, label: "Beginner", count: levelCounts.beginner },
            { id: "intermediate" as LevelFilter, label: "Intermediate", count: levelCounts.intermediate },
            { id: "advanced" as LevelFilter, label: "Advanced", count: levelCounts.advanced },
            { id: "masters" as LevelFilter, label: "Masters", count: levelCounts.masters },
          ].map(level => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: selectedLevel === level.id ? VBG : "transparent",
                color: selectedLevel === level.id ? V : "#6B7280",
                border: selectedLevel === level.id ? `1px solid rgba(99,103,255,0.25)` : "1px solid transparent",
                fontWeight: selectedLevel === level.id ? 600 : 400,
              }}
              data-testid={`filter-level-${level.id}`}
            >
              <span>{level.label}</span>
              {level.count !== undefined && level.count > 0 && (
                <span className="text-xs" style={{ color: selectedLevel === level.id ? V : "#9CA3AF" }}>{level.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>Pricing</h4>
        <div className="space-y-1">
          {[
            { id: "all" as PricingFilter, label: "All Pricing" },
            { id: "free" as PricingFilter, label: "Free" },
            { id: "paid" as PricingFilter, label: "Paid" },
          ].map(pricing => (
            <button
              key={pricing.id}
              onClick={() => setSelectedPricing(pricing.id)}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left"
              style={{
                background: selectedPricing === pricing.id ? VBG : "transparent",
                color: selectedPricing === pricing.id ? V : "#6B7280",
                border: selectedPricing === pricing.id ? `1px solid rgba(99,103,255,0.25)` : "1px solid transparent",
                fontWeight: selectedPricing === pricing.id ? 600 : 400,
              }}
              data-testid={`filter-pricing-${pricing.id}`}
            >
              {pricing.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6B7280", letterSpacing: "0.06em" }}>Sort By</h4>
        <div className="space-y-1">
          {[
            { id: "default" as SortOption, label: "Default" },
            { id: "title-asc" as SortOption, label: "Title: A to Z" },
            { id: "title-desc" as SortOption, label: "Title: Z to A" },
            { id: "price-low" as SortOption, label: "Price: Low to High" },
            { id: "price-high" as SortOption, label: "Price: High to Low" },
            { id: "newest" as SortOption, label: "Newest First" },
          ].map(sort => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id)}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left"
              style={{
                background: sortBy === sort.id ? VBG : "transparent",
                color: sortBy === sort.id ? V : "#6B7280",
                border: sortBy === sort.id ? `1px solid rgba(99,103,255,0.25)` : "1px solid transparent",
                fontWeight: sortBy === sort.id ? 600 : 400,
              }}
              data-testid={`filter-sort-${sort.id}`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(239,68,68,0.06)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.18)" }}
          data-testid="button-clear-filters"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  const HERO_GRAD = "linear-gradient(135deg, #6367FF 0%, #8494FF 60%, #C9BEFF 100%)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8F7FF", color: "#1A1A1A" }}>
      <LandingNavbar />
      <div className="flex-1">

        <div className="relative z-10">

          {/* ═══ HERO BANNER ═══ */}
          <div className="mx-4 md:mx-8 mt-5 rounded-2xl overflow-hidden relative"
            style={{ background: HERO_GRAD, boxShadow: "0 8px 32px -8px rgba(99,103,255,0.4)" }}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-16 right-1/4 w-64 h-64 rounded-full blur-[80px] opacity-30"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent)" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px] opacity-20"
                style={{ background: "radial-gradient(circle, rgba(255,219,253,0.8), transparent)" }} />
            </div>

            <div className="relative flex items-center justify-between px-6 md:px-10 py-8">
              <div className="flex-1 max-w-xl">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-2 text-white"
                  style={{ fontFamily: "var(--font-display)" }}>
                  Our <span style={{ color: "#FFDBFD" }}>Courses</span>
                </h1>
                <p className="text-sm md:text-base mb-7" style={{ color: "rgba(255,255,255,0.82)" }}>
                  Designed by{" "}
                  <span className="font-semibold text-white">IIT Alumni</span>
                  {" "}•{" "}
                  Learn from{" "}
                  <span className="font-semibold text-white">Industry Experts</span>
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { icon: BookOpen, value: `${courses?.length ? `${courses.length}+` : "100+"}`, label: "Courses" },
                    { icon: Users,     value: "25K+",     label: "Students" },
                    { icon: GraduationCap, value: "IIT",  label: "Alumni Designed" },
                    { icon: Award,     value: "Industry", label: "Certified" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" }}
                      >
                        <stat.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm leading-none">{stat.value}</div>
                        <div className="text-xs mt-0.5 whitespace-nowrap" style={{ color: "rgba(255,255,255,0.75)" }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-end justify-end shrink-0 ml-6 self-end">
                <img
                  src={catalogIllustration}
                  alt="Learning illustration"
                  className="h-56 w-auto object-contain drop-shadow-2xl select-none"
                  style={{ filter: "drop-shadow(0 0 24px rgba(255,255,255,0.25)) brightness(1.05)" }}
                />
              </div>
            </div>
          </div>

          {/* ═══ CONTROLS STRIP ═══ */}
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <div className="flex items-center rounded-xl overflow-hidden bg-white"
                  style={{ border: `1px solid ${VBORDER}`, boxShadow: "0 1px 4px -1px rgba(99,103,255,0.08)" }}>
                  <Search className="w-4 h-4 ml-3 shrink-0" style={{ color: V }} />
                  <input
                    type="text"
                    placeholder="Search skills, tools, careers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2.5 placeholder:text-gray-400 outline-none text-sm"
                    style={{ color: "#1A1A1A" }}
                    data-testid="input-search-courses"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="p-2 mr-1 text-gray-400 hover:text-gray-700 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Course / Track / Program tabs */}
              <div className="flex items-center gap-1 shrink-0 px-1 py-1 rounded-xl bg-white"
                style={{ border: `1px solid ${VBORDER}` }}>
                {([
                  { id: "course" as CatalogTab, label: "Courses", icon: BookOpen },
                  { id: "track" as CatalogTab,  label: "Tracks",  icon: Layers },
                  { id: "program" as CatalogTab, label: "Programs", icon: Trophy },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCatalogTab(tab.id)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: catalogTab === tab.id ? V : "transparent",
                      color: catalogTab === tab.id ? "#fff" : "#6B7280",
                      boxShadow: catalogTab === tab.id ? `0 2px 10px -2px ${VGLOW}` : "none",
                    }}
                    data-testid={`tab-catalog-${tab.id}`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills — only for course tab */}
            {catalogTab === "course" && !isLoading && courses && courses.length > 0 && (
              <div
                ref={pillsRef}
                className="flex items-center gap-2 overflow-x-auto mt-3 pb-1 hide-scrollbar"
                style={{ scrollbarWidth: "none" }}
              >
                {CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  const exists = cat.id === "all" || categories.includes(cat.id);
                  if (!exists) return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                      style={{
                        background: isActive ? V : "#fff",
                        color: isActive ? "#fff" : "#6B7280",
                        border: isActive ? `1px solid ${V}` : `1px solid ${VBORDER}`,
                        boxShadow: isActive ? `0 2px 10px -2px ${VGLOW}` : "none",
                      }}
                      data-testid={`pill-category-${cat.id}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 md:px-8 pb-16 max-w-[1600px] mx-auto">
            <div className="flex gap-6">
              {/* ── Filter Sidebar (desktop) ── */}
              {catalogTab === "course" && !isLoading && !error && courses && courses.length > 0 && (
                <aside className="hidden lg:block w-56 shrink-0">
                  <div
                    className="sticky top-24 rounded-2xl p-5 overflow-y-auto max-h-[calc(100vh-8rem)] bg-white"
                    style={{ border: `1px solid ${VBORDER}`, boxShadow: "0 2px 12px -4px rgba(99,103,255,0.08)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold" style={{ color: "#1E1B4B" }}>Filter Courses</h3>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs font-semibold transition-colors"
                          style={{ color: V }}
                          data-testid="button-reset-sidebar"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-4" data-testid="text-total-courses">
                      Showing {totalCourses} course{totalCourses !== 1 ? "s" : ""}
                    </p>
                    {filterSidebarContent}
                  </div>
                </aside>
              )}

              <div className="flex-1 min-w-0">
                {(catalogTab === "track" || catalogTab === "program") && (
                  <GroupCatalogGrid
                    groups={(courseGroups || []).filter(g => g.groupType === catalogTab)}
                    type={catalogTab}
                    isLoading={groupsLoading}
                  />
                )}

                {/* Mobile filter + sort bar */}
                {catalogTab === "course" && !isLoading && !error && courses && courses.length > 0 && (
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h2 className="text-sm font-semibold" style={{ color: "#1E1B4B" }}>
                      {selectedCategory === "all" ? "All Courses" : selectedCategory}{" "}
                      <span className="text-gray-400">({totalCourses})</span>
                    </h2>

                    <div className="flex items-center gap-2 ml-auto">
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium outline-none cursor-pointer bg-white"
                          style={{ border: `1px solid ${VBORDER}`, color: "#6B7280" }}
                          data-testid="select-sort"
                        >
                          <option value="default">Sort: Recommended</option>
                          <option value="title-asc">Title: A to Z</option>
                          <option value="title-desc">Title: Z to A</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="newest">Newest First</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                {catalogTab !== "course" ? null : isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5" data-testid="skeleton-courses">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <PremiumSkeleton key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                      <BookOpen className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1E1B4B" }} data-testid="text-empty-title">
                      Unable to load courses
                    </h3>
                    <p className="text-gray-500 max-w-md" data-testid="text-empty-message">
                      We're having trouble fetching courses. Please try again later.
                    </p>
                  </div>
                ) : !courses || courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: VBG, border: `1px solid rgba(99,103,255,0.18)` }}>
                      <BookOpen className="w-10 h-10" style={{ color: V }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1E1B4B" }} data-testid="text-empty-title">
                      No courses available
                    </h3>
                    <p className="text-gray-500 max-w-md" data-testid="text-empty-message">
                      Please check back later for new learning opportunities.
                    </p>
                  </div>
                ) : groupedCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: VBG, border: `1px solid rgba(99,103,255,0.18)` }}>
                      <Search className="w-10 h-10" style={{ color: V }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1E1B4B" }} data-testid="text-empty-title">
                      No courses found
                    </h3>
                    <p className="text-gray-500 max-w-md mb-4" data-testid="text-empty-message">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: V, color: "#fff", boxShadow: `0 4px 12px -3px ${VGLOW}` }}
                      data-testid="button-reset-filters"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
                    data-testid="grid-courses"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {groupedCourses.map(({ primary, variants }) => (
                      <motion.div key={primary.groupTitle || primary.id} variants={staggerItem}>
                        <PremiumCourseCard course={primary} languageVariants={variants.length > 1 ? variants : undefined} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {catalogTab === "course" && !user && !isLoading && courses && courses.length > 0 && (
                  <motion.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div
                      className="rounded-2xl p-8 text-center space-y-4"
                      style={{ background: HERO_GRAD, boxShadow: `0 8px 32px -8px ${VGLOW}` }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                        style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}
                      >
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <h3
                        className="text-xl font-semibold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                        data-testid="text-signup-cta"
                      >
                        Ready to start learning?
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.82)" }} className="max-w-md mx-auto">
                        Create a free account to enroll in courses, track your progress, earn certificates, and build your learning portfolio.
                      </p>
                      <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                        <Link href="/signup">
                          <button
                            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                            style={{ background: "#fff", color: V, boxShadow: "0 4px 14px -3px rgba(255,255,255,0.4)" }}
                            data-testid="button-signup-cta"
                          >
                            <UserPlus className="w-4 h-4" />
                            Sign Up Free
                          </button>
                        </Link>
                        <Link href="/login">
                          <button
                            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }}
                            data-testid="button-login-cta"
                          >
                            <LogIn className="w-4 h-4" />
                            Log In
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
      <footer className="relative z-10 py-6 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-gray-500">
          <p>Your learning journey starts here.</p>
        </div>
      </footer>
    </div>
  );
}
