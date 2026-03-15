import { useState, useMemo } from "react";
import { Link } from "wouter";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Search,
  Pencil,
  Trash2,
  Globe,
  GlobeLock,
  GraduationCap,
  Eye,
  Cloud,
  Layers,
  Clock,
  X,
  BookOpen,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface Course {
  id: number;
  title: string;
  description: string | null;
  shortDescription: string | null;
  level: string;
  duration: string | null;
  skills: string | null;
  status: string;
  isActive: boolean;
  isFree: boolean;
  creditCost: number;
  price: number;
  testRequired: boolean;
  projectRequired: boolean;
  createdAt: string;
  zohoId: string | null;
  category: string | null;
  rating: number | null;
  totalStudents: number | null;
}

interface CourseForm {
  title: string;
  description: string;
  level: string;
  duration: string;
  creditCost: number;
  isFree: boolean;
  testRequired: boolean;
  projectRequired: boolean;
  skills: string;
  rating: number;
  totalStudents: number;
}

interface CourseGroupData {
  id: number;
  name: string;
  description: string | null;
  level: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  courseCount: number;
  courses: Course[];
  aggregatedSkills: string;
  totalDuration: string | null;
}

interface GroupForm {
  name: string;
  description: string;
  level: string;
  courseIds: number[];
}

const defaultForm: CourseForm = {
  title: "",
  description: "",
  level: "beginner",
  duration: "",
  creditCost: 0,
  isFree: false,
  testRequired: false,
  projectRequired: false,
  skills: "",
  rating: 0,
  totalStudents: 0,
};

const defaultGroupForm: GroupForm = {
  name: "",
  description: "",
  level: "beginner",
  courseIds: [],
};

