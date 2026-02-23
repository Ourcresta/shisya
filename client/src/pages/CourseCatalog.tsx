import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Search, BookOpen, GraduationCap, X, Mic, ChevronRight,
  Clock, Globe, Coins, Lock, Play, ArrowRight, Star,
  FolderKanban, Award, SlidersHorizontal, ArrowUpDown,
  Sparkles, Filter, UserPlus, LogIn
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

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced" | "masters";
type PricingFilter = "all" | "free" | "paid";
type SortOption = "default" | "title-asc" | "title-desc" | "price-low" | "price-high" | "newest";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", kn: "Kannada",
  ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati", pa: "Punjabi",
  ur: "Urdu", es: "Spanish", fr: "French", de: "German", ja: "Japanese",
  zh: "Chinese", ko: "Korean", ar: "Arabic", pt: "Portuguese", ru: "Russian",
};

function getLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code.toLowerCase()] || code.toUpperCase();
}

const CATEGORIES = [
  { id: "all", label: "All Courses" },
  { id: "General", label: "General" },
  { id: "AI & Data", label: "AI & Data" },
  { id: "Web Development", label: "Web Dev" },
  { id: "Mobile Development", label: "Mobile" },
  { id: "DevOps", label: "DevOps" },
  { id: "Career Skills", label: "Career" },
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
      className="group relative rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px -12px rgba(0, 245, 255, 0.2), 0 0 20px rgba(0, 245, 255, 0.15)",
        borderColor: "rgba(0, 245, 255, 0.3)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
            style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.1), rgba(124,58,237,0.08))" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,245,255,0.15)", border: "1px solid rgba(0,245,255,0.25)" }}
            >
              <BookOpen className="w-8 h-8" style={{ color: "#00F5FF" }} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/80 via-transparent to-transparent" />

        {course.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(0,245,255,0.85)", color: "#0B1D3A", backdropFilter: "blur(8px)" }}
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

        {languageVariants && languageVariants.length > 1 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {languageVariants.map((v) => (
              <button
                key={v.id}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedLang(v.language || "en"); }}
                className="px-2 py-0.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: v.id === course.id ? "rgba(0,245,255,0.85)" : "rgba(255,255,255,0.15)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  border: v.id === course.id ? "1px solid rgba(0,245,255,0.6)" : "1px solid rgba(255,255,255,0.1)",
                }}
                data-testid={`badge-lang-variant-${v.language}-${v.id}`}
              >
                <Globe className="w-3 h-3 mr-1 inline" />
                {getLanguageLabel(v.language || "en")}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3
            className="text-base font-semibold leading-snug line-clamp-2 text-white"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid={`text-course-title-${course.id}`}
          >
            {course.groupTitle || course.title}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-2 mt-1" data-testid={`rating-${course.id}`}>
              <StarRating rating={rating} />
              <span className="text-xs font-medium text-gray-400">{rating.toFixed(1)}</span>
              {totalStudents > 0 && (
                <span className="text-xs text-gray-500">({totalStudents.toLocaleString()} students)</span>
              )}
            </div>
          )}
        </div>

        {course.description && (
          <p className="text-sm text-gray-400 line-clamp-2" data-testid={`text-course-description-${course.id}`}>
            {course.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
          {course.duration && (
            <span className="flex items-center gap-1" data-testid={`text-duration-${course.id}`}>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {course.duration}
            </span>
          )}
          <LevelBadge level={course.level as any} />
          {projectCount > 0 && (
            <span className="flex items-center gap-1" data-testid={`text-projects-${course.id}`}>
              <FolderKanban className="w-3.5 h-3.5" style={{ color: "#00F5FF" }} />
              {projectCount} Project{projectCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {course.language && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
              data-testid={`badge-language-${course.id}`}
            >
              <Globe className="w-3 h-3" />
              {getLanguageLabel(course.language)}
            </span>
          )}
          {course.testRequired && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
              style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}
              data-testid={`badge-certificate-${course.id}`}
            >
              <Award className="w-3 h-3 text-amber-400" />
              Certificate
            </span>
          )}
        </div>

        <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            {isFree ? (
              <span className="text-sm font-semibold text-emerald-400" data-testid={`text-price-${course.id}`}>Free</span>
            ) : isEnrolled ? (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}
                data-testid={`badge-enrolled-${course.id}`}
              >
                Enrolled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-400" data-testid={`text-price-${course.id}`}>
                <Coins className="w-3.5 h-3.5" />
                {creditCost} Credits
              </span>
            )}
          </div>

          {isEnrolled ? (
            <Link href={`/courses/${course.id}`} className="block">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  color: "#fff",
                  boxShadow: "0 4px 14px -3px rgba(79,70,229,0.4)",
                }}
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
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#fff",
                  boxShadow: "0 4px 14px -3px rgba(16,185,129,0.4)",
                }}
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
                style={{
                  background: "linear-gradient(135deg, #00F5FF, #06B6D4)",
                  color: "#0B1D3A",
                  boxShadow: "0 4px 14px -3px rgba(0,245,255,0.4)",
                }}
                data-testid={`button-view-course-${course.id}`}
              >
                <Coins className="w-4 h-4 text-amber-300" />
                Enroll for {creditCost} Credits
              </button>
            </Link>
          ) : canAfford ? (
            <Link href={`/courses/${course.id}`} className="block">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  color: "#fff",
                  boxShadow: "0 4px 14px -3px rgba(79,70,229,0.4)",
                }}
                data-testid={`button-enroll-${course.id}`}
              >
                <Coins className="w-4 h-4 text-amber-300" />
                Enroll for {creditCost} Credits
              </button>
            </Link>
          ) : (
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af" }}
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
      className="rounded-2xl overflow-hidden h-full flex flex-col animate-pulse"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="aspect-video" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="p-4 space-y-3 flex-1">
        <div className="h-5 rounded" style={{ background: "rgba(255,255,255,0.08)", width: "75%" }} />
        <div className="space-y-2">
          <div className="h-4 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "100%" }} />
          <div className="h-4 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "60%" }} />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-6 w-20 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
        <div className="mt-auto pt-3">
          <div className="h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>
    </div>
  );
}

