import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Eye,
  ShieldCheck,
  BookOpen,
  Coins,
  Award,
  ClipboardCheck,
  FolderKanban,
} from "lucide-react";

interface StudentProfile {
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
}

interface StudentCredits {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface StudentData {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  profile: StudentProfile | null;
  credits: StudentCredits | null;
  enrollmentCount: number;
}

interface StudentDetail extends StudentData {
  enrollments: Array<{ id: number; courseId: number; userId: string }>;
  progressCount: number;
  testAttempts: Array<{ id: number }>;
  projectSubmissions: Array<{ id: number }>;
  certificates: Array<{ id: number }>;
}

export default function GuruStudents() {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const url = search
    ? `/api/guru/students?search=${encodeURIComponent(search)}`
    : "/api/guru/students";

  const { data: students, isLoading } = useQuery<StudentData[]>({
    queryKey: [url],
  });

  const { data: studentDetail, isLoading: detailLoading } = useQuery<StudentDetail>({
    queryKey: ["/api/guru/students", selectedStudentId],
    enabled: !!selectedStudentId && detailOpen,
  });

  const totalStudents = students?.length ?? 0;
  const verifiedCount = students?.filter((s) => s.emailVerified).length ?? 0;
  const totalEnrollments = students?.reduce((sum, s) => sum + s.enrollmentCount, 0) ?? 0;

  const openDetail = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedStudentId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-students-title">
          Students
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-students-subtitle">
          Manage and view all registered students
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-students"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card data-testid="stat-total-students">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-students">
                  {totalStudents}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-verified-students">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Verified
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-verified-students">
                  {verifiedCount}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="stat-total-enrollments">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Enrollments
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="value-total-enrollments">
                  {totalEnrollments}
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
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : students && students.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Credits Balance</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium" data-testid={`text-student-name-${student.id}`}>
                          {student.profile?.fullName || "No name"}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-student-email-${student.id}`}>
                          {student.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-student-username-${student.id}`}>
                      {student.profile?.username || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.emailVerified ? "default" : "secondary"}
                        className={
                          student.emailVerified
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                            : ""
                        }
                        data-testid={`badge-verified-${student.id}`}
                      >
                        {student.emailVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-credits-${student.id}`}>
                      {student.credits?.balance ?? 0}
                    </TableCell>
                    <TableCell data-testid={`text-enrollments-${student.id}`}>
                      {student.enrollmentCount}
                    </TableCell>
                    <TableCell data-testid={`text-joined-${student.id}`}>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetail(student.id)}
                        data-testid={`button-view-student-${student.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card data-testid="empty-students">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search ? "No students match your search." : "No students registered yet."}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={detailOpen} onOpenChange={(open) => { if (!open) closeDetail(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-student-detail-title">Student Details</DialogTitle>
            <DialogDescription>View student information and progress</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ) : studentDetail ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-medium text-lg" data-testid="text-detail-name">
                    {studentDetail.profile?.fullName || "No name"}
                  </p>
                  <Badge
                    variant={studentDetail.emailVerified ? "default" : "secondary"}
                    className={
                      studentDetail.emailVerified
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 no-default-hover-elevate no-default-active-elevate"
                        : ""
                    }
                    data-testid="badge-detail-verified"
                  >
                    {studentDetail.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-detail-email">
                  {studentDetail.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <Coins className="w-4 h-4 text-yellow-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Credits</p>
                    <p className="font-semibold" data-testid="text-detail-credits">
                      {studentDetail.credits?.balance ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Enrollments</p>
                    <p className="font-semibold" data-testid="text-detail-enrollments">
                      {studentDetail.enrollments?.length ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <ClipboardCheck className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Test Attempts</p>
                    <p className="font-semibold" data-testid="text-detail-test-attempts">
                      {studentDetail.testAttempts?.length ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <FolderKanban className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Project Submissions</p>
                    <p className="font-semibold" data-testid="text-detail-project-submissions">
                      {studentDetail.projectSubmissions?.length ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <Award className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Certificates</p>
                    <p className="font-semibold" data-testid="text-detail-certificates">
                      {studentDetail.certificates?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
