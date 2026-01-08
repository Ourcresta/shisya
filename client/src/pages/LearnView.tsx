import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Redirect } from "wouter";
import { 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  ArrowLeft,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Palette,
  Check,
  GraduationCap,
  Coins,
  Target,
  Lightbulb,
  Video,
  ExternalLink,
  LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useCourseProgress } from "@/contexts/ProgressContext";
import { useTheme, themeColors, type ThemeMode } from "@/contexts/ThemeContext";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import { UshaAvatar } from "@/components/usha";
import type { Course, ModuleWithLessons, Lesson, AINotes } from "@shared/schema";

const modeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export default function LearnView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const courseIdNum = parseInt(courseId || "0", 10);
  const lessonIdNum = lessonId ? parseInt(lessonId, 10) : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: modules, isLoading: modulesLoading } = useQuery<ModuleWithLessons[]>({
    queryKey: ["/api/courses", courseId, "modules-with-lessons"],
    enabled: !!course,
  });

  const { completedCount, isLessonCompleted, toggleLessonComplete } = useCourseProgress(courseIdNum);
  const { themeMode, themeColor, setThemeMode, setThemeColor, resolvedMode } = useTheme();
  const { balance } = useCredits();

  const isLoading = courseLoading || modulesLoading;

  if (!isLoading && course && course.status !== "published") {
    return <Redirect to="/" />;
  }

  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const allLessons = modules?.flatMap(m => m.lessons || []) || [];
  const currentLessonIndex = lessonIdNum ? allLessons.findIndex(l => l.id === lessonIdNum) : -1;
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 
    ? allLessons[currentLessonIndex + 1] 
    : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Custom Compact Header */}
      <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-4 flex items-center justify-between gap-4">
          {/* Left: Back + Course Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href={course ? `/courses/${course.id}` : "/shishya/dashboard"}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <h1 
                  className="text-sm font-semibold truncate"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-header-course-title"
                >
                  {course?.title}
                </h1>
              )}
            </div>
          </div>

          {/* Center: Progress Bar (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-xs">
            <Progress value={progressPercent} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {Math.round(progressPercent)}%
            </span>
          </div>

          {/* Right: Credits + Theme + Sidebar Toggle */}
          <div className="flex items-center gap-2">
            {/* Credits Badge */}
            <Link href="/shishya/wallet">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 text-amber-600 dark:text-amber-400"
                data-testid="button-credits"
              >
                <Coins className="w-4 h-4" />
                <span className="font-semibold text-xs">{balance.toLocaleString()}</span>
              </Button>
            </Link>

            {/* Theme Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-theme">
                  <Palette className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  {themeMode === "system" ? <Monitor className="h-4 w-4" /> : resolvedMode === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Mode
                </DropdownMenuLabel>
                {modeOptions.map((mode) => (
                  <DropdownMenuItem
                    key={mode.id}
                    onClick={() => setThemeMode(mode.id)}
                    className="flex items-center justify-between cursor-pointer"
                    data-testid={`menu-theme-mode-${mode.id}`}
                  >
                    <span className="flex items-center gap-2">
                      <mode.icon className="h-4 w-4" />
                      {mode.label}
                    </span>
                    {themeMode === mode.id && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
                <div className="grid grid-cols-3 gap-2 p-2">
                  {themeColors.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setThemeColor(theme.id)}
                      className={`
                        relative flex flex-col items-center gap-1 p-2 rounded-md
                        hover-elevate active-elevate-2 transition-all
                        ${themeColor === theme.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                      `}
                      title={theme.description}
                      data-testid={`button-theme-color-${theme.id}`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="text-xs text-muted-foreground">{theme.name}</span>
                      {themeColor === theme.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-sidebar-toggle"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
            w-80 xl:w-96 border-r bg-card/50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:transform-none
            top-14 lg:top-0 h-[calc(100vh-3.5rem)] lg:h-full
          `}
        >
          {isLoading ? (
            <LearnViewSidebarSkeleton />
          ) : course && modules ? (
            <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-6">
              {/* Course Title & Progress */}
              <div className="space-y-4">
                <h2 
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-course-title"
                >
                  {course.title}
                </h2>

                {/* Progress Indicator */}
                <div className="flex items-center gap-4">
                  <ProgressRing progress={progressPercent} size={56} />
                  <div>
                    <p className="text-sm font-medium" data-testid="text-progress">
                      {completedCount} / {totalLessons} lessons
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progressPercent === 100 ? "Completed!" : "In progress"}
                    </p>
                  </div>
                </div>

                <Progress value={progressPercent} className="h-2" />
              </div>

              {/* Modules Accordion */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Course Content
                </h3>
                
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No modules available yet.
                  </p>
                ) : (
                  <Accordion 
                    type="multiple" 
                    defaultValue={modules.map(m => `module-${m.id}`)}
                    className="space-y-2"
                  >
                    {modules.map((module) => (
                      <ModuleAccordionItem 
                        key={module.id} 
                        module={module} 
                        courseId={courseIdNum}
                        activeLessonId={lessonIdNum}
                        isLessonCompleted={isLessonCompleted}
                        onLessonClick={() => setSidebarOpen(false)}
                      />
                    ))}
                  </Accordion>
                )}
              </div>
            </div>
          ) : null}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="max-w-3xl mx-auto p-4 lg:p-8">
              <Skeleton className="h-48 rounded-lg" />
            </div>
          ) : lessonIdNum ? (
            <LessonContent 
              courseId={courseIdNum}
              lessonId={lessonIdNum}
              courseTitle={course?.title}
              isCompleted={isLessonCompleted(lessonIdNum)}
              onToggleComplete={() => toggleLessonComplete(lessonIdNum)}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
              user={user}
            />
          ) : (
            <div className="max-w-3xl mx-auto p-4 lg:p-8">
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Select a Lesson
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose a lesson from the sidebar to begin learning. 
                    Track your progress as you complete each lesson.
                  </p>
                  
                  {/* Mobile: Show button to open sidebar */}
                  <Button
                    variant="outline"
                    className="lg:hidden mt-4"
                    onClick={() => setSidebarOpen(true)}
                    data-testid="button-open-lessons"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Browse Lessons
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Usha AI Tutor Avatar */}
      {user && lessonIdNum && course && (
        <UshaAvatar
          context={{
            courseId: courseIdNum,
            lessonId: lessonIdNum,
            pageType: "lesson",
            courseTitle: course.title,
          }}
        />
      )}
    </div>
  );
}

