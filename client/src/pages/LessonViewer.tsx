import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Target, 
  Lightbulb, 
  Video,
  LinkIcon,
  BookOpen,
  Play
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCourseProgress } from "@/contexts/ProgressContext";
import { UshaAvatar } from "@/components/usha";
import { UshaVideoPlayer } from "@/components/video/UshaVideoPlayer";
import { useAuth } from "@/contexts/AuthContext";
import type { Lesson, AINotes, Course } from "@shared/schema";

function isEmbeddableVideo(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|trainercentral\.com.*\/embed/i.test(url);
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url);
}

function getEmbedUrl(url: string): string {
  if (/youtube\.com\/embed\/[a-zA-Z0-9_-]+/i.test(url)) {
    return url.replace(/^http:/, 'https:');
  }

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}

export default function LessonViewer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const courseIdNum = parseInt(courseId || "0", 10);
  const lessonIdNum = parseInt(lessonId || "0", 10);
  const { user } = useAuth();

  // Use centralized progress context for reactive state
  const { isLessonCompleted, toggleLessonComplete } = useCourseProgress(courseIdNum);
  const isCompleted = isLessonCompleted(lessonIdNum);

  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useQuery<Lesson>({
    queryKey: ["/api/lessons", lessonId],
  });

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: aiNotes, isLoading: notesLoading } = useQuery<AINotes | null>({
    queryKey: ["/api/lessons", lessonId, "notes"],
    enabled: !!lesson,
  });

  const isLoading = lessonLoading || notesLoading;

  const handleToggleComplete = () => {
    toggleLessonComplete(lessonIdNum);
  };

  if (lessonError) {
    return <Redirect to={`/shishya/learn/${courseId}`} />;
  }

  return (
    <Layout>
      {isLoading ? (
        <LessonViewerSkeleton />
      ) : lesson ? (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href={`/shishya/learn/${courseId}`}>
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>

            <Button
              onClick={handleToggleComplete}
              variant={isCompleted ? "secondary" : "default"}
              className="gap-2"
              data-testid="button-mark-complete"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Mark as Completed
                </>
              )}
            </Button>
          </div>

          {/* Lesson Header */}
          <div className="space-y-2">
            <h1 
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-lesson-title"
            >
              {lesson.title}
            </h1>
            {lesson.estimatedTime && (
              <p className="text-muted-foreground">
                Estimated time: {lesson.estimatedTime}
              </p>
            )}
          </div>

          <Separator />

          {/* Objectives */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-objectives">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key Concepts */}
          {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Key Concepts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 list-decimal list-inside" data-testid="list-concepts">
                  {lesson.keyConcepts.map((concept, index) => (
                    <li key={index} className="text-foreground">
                      {concept}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Lesson Content (from TrainerCentral or local) */}
          {lesson.content && lesson.content.length > 50 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Lesson Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                  data-testid="content-lesson"
                />
              </CardContent>
            </Card>
          )}

          {/* AI Notes */}
          {aiNotes && aiNotes.content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  AI Study Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: aiNotes.content }}
                  data-testid="content-ai-notes"
                />
              </CardContent>
            </Card>
          )}

          {/* Video */}
          {lesson.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="w-5 h-5 text-rose-500" />
                  Video Lesson
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEmbeddableVideo(lesson.videoUrl) ? (
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src={getEmbedUrl(lesson.videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={lesson.title}
                      data-testid="video-embed"
                    />
                  </div>
                ) : isDirectVideo(lesson.videoUrl) ? (
                  <UshaVideoPlayer
                    videoUrl={lesson.videoUrl}
                    title={lesson.title}
                  />
                ) : (
                  <a 
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                    data-testid="link-video"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch Video
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Watch on TrainerCentral - for uploaded videos */}
          {lesson.trainerCentralUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="w-5 h-5 text-rose-500" />
                  {lesson.videoUrl ? "Additional Video" : "Video Lesson"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-center text-sm max-w-md">
                    This lesson includes a video hosted on TrainerCentral. Click below to watch it.
                  </p>
                  <a
                    href={lesson.trainerCentralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="button-watch-trainercentral"
                  >
                    <Button className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Watch Video on TrainerCentral
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Resources */}
          {lesson.externalResources && lesson.externalResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="w-5 h-5 text-blue-500" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" data-testid="list-resources">
                  {lesson.externalResources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 pb-8">
            <Link href={`/shishya/learn/${courseId}`}>
              <Button variant="outline" className="gap-2" data-testid="button-back-bottom">
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </Link>

            <Button
              onClick={handleToggleComplete}
              variant={isCompleted ? "secondary" : "default"}
              className="gap-2"
              data-testid="button-mark-complete-bottom"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Completed
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Mark as Completed
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Usha AI Tutor Avatar */}
      {user && lesson && (
        <UshaAvatar
          context={{
            courseId: courseIdNum,
            lessonId: lessonIdNum,
            pageType: "lesson",
            courseTitle: course?.title,
            lessonTitle: lesson.title,
          }}
        />
      )}
    </Layout>
  );
}

function LessonViewerSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-32" />
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
