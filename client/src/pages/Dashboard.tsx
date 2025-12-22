import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  Clock,
  AlertCircle,
  TrendingUp,
  Beaker
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseProgress, getCompletedLessonsCount } from "@/lib/progress";
import { getAllSubmissions } from "@/lib/submissions";
import { getTestAttempts, getAllPassedTests, getPassedTestsCount } from "@/lib/testAttempts";
import { getAllCertificates } from "@/lib/certificates";
import type { Course } from "@shared/schema";

interface CourseWithProgress extends Course {
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export default function Dashboard() {
  const { user } = useAuth();

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
  const notStartedCourses = coursesWithProgress.filter((c) => c.progress === 0);

  const pendingTests = Object.keys(allTestAttempts).length === 0 
    ? courses.length 
    : courses.length - Object.keys(allTestAttempts).length;
  
  const pendingProjects = Object.keys(allSubmissions).length === 0
    ? courses.length
    : courses.length - Object.keys(allSubmissions).length;

  const totalCertificates = allCertificates.length;
  const passedTests = Object.values(allTestAttempts).filter((a: any) => a.passed).length;

  const stats = [
    {
      title: "Courses In Progress",
      value: inProgressCourses.length,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "Completed",
      value: completedCourses.length,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Certificates Earned",
      value: totalCertificates,
      icon: Award,
      color: "text-amber-500",
    },
    {
      title: "Tests Passed",
      value: passedTests,
      icon: ClipboardCheck,
      color: "text-purple-500",
    },
  ];

  if (coursesLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-welcome"
          >
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Track your progress, continue learning, and earn certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {inProgressCourses.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Continue Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inProgressCourses.slice(0, 3).map((course) => (
                    <div 
                      key={course.id} 
                      className="flex items-center justify-between gap-4 p-4 rounded-lg border"
                      data-testid={`course-progress-${course.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={course.progress} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {course.progress}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.completedLessons} of {course.totalLessons} lessons completed
                        </p>
                      </div>
                      <Link href={`/shisya/learn/${course.id}`}>
                        <Button size="sm" data-testid={`button-resume-${course.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {inProgressCourses.length === 0 && notStartedCourses.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Start Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    You haven't started any courses yet. Browse our catalog to begin your learning journey.
                  </p>
                  <Link href="/courses">
                    <Button data-testid="button-browse-courses">
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {completedCourses.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Completed Courses
                  </CardTitle>
                  <Badge variant="secondary">{completedCourses.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedCourses.slice(0, 3).map((course) => (
                    <div 
                      key={course.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border"
                      data-testid={`course-completed-${course.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{course.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/shisya/tests/${course.id}`}>
                          <Button variant="outline" size="sm">
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Test
                          </Button>
                        </Link>
                        <Link href={`/shisya/projects/${course.id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingTests > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Tests to take</span>
                    </div>
                    <Badge variant="outline">{pendingTests}</Badge>
                  </div>
                )}
                {pendingProjects > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Projects to submit</span>
                    </div>
                    <Badge variant="outline">{pendingProjects}</Badge>
                  </div>
                )}
                {pendingTests === 0 && pendingProjects === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All caught up! No pending actions.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Recent Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allCertificates.length > 0 ? (
                  <div className="space-y-3">
                    {allCertificates.slice(0, 3).map((cert: any) => (
                      <Link 
                        key={cert.certificateId} 
                        href={`/shisya/certificates/${cert.certificateId}`}
                        className="block"
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer">
                          <Award className="w-5 h-5 text-amber-500" />
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm">{cert.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <Link href="/shisya/certificates">
                      <Button variant="ghost" size="sm" className="w-full">
                        View All Certificates
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Complete courses and pass tests to earn certificates.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-purple-500" />
                  Practice Labs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Reinforce your learning with hands-on coding exercises.
                </p>
                {inProgressCourses.length > 0 ? (
                  <Link href={`/shisya/labs/${inProgressCourses[0].id}`}>
                    <Button variant="outline" className="w-full">
                      <Beaker className="w-4 h-4 mr-2" />
                      Open Labs
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Start a course first
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