interface LessonContentProps {
  courseId: number;
  lessonId: number;
  courseTitle?: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  prevLesson: { id: number; title: string } | null;
  nextLesson: { id: number; title: string } | null;
  user: any;
}

function LessonContent({ 
  courseId, 
  lessonId, 
  isCompleted, 
  onToggleComplete,
  prevLesson,
  nextLesson
}: LessonContentProps) {
  const { data: lesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", lessonId.toString()],
  });

  const { data: aiNotes, isLoading: notesLoading } = useQuery<AINotes | null>({
    queryKey: ["/api/lessons", lessonId.toString(), "notes"],
    enabled: !!lesson,
  });

  const isLoading = lessonLoading || notesLoading;

  if (isLoading) {
    return <LessonContentSkeleton />;
  }

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-8">
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Lesson not found</p>
            <Link href={`/shishya/learn/${courseId}`}>
              <Button variant="outline">Back to Course</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6 pb-24">
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
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
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

      {/* AI Notes / Content */}
      {aiNotes && aiNotes.content && (
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
          <CardContent>
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-80 xl:left-96 bg-background/95 backdrop-blur border-t p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Previous Lesson */}
          {prevLesson ? (
            <Link href={`/shishya/learn/${courseId}/${prevLesson.id}`}>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-prev-lesson">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {/* Mark Complete */}
          <Button
            onClick={onToggleComplete}
            variant={isCompleted ? "secondary" : "default"}
            className="gap-2"
            data-testid="button-mark-complete"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span className="hidden sm:inline">Mark Complete</span>
              </>
            )}
          </Button>

          {/* Next Lesson */}
          {nextLesson ? (
            <Link href={`/shishya/learn/${courseId}/${nextLesson.id}`}>
              <Button variant="default" size="sm" className="gap-2" data-testid="button-next-lesson">
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/shishya/learn/${courseId}`}>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-finish">
                <span className="hidden sm:inline">Finish</span>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface ModuleAccordionItemProps {
  module: ModuleWithLessons;
  courseId: number;
  activeLessonId: number | null;
  isLessonCompleted: (lessonId: number) => boolean;
  onLessonClick?: () => void;
}

function ModuleAccordionItem({ module, courseId, activeLessonId, isLessonCompleted, onLessonClick }: ModuleAccordionItemProps) {
  const lessons = module.lessons || [];
  const completedCount = lessons.filter(l => isLessonCompleted(l.id)).length;

  return (
    <AccordionItem 
      value={`module-${module.id}`}
      className="border rounded-lg overflow-hidden"
      data-testid={`accordion-module-${module.id}`}
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
        <div className="flex-1 text-left space-y-1">
          <p className="font-medium text-sm" data-testid={`text-module-title-${module.id}`}>
            {module.title}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {module.estimatedTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {module.estimatedTime}
              </span>
            )}
            <span>{completedCount}/{lessons.length} completed</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0 pb-2">
        <ul className="space-y-1 px-2">
          {lessons.map((lesson) => (
            <LessonListItem 
              key={lesson.id} 
              lesson={lesson} 
              courseId={courseId}
              isActive={lesson.id === activeLessonId}
              isCompleted={isLessonCompleted(lesson.id)}
              onClick={onLessonClick}
            />
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

interface LessonListItemProps {
  lesson: {
    id: number;
    title: string;
    estimatedTime: string | null;
  };
  courseId: number;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}

function LessonListItem({ lesson, courseId, isActive, isCompleted, onClick }: LessonListItemProps) {
  return (
    <li>
      <Link 
        href={`/shishya/learn/${courseId}/${lesson.id}`}
        onClick={onClick}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group
          ${isActive 
            ? 'bg-primary/10 text-primary' 
            : 'hover-elevate active-elevate-2'
          }
        `}
        data-testid={`link-lesson-${lesson.id}`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${isCompleted && !isActive ? "text-muted-foreground" : ""}`}>
            {lesson.title}
          </p>
          {lesson.estimatedTime && (
            <p className="text-xs text-muted-foreground">{lesson.estimatedTime}</p>
          )}
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'} transition-opacity`} />
      </Link>
    </li>
  );
}

function LessonContentSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
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
    </div>
  );
}

function LearnViewSidebarSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
