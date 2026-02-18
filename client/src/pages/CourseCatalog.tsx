import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import { EmptyState } from "@/components/course/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import type { Course } from "@shared/schema";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type PricingFilter = "all" | "free" | "paid";

export default function CourseCatalog() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");
  const [selectedPricing, setSelectedPricing] = useState<PricingFilter>("all");

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        course.title.toLowerCase().includes(searchLower) ||
        (course.description && course.description.toLowerCase().includes(searchLower));

      const matchesLevel = 
        selectedLevel === "all" || 
        course.level.toLowerCase() === selectedLevel;

      const matchesPricing =
        selectedPricing === "all" ||
        (selectedPricing === "free" && (course.isFree || course.creditCost === 0)) ||
        (selectedPricing === "paid" && !course.isFree && course.creditCost > 0);

      return matchesSearch && matchesLevel && matchesPricing;
    });
  }, [courses, searchTerm, selectedLevel, selectedPricing]);

  const totalCourses = courses?.length ?? 0;
  const filteredCount = filteredCourses.length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto space-y-4"
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <h1 
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-page-title"
          >
            Explore Courses
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover structured learning paths designed to help you master new skills at your own pace.
          </p>
        </motion.div>

        {/* Filters Section */}
        {!isLoading && !error && courses && courses.length > 0 && (
          <motion.div 
            className="space-y-4"
            variants={slideUp}
            initial="initial"
            animate="animate"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-courses"
              />
            </div>

            {/* Filter Badges */}
            <div className="space-y-3">
              {/* Level Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedLevel === "all" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedLevel("all")}
                  data-testid="badge-filter-level-all"
                >
                  All Levels
                </Badge>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedLevel === "beginner" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedLevel("beginner")}
                  data-testid="badge-filter-level-beginner"
                >
                  Beginner
                </Badge>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedLevel === "intermediate" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedLevel("intermediate")}
                  data-testid="badge-filter-level-intermediate"
                >
                  Intermediate
                </Badge>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedLevel === "advanced" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedLevel("advanced")}
                  data-testid="badge-filter-level-advanced"
                >
                  Advanced
                </Badge>
              </div>

              {/* Pricing Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedPricing === "all" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedPricing("all")}
                  data-testid="badge-filter-pricing-all"
                >
                  All Pricing
                </Badge>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedPricing === "free" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedPricing("free")}
                  data-testid="badge-filter-pricing-free"
                >
                  Free
                </Badge>
                <Badge
                  variant="secondary"
                  className={`cursor-pointer toggle-elevate ${selectedPricing === "paid" ? "toggle-elevated" : ""}`}
                  onClick={() => setSelectedPricing("paid")}
                  data-testid="badge-filter-pricing-paid"
                >
                  Paid
                </Badge>
              </div>
            </div>

            {/* Course Count */}
            <div className="text-sm text-muted-foreground">
              <span data-testid="text-total-courses">
                Showing {filteredCount} of {totalCourses} course{totalCourses !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        )}

        {/* Course Grid */}
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
          <EmptyState 
            title="No courses found"
            message="Try adjusting your search or filters to find what you're looking for."
          />
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
      </div>
    </Layout>
  );
}
