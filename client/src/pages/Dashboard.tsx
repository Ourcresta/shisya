import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Award, 
  FileText, 
  ClipboardCheck, 
  Play, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  User,
  FolderOpen,
  Trophy,
  Zap,
  Code2,
  Coins
} from "lucide-react";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditContext";
import { getCourseProgress } from "@/lib/progress";
import { getAllSubmissions } from "@/lib/submissions";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllCertificates } from "@/lib/certificates";
import type { Course } from "@shared/schema";

interface CourseWithProgress extends Course {
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

function getLearningLevel(completedCourses: number, passedTests: number): { level: string; variant: "default" | "secondary" | "outline" } {
  const score = completedCourses * 2 + passedTests;
  if (score >= 10) return { level: "Advanced", variant: "default" };
  if (score >= 4) return { level: "Intermediate", variant: "secondary" };
  return { level: "Beginner", variant: "outline" };
}

function getMotivationalMessage(inProgress: number, completed: number): string {
  if (completed >= 3) return "You're on fire! Keep building those skills.";
  if (inProgress > 0) return "Keep going — you're building real skills.";
  if (completed > 0) return "Great start! Continue your learning journey.";
  return "Your learning journey begins here.";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { balance, isLoading: creditsLoading } = useCredits();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const allSubmissions = getAllSubmissions();
  const allTestAttempts = getTestAttempts();
  const allCertificates = getAllCertificates();

  const coursesWithProgress: CourseWithProgress[] = courses.map((course) => {
    const progress = getCourseProgress(course.id);
    const completedLessons = progress.completedLessons.length;
    const totalLessons = 10;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return {
      ...course,
      progress: Math.min(progressPercent, 100),
      completedLessons,
      totalLessons,
    };
  });

  const inProgressCourses = coursesWithProgress.filter(
    (c) => c.progress > 0 && c.progress < 100
  );
  const completedCourses = coursesWithProgress.filter((c) => c.progress === 100);

  const passedTests = Object.values(allTestAttempts).filter((a: any) => a.passed).length;
  const totalCertificates = allCertificates.length;

  const pendingTests = coursesWithProgress.filter(c => {
    const courseId = c.id.toString();
    const attempt = (allTestAttempts as Record<string, any>)[courseId];
    return c.progress === 100 && (!attempt || !attempt.passed);
  });

  const pendingProjects = coursesWithProgress.filter(c => {
    const courseId = c.id.toString();
    const submission = (allSubmissions as Record<string, any>)[courseId];
    return c.progress === 100 && c.projectRequired && !submission;
  });

  const learningStatus = getLearningLevel(completedCourses.length, passedTests);
  const motivationalMessage = getMotivationalMessage(inProgressCourses.length, completedCourses.length);

  const allSkills = allCertificates.reduce((acc: string[], cert: any) => {
    if (cert.skills) {
      return [...acc, ...cert.skills];
    }
    return acc;
  }, []);
  const uniqueSkills = Array.from(new Set(allSkills)).slice(0, 8);

  const stats = [
    {
      title: "Credits",
      value: creditsLoading ? "..." : balance,
      icon: Coins,
      color: "text-amber-500",
      href: "/courses",
    },
    {
      title: "In Progress",
      value: inProgressCourses.length,
      icon: BookOpen,
      color: "text-blue-500",
      href: "/courses",
    },
    {
      title: "Completed",
      value: completedCourses.length,
      icon: CheckCircle,
      color: "text-green-500",
      href: "/courses",
    },
    {
      title: "Certificates",
      value: totalCertificates,
      icon: Award,
      color: "text-yellow-500",
      href: "/shishya/certificates",
    },
    {
      title: "Tests Passed",
      value: passedTests,
      icon: ClipboardCheck,
      color: "text-purple-500",
      href: "/shishya/certificates",
    },
  ];

  const quickLinks = [
    { title: "Courses", icon: BookOpen, href: "/courses" },
    { title: "Projects", icon: FolderOpen, href: "/shishya/projects" },
    { title: "Tests", icon: ClipboardCheck, href: "/shishya/tests" },
    { title: "Labs", icon: Code2, href: "/shishya/labs" },
    { title: "Certificates", icon: Award, href: "/shishya/certificates" },
    { title: "Portfolio", icon: User, href: "/shishya/profile/portfolio-preview" },
  ];

  if (coursesLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </Layout>
    );
  }

