import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect } from "wouter";
import { ArrowRight, CheckCircle2, XCircle, Target, Award, FolderKanban, BookOpen, ClipboardList, FlaskConical } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelBadge } from "@/components/ui/level-badge";
import { DurationBadge } from "@/components/ui/duration-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import type { Course } from "@shared/schema";

export default function CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>();
  
  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

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
            <Link href={`/shisya/learn/${course.id}`}>
              <Button size="lg" className="px-8 gap-2" data-testid="button-start-learning">
                <BookOpen className="w-4 h-4" />
                Start Learning
              </Button>
            </Link>
            {course.testRequired && (
              <Link href={`/shisya/tests/${course.id}`}>
                <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-tests">
                  <ClipboardList className="w-4 h-4" />
                  View Tests
                </Button>
              </Link>
            )}
            {course.projectRequired && (
              <Link href={`/shisya/projects/${course.id}`}>
                <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-projects">
                  <FolderKanban className="w-4 h-4" />
                  View Projects
                </Button>
              </Link>
            )}
            <Link href={`/shisya/labs/${course.id}`}>
              <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-labs">
                <FlaskConical className="w-4 h-4" />
                Practice Labs
              </Button>
            </Link>
          </div>
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