export default function GuruCourses() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(defaultForm);
  const [publishAction, setPublishAction] = useState<"publish" | "unpublish">("publish");

  const [groupCreateOpen, setGroupCreateOpen] = useState(false);
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const [groupDeleteOpen, setGroupDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CourseGroupData | null>(null);
  const [groupForm, setGroupForm] = useState<GroupForm>(defaultGroupForm);
  const [groupSearch, setGroupSearch] = useState("");
  const [coursePickerSearch, setCoursePickerSearch] = useState("");

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/guru/courses"],
  });

  const { data: courseGroups, isLoading: groupsLoading } = useQuery<CourseGroupData[]>({
    queryKey: ["/api/guru/course-groups"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CourseForm) => {
      const res = await apiRequest("POST", "/api/guru/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/recent-courses"] });
      setCreateOpen(false);
      setForm(defaultForm);
      toast({ title: "Course created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create course", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CourseForm }) => {
      const res = await apiRequest("PUT", `/api/guru/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/recent-courses"] });
      setEditOpen(false);
      setSelectedCourse(null);
      toast({ title: "Course updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update course", description: error.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "publish" | "unpublish" }) => {
      const res = await apiRequest("POST", `/api/guru/courses/${id}/${action}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/recent-courses"] });
      setPublishOpen(false);
      setSelectedCourse(null);
      toast({ title: publishAction === "publish" ? "Course published" : "Course unpublished" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update course status", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/courses/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guru/dashboard/recent-courses"] });
      setDeleteOpen(false);
      setSelectedCourse(null);
      toast({ title: "Course deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete course", description: error.message, variant: "destructive" });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: GroupForm) => {
      const res = await apiRequest("POST", "/api/guru/course-groups", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/course-groups"] });
      setGroupCreateOpen(false);
      setGroupForm(defaultGroupForm);
      toast({ title: "Group created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create group", description: error.message, variant: "destructive" });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GroupForm }) => {
      const res = await apiRequest("PUT", `/api/guru/course-groups/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/course-groups"] });
      setGroupEditOpen(false);
      setSelectedGroup(null);
      toast({ title: "Group updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update group", description: error.message, variant: "destructive" });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/guru/course-groups/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/course-groups"] });
      setGroupDeleteOpen(false);
      setSelectedGroup(null);
      toast({ title: "Group deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete group", description: error.message, variant: "destructive" });
    },
  });

  const filteredCourses = courses?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = courseGroups?.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const selectedCourseObjects = useMemo(() => {
    if (!courses) return [];
    return groupForm.courseIds
      .map(id => courses.find(c => c.id === id))
      .filter(Boolean) as Course[];
  }, [courses, groupForm.courseIds]);

  const autoSkills = useMemo(() => {
    const all = selectedCourseObjects
      .flatMap(c => (c.skills || "").split(",").map(s => s.trim()).filter(Boolean));
    return Array.from(new Set(all));
  }, [selectedCourseObjects]);

  const autoDuration = useMemo(() => {
    const total = selectedCourseObjects.reduce((sum, c) => {
      if (!c.duration) return sum;
      const match = c.duration.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
    return total > 0 ? `${total} hours` : "N/A";
  }, [selectedCourseObjects]);

  const availableCoursesForPicker = useMemo(() => {
    if (!courses) return [];
    return courses
      .filter(c => !groupForm.courseIds.includes(c.id))
      .filter(c => c.title.toLowerCase().includes(coursePickerSearch.toLowerCase()));
  }, [courses, groupForm.courseIds, coursePickerSearch]);

  const openEdit = (course: Course) => {
    setSelectedCourse(course);
    setForm({
      title: course.title,
      description: course.description || "",
      level: course.level,
      duration: course.duration || "",
      creditCost: course.creditCost,
      isFree: course.isFree,
      testRequired: course.testRequired,
      projectRequired: course.projectRequired,
      skills: course.skills || "",
      rating: course.rating ?? 0,
      totalStudents: course.totalStudents ?? 0,
    });
    setEditOpen(true);
  };

  const openPublish = (course: Course, action: "publish" | "unpublish") => {
    setSelectedCourse(course);
    setPublishAction(action);
    setPublishOpen(true);
  };

  const openDelete = (course: Course) => {
    setSelectedCourse(course);
    setDeleteOpen(true);
  };

  const openEditGroup = (group: CourseGroupData) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || "",
      level: group.level,
      courseIds: group.courses.map(c => c.id),
    });
    setCoursePickerSearch("");
    setGroupEditOpen(true);
  };

  const openDeleteGroup = (group: CourseGroupData) => {
    setSelectedGroup(group);
    setGroupDeleteOpen(true);
  };

  const addCourseToGroup = (courseId: number) => {
    if (!groupForm.courseIds.includes(courseId)) {
      setGroupForm({ ...groupForm, courseIds: [...groupForm.courseIds, courseId] });
    }
  };

  const removeCourseFromGroup = (courseId: number) => {
    setGroupForm({ ...groupForm, courseIds: groupForm.courseIds.filter(id => id !== courseId) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-courses-title">
            Courses
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-courses-subtitle">
            Manage all courses and course groups in the platform
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-courses">
          <TabsTrigger value="courses" data-testid="tab-all-courses">
            <BookOpen className="w-4 h-4 mr-2" />
            All Courses
          </TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-group-courses">
            <Layers className="w-4 h-4 mr-2" />
            Group Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-courses"
              />
            </div>
            <Button
              onClick={() => { setForm(defaultForm); setCreateOpen(true); }}
              data-testid="button-create-course"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credit Cost</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id} data-testid={`row-course-${course.id}`}>
                        <TableCell className="text-muted-foreground tabular-nums" data-testid={`text-course-id-${course.id}`}>
                          {course.id}
                        </TableCell>
                        <TableCell>
                          <Link href={`/guru/courses/${course.id}`}>
                            <span className="font-medium hover:underline cursor-pointer" data-testid={`link-course-${course.id}`}>
                              {course.title}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell data-testid={`text-source-${course.id}`}>
                          {course.zohoId ? (
                            <Badge variant="outline" className="gap-1 no-default-hover-elevate no-default-active-elevate">
                              <Cloud className="w-3 h-3" />
                              TrainerCentral
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="no-default-hover-elevate no-default-active-elevate">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize" data-testid={`badge-level-${course.id}`}>
                            {course.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={course.status === "published" ? "default" : "secondary"}
                            className={
                              course.status === "published"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                                : ""
                            }
                            data-testid={`badge-status-${course.id}`}
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-credit-cost-${course.id}`}>
                          {course.isFree ? "Free" : course.creditCost}
                        </TableCell>
                        <TableCell data-testid={`text-created-${course.id}`}>
                          {new Date(course.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/guru/courses/${course.id}`}>
                              <Button variant="ghost" size="icon" data-testid={`button-view-${course.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(course)}
                              data-testid={`button-edit-${course.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {course.status === "published" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openPublish(course, "unpublish")}
                                data-testid={`button-unpublish-${course.id}`}
                              >
                                <GlobeLock className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openPublish(course, "publish")}
                                data-testid={`button-publish-${course.id}`}
                              >
                                <Globe className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(course)}
                              data-testid={`button-delete-${course.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="empty-courses">
              <CardContent className="p-8 text-center">
                <GraduationCap className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {search ? "No courses match your search." : "No courses yet. Create your first course to get started."}
                </p>
                {!search && (
                  <Button onClick={() => { setForm(defaultForm); setCreateOpen(true); }} data-testid="button-create-first-course">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-groups"
              />
            </div>
            <Button
              onClick={() => { setGroupForm(defaultGroupForm); setCoursePickerSearch(""); setGroupCreateOpen(true); }}
              data-testid="button-create-group"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>

          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGroups && filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <Card key={group.id} data-testid={`card-group-${group.id}`} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate" data-testid={`text-group-name-${group.id}`}>
                          {group.name}
                        </CardTitle>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditGroup(group)}
                          data-testid={`button-edit-group-${group.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteGroup(group)}
                          data-testid={`button-delete-group-${group.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="capitalize" data-testid={`badge-group-level-${group.id}`}>
                        {group.level}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" />
                        {group.courseCount} course{group.courseCount !== 1 ? "s" : ""}
                      </span>
                      {group.totalDuration && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {group.totalDuration}
                        </span>
                      )}
                    </div>

                    {group.courses.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Courses</p>
                        <div className="flex flex-col gap-1">
                          {group.courses.map((c, idx) => (
                            <div key={c.id} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground text-xs w-5 text-right">{idx + 1}.</span>
                              <span className="truncate">{c.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {group.aggregatedSkills && (
                      <div className="flex flex-wrap gap-1">
                        {group.aggregatedSkills.split(",").slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                        {group.aggregatedSkills.split(",").length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{group.aggregatedSkills.split(",").length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card data-testid="empty-groups">
              <CardContent className="p-8 text-center">
                <Layers className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {groupSearch ? "No groups match your search." : "No course groups yet. Bundle micro-courses into groups."}
                </p>
                {!groupSearch && (
                  <Button onClick={() => { setGroupForm(defaultGroupForm); setCoursePickerSearch(""); setGroupCreateOpen(true); }} data-testid="button-create-first-group">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Course Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-create-dialog-title">Create Course</DialogTitle>
            <DialogDescription>Add a new course to the platform</DialogDescription>
          </DialogHeader>
          <CourseFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-create">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.title || createMutation.isPending}
              data-testid="button-submit-create"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-dialog-title">Edit Course</DialogTitle>
            <DialogDescription>Update course details</DialogDescription>
          </DialogHeader>
          <CourseFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button
              onClick={() => selectedCourse && updateMutation.mutate({ id: selectedCourse.id, data: form })}
              disabled={!form.title || updateMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish/Unpublish Course Dialog */}
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-publish-dialog-title">
              {publishAction === "publish" ? "Publish Course" : "Unpublish Course"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {publishAction === "publish"
                ? `Are you sure you want to publish "${selectedCourse?.title}"? It will become visible to students.`
                : `Are you sure you want to unpublish "${selectedCourse?.title}"? It will be hidden from students.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-publish">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCourse && publishMutation.mutate({ id: selectedCourse.id, action: publishAction })}
              data-testid="button-confirm-publish"
            >
              {publishMutation.isPending ? "Processing..." : publishAction === "publish" ? "Publish" : "Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-dialog-title">Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This will also delete all modules, lessons, labs, tests, and projects associated with this course. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCourse && deleteMutation.mutate(selectedCourse.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Group Dialog */}
      <Dialog open={groupCreateOpen} onOpenChange={setGroupCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-create-group-dialog-title">Create Course Group</DialogTitle>
            <DialogDescription>Bundle multiple micro-courses into a single group</DialogDescription>
          </DialogHeader>
          <GroupFormFields
            form={groupForm}
            setForm={setGroupForm}
            allCourses={courses || []}
            selectedCourses={selectedCourseObjects}
            availableCourses={availableCoursesForPicker}
            coursePickerSearch={coursePickerSearch}
            setCoursePickerSearch={setCoursePickerSearch}
            autoSkills={autoSkills}
            autoDuration={autoDuration}
            onAddCourse={addCourseToGroup}
            onRemoveCourse={removeCourseFromGroup}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupCreateOpen(false)} data-testid="button-cancel-create-group">
              Cancel
            </Button>
            <Button
              onClick={() => createGroupMutation.mutate(groupForm)}
              disabled={!groupForm.name || groupForm.courseIds.length === 0 || createGroupMutation.isPending}
              data-testid="button-submit-create-group"
            >
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={groupEditOpen} onOpenChange={setGroupEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-edit-group-dialog-title">Edit Course Group</DialogTitle>
            <DialogDescription>Update group details and member courses</DialogDescription>
          </DialogHeader>
          <GroupFormFields
            form={groupForm}
            setForm={setGroupForm}
            allCourses={courses || []}
            selectedCourses={selectedCourseObjects}
            availableCourses={availableCoursesForPicker}
            coursePickerSearch={coursePickerSearch}
            setCoursePickerSearch={setCoursePickerSearch}
            autoSkills={autoSkills}
            autoDuration={autoDuration}
            onAddCourse={addCourseToGroup}
            onRemoveCourse={removeCourseFromGroup}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupEditOpen(false)} data-testid="button-cancel-edit-group">
              Cancel
            </Button>
            <Button
              onClick={() => selectedGroup && updateGroupMutation.mutate({ id: selectedGroup.id, data: groupForm })}
              disabled={!groupForm.name || groupForm.courseIds.length === 0 || updateGroupMutation.isPending}
              data-testid="button-submit-edit-group"
            >
              {updateGroupMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={groupDeleteOpen} onOpenChange={setGroupDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-group-dialog-title">Delete Course Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{selectedGroup?.name}"? The individual courses will not be affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-group">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedGroup && deleteGroupMutation.mutate(selectedGroup.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-group"
            >
              {deleteGroupMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CourseFormFields({
  form,
  setForm,
}: {
  form: CourseForm;
  setForm: (f: CourseForm) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="course-title">Title *</Label>
        <Input
          id="course-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Course title"
          data-testid="input-course-title"
        />
      </div>
      <div>
        <Label htmlFor="course-description">Description</Label>
        <Textarea
          id="course-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Course description"
          rows={3}
          data-testid="input-course-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Level</Label>
          <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
            <SelectTrigger data-testid="select-course-level">
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
          <Label htmlFor="course-duration">Duration</Label>
          <Input
            id="course-duration"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g. 8 weeks"
            data-testid="input-course-duration"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="course-credit-cost">Credit Cost</Label>
        <Input
          id="course-credit-cost"
          type="number"
          value={form.creditCost}
          onChange={(e) => setForm({ ...form, creditCost: parseInt(e.target.value) || 0 })}
          data-testid="input-course-credit-cost"
        />
      </div>
      <div>
        <Label htmlFor="course-skills">Skills (comma-separated)</Label>
        <Input
          id="course-skills"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="e.g. React, Node.js, REST APIs, TypeScript"
          data-testid="input-course-skills"
        />
        {form.skills && (
          <div className="flex flex-wrap gap-1 mt-2">
            {form.skills.split(",").map((skill, i) => skill.trim() && (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill.trim()}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course-rating">Rating (0-5)</Label>
          <Input
            id="course-rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 4.5"
            data-testid="input-course-rating"
          />
        </div>
        <div>
          <Label htmlFor="course-total-students">Total Students</Label>
          <Input
            id="course-total-students"
            type="number"
            min={0}
            value={form.totalStudents}
            onChange={(e) => setForm({ ...form, totalStudents: parseInt(e.target.value) || 0 })}
            placeholder="e.g. 1200"
            data-testid="input-course-total-students"
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="course-is-free"
            checked={form.isFree}
            onCheckedChange={(c) => setForm({ ...form, isFree: !!c })}
            data-testid="checkbox-course-is-free"
          />
          <Label htmlFor="course-is-free" className="cursor-pointer">Free course</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="course-test-required"
            checked={form.testRequired}
            onCheckedChange={(c) => setForm({ ...form, testRequired: !!c })}
            data-testid="checkbox-course-test-required"
          />
          <Label htmlFor="course-test-required" className="cursor-pointer">Test required for completion</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="course-project-required"
            checked={form.projectRequired}
            onCheckedChange={(c) => setForm({ ...form, projectRequired: !!c })}
            data-testid="checkbox-course-project-required"
          />
          <Label htmlFor="course-project-required" className="cursor-pointer">Project required for completion</Label>
        </div>
      </div>
    </div>
  );
}

function GroupFormFields({
  form,
  setForm,
  allCourses,
  selectedCourses,
  availableCourses,
  coursePickerSearch,
  setCoursePickerSearch,
  autoSkills,
  autoDuration,
  onAddCourse,
  onRemoveCourse,
}: {
  form: GroupForm;
  setForm: (f: GroupForm) => void;
  allCourses: Course[];
  selectedCourses: Course[];
  availableCourses: Course[];
  coursePickerSearch: string;
  setCoursePickerSearch: (s: string) => void;
  autoSkills: string[];
  autoDuration: string;
  onAddCourse: (id: number) => void;
  onRemoveCourse: (id: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="group-name">Group Name *</Label>
        <Input
          id="group-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Web Development"
          data-testid="input-group-name"
        />
      </div>
      <div>
        <Label htmlFor="group-description">Description</Label>
        <Textarea
          id="group-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of this course group"
          rows={2}
          data-testid="input-group-description"
        />
      </div>
      <div>
        <Label>Skill Level</Label>
        <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
          <SelectTrigger data-testid="select-group-level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="mastery">Mastery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Courses in Group ({selectedCourses.length})</Label>
        </div>
        {selectedCourses.length > 0 ? (
          <div className="border rounded-lg divide-y">
            {selectedCourses.map((course, idx) => (
              <div key={course.id} className="flex items-center justify-between p-3 gap-3" data-testid={`group-course-item-${course.id}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-muted-foreground w-6 text-center shrink-0">{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs capitalize">{course.level}</Badge>
                      {course.duration && (
                        <span className="text-xs text-muted-foreground">{course.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-8 w-8"
                  onClick={() => onRemoveCourse(course.id)}
                  data-testid={`button-remove-course-${course.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
            No courses added yet. Use the picker below to add courses.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Add Courses</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses to add..."
            value={coursePickerSearch}
            onChange={(e) => setCoursePickerSearch(e.target.value)}
            className="pl-9"
            data-testid="input-course-picker-search"
          />
        </div>
        <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
          {availableCourses.length > 0 ? (
            availableCourses.map(course => (
              <div
                key={course.id}
                className="flex items-center justify-between p-2.5 hover:bg-muted/50 cursor-pointer"
                onClick={() => onAddCourse(course.id)}
                data-testid={`picker-course-${course.id}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{course.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs capitalize">{course.level}</Badge>
                    {course.duration && (
                      <span className="text-xs text-muted-foreground">{course.duration}</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 ml-2" data-testid={`button-add-course-${course.id}`}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            ))
          ) : (
            <p className="p-3 text-sm text-muted-foreground text-center">
              {coursePickerSearch ? "No matching courses found." : "All courses have been added."}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Duration (auto-calculated)</Label>
          <div className="flex items-center gap-2 mt-1.5 p-2.5 border rounded-md bg-muted/30">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm" data-testid="text-auto-duration">{autoDuration}</span>
          </div>
        </div>
        <div>
          <Label>Total Courses</Label>
          <div className="flex items-center gap-2 mt-1.5 p-2.5 border rounded-md bg-muted/30">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm" data-testid="text-total-courses">{selectedCourses.length}</span>
          </div>
        </div>
      </div>

      {autoSkills.length > 0 && (
        <div>
          <Label>Skills (auto-aggregated)</Label>
          <div className="flex flex-wrap gap-1 mt-1.5" data-testid="group-auto-skills">
            {autoSkills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
