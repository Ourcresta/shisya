import { useState } from "react";
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
  Briefcase,
  Eye,
  MapPin,
  Calendar,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface JobData {
  job: {
    id: number;
    hrId: number;
    title: string;
    description: string;
    requiredSkills: string | null;
    internshipRequired: boolean;
    minSkillScore: number | null;
    location: string | null;
    salaryRange: string | null;
    jobType: string;
    status: string;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
  };
  hr: {
    name: string;
    companyName: string;
  };
}

interface Application {
  id: number;
  jobId: number;
  studentId: string;
  matchingScore: number | null;
  status: string;
  appliedAt: string;
}

interface JobForm {
  title: string;
  description: string;
  requiredSkills: string;
  internshipRequired: boolean;
  minSkillScore: number;
  location: string;
  salaryRange: string;
  jobType: string;
  status: string;
  deadline: string;
}

const defaultJobForm: JobForm = {
  title: "",
  description: "",
  requiredSkills: "",
  internshipRequired: false,
  minSkillScore: 0,
  location: "",
  salaryRange: "",
  jobType: "full-time",
  status: "active",
  deadline: "",
};

const applicationStatuses = ["applied", "shortlisted", "interviewed", "offered", "hired", "rejected"];

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "closed":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate";
    case "paused":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 no-default-hover-elevate no-default-active-elevate";
    case "closed":
      return "bg-red-500/10 text-red-700 dark:text-red-400 no-default-hover-elevate no-default-active-elevate";
    default:
      return "";
  }
}

