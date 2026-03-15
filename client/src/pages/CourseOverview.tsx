import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect, useLocation } from "wouter";
import { 
  CheckCircle2, XCircle, Target, Award, FolderKanban, BookOpen, 
  ClipboardList, FlaskConical, Coins, Loader2, ExternalLink, Play,
  ArrowRight, FileQuestion, Clock, Percent, Code2, Lightbulb,
  ChevronDown, ChevronUp, GraduationCap, ListVideo, Users, Globe,
  CheckCircle, Lock, Video
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
import type { Course, Test, Project, Lab, ModuleWithLessons } from "@shared/schema";

export default function CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { checkEnrollment, enrollments, isLoadingEnrollments } = useCredits();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));
  const [showAllModules, setShowAllModules] = useState(false);

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

  const { data: modulesData } = useQuery<ModuleWithLessons[]>({
    queryKey: ["/api/courses", courseId, "modules-with-lessons"],
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

  const toggleModule = (idx: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (error) return <Redirect to="/" />;
  if (course && course.status !== "published") return <Redirect to="/" />;

  const skillsList = course?.skills
    ? (typeof course.skills === "string" ? course.skills.split(",").map(s => s.trim()).filter(Boolean) : course.skills)
    : [];

  const testCount = tests?.length || 0;
  const projectCount = projects?.length || 0;
  const labCount = labs?.length || 0;
  const hasPracticeContent = testCount > 0 || projectCount > 0 || labCount > 0;

  const allModules = modulesData || [];
  const totalLessons = allModules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const visibleModules = showAllModules ? allModules : allModules.slice(0, 6);
  const hasCurriculum = allModules.length > 0;

  return (
    <Layout>
      {isLoading ? (
        <CourseOverviewSkeleton />
      ) : course ? (
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Hero Section ── */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
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
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold dark:neon-gradient-text"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-course-title"
            >
              {course.title}
            </h1>

            {course.description && (
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-course-description">
                {course.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
              {course.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {course.duration}
                </span>
              )}
              {totalLessons > 0 && (
                <span className="flex items-center gap-1.5">
                  <ListVideo className="w-4 h-4 text-primary" />
                  {totalLessons} lessons
                </span>
              )}
              {hasCurriculum && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {allModules.length} modules
                </span>
              )}
              {course.language && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" />
                  {course.language === "hi" ? "Hindi" : course.language === "ta" ? "Tamil" : course.language === "te" ? "Telugu" : "English"}
                </span>
              )}
            </div>

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
                ) : isEnrolled ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                {isEnrolled ? "Continue Learning" : "Start Learning"}
              </Button>

              {course.trainerCentralCourseUrl && (
                <a href={course.trainerCentralCourseUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="gap-2" data-testid="button-watch-trainercentral">
                    <Play className="w-4 h-4" />
                    Watch on TrainerCentral
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* ── Course Curriculum ── */}
          {hasCurriculum && (
            <>
              <Separator />
              <div className="space-y-4" data-testid="section-curriculum">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                      <ListVideo className="w-5 h-5 text-primary" />
                      Course Curriculum
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {allModules.length} module{allModules.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                      {course.duration ? ` · ${course.duration}` : ""}
                    </p>
                  </div>
                  {!isEnrolled && (
                    <Button size="sm" onClick={handleStartLearning} className="shrink-0 gap-1.5" data-testid="button-enroll-curriculum">
                      <GraduationCap className="w-4 h-4" />
                      Enroll Free
                    </Button>
                  )}
                </div>

                <div className="border rounded-xl overflow-hidden divide-y dark:border-border dark:divide-border">
                  {visibleModules.map((mod, idx) => {
                    const isOpen = openModules.has(idx);
                    const lessonCount = mod.lessons?.length || 0;
                    return (
                      <div key={mod.id} data-testid={`module-item-${idx}`}>
                        <button
                          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left"
                          onClick={() => toggleModule(idx)}
                          aria-expanded={isOpen}
                          data-testid={`button-toggle-module-${idx}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                              {idx + 1}
                            </div>
                            <span className="font-medium truncate">{mod.title}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                            <span>{lessonCount} lesson{lessonCount !== 1 ? "s" : ""}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isOpen && lessonCount > 0 && (
                          <div className="bg-muted/30 dark:bg-muted/10 divide-y dark:divide-border/50">
                            {mod.lessons.map((lesson, li) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm"
                                data-testid={`lesson-item-${idx}-${li}`}
                              >
                                <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center shrink-0 border dark:border-border">
                                  {isEnrolled ? (
                                    <Video className="w-3 h-3 text-primary" />
                                  ) : (
                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <span className={isEnrolled ? "text-foreground" : "text-muted-foreground"}>
                                  {lesson.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {allModules.length > 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setShowAllModules(!showAllModules)}
                    data-testid="button-show-all-modules"
                  >
                    {showAllModules ? (
                      <><ChevronUp className="w-4 h-4" />Show Less</>
                    ) : (
                      <><ChevronDown className="w-4 h-4" />Show all {allModules.length} modules</>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}

          {/* ── Practice & Assessment ── */}
          {hasPracticeContent && (
            <>
              <Separator />
              <div className="space-y-4">
                {/* Enrolled Banner at top of Practice section */}
                {isEnrolled && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20" data-testid="banner-enrolled-status">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-primary text-sm">You're enrolled in this course</p>
                      <p className="text-xs text-muted-foreground">Access all assessments, projects, and labs below</p>
                    </div>
                    <Link href={`/shishya/learn/${courseId}`} className="ml-auto shrink-0">
                      <Button size="sm" variant="outline" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10" data-testid="button-continue-from-banner">
                        <Play className="w-3.5 h-3.5" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                )}

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
                            <li className="text-xs text-muted-foreground pl-5">+{testCount - 3} more</li>
                          )}
                        </ul>
                        {isEnrolled ? (
                          <Link href={`/shishya/tests/${courseId}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-view-tests">
                              View Tests <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-1">Enroll to access tests</p>
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
                            <li className="text-xs text-muted-foreground pl-5">+{projectCount - 3} more</li>
                          )}
                        </ul>
                        {isEnrolled ? (
                          <Link href={`/shishya/projects/${courseId}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-view-projects">
                              View Projects <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-1">Enroll to access projects</p>
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
                            <li className="text-xs text-muted-foreground pl-5">+{labCount - 3} more</li>
                          )}
                        </ul>
                        {isEnrolled ? (
                          <Link href={`/shishya/labs/${courseId}`}>
                            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-view-labs">
                              Practice Labs <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-1">Enroll to access labs</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Skills You Will Gain ── */}
          {skillsList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Skills You Will Gain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" data-testid="container-skills">
                  {skillsList.map((skill: string) => (
                    <SkillTag key={skill} skill={skill} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Certificate Requirements ── */}
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

      {/* Curriculum skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="border rounded-xl overflow-hidden divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
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
