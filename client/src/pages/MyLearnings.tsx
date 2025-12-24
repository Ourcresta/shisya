import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Play, 
  CheckCircle,
  ArrowRight,
  Clock,
  Library,
  Sparkles
} from "lucide-react";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { getCourseProgress } from "@/lib/progress";
import { useCredits } from "@/contexts/CreditContext";
import type { Course } from "@shared/schema";

interface CourseWithProgress extends Course {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isEnrolled: boolean;
}

function getLevelColor(level: string): string {
  switch (level) {
    case "beginner": return "text-green-500 bg-green-100 dark:bg-green-900/30";
    case "intermediate": return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    case "advanced": return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
    default: return "text-muted-foreground bg-muted";
  }
}

export default function MyLearnings() {
  const { enrollments, isLoadingEnrollments } = useCredits();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const isLoading = coursesLoading || isLoadingEnrollments;

  const enrolledCourseIds = enrollments.map(e => e.courseId);

  const enrolledCourses: CourseWithProgress[] = courses
    .filter((course) => enrolledCourseIds.includes(course.id))
    .map((course) => {
      const progress = getCourseProgress(course.id);
      const completedLessons = progress.completedLessons.length;
      const totalLessons = 10;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        ...course,
        progress: Math.min(progressPercent, 100),
        completedLessons,
        totalLessons,
        isEnrolled: true,
      };
    });

  const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const notStartedCourses = enrolledCourses.filter(c => c.progress === 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const renderCourseCard = (course: CourseWithProgress) => (
    <motion.div key={course.id} variants={staggerItem}>
      <Card 
        className="h-full hover-elevate cursor-pointer transition-all"
        data-testid={`course-card-${course.id}`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${getLevelColor(course.level)}`}
                >
                  {course.level}
                </Badge>
                {course.progress === 100 && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <h3 
                className="font-semibold text-base line-clamp-2 mb-2"
                data-testid={`course-title-${course.id}`}
              >
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {course.description}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
              {course.skills && course.skills.length > 0 && (
                <>
                  <span className="mx-1">|</span>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{course.skills.length} skills</span>
                </>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {course.completedLessons} of {course.totalLessons} lessons
              </p>
            </div>

            <Link href={course.progress > 0 ? `/shishya/learn/${course.id}` : `/courses/${course.id}`}>
              <Button 
                className="w-full mt-2" 
                size="sm"
                data-testid={`button-course-${course.id}`}
              >
                {course.progress === 100 ? (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Review Course
                  </>
                ) : course.progress > 0 ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                  </>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Library className="w-8 h-8 text-primary" />
            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-page-title"
            >
              My Learnings
            </h1>
          </div>
          <p className="text-muted-foreground">
            All the courses you've enrolled in, organized by progress.
          </p>
        </motion.div>

        {enrolledCourses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Library className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                You haven't enrolled in any courses yet. Browse our catalog to find courses that match your learning goals.
              </p>
              <Link href="/courses">
                <Button data-testid="button-browse-courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {inProgressCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">In Progress ({inProgressCourses.length})</h2>
                </div>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {inProgressCourses.map(renderCourseCard)}
                </motion.div>
              </section>
            )}

            {notStartedCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold">Not Started ({notStartedCourses.length})</h2>
                </div>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {notStartedCourses.map(renderCourseCard)}
                </motion.div>
              </section>
            )}

            {completedCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold">Completed ({completedCourses.length})</h2>
                </div>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {completedCourses.map(renderCourseCard)}
                </motion.div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