function getAppStatusBadgeClass(status: string): string {
  switch (status) {
    case "hired":
    case "offered":
      return "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate";
    case "shortlisted":
    case "interviewed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 no-default-hover-elevate no-default-active-elevate";
    case "rejected":
      return "bg-red-500/10 text-red-700 dark:text-red-400 no-default-hover-elevate no-default-active-elevate";
    default:
      return "";
  }
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score > 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default function GuruJobs() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [form, setForm] = useState<JobForm>(defaultJobForm);
  const [selectedJobIdForApps, setSelectedJobIdForApps] = useState<string>("");

  const { data: jobsData, isLoading } = useQuery<JobData[]>({
    queryKey: ["/api/udyog/admin/jobs"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/udyog/admin/jobs", selectedJobIdForApps, "applications"],
    queryFn: async () => {
      const res = await fetch(`/api/udyog/admin/jobs/${selectedJobIdForApps}/applications`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!selectedJobIdForApps,
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobForm) => {
      const body: any = {
        ...data,
        requiredSkills: data.requiredSkills || null,
        location: data.location || null,
        salaryRange: data.salaryRange || null,
        minSkillScore: data.minSkillScore || 0,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      };
      const res = await apiRequest("POST", "/api/udyog/admin/jobs", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/jobs"] });
      setCreateOpen(false);
      setForm(defaultJobForm);
      toast({ title: "Job created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create job", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: JobForm }) => {
      const body: any = {
        ...data,
        requiredSkills: data.requiredSkills || null,
        location: data.location || null,
        salaryRange: data.salaryRange || null,
        minSkillScore: data.minSkillScore || 0,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
      };
      const res = await apiRequest("PUT", `/api/udyog/admin/jobs/${id}`, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/jobs"] });
      setEditOpen(false);
      setSelectedJob(null);
      toast({ title: "Job updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update job", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/udyog/admin/jobs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/jobs"] });
      setDeleteOpen(false);
      setSelectedJob(null);
      toast({ title: "Job deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete job", description: error.message, variant: "destructive" });
    },
  });

  const updateAppStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/udyog/admin/applications/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/udyog/admin/jobs", selectedJobIdForApps, "applications"] });
      toast({ title: "Application status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
    },
  });

  const filteredJobs = jobsData?.filter((j) =>
    j.job.title.toLowerCase().includes(search.toLowerCase()) ||
    j.hr.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (jobData: JobData) => {
    setSelectedJob(jobData);
    setForm({
      title: jobData.job.title,
      description: jobData.job.description,
      requiredSkills: jobData.job.requiredSkills || "",
      internshipRequired: jobData.job.internshipRequired,
      minSkillScore: jobData.job.minSkillScore || 0,
      location: jobData.job.location || "",
      salaryRange: jobData.job.salaryRange || "",
      jobType: jobData.job.jobType,
      status: jobData.job.status,
      deadline: jobData.job.deadline ? new Date(jobData.job.deadline).toISOString().split("T")[0] : "",
    });
    setEditOpen(true);
  };

  const openDelete = (jobData: JobData) => {
    setSelectedJob(jobData);
    setDeleteOpen(true);
  };

  const renderJobForm = (isEdit: boolean) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={isEdit ? "edit-title" : "create-title"}>Title *</Label>
        <Input
          id={isEdit ? "edit-title" : "create-title"}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Job title"
          data-testid={isEdit ? "input-edit-job-title" : "input-create-job-title"}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-description" : "create-description"}>Description *</Label>
        <Textarea
          id={isEdit ? "edit-description" : "create-description"}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Job description"
          rows={4}
          data-testid={isEdit ? "input-edit-job-description" : "input-create-job-description"}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-skills" : "create-skills"}>Required Skills (comma-separated)</Label>
        <Input
          id={isEdit ? "edit-skills" : "create-skills"}
          value={form.requiredSkills}
          onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
          placeholder="React, Node.js, TypeScript"
          data-testid={isEdit ? "input-edit-job-skills" : "input-create-job-skills"}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-location" : "create-location"}>Location</Label>
          <Input
            id={isEdit ? "edit-location" : "create-location"}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Remote / City, Country"
            data-testid={isEdit ? "input-edit-job-location" : "input-create-job-location"}
          />
        </div>
        <div>
          <Label htmlFor={isEdit ? "edit-salary" : "create-salary"}>Salary Range</Label>
          <Input
            id={isEdit ? "edit-salary" : "create-salary"}
            value={form.salaryRange}
            onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
            placeholder="e.g. 5-10 LPA"
            data-testid={isEdit ? "input-edit-job-salary" : "input-create-job-salary"}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Job Type</Label>
          <Select value={form.jobType} onValueChange={(v) => setForm({ ...form, jobType: v })}>
            <SelectTrigger data-testid={isEdit ? "select-edit-job-type" : "select-create-job-type"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger data-testid={isEdit ? "select-edit-job-status" : "select-create-job-status"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "edit-min-score" : "create-min-score"}>Min Skill Score</Label>
          <Input
            id={isEdit ? "edit-min-score" : "create-min-score"}
            type="number"
            value={form.minSkillScore}
            onChange={(e) => setForm({ ...form, minSkillScore: parseInt(e.target.value) || 0 })}
            data-testid={isEdit ? "input-edit-job-min-score" : "input-create-job-min-score"}
          />
        </div>
        <div>
          <Label htmlFor={isEdit ? "edit-deadline" : "create-deadline"}>Deadline</Label>
          <Input
            id={isEdit ? "edit-deadline" : "create-deadline"}
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            data-testid={isEdit ? "input-edit-job-deadline" : "input-create-job-deadline"}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={isEdit ? "edit-internship-required" : "create-internship-required"}
          checked={form.internshipRequired}
          onCheckedChange={(checked) => setForm({ ...form, internshipRequired: !!checked })}
          data-testid={isEdit ? "checkbox-edit-internship-required" : "checkbox-create-internship-required"}
        />
        <Label htmlFor={isEdit ? "edit-internship-required" : "create-internship-required"}>
          Internship Required
        </Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-jobs-title">
          Job Postings
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-jobs-subtitle">
          Manage job listings, applications, and hiring pipeline
        </p>
      </div>

      <Tabs defaultValue="jobs" data-testid="tabs-jobs">
        <TabsList>
          <TabsTrigger value="jobs" data-testid="tab-jobs">
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">
            <Eye className="w-4 h-4 mr-2" />
            Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-jobs"
              />
            </div>
            <Button
              onClick={() => { setForm(defaultJobForm); setCreateOpen(true); }}
              data-testid="button-create-job"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : filteredJobs && filteredJobs.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((jobData) => (
                      <TableRow key={jobData.job.id} data-testid={`job-row-${jobData.job.id}`}>
                        <TableCell>
                          <span className="font-medium" data-testid={`text-job-title-${jobData.job.id}`}>
                            {jobData.job.title}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`text-job-company-${jobData.job.id}`}>
                          {jobData.hr.companyName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize" data-testid={`badge-job-type-${jobData.job.id}`}>
                            {jobData.job.jobType}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-job-location-${jobData.job.id}`}>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {jobData.job.location || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(jobData.job.status)}
                            className={getStatusBadgeClass(jobData.job.status)}
                            data-testid={`badge-job-status-${jobData.job.id}`}
                          >
                            {jobData.job.status}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-job-deadline-${jobData.job.id}`}>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {jobData.job.deadline
                              ? new Date(jobData.job.deadline).toLocaleDateString()
                              : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(jobData)}
                              data-testid={`button-edit-job-${jobData.job.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(jobData)}
                              data-testid={`button-delete-job-${jobData.job.id}`}
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
            <Card data-testid="empty-jobs">
              <CardContent className="p-8 text-center">
                <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">
                  {search ? "No jobs match your search." : "No job postings yet. Create your first job to get started."}
                </p>
                {!search && (
                  <Button onClick={() => { setForm(defaultJobForm); setCreateOpen(true); }} data-testid="button-create-first-job">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-72">
              <Label>Select Job</Label>
              <Select value={selectedJobIdForApps} onValueChange={setSelectedJobIdForApps}>
                <SelectTrigger data-testid="select-job-for-applications">
                  <SelectValue placeholder="Choose a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobsData?.map((j) => (
                    <SelectItem key={j.job.id} value={String(j.job.id)}>
                      {j.job.title} - {j.hr.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedJobIdForApps ? (
            applicationsLoading ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : applications && applications.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Matching Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id} data-testid={`application-row-${app.id}`}>
                          <TableCell className="font-mono text-sm" data-testid={`text-app-student-${app.id}`}>
                            {app.studentId}
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${getScoreColor(app.matchingScore)}`} data-testid={`text-app-score-${app.id}`}>
                              {app.matchingScore !== null ? `${app.matchingScore}%` : "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`capitalize ${getAppStatusBadgeClass(app.status)}`}
                              data-testid={`badge-app-status-${app.id}`}
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-app-date-${app.id}`}>
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={app.status}
                              onValueChange={(v) => updateAppStatusMutation.mutate({ id: app.id, status: v })}
                            >
                              <SelectTrigger className="w-36" data-testid={`select-app-status-${app.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {applicationStatuses.map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="empty-applications">
                <CardContent className="p-8 text-center">
                  <Eye className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No applications for this job yet.</p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Select a job to view its applications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Posting</DialogTitle>
            <DialogDescription>Fill in the details to create a new job listing.</DialogDescription>
          </DialogHeader>
          {renderJobForm(false)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel-create-job">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.title || !form.description || createMutation.isPending}
              data-testid="button-submit-create-job"
            >
              {createMutation.isPending ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job Posting</DialogTitle>
            <DialogDescription>Update the job listing details.</DialogDescription>
          </DialogHeader>
          {renderJobForm(true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit-job">
              Cancel
            </Button>
            <Button
              onClick={() => selectedJob && updateMutation.mutate({ id: selectedJob.job.id, data: form })}
              disabled={!form.title || !form.description || updateMutation.isPending}
              data-testid="button-submit-edit-job"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedJob?.job.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-job">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedJob && deleteMutation.mutate(selectedJob.job.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-job"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
