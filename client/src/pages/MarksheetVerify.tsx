import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Award,
  Star,
  Trophy,
  Home,
  AlertCircle
} from "lucide-react";
import { slideUp, staggerContainer, staggerItem } from "@/lib/animations";

interface VerificationResponse {
  valid: boolean;
  marksheet?: {
    marksheetId: string;
    studentName: string;
    programName: string;
    academicYear: string;
    totalCredits: number;
    coursesCompleted: number;
    percentage: number;
    grade: string;
    cgpa: string;
    result: string;
    classification: string;
    signedBy: string;
    aiVerifierName: string;
    issuedAt: string;
    status: string;
  };
  error?: string;
}

function getClassificationColor(classification: string): string {
  const colors: Record<string, string> = {
    "Distinction": "text-yellow-400 bg-yellow-500/20 border-yellow-500/50",
    "First Class": "text-cyan-400 bg-cyan-500/20 border-cyan-500/50",
    "Second Class": "text-blue-400 bg-blue-500/20 border-blue-500/50",
    "Pass": "text-green-400 bg-green-500/20 border-green-500/50",
    "Below Pass": "text-red-400 bg-red-500/20 border-red-500/50",
  };
  return colors[classification] || "text-muted-foreground";
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    "O": "text-yellow-400",
    "A+": "text-emerald-400",
    "A": "text-cyan-400",
    "B+": "text-blue-400",
    "B": "text-purple-400",
    "C": "text-amber-400",
    "F": "text-red-400",
  };
  return colors[grade] || "text-muted-foreground";
}

export default function MarksheetVerify() {
  const params = useParams();
  const code = params.code || params.marksheetId;

  const { data, isLoading } = useQuery<VerificationResponse>({
    queryKey: ["/api/marksheet/verify", code],
    queryFn: async () => {
      const response = await fetch(`/api/marksheet/verify/${code}`);
      return response.json();
    },
    enabled: !!code,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const isValid = data?.valid === true;
  const marksheet = data?.marksheet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE0YjhhNiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
      
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto px-4 py-16">
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-display)" }}
            >
              OurShiksha Academy
            </h1>
          </div>
          <p className="text-muted-foreground">Marksheet Verification Portal</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <Card className="border-2 border-cyan-500/30 bg-slate-900/90 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
              
              <CardHeader className="relative border-b border-cyan-500/20 pb-4">
                <div className="flex items-center justify-center gap-3">
                  {isValid ? (
                    <div className="p-2 rounded-full bg-green-500/20">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-red-500/20">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                  )}
                  <CardTitle className={isValid ? "text-green-400" : "text-red-400"}>
                    {isValid ? "Verified Document" : "Verification Failed"}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="relative pt-6">
                {isValid && marksheet ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Marksheet ID</p>
                          <p className="font-mono font-medium text-white" data-testid="text-marksheet-id">{marksheet.marksheetId}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={marksheet.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-red-500/20 text-red-400 border-red-500/50"}
                        data-testid="badge-status"
                      >
                        {marksheet.status === "active" ? "Active" : marksheet.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-muted-foreground mb-1">Student Name</p>
                        <p className="font-medium text-white capitalize" data-testid="text-student-name">{marksheet.studentName}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-muted-foreground mb-1">Program</p>
                        <p className="font-medium text-white">{marksheet.programName}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-muted-foreground mb-1">Academic Year</p>
                        <p className="font-medium text-white" data-testid="text-academic-year">{marksheet.academicYear}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
                        <p className="font-medium text-white">
                          {new Date(marksheet.issuedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 border border-cyan-500/20">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Credits</p>
                        <p className="text-xl font-bold text-white">{marksheet.totalCredits}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Courses</p>
                        <p className="text-xl font-bold text-white">{marksheet.coursesCompleted}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-cyan-400" />
                          <p className="text-xs text-muted-foreground">CGPA</p>
                        </div>
                        <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {marksheet.cgpa}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          <p className="text-xs text-muted-foreground">Grade</p>
                        </div>
                        <p className={`text-xl font-bold ${getGradeColor(marksheet.grade)}`}>
                          {marksheet.grade}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-muted-foreground">Classification:</span>
                        <Badge className={getClassificationColor(marksheet.classification)} data-testid="badge-classification">
                          {marksheet.classification}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground hidden sm:inline">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Result:</span>
                        <Badge 
                          className={marksheet.result === "Pass" 
                            ? "bg-green-500/20 text-green-400 border-green-500/50" 
                            : "bg-red-500/20 text-red-400 border-red-500/50"
                          }
                          data-testid="badge-result"
                        >
                          {marksheet.result}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-cyan-500/20 text-center">
                      <p className="text-xs text-muted-foreground mb-2">
                        Signed by: {marksheet.signedBy}
                      </p>
                      <p className="text-xs text-cyan-400">
                        Verified by: {marksheet.aiVerifierName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-red-500/20 w-fit mx-auto mb-4">
                      <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      {data?.error || "Invalid Verification Code"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      The marksheet could not be verified. Please check the code and try again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <Button variant="outline" className="gap-2" data-testid="button-back-home">
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            For any queries, contact support@ourshiksha.com
          </p>
        </motion.div>
      </div>
    </div>
  );
}
