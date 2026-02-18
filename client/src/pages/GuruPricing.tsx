import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Coins,
  DollarSign,
  CreditCard,
  Pencil,
  Check,
  X,
  Cloud,
  BookOpen,
  Gift,
  IndianRupee,
} from "lucide-react";

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
}

export default function GuruPricing() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCreditCost, setEditCreditCost] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCreditAmount, setBulkCreditAmount] = useState("");
  const [setAllFreeOpen, setSetAllFreeOpen] = useState(false);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/guru/courses"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Course> }) => {
      const res = await apiRequest("PUT", `/api/guru/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setEditingId(null);
      toast({ title: "Pricing updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update pricing", description: error.message, variant: "destructive" });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (creditCost: number) => {
      const promises = (courses || []).map((course) =>
        apiRequest("PUT", `/api/guru/courses/${course.id}`, { creditCost })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setBulkOpen(false);
      setBulkCreditAmount("");
      toast({ title: "All courses updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to bulk update", description: error.message, variant: "destructive" });
    },
  });

  const setAllFreeMutation = useMutation({
    mutationFn: async () => {
      const promises = (courses || []).map((course) =>
        apiRequest("PUT", `/api/guru/courses/${course.id}`, { isFree: true, creditCost: 0 })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guru/courses"] });
      setSetAllFreeOpen(false);
      toast({ title: "All courses set to free" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to set all free", description: error.message, variant: "destructive" });
    },
  });

  const startEditing = (course: Course) => {
    setEditingId(course.id);
    setEditCreditCost(String(course.creditCost));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCreditCost("");
  };

  const saveCredits = (courseId: number) => {
    const cost = parseInt(editCreditCost) || 0;
    updateMutation.mutate({ id: courseId, data: { creditCost: cost } });
  };

  const toggleFree = (course: Course) => {
    updateMutation.mutate({
      id: course.id,
      data: { isFree: !course.isFree, creditCost: !course.isFree ? 0 : course.creditCost },
    });
  };

  const totalCourses = courses?.length ?? 0;
  const freeCourses = courses?.filter((c) => c.isFree).length ?? 0;
  const avgCreditCost =
    totalCourses > 0
      ? Math.round((courses?.reduce((sum, c) => sum + c.creditCost, 0) ?? 0) / totalCourses)
      : 0;
  const totalRevenue = courses?.reduce((sum, c) => sum + c.creditCost, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-pricing-title">
            Pricing & Credits
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-pricing-subtitle">
            Manage course pricing and credit governance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setSetAllFreeOpen(true)}
            data-testid="button-set-all-free"
          >
            <Gift className="w-4 h-4 mr-2" />
            Set All Free
          </Button>
          <Button
            onClick={() => setBulkOpen(true)}
            data-testid="button-bulk-update"
          >
            <Coins className="w-4 h-4 mr-2" />
            Bulk Update Credits
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card data-testid="stat-total-courses">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-courses">
                  {totalCourses}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-free-courses">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Free Courses
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <Gift className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-free-courses">
                  {freeCourses}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-avg-credit-cost">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Credit Cost
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <CreditCard className="w-4 h-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-avg-credit-cost">
                  {avgCreditCost}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-total-revenue">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-revenue">
                  {totalRevenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : courses && courses.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credit Cost</TableHead>
                  <TableHead>Free / Paid</TableHead>
                  <TableHead>Price (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} data-testid={`row-pricing-${course.id}`}>
                    <TableCell>
                      <Link href={`/guru/courses/${course.id}`}>
                        <span className="font-medium hover:underline cursor-pointer" data-testid={`link-pricing-course-${course.id}`}>
                          {course.title}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell data-testid={`text-pricing-source-${course.id}`}>
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
                      <Badge
                        variant={course.status === "published" ? "default" : "secondary"}
                        className={
                          course.status === "published"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                            : "no-default-hover-elevate no-default-active-elevate"
                        }
                        data-testid={`badge-pricing-status-${course.id}`}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === course.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={editCreditCost}
                            onChange={(e) => setEditCreditCost(e.target.value)}
                            className="w-20"
                            data-testid={`input-edit-credit-${course.id}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveCredits(course.id)}
                            disabled={updateMutation.isPending}
                            data-testid={`button-save-credit-${course.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                            data-testid={`button-cancel-credit-${course.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span data-testid={`text-credit-cost-${course.id}`}>
                            {course.creditCost}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(course)}
                            data-testid={`button-edit-credit-${course.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={course.isFree}
                          onCheckedChange={() => toggleFree(course)}
                          data-testid={`switch-free-${course.id}`}
                        />
                        <span className="text-sm text-muted-foreground" data-testid={`text-free-label-${course.id}`}>
                          {course.isFree ? "Free" : "Paid"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-price-${course.id}`}>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 text-muted-foreground" />
                        {course.price.toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="empty-pricing">
          <CardContent className="p-8 text-center">
            <Coins className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No courses found. Create courses first to manage pricing.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="text-bulk-dialog-title">Bulk Update Credits</DialogTitle>
            <DialogDescription>Set the same credit cost for all courses</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-credit-amount">Credit Cost</Label>
              <Input
                id="bulk-credit-amount"
                type="number"
                min="0"
                value={bulkCreditAmount}
                onChange={(e) => setBulkCreditAmount(e.target.value)}
                placeholder="Enter credit amount"
                data-testid="input-bulk-credit-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} data-testid="button-cancel-bulk">
              Cancel
            </Button>
            <Button
              onClick={() => bulkUpdateMutation.mutate(parseInt(bulkCreditAmount) || 0)}
              disabled={bulkCreditAmount === "" || bulkUpdateMutation.isPending}
              data-testid="button-submit-bulk"
            >
              {bulkUpdateMutation.isPending ? "Updating..." : "Update All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={setAllFreeOpen} onOpenChange={setSetAllFreeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-set-all-free-dialog-title">Set All Courses Free</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set all courses to free? This will set the credit cost to 0 and mark all courses as free. This action affects {totalCourses} course{totalCourses !== 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-set-all-free">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setAllFreeMutation.mutate()}
              data-testid="button-confirm-set-all-free"
            >
              {setAllFreeMutation.isPending ? "Processing..." : "Set All Free"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
