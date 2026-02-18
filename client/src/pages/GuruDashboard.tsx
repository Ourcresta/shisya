import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  FlaskConical,
  ClipboardCheck,
  FolderKanban,
  Plus,
  Users,
  Coins,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalModules: number;
  totalLessons: number;
  totalTests: number;
  totalProjects: number;
  totalLabs: number;
  totalStudents: number;
  activeEnrollments: number;
  totalCreditsDistributed: number;
}

interface RecentCourse {
  id: number;
  title: string;
  level: string;
  status: string;
  createdAt: string;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-12 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

export default function GuruDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/guru/dashboard/stats"],
  });

  const { data: recentCourses, isLoading: coursesLoading } = useQuery<RecentCourse[]>({
    queryKey: ["/api/guru/dashboard/recent-courses"],
  });

  const statCards = stats
    ? [
        {
          title: "Total Courses",
          value: stats.totalCourses,
          description: `${stats.draftCourses} Draft / ${stats.publishedCourses} Published`,
          icon: GraduationCap,
          color: "text-orange-500",
        },
        {
          title: "Modules",
          value: stats.totalModules,
          description: "Course sections",
          icon: BookOpen,
          color: "text-blue-500",
        },
        {
          title: "Lessons",
          value: stats.totalLessons,
          description: "Learning units",
          icon: CheckCircle,
          color: "text-green-500",
        },
        {
          title: "Practice Labs",
          value: stats.totalLabs,
          description: "Hands-on exercises",
          icon: FlaskConical,
          color: "text-violet-500",
        },
        {
          title: "Tests",
          value: stats.totalTests,
          description: "Assessments",
          icon: ClipboardCheck,
          color: "text-purple-500",
        },
        {
          title: "Projects",
          value: stats.totalProjects,
          description: "Capstone assignments",
          icon: FolderKanban,
          color: "text-cyan-500",
        },
      ]
    : [];

  const actionItems = [
    {
      title: "Create Course",
      subtitle: "Add new course content",
      icon: Plus,
      href: "/guru/courses",
      primary: true,
    },
    {
      title: "Manage Students",
      subtitle: "View student records",
      icon: Users,
      href: "/guru/students",
    },
    {
      title: "Create Lab",
      subtitle: "Build coding exercises",
      icon: FlaskConical,
      href: "/guru/labs",
    },
    {
      title: "Create Test",
      subtitle: "Design assessments",
      icon: ClipboardCheck,
      href: "/guru/tests",
    },
    {
      title: "Manage Credits",
      subtitle: "Credit administration",
      icon: Coins,
      href: "/guru/credits",
    },
  ];

  const totalContent = stats
    ? stats.totalModules + stats.totalLessons + stats.totalLabs + stats.totalTests + stats.totalProjects
    : 0;

  const publishedPercent =
    stats && stats.totalCourses > 0
      ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">
          Welcome to OurShiksha Guru. Manage courses, students, and platform settings.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" data-testid="text-system-snapshot">
          System Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsLoading
            ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((card) => (
                <Card key={card.title} data-testid={`stat-${card.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold" data-testid={`value-${card.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" data-testid="text-action-center">
          Action Command Center
        </h2>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {actionItems.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  data-testid={`action-${action.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="border rounded-lg p-4 text-center hover-elevate cursor-pointer">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                        action.primary
                          ? "bg-orange-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <action.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card data-testid="card-student-overview">
          <CardHeader>
            <CardTitle className="text-base">Student Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-6 w-32" />
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold" data-testid="value-total-students">
                    {stats?.totalStudents ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Enrollments</p>
                  <p className="text-3xl font-bold" data-testid="value-active-enrollments">
                    {stats?.activeEnrollments ?? 0}
                  </p>
                </div>
                <div>
                  <Badge variant="secondary" data-testid="badge-credits-distributed">
                    {stats?.totalCreditsDistributed?.toLocaleString() ?? 0} Credits Distributed
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-content-health">
          <CardHeader>
            <CardTitle className="text-base">Content Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-20" />
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm text-muted-foreground">Published vs Draft</p>
                    <p className="text-sm font-medium">{publishedPercent}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${publishedPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {stats?.publishedCourses ?? 0} Published
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stats?.draftCourses ?? 0} Draft
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Content Items</p>
                  <p className="text-3xl font-bold" data-testid="value-total-content">
                    {totalContent}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Modules, lessons, labs, tests, and projects
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <h2 className="text-lg font-semibold" data-testid="text-recent-courses">
            Recent Courses
          </h2>
          <Link href="/guru/courses">
            <Button variant="ghost" size="sm" data-testid="link-view-all-courses">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentCourses && recentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCourses.map((course) => (
              <Card key={course.id} data-testid={`course-card-${course.id}`}>
                <CardContent className="p-4">
                  <p className="font-medium mb-2" data-testid={`course-title-${course.id}`}>
                    {course.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize" data-testid={`course-level-${course.id}`}>
                      {course.level}
                    </Badge>
                    <Badge
                      variant={course.status === "published" ? "default" : "secondary"}
                      className={
                        course.status === "published"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                          : ""
                      }
                      data-testid={`course-status-${course.id}`}
                    >
                      {course.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card data-testid="empty-courses">
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No courses yet. Create your first course to get started.</p>
              <Link href="/guru/courses">
                <Button className="mt-4" data-testid="button-create-first-course">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