  const activeCourse = inProgressCourses[0];
  const hasPendingActions = pendingTests.length > 0 || pendingProjects.length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* ZONE 1: Welcome & Status */}
        <motion.div 
          className="mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-welcome"
                >
                  Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                </h1>
                <Badge variant={learningStatus.variant} data-testid="badge-learning-level">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {learningStatus.level}
                </Badge>
              </div>
              <p className="text-muted-foreground" data-testid="text-motivational">
                {motivationalMessage}
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid={`quick-link-${link.title.toLowerCase()}`}
                  >
                    <link.icon className="w-4 h-4 mr-1.5" />
                    {link.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ZONE 2: Learning Snapshot (Metrics) */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={staggerItem}>
              <Link href={stat.href}>
                <Card 
                  className="hover-elevate cursor-pointer transition-all"
                  data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                        <p className="text-2xl sm:text-3xl font-bold mt-0.5">{stat.value}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ZONE 3: Primary Action */}
        <motion.div 
          className="mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          {activeCourse ? (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Continue Learning</span>
                    </div>
                    <h2 
                      className="text-xl font-bold mb-3 truncate"
                      data-testid="text-active-course"
                    >
                      {activeCourse.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <Progress value={activeCourse.progress} className="flex-1 h-2 max-w-xs" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {activeCourse.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {activeCourse.completedLessons} of {activeCourse.totalLessons} lessons completed
                    </p>
                  </div>
                  <Link href={`/shishya/learn/${activeCourse.id}`}>
                    <Button size="lg" data-testid="button-continue-learning">
                      <Play className="w-4 h-4 mr-2" />
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : hasPendingActions ? (
            <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Complete Pending Actions</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      You have {pendingTests.length + pendingProjects.length} pending items
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Complete tests and submit projects to earn certificates.
                    </p>
                  </div>
                  <Link href={pendingTests.length > 0 ? `/shishya/tests/${pendingTests[0].id}` : `/shishya/projects/${pendingProjects[0].id}`}>
                    <Button size="lg" variant="outline" data-testid="button-complete-pending">
                      Take Action
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Start Learning</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      Your learning journey begins here
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Browse our courses and start building real-world skills today.
                    </p>
                  </div>
                  <Link href="/courses">
                    <Button size="lg" data-testid="button-browse-courses">
                      Browse Courses
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* ZONE 4: Pending Actions */}
          <motion.div variants={staggerItem}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  Pending Actions
                </CardTitle>
                {(pendingTests.length > 0 || pendingProjects.length > 0) && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingTests.length + pendingProjects.length} items
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingTests.length === 0 && pendingProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      You're all caught up!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No pending actions right now.
                    </p>
                  </div>
                ) : (
                  <>
                    {pendingTests.map((course) => (
                      <Link 
                        key={`test-${course.id}`} 
                        href={`/shishya/tests/${course.id}`}
                        className="block"
                      >
                        <div 
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                          data-testid={`pending-test-${course.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                              <ClipboardCheck className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">Take Test</p>
                              <p className="text-xs text-muted-foreground truncate">{course.title}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                    {pendingProjects.map((course) => (
                      <Link 
                        key={`project-${course.id}`} 
                        href={`/shishya/projects/${course.id}`}
                        className="block"
                      >
                        <div 
                          className="flex items-center justify-between gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                          data-testid={`pending-project-${course.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                              <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">Submit Project</p>
                              <p className="text-xs text-muted-foreground truncate">{course.title}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ZONE 5: Achievements & Proof */}
          <motion.div variants={staggerItem} className="space-y-6">
            {/* Recent Certificates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Recent Certificates
                </CardTitle>
                {totalCertificates > 0 && (
                  <Link href="/shishya/certificates">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {allCertificates.length > 0 ? (
                  <div className="space-y-2">
                    {allCertificates.slice(0, 3).map((cert: any) => (
                      <Link 
                        key={cert.certificateId} 
                        href={`/shishya/certificates/${cert.certificateId}`}
                        className="block"
                      >
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                          data-testid={`certificate-${cert.certificateId}`}
                        >
                          <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30">
                            <Award className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{cert.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      Complete courses and pass tests to earn certificates.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Gained */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Skills Gained
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uniqueSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary"
                        className="text-xs"
                        data-testid={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Skills will appear here as you complete courses.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
