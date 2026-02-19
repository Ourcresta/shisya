import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, BookOpen, GraduationCap, ArrowUpDown, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import { EmptyState } from "@/components/course/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@shared/schema";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type PricingFilter = "all" | "free" | "paid";
type SortOption = "default" | "title-asc" | "title-desc" | "price-low" | "price-high" | "newest";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  ur: "Urdu",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
};

function getLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code.toLowerCase()] || code.toUpperCase();
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

  const categories = useMemo(() => {
    if (!courses) return [];
    const cats = new Set<string>();
    courses.forEach((c) => {
      if (c.category) cats.add(c.category);
    });
    return Array.from(cats).sort();
  }, [courses]);

  const languages = useMemo(() => {
    if (!courses) return [];
    const langs = new Set<string>();
    courses.forEach((c) => {
      if (c.language) langs.add(c.language);
    });
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

      const matchesLevel =
        selectedLevel === "all" ||
        course.level.toLowerCase() === selectedLevel;

      const matchesPricing =
        selectedPricing === "all" ||
        (selectedPricing === "free" && (course.isFree || (course.creditCost ?? 0) === 0)) ||
        (selectedPricing === "paid" && !course.isFree && (course.creditCost ?? 0) > 0);

      const matchesCategory =
        selectedCategory === "all" ||
        course.category === selectedCategory;

      const matchesLanguage =
        selectedLanguage === "all" ||
        course.language === selectedLanguage;

      return matchesSearch && matchesLevel && matchesPricing && matchesCategory && matchesLanguage;
    });

    switch (sortBy) {
      case "title-asc":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => (a.creditCost ?? 0) - (b.creditCost ?? 0));
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => (b.creditCost ?? 0) - (a.creditCost ?? 0));
        break;
      case "newest":
        filtered = [...filtered].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
    }

    return filtered;
  }, [courses, searchTerm, selectedLevel, selectedPricing, selectedCategory, selectedLanguage, sortBy]);

  const totalCourses = courses?.length ?? 0;
  const filteredCount = filteredCourses.length;

  const hasActiveFilters =
    selectedLevel !== "all" ||
    selectedPricing !== "all" ||
    selectedCategory !== "all" ||
    selectedLanguage !== "all" ||
    searchTerm !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("all");
    setSelectedPricing("all");
    setSelectedCategory("all");
    setSelectedLanguage("all");
    setSortBy("default");
  };

  const levelCounts = useMemo(() => {
    if (!courses) return { beginner: 0, intermediate: 0, advanced: 0 };
    return {
      beginner: courses.filter((c) => c.level.toLowerCase() === "beginner").length,
      intermediate: courses.filter((c) => c.level.toLowerCase() === "intermediate").length,
      advanced: courses.filter((c) => c.level.toLowerCase() === "advanced").length,
    };
  }, [courses]);

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-4"
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-page-title"
          >
            Course Catalog
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Browse our curated collection of courses. Find the right learning path for your goals and start building real skills today.
          </p>

          {!isLoading && !error && courses && courses.length > 0 && (
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5" data-testid="stat-total-courses">
                <BookOpen className="w-4 h-4" />
                <span>{totalCourses} Course{totalCourses !== 1 ? "s" : ""}</span>
              </div>
              {levelCounts.beginner > 0 && (
                <div data-testid="stat-beginner-count">
                  {levelCounts.beginner} Beginner
                </div>
              )}
              {levelCounts.intermediate > 0 && (
                <div data-testid="stat-intermediate-count">
                  {levelCounts.intermediate} Intermediate
                </div>
              )}
              {levelCounts.advanced > 0 && (
                <div data-testid="stat-advanced-count">
                  {levelCounts.advanced} Advanced
                </div>
              )}
            </div>
          )}
        </motion.div>

        {!isLoading && !error && courses && courses.length > 0 && (
          <motion.div
            className="space-y-4"
            variants={slideUp}
            initial="initial"
            animate="animate"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by title, description, or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-courses"
                />
              </div>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-sort">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title-asc">Title: A to Z</SelectItem>
                  <SelectItem value="title-desc">Title: Z to A</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "beginner", "intermediate", "advanced"] as LevelFilter[]).map(
                  (level) => (
                    <Badge
                      key={level}
                      variant="secondary"
                      className={`cursor-pointer toggle-elevate ${selectedLevel === level ? "toggle-elevated" : ""}`}
                      onClick={() => setSelectedLevel(level)}
                      data-testid={`badge-filter-level-${level}`}
                    >
                      {level === "all" ? "All Levels" : level.charAt(0).toUpperCase() + level.slice(1)}
                    </Badge>
                  )
                )}
              </div>

              <div className="hidden sm:block w-px h-5 bg-border" />

              <div className="flex flex-wrap gap-2">
                {(["all", "free", "paid"] as PricingFilter[]).map((pricing) => (
                  <Badge
                    key={pricing}
                    variant="secondary"
                    className={`cursor-pointer toggle-elevate ${selectedPricing === pricing ? "toggle-elevated" : ""}`}
                    onClick={() => setSelectedPricing(pricing)}
                    data-testid={`badge-filter-pricing-${pricing}`}
                  >
                    {pricing === "all" ? "All Pricing" : pricing.charAt(0).toUpperCase() + pricing.slice(1)}
                  </Badge>
                ))}
              </div>

              {categories.length > 0 && (
                <>
                  <div className="hidden sm:block w-px h-5 bg-border" />
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className={`cursor-pointer toggle-elevate ${selectedCategory === "all" ? "toggle-elevated" : ""}`}
                      onClick={() => setSelectedCategory("all")}
                      data-testid="badge-filter-category-all"
                    >
                      All Categories
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className={`cursor-pointer toggle-elevate ${selectedCategory === cat ? "toggle-elevated" : ""}`}
                        onClick={() => setSelectedCategory(cat)}
                        data-testid={`badge-filter-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </>
              )}

              {languages.length > 1 && (
                <>
                  <div className="hidden sm:block w-px h-5 bg-border" />
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className={`cursor-pointer toggle-elevate ${selectedLanguage === "all" ? "toggle-elevated" : ""}`}
                      onClick={() => setSelectedLanguage("all")}
                      data-testid="badge-filter-language-all"
                    >
                      All Languages
                    </Badge>
                    {languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className={`cursor-pointer toggle-elevate ${selectedLanguage === lang ? "toggle-elevated" : ""}`}
                        onClick={() => setSelectedLanguage(lang)}
                        data-testid={`badge-filter-language-${lang.toLowerCase()}`}
                      >
                        {getLanguageLabel(lang)}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                <span data-testid="text-total-courses">
                  Showing {filteredCount} of {totalCourses} course{totalCourses !== 1 ? "s" : ""}
                </span>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="skeleton-courses"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load courses"
            message="We're having trouble fetching courses. Please try again later."
          />
        ) : !courses || courses.length === 0 ? (
          <EmptyState />
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <EmptyState
              title="No courses found"
              message="Try adjusting your search or filters to find what you're looking for."
            />
            <Button variant="outline" onClick={clearFilters} data-testid="button-reset-filters">
              Reset All Filters
            </Button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="grid-courses"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredCourses.map((course) => (
              <motion.div key={course.id} variants={staggerItem}>
                <CourseCard course={course} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!user && !isLoading && courses && courses.length > 0 && (
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
          >
            <Card className="p-8 text-center space-y-4 bg-primary/5 border-primary/10">
              <GraduationCap className="w-10 h-10 text-primary mx-auto" />
              <h3
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-signup-cta"
              >
                Ready to start learning?
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create a free account to enroll in courses, track your progress, earn certificates, and build your learning portfolio.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="/signup">
                  <Button data-testid="button-signup-cta">Sign Up Free</Button>
                </a>
                <a href="/login">
                  <Button variant="outline" data-testid="button-login-cta">Log In</Button>
                </a>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
