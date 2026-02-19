import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  FileText,
  Cloud,
  ExternalLink,
  Tag,
  Clock,
  CreditCard,
  Languages,
  Zap,
  Video,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string | null;
  shortDescription: string | null;
  level: string;
  status: string;
  isActive: boolean;
  isFree: boolean;
  creditCost: number;
  duration: string | null;
  testRequired: boolean;
  projectRequired: boolean;
  zohoId: string | null;
  category: string | null;
  thumbnailUrl: string | null;
  language: string | null;
  groupTitle: string | null;
  skills: string | null;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  content: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  orderIndex: number;
  isPreview: boolean;
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: Lesson[];
}

interface ModuleForm {
  title: string;
  description: string;
  orderIndex: number;
}

interface LessonForm {
  title: string;
  content: string;
  videoUrl: string;
  durationMinutes: number;
  orderIndex: number;
  isPreview: boolean;
}

const defaultModuleForm: ModuleForm = { title: "", description: "", orderIndex: 0 };
const defaultLessonForm: LessonForm = { title: "", content: "", videoUrl: "", durationMinutes: 0, orderIndex: 0, isPreview: false };

export default function GuruCourseDetail() {
  const params = useParams();
  const courseId = params.courseId;
  const { toast } = useToast();

  const [openModules, setOpenModules] = useState<Set<number>>(new Set());
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [deleteLessonOpen, setDeleteLessonOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [deleteTargetModule, setDeleteTargetModule] = useState<Module | null>(null);
  const [deleteTargetLesson, setDeleteTargetLesson] = useState<Lesson | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleForm>(defaultModuleForm);
  const [lessonForm, setLessonForm] = useState<LessonForm>(defaultLessonForm);

  const [courseEditOpen, setCourseEditOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", level: "beginner", thumbnailUrl: "", language: "", groupTitle: "" });

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/guru/courses", courseId],
    enabled: !!courseId,
  });

  const { data: modulesData, isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/guru/courses", courseId, "modules"],
    enabled: !!courseId,
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; level: string; thumbnailUrl: string; language: string; groupTitle: string }) => {
      const res = await apiRequest("PUT", `/api/guru/courses/${courseId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setCourseEditOpen(false);
      toast({ title: "Course updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update course", description: error.message, variant: "destructive" });
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async (data: ModuleForm) => {
      const res = await apiRequest("POST", "/api/guru/modules", { ...data, courseId: parseInt(courseId!) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId, "modules"] });
      setModuleDialogOpen(false);
      setModuleForm(defaultModuleForm);
      setEditingModule(null);
      toast({ title: "Module created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create module", description: error.message, variant: "destructive" });
    },
  });

  const updateModuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ModuleForm }) => {
      const res = await apiRequest("PUT", `/api/guru/modules/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId, "modules"] });
      setModuleDialogOpen(false);
      setEditingModule(null);
      setModuleForm(defaultModuleForm);
      toast({ title: "Module updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update module", description: error.message, variant: "destructive" });
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/modules/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId, "modules"] });
      setDeleteModuleOpen(false);
      setDeleteTargetModule(null);
      toast({ title: "Module deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete module", description: error.message, variant: "destructive" });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: LessonForm & { moduleId: number }) => {
      const res = await apiRequest("POST", "/api/guru/lessons", { ...data, courseId: parseInt(courseId!) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId, "modules"] });
      setLessonDialogOpen(false);
      setLessonForm(defaultLessonForm);
      setEditingLesson(null);
      setSelectedModuleId(null);
      toast({ title: "Lesson created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create lesson", description: error.message, variant: "destructive" });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LessonForm }) => {
      const res = await apiRequest("PUT", `/api/guru/lessons/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId, "modules"] });
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setLessonForm(defaultLessonForm);
      toast({ title: "Lesson updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update lesson", description: error.message, variant: "destructive" });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/lessons/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses", courseId, "modules"] });
      setDeleteLessonOpen(false);
      setDeleteTargetLesson(null);
      toast({ title: "Lesson deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete lesson", description: error.message, variant: "destructive" });
    },
  });

  const toggleModule = (id: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateModule = () => {
    setEditingModule(null);
    setModuleForm({ ...defaultModuleForm, orderIndex: (modulesData?.length || 0) });
    setModuleDialogOpen(true);
  };

  const openEditModule = (mod: Module) => {
    setEditingModule(mod);
    setModuleForm({ title: mod.title, description: mod.description || "", orderIndex: mod.orderIndex });
    setModuleDialogOpen(true);
  };

  const openCreateLesson = (moduleId: number) => {
    setEditingLesson(null);
    setSelectedModuleId(moduleId);
    const mod = modulesData?.find((m) => m.id === moduleId);
    setLessonForm({ ...defaultLessonForm, orderIndex: mod?.lessons?.length || 0 });
    setLessonDialogOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setSelectedModuleId(lesson.moduleId);
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      durationMinutes: lesson.durationMinutes || 0,
      orderIndex: lesson.orderIndex,
      isPreview: lesson.isPreview,
    });
    setLessonDialogOpen(true);
  };

  const openEditCourse = () => {
    if (course) {
      setCourseForm({ title: course.title, description: course.description || "", level: course.level, thumbnailUrl: course.thumbnailUrl || "", language: course.language || "", groupTitle: course.groupTitle || "" });
      setCourseEditOpen(true);
    }
  };

  const handleModuleSubmit = () => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data: moduleForm });
    } else {
      createModuleMutation.mutate(moduleForm);
    }
  };

  const handleLessonSubmit = () => {
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, data: lessonForm });
    } else if (selectedModuleId) {
      createLessonMutation.mutate({ ...lessonForm, moduleId: selectedModuleId });
    }
  };

  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Link href="/guru/courses">
          <Button variant="ghost" size="sm" data-testid="button-back-courses">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Courses
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Course not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="breadcrumb-courses">
        <Link href="/guru/courses">
          <span className="hover:underline cursor-pointer">Courses</span>
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{course.title}</span>
      </div>

      <Card data-testid="card-course-info">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-xl" data-testid="text-course-title">{course.title}</CardTitle>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-course-description">
                {course.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {course.zohoId && (
              <Badge variant="outline" className="gap-1 no-default-hover-elevate no-default-active-elevate" data-testid="badge-synced">
                <Cloud className="w-3 h-3" />
                Synced
              </Badge>
            )}
            <Badge
              variant={course.status === "published" ? "default" : "secondary"}
              className={
                course.status === "published"
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                  : ""
              }
              data-testid="badge-course-status"
            >
              {course.status}
            </Badge>
            <Badge variant="outline" className="capitalize" data-testid="badge-course-level">
              {course.level}
            </Badge>
            <Button variant="outline" size="sm" onClick={openEditCourse} data-testid="button-edit-course-info">
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {course.duration && (
              <div className="flex items-center gap-2 text-sm" data-testid="info-duration">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Duration:</span>
                <span>{course.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm" data-testid="info-credits">
              <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Cost:</span>
              <span>{course.isFree ? "Free" : `${course.creditCost} credits`}</span>
            </div>
            {course.category && (
              <div className="flex items-center gap-2 text-sm" data-testid="info-category">
                <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Category:</span>
                <span>{course.category}</span>
              </div>
            )}
            {course.language && (
              <div className="flex items-center gap-2 text-sm" data-testid="info-language">
                <Languages className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Language:</span>
                <span className="uppercase">{course.language}</span>
              </div>
            )}
            {course.testRequired && (
              <div className="flex items-center gap-2 text-sm" data-testid="info-test-required">
                <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Test required</span>
              </div>
            )}
            {course.projectRequired && (
              <div className="flex items-center gap-2 text-sm" data-testid="info-project-required">
                <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Project required</span>
              </div>
            )}
          </div>
          {course.zohoId && (
            <div className="mt-4 p-3 rounded-md border border-dashed" data-testid="info-zoho-sync">
              <div className="flex items-center gap-2 text-sm">
                <Cloud className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">TrainerCentral ID:</span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{course.zohoId}</code>
                <a
                  href={`https://our-shiksha.trainercentral.in`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-trainer-central"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {course.skills && (
                <div className="flex items-center gap-2 text-sm mt-2 flex-wrap">
                  <span className="text-muted-foreground shrink-0">Skills:</span>
                  {course.skills.split(",").map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold" data-testid="text-modules-heading">Modules</h2>
          {modulesData && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate" data-testid="badge-total-modules">
                {modulesData.length} module{modulesData.length !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate" data-testid="badge-total-lessons">
                {modulesData.reduce((sum, m) => sum + m.lessons.length, 0)} lesson{modulesData.reduce((sum, m) => sum + m.lessons.length, 0) !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </div>
        <Button onClick={openCreateModule} data-testid="button-add-module">
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      </div>

      {modulesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : modulesData && modulesData.length > 0 ? (
        <div className="space-y-3">
          {modulesData.map((mod) => (
            <Card key={mod.id} data-testid={`card-module-${mod.id}`}>
              <Collapsible open={openModules.has(mod.id)} onOpenChange={() => toggleModule(mod.id)}>
                <div className="flex items-center justify-between gap-4 p-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 hover-elevate rounded-md p-1 -m-1" data-testid={`trigger-module-${mod.id}`}>
                      {openModules.has(mod.id) ? (
                        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                      )}
                      <BookOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-medium truncate" data-testid={`text-module-title-${mod.id}`}>
                          {mod.title}
                        </p>
                        {mod.description && (
                          <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="ml-auto shrink-0" data-testid={`badge-lesson-count-${mod.id}`}>
                        {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEditModule(mod)} data-testid={`button-edit-module-${mod.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setDeleteTargetModule(mod); setDeleteModuleOpen(true); }}
                      data-testid={`button-delete-module-${mod.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-2 space-y-2">
                    {mod.lessons.length > 0 ? (
                      mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-4 p-3 rounded-md border"
                          data-testid={`row-lesson-${lesson.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" data-testid={`text-lesson-title-${lesson.id}`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {lesson.durationMinutes && (
                                  <span className="text-xs text-muted-foreground">{lesson.durationMinutes} min</span>
                                )}
                                {lesson.videoUrl && (
                                  <Badge variant="outline" className="text-xs gap-1 no-default-hover-elevate no-default-active-elevate" data-testid={`badge-video-${lesson.id}`}>
                                    <Video className="w-3 h-3" />
                                    Video
                                  </Badge>
                                )}
                                {lesson.isPreview && (
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-preview-${lesson.id}`}>
                                    Preview
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)} data-testid={`button-edit-lesson-${lesson.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setDeleteTargetLesson(lesson); setDeleteLessonOpen(true); }}
                              data-testid={`button-delete-lesson-${lesson.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-2" data-testid={`text-no-lessons-${mod.id}`}>
                        No lessons in this module yet.
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateLesson(mod.id)}
                      className="mt-2"
                      data-testid={`button-add-lesson-${mod.id}`}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Lesson
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      ) : (
        <Card data-testid="empty-modules">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No modules yet. Add your first module to structure this course.</p>
            <Button onClick={openCreateModule} data-testid="button-create-first-module">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={courseEditOpen} onOpenChange={setCourseEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-course-dialog-title">Edit Course Info</DialogTitle>
            <DialogDescription>Update course title, description, and level</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div>
              <Label htmlFor="edit-course-title">Title</Label>
              <Input
                id="edit-course-title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                data-testid="input-edit-course-title"
              />
            </div>
            <div>
              <Label htmlFor="edit-course-group-title">Group Title</Label>
              <Input
                id="edit-course-group-title"
                value={courseForm.groupTitle}
                onChange={(e) => setCourseForm({ ...courseForm, groupTitle: e.target.value })}
                placeholder="e.g. Masters in Python"
                data-testid="input-edit-course-group-title"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Courses with the same group title are shown as one card with language options in the catalog.
              </p>
            </div>
            <div>
              <Label htmlFor="edit-course-description">Description</Label>
              <Textarea
                id="edit-course-description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={3}
                data-testid="input-edit-course-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Level</Label>
                <Select value={courseForm.level} onValueChange={(v) => setCourseForm({ ...courseForm, level: v })}>
                  <SelectTrigger data-testid="select-edit-course-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="masters">Masters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select value={courseForm.language} onValueChange={(v) => setCourseForm({ ...courseForm, language: v })}>
                  <SelectTrigger data-testid="select-edit-course-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="kn">Kannada</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="pa">Punjabi</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-course-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-course-thumbnail"
                value={courseForm.thumbnailUrl}
                onChange={(e) => {
                  let url = e.target.value;
                  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
                  if (driveMatch) {
                    url = `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
                  }
                  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
                  if (driveOpenMatch) {
                    url = `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`;
                  }
                  setCourseForm({ ...courseForm, thumbnailUrl: url });
                }}
                placeholder="Paste any image URL or Google Drive link"
                data-testid="input-edit-course-thumbnail"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Google Drive links are auto-converted. Make sure the file is shared as "Anyone with the link".
              </p>
              {courseForm.thumbnailUrl && (
                <div className="mt-2 rounded-md overflow-hidden border aspect-video max-w-[200px] relative bg-muted">
                  <img
                    src={courseForm.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.parentElement?.querySelector('.preview-fallback');
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'block';
                      const fallback = img.parentElement?.querySelector('.preview-fallback');
                      if (fallback) (fallback as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="preview-fallback absolute inset-0 items-center justify-center text-xs text-muted-foreground" style={{ display: 'none' }}>
                    Preview unavailable
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseEditOpen(false)} data-testid="button-cancel-edit-course">
              Cancel
            </Button>
            <Button
              onClick={() => updateCourseMutation.mutate(courseForm)}
              disabled={!courseForm.title || updateCourseMutation.isPending}
              data-testid="button-submit-edit-course"
            >
              {updateCourseMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-module-dialog-title">
              {editingModule ? "Edit Module" : "Add Module"}
            </DialogTitle>
            <DialogDescription>
              {editingModule ? "Update module details" : "Create a new module for this course"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Module title"
                data-testid="input-module-title"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Module description"
                rows={3}
                data-testid="input-module-description"
              />
            </div>
            <div>
              <Label htmlFor="module-order">Order Index</Label>
              <Input
                id="module-order"
                type="number"
                value={moduleForm.orderIndex}
                onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value) || 0 })}
                data-testid="input-module-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)} data-testid="button-cancel-module">
              Cancel
            </Button>
            <Button
              onClick={handleModuleSubmit}
              disabled={!moduleForm.title || createModuleMutation.isPending || updateModuleMutation.isPending}
              data-testid="button-submit-module"
            >
              {(createModuleMutation.isPending || updateModuleMutation.isPending) ? "Saving..." : editingModule ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-lesson-dialog-title">
              {editingLesson ? "Edit Lesson" : "Add Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson ? "Update lesson details" : "Create a new lesson"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Title *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Lesson title"
                data-testid="input-lesson-title"
              />
            </div>
            <div>
              <Label htmlFor="lesson-content">Content</Label>
              <Textarea
                id="lesson-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Lesson content (markdown supported)"
                rows={5}
                data-testid="input-lesson-content"
              />
            </div>
            <div>
              <Label htmlFor="lesson-video-url">Video URL</Label>
              <Input
                id="lesson-video-url"
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                placeholder="https://..."
                data-testid="input-lesson-video-url"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  value={lessonForm.durationMinutes}
                  onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: parseInt(e.target.value) || 0 })}
                  data-testid="input-lesson-duration"
                />
              </div>
              <div>
                <Label htmlFor="lesson-order">Order Index</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  value={lessonForm.orderIndex}
                  onChange={(e) => setLessonForm({ ...lessonForm, orderIndex: parseInt(e.target.value) || 0 })}
                  data-testid="input-lesson-order"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="lesson-is-preview"
                checked={lessonForm.isPreview}
                onCheckedChange={(c) => setLessonForm({ ...lessonForm, isPreview: !!c })}
                data-testid="checkbox-lesson-preview"
              />
              <Label htmlFor="lesson-is-preview" className="cursor-pointer">Available as free preview</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)} data-testid="button-cancel-lesson">
              Cancel
            </Button>
            <Button
              onClick={handleLessonSubmit}
              disabled={!lessonForm.title || createLessonMutation.isPending || updateLessonMutation.isPending}
              data-testid="button-submit-lesson"
            >
              {(createLessonMutation.isPending || updateLessonMutation.isPending) ? "Saving..." : editingLesson ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteModuleOpen} onOpenChange={setDeleteModuleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-module-title">Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTargetModule?.title}"? All lessons in this module will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-module">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetModule && deleteModuleMutation.mutate(deleteTargetModule.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-module"
            >
              {deleteModuleMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteLessonOpen} onOpenChange={setDeleteLessonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-lesson-title">Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTargetLesson?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-lesson">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetLesson && deleteLessonMutation.mutate(deleteTargetLesson.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-lesson"
            >
              {deleteLessonMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
