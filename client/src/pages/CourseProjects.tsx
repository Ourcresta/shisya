import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProjectCard, ProjectCardSkeleton } from "@/components/project/ProjectCard";
import { isProjectSubmitted } from "@/lib/submissions";
import type { Project, Course } from "@shared/schema";

export default function CourseProjects() {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNum = parseInt(courseId || "0", 10);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/courses", courseId, "projects"],
    enabled: !!course,
  });

  const isLoading = courseLoading || projectsLoading;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Button>
          </Link>

          <div className="space-y-2">
            <h1 
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-page-title"
            >
              Course Projects
            </h1>
            {course && (
              <p className="text-muted-foreground">
                {course.title}
              </p>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                courseId={courseIdNum}
                isSubmitted={isProjectSubmitted(courseIdNum, project.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </Layout>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
        <FolderKanban className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 
        className="text-lg font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        No Projects Available
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        No projects available for this course yet. Check back later!
      </p>
    </div>
  );
}
