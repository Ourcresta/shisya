import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect, useLocation } from "wouter";
import { 
  CheckCircle2, XCircle, Target, Award, FolderKanban, BookOpen, 
  ClipboardList, FlaskConical, Coins, Loader2, ExternalLink, Play,
  ArrowRight, FileQuestion, Clock, Percent, Code2, Lightbulb
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { DurationBadge } from "@/components/ui/duration-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { Separator } from "@/components/ui/separator";
import { EnrollmentModal } from "@/components/EnrollmentModal";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Course, Test, Project, Lab } from "@shared/schema";


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

  const { data: tests } = useQuery<Test[]>({
    queryKey: ["/api/courses", courseId, "tests"],
    enabled: !!course,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/courses", courseId, "projects"],
    enabled: !!course,
  });

  const { data: labs } = useQuery<Lab[]>({
    queryKey: ["/api/courses", courseId, "labs"],
    enabled: !!course,
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

  const skillsList = course?.skills 
    ? (typeof course.skills === "string" ? course.skills.split(",").map(s => s.trim()).filter(Boolean) : course.skills)
    : [];

  const testCount = tests?.length || 0;
  const projectCount = projects?.length || 0;
  const labCount = labs?.length || 0;
  const hasPracticeContent = testCount > 0 || projectCount > 0 || labCount > 0;

  return (
    <Layout>
      {isLoading ? (
        <CourseOverviewSkeleton />
      ) : course ? (
        <div className="max-w-4xl mx-auto space-y-8">
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
              className="text-3xl md:text-4xl font-bold dark:neon-gradient-text"
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

            <div className="flex flex-col sm:flex-row gap-3 pt-2 flex-wrap">
              <Button 
                size="lg" 
                className="gap-2" 
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

              {course.trainerCentralCourseUrl && (
                <a 
                  href={course.trainerCentralCourseUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-watch-trainercentral">
                    <Play className="w-4 h-4" />
                    Watch on TrainerCentral
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {hasPracticeContent && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                    data-testid="text-practice-heading"
                  >
                    Practice & Assessment
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sharpen your skills with hands-on practice and earn your certificate
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testCount > 0 && (
                    <Card className="relative overflow-visible" data-testid="card-tests-overview">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-5 h-5 text-violet-500" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base">Tests</CardTitle>
                            <CardDescription className="text-xs">
                              {testCount} assessment{testCount !== 1 ? "s" : ""} available
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <ul className="space-y-2" data-testid="list-tests-preview">
                          {tests?.slice(0, 3).map((test) => (
                            <li key={test.id} className="flex items-center gap-2 text-sm">
                              <FileQuestion className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{test.title}</span>
                            </li>
                          ))}
                          {testCount > 3 && (
                            <li className="text-xs text-muted-foreground pl-5.5">
                              +{testCount - 3} more
                            </li>
                          )}
                        </ul>
                        {isEnrolled ? (
                          <Link href={`/shishya/tests/${courseId}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-view-tests">
                              View Tests
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-1">
                            Enroll to access tests
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {projectCount > 0 && (
                    <Card className="relative overflow-visible" data-testid="card-projects-overview">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <FolderKanban className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base">Projects</CardTitle>
                            <CardDescription className="text-xs">
                              {projectCount} project{projectCount !== 1 ? "s" : ""} to build
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <ul className="space-y-2" data-testid="list-projects-preview">
                          {projects?.slice(0, 3).map((project) => (
                            <li key={project.id} className="flex items-center gap-2 text-sm">
                              <Code2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{project.title}</span>
                            </li>
                          ))}
                          {projectCount > 3 && (
                            <li className="text-xs text-muted-foreground pl-5.5">
                              +{projectCount - 3} more
                            </li>
                          )}
                        </ul>
                        {isEnrolled ? (
                          <Link href={`/shishya/projects/${courseId}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-view-projects">
                              View Projects
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-1">
                            Enroll to access projects
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {labCount > 0 && (
                    <Card className="relative overflow-visible" data-testid="card-labs-overview">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <FlaskConical className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base">Labs</CardTitle>
                            <CardDescription className="text-xs">
                              {labCount} guided lab{labCount !== 1 ? "s" : ""} to practice
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <ul className="space-y-2" data-testid="list-labs-preview">
                          {labs?.slice(0, 3).map((lab) => (
                            <li key={lab.id} className="flex items-center gap-2 text-sm">
                              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{lab.title}</span>
                            </li>
                          ))}
                          {labCount > 3 && (
                            <li className="text-xs text-muted-foreground pl-5.5">
                              +{labCount - 3} more
                            </li>
                          )}
                        </ul>
                        {isEnrolled ? (
                          <Link href={`/shishya/labs/${courseId}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-view-labs">
                              Practice Labs
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-1">
                            Enroll to access labs
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}

          {skillsList.length > 0 && (
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
                  {skillsList.map((skill: string) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                      {course.testRequired ? "Required to earn certificate" : "Not required"}
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
                      {course.projectRequired ? "Required to earn certificate" : "Not required"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-40 rounded-lg" />
          <Skeleton className="h-11 w-52 rounded-lg" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full rounded-md mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
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
    </div>
  );
}
