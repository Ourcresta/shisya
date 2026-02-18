import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
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
};

export default function GuruCourses() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(defaultForm);
  const [publishAction, setPublishAction] = useState<"publish" | "unpublish">("publish");

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/guru/courses"],
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

  const filteredCourses = courses?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-courses-title">
            Courses
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-courses-subtitle">
            Manage all courses in the platform
          </p>
        </div>
        <Button
          onClick={() => { setForm(defaultForm); setCreateOpen(true); }}
          data-testid="button-create-course"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-courses"
        />
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
                  <TableHead>Title</TableHead>
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
                    <TableCell>
                      <Link href={`/guru/courses/${course.id}`}>
                        <span className="font-medium hover:underline cursor-pointer" data-testid={`link-course-${course.id}`}>
                          {course.title}
                        </span>
                      </Link>
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
