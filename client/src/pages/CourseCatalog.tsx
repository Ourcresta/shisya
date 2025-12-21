import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import { EmptyState } from "@/components/course/EmptyState";
import type { Course } from "@shared/schema";

export default function CourseCatalog() {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
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
        </div>

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
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="grid-courses"
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