export default function CourseCatalog() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");
  const [selectedPricing, setSelectedPricing] = useState<PricingFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    if (!courses) return [];
    const cats = new Set<string>();
    courses.forEach((c) => { if (c.category) cats.add(c.category); });
    return Array.from(cats).sort();
  }, [courses]);

  const languages = useMemo(() => {
    if (!courses) return [];
    const langs = new Set<string>();
    courses.forEach((c) => { if (c.language) langs.add(c.language); });
    return Array.from(langs).sort();
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
      const matchesLanguage = selectedLanguage === "all" || course.language === selectedLanguage;

      return matchesSearch && matchesLevel && matchesPricing && matchesCategory && matchesLanguage;
    });

    switch (sortBy) {
      case "title-asc": filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title)); break;
      case "title-desc": filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title)); break;
      case "price-low": filtered = [...filtered].sort((a, b) => (a.creditCost ?? 0) - (b.creditCost ?? 0)); break;
      case "price-high": filtered = [...filtered].sort((a, b) => (b.creditCost ?? 0) - (a.creditCost ?? 0)); break;
      case "newest": filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    }

    return filtered;
  }, [courses, searchTerm, selectedLevel, selectedPricing, selectedCategory, selectedLanguage, sortBy]);

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
    selectedCategory !== "all" || selectedLanguage !== "all" || searchTerm !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("all");
    setSelectedPricing("all");
    setSelectedCategory("all");
    setSelectedLanguage("all");
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

  const activeFilterCount = [selectedLevel, selectedPricing, selectedLanguage].filter(f => f !== "all").length +
    (searchTerm ? 1 : 0);

  const filterSidebarContent = (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Skill Level</h4>
        <div className="space-y-1.5">
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
                background: selectedLevel === level.id ? "rgba(0,245,255,0.12)" : "transparent",
                color: selectedLevel === level.id ? "#00F5FF" : "#9ca3af",
                border: selectedLevel === level.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
              }}
              data-testid={`filter-level-${level.id}`}
            >
              <span>{level.label}</span>
              {level.count !== undefined && level.count > 0 && (
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{level.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Pricing</h4>
        <div className="space-y-1.5">
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
                background: selectedPricing === pricing.id ? "rgba(0,245,255,0.12)" : "transparent",
                color: selectedPricing === pricing.id ? "#00F5FF" : "#9ca3af",
                border: selectedPricing === pricing.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
              }}
              data-testid={`filter-pricing-${pricing.id}`}
            >
              {pricing.label}
            </button>
          ))}
        </div>
      </div>

      {languages.length > 1 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Language</h4>
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedLanguage("all")}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left"
              style={{
                background: selectedLanguage === "all" ? "rgba(0,245,255,0.12)" : "transparent",
                color: selectedLanguage === "all" ? "#00F5FF" : "#9ca3af",
                border: selectedLanguage === "all" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
              }}
              data-testid="filter-language-all"
            >
              All Languages
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left"
                style={{
                  background: selectedLanguage === lang ? "rgba(0,245,255,0.12)" : "transparent",
                  color: selectedLanguage === lang ? "#00F5FF" : "#9ca3af",
                  border: selectedLanguage === lang ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
                }}
                data-testid={`filter-language-${lang}`}
              >
                {getLanguageLabel(lang)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Sort By</h4>
        <div className="space-y-1.5">
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
                background: sortBy === sort.id ? "rgba(0,245,255,0.12)" : "transparent",
                color: sortBy === sort.id ? "#00F5FF" : "#9ca3af",
                border: sortBy === sort.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent",
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
          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
          data-testid="button-clear-filters"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #0B1D3A 0%, #0F172A 40%, #0B1120 100%)", color: "#e2e8f0" }}>
      <LandingNavbar />
      <div className="flex-1">
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ position: "fixed", zIndex: 0 }}
        >
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
            style={{ background: "radial-gradient(circle, #4F46E5, transparent)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[120px] opacity-15"
            style={{ background: "radial-gradient(circle, #00F5FF, transparent)" }}
          />
          <div
            className="absolute top-1/3 right-1/6 w-64 h-64 rounded-full blur-[100px] opacity-10"
            style={{ background: "radial-gradient(circle, #F59E0B, transparent)" }}
          />
        </div>

        <div className="relative z-10">
          <div className="pt-8 pb-10 px-4 md:px-8">
            <motion.div
              className="max-w-3xl mx-auto text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.1))",
                    border: "1px solid rgba(0,245,255,0.25)",
                    boxShadow: "0 0 20px rgba(0,245,255,0.15)",
                  }}
                >
                  <GraduationCap className="w-7 h-7" style={{ color: "#00F5FF" }} />
                </div>
              </div>

              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #00F5FF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                  data-testid="text-page-title"
                >
                  Course Catalog
                </h1>
                <p className="text-gray-400 text-lg mt-3 max-w-xl mx-auto">
                  Search skills, tools, and careers. Find the right learning path for your goals.
                </p>
              </div>

              {!isLoading && !error && courses && courses.length > 0 && (
                <div className="flex items-center justify-center gap-4 md:gap-6 text-sm text-gray-400 flex-wrap">
                  <div className="flex items-center gap-1.5" data-testid="stat-total-courses">
                    <BookOpen className="w-4 h-4" style={{ color: "#00F5FF" }} />
                    <span>{courses.length} Course{courses.length !== 1 ? "s" : ""}</span>
                  </div>
                  {levelCounts.beginner > 0 && <div data-testid="stat-beginner-count">{levelCounts.beginner} Beginner</div>}
                  {levelCounts.intermediate > 0 && <div data-testid="stat-intermediate-count">{levelCounts.intermediate} Intermediate</div>}
                  {levelCounts.advanced > 0 && <div data-testid="stat-advanced-count">{levelCounts.advanced} Advanced</div>}
                  {levelCounts.masters > 0 && <div data-testid="stat-masters-count">{levelCounts.masters} Masters</div>}
                </div>
              )}

              <div className="relative max-w-2xl mx-auto">
                <div
                  className="absolute -inset-1 rounded-2xl opacity-50 blur-sm"
                  style={{ background: "linear-gradient(135deg, #00F5FF, #7C3AED, #00F5FF)" }}
                />
                <div
                  className="relative flex items-center rounded-xl overflow-hidden"
                  style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(0,245,255,0.3)" }}
                >
                  <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills, tools, careers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder:text-gray-500 outline-none text-base"
                    data-testid="input-search-courses"
                  />
                  <button
                    className="p-3 mr-1 rounded-lg transition-colors"
                    style={{ color: "#6b7280" }}
                    title="Voice search (coming soon)"
                    data-testid="button-voice-search"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {!isLoading && !error && courses && courses.length > 0 && (
            <motion.div
              className="px-4 md:px-8 pb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div
                ref={pillsRef}
                className="flex items-center gap-2 overflow-x-auto pb-2 max-w-5xl mx-auto hide-scrollbar"
                style={{ scrollbarWidth: "none" }}
              >
                {CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  const exists = cat.id === "all" || categories.includes(cat.id);
                  if (!exists && cat.id !== "all") return null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
                      style={{
                        background: isActive ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)",
                        color: isActive ? "#00F5FF" : "#9ca3af",
                        border: isActive
                          ? "1px solid rgba(0,245,255,0.4)"
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isActive ? "0 0 12px rgba(0,245,255,0.2)" : "none",
                      }}
                      data-testid={`pill-category-${cat.id}`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="px-4 md:px-8 pb-16 max-w-[1400px] mx-auto">
            <div className="flex gap-8">
              {!isLoading && !error && courses && courses.length > 0 && (
                <aside
                  className="hidden lg:block w-64 shrink-0"
                >
                  <div
                    className="sticky top-24 rounded-2xl p-5 overflow-y-auto max-h-[calc(100vh-8rem)]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <SlidersHorizontal className="w-4 h-4" style={{ color: "#00F5FF" }} />
                      <h3 className="text-sm font-semibold text-white">Filters</h3>
                      {activeFilterCount > 0 && (
                        <span
                          className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "rgba(0,245,255,0.15)", color: "#00F5FF" }}
                        >
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    {filterSidebarContent}
                  </div>
                </aside>
              )}

              <div className="flex-1 min-w-0">
                {!isLoading && !error && courses && courses.length > 0 && (
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-400" data-testid="text-total-courses">
                      Showing {totalCourses} course{totalCourses !== 1 ? "s" : ""}
                    </p>

                    <button
                      className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#9ca3af",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onClick={() => setMobileFiltersOpen(true)}
                      data-testid="button-mobile-filters"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span
                          className="px-1.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "rgba(0,245,255,0.2)", color: "#00F5FF" }}
                        >
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="skeleton-courses">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <PremiumSkeleton key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <BookOpen className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-empty-title">
                      Unable to load courses
                    </h3>
                    <p className="text-gray-400 max-w-md" data-testid="text-empty-message">
                      We're having trouble fetching courses. Please try again later.
                    </p>
                  </div>
                ) : !courses || courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" }}
                    >
                      <BookOpen className="w-10 h-10" style={{ color: "#00F5FF" }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-empty-title">
                      No courses available
                    </h3>
                    <p className="text-gray-400 max-w-md" data-testid="text-empty-message">
                      Please check back later for new learning opportunities.
                    </p>
                  </div>
                ) : groupedCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                      style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" }}
                    >
                      <Search className="w-10 h-10" style={{ color: "#00F5FF" }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-display)" }} data-testid="text-empty-title">
                      No courses found
                    </h3>
                    <p className="text-gray-400 max-w-md mb-4" data-testid="text-empty-message">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.2)" }}
                      data-testid="button-reset-filters"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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

                {!user && !isLoading && courses && courses.length > 0 && (
                  <motion.div
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div
                      className="rounded-2xl p-8 text-center space-y-4"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.05))",
                        border: "1px solid rgba(0,245,255,0.15)",
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                        style={{ background: "rgba(0,245,255,0.12)", border: "1px solid rgba(0,245,255,0.25)" }}
                      >
                        <Sparkles className="w-7 h-7" style={{ color: "#00F5FF" }} />
                      </div>
                      <h3
                        className="text-xl font-semibold text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                        data-testid="text-signup-cta"
                      >
                        Ready to start learning?
                      </h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Create a free account to enroll in courses, track your progress, earn certificates, and build your learning portfolio.
                      </p>
                      <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                        <Link href="/signup">
                          <button
                            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                            style={{
                              background: "linear-gradient(135deg, #00F5FF, #06B6D4)",
                              color: "#0B1D3A",
                              boxShadow: "0 4px 14px -3px rgba(0,245,255,0.4)",
                            }}
                            data-testid="button-signup-cta"
                          >
                            <UserPlus className="w-4 h-4" />
                            Sign Up Free
                          </button>
                        </Link>
                        <Link href="/login">
                          <button
                            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#00F5FF",
                              border: "1px solid rgba(0,245,255,0.25)",
                            }}
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

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, #1e293b, #0f172a)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  maxHeight: "80vh",
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Filter className="w-5 h-5" style={{ color: "#00F5FF" }} />
                      Filters
                    </h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#9ca3af" }}
                      data-testid="button-close-mobile-filters"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
                    {filterSidebarContent}
                  </div>
                  <div className="mt-5">
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: "linear-gradient(135deg, #00F5FF, #06B6D4)",
                        color: "#0B1D3A",
                      }}
                      data-testid="button-apply-filters"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <footer className="relative z-10 py-6 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-gray-500">
          <p>Your learning journey starts here.</p>
        </div>
      </footer>
    </div>
  );
}
