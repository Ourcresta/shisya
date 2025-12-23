import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect, useLocation } from "wouter";
import { CheckCircle2, XCircle, Target, Award, FolderKanban, BookOpen, ClipboardList, FlaskConical, Coins, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { DurationBadge } from "@/components/ui/duration-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@shared/schema";

export default function CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { checkEnrollment, enrollments, isLoadingEnrollments } = useCredits();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  
  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  useEffect(() => {
    const checkUserEnrollment = async () => {
      if (user && courseId) {
        setCheckingEnrollment(true);
        const result = await checkEnrollment(parseInt(courseId, 10));
        setIsEnrolled(result.enrolled);
        setCheckingEnrollment(false);
      }
    };
    checkUserEnrollment();
  }, [user, courseId, checkEnrollment, enrollments]);

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
    setLocation(`/shishya/learn/${courseId}`);
  };

  const handleStartLearning = () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    if (isEnrolled) {
      setLocation(`/shishya/learn/${courseId}`);
    } else {
      setShowEnrollModal(true);
    }
  };

  if (error) {
    return <Redirect to="/" />;
  }

  if (course && course.status !== "published") {
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      {isLoading ? (
        <CourseOverviewSkeleton />
      ) : course ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Course Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <LevelBadge level={course.level} />
              <DurationBadge duration={course.duration} />
              {course.isFree ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" data-testid="badge-free-course">
                  Free Course
                </Badge>
              ) : course.creditCost ? (
                <Badge variant="secondary" className="gap-1" data-testid="badge-credit-cost">
                  <Coins className="h-3 w-3" />
                  {course.creditCost} Credits
                </Badge>
              ) : null}
              {isEnrolled && (
                <Badge variant="secondary" className="bg-primary/10 text-primary" data-testid="badge-enrolled">
                  Enrolled
                </Badge>
              )}
            </div>
            
            <h1 
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-course-title"
            >
              {course.title}
            </h1>

            {course.description && (
              <p 
                className="text-lg text-muted-foreground leading-relaxed"
                data-testid="text-course-description"
              >
                {course.description}
              </p>
            )}
          </div>

          {/* Skills Section */}
          {course.skills && course.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Skills You Will Gain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="flex flex-wrap gap-2"
                  data-testid="container-skills"
                >
                  {course.skills.map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificate Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-primary" />
                Certificate Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  {course.testRequired ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Assessment Test</p>
                    <p className="text-sm text-muted-foreground">
                      {course.testRequired ? "Required" : "Not required"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  {course.projectRequired ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Project Submission</p>
                    <p className="text-sm text-muted-foreground">
                      {course.projectRequired ? "Required" : "Not required"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 flex-wrap">
            <Button 
              size="lg" 
              className="px-8 gap-2" 
              onClick={handleStartLearning}
              disabled={checkingEnrollment}
              data-testid="button-start-learning"
            >
              {checkingEnrollment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {isEnrolled ? "Continue Learning" : "Start Learning"}
            </Button>
            {course.testRequired && isEnrolled && (
              <Link href={`/shishya/tests/${course.id}`}>
                <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-tests">
                  <ClipboardList className="w-4 h-4" />
                  View Tests
                </Button>
              </Link>
            )}
            {course.projectRequired && isEnrolled && (
              <Link href={`/shishya/projects/${course.id}`}>
                <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-projects">
                  <FolderKanban className="w-4 h-4" />
                  View Projects
                </Button>
              </Link>
            )}
            {isEnrolled && (
              <Link href={`/shishya/labs/${course.id}`}>
                <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-labs">
                  <FlaskConical className="w-4 h-4" />
                  Practice Labs
                </Button>
              </Link>
            )}
          </div>

          <EnrollmentModal
            course={course}
            open={showEnrollModal}
            onOpenChange={setShowEnrollModal}
            onEnrollmentSuccess={handleEnrollmentSuccess}
          />
        </div>
      ) : null}
    </Layout>
  );
}

function CourseOverviewSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Skeleton className="h-12 w-40 rounded-lg" />
      </div>
    </div>
  );
}
