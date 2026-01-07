import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  Download, 
  Copy, 
  Check,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Sparkles,
  Star,
  Shield,
  Trophy,
  Coins
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseProgress } from "@/lib/progress";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllSubmissions } from "@/lib/submissions";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { apiRequest } from "@/lib/queryClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Course, MarksheetCourseEntry } from "@shared/schema";

interface MarksheetEntry {
  sno: number;
  courseCode: string;
  courseId: number;
  courseName: string;
  credits: number;
  maxMarks: number;
  obtainedMarks: number;
  testScore: number | null;
  projectStatus: "Submitted" | "Pending" | "N/A";
  labStatus: "Completed" | "Pending" | "N/A";
  grade: string;
  status: "Pass" | "Fail" | "Pending";
}

function calculateGrade(score: number): string {
  if (score >= 90) return "O";
  if (score >= 80) return "A+";
  if (score >= 70) return "A";
  if (score >= 60) return "B+";
  if (score >= 50) return "B";
  if (score >= 40) return "C";
  return "F";
}

function calculateGradePoints(grade: string): number {
  const gradePointMap: Record<string, number> = {
    "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0
  };
  return gradePointMap[grade] || 0;
}

function getClassification(percentage: number): { label: string; variant: "default" | "secondary" | "outline"; color: string } {
  if (percentage >= 75) return { label: "Distinction", variant: "default", color: "text-yellow-400" };
  if (percentage >= 60) return { label: "First Class", variant: "secondary", color: "text-cyan-400" };
  if (percentage >= 50) return { label: "Second Class", variant: "outline", color: "text-blue-400" };
  if (percentage >= 40) return { label: "Pass", variant: "outline", color: "text-green-400" };
  return { label: "Below Pass", variant: "outline", color: "text-red-400" };
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    "O": "text-yellow-400 bg-yellow-500/20 border-yellow-500/50",
    "A+": "text-emerald-400 bg-emerald-500/20 border-emerald-500/50",
    "A": "text-cyan-400 bg-cyan-500/20 border-cyan-500/50",
    "B+": "text-blue-400 bg-blue-500/20 border-blue-500/50",
    "B": "text-purple-400 bg-purple-500/20 border-purple-500/50",
    "C": "text-amber-400 bg-amber-500/20 border-amber-500/50",
    "F": "text-red-400 bg-red-500/20 border-red-500/50",
  };
  return colors[grade] || "text-muted-foreground";
}

function calculateRewardCoins(classification: string, cgpa: number): number {
  const baseCoins: Record<string, number> = {
    "Distinction": 500,
    "First Class": 300,
    "Second Class": 150,
    "Pass": 50,
    "Below Pass": 0
  };
  return Math.floor((baseCoins[classification] || 0) * (cgpa / 10));
}

function generateMarksheetId(userId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const hash = userId.substring(0, 8).toUpperCase();
  return `MS-${year}-${hash}`;
}

export default function Marksheet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const marksheetRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const allTestAttempts = getTestAttempts();
  const allSubmissions = getAllSubmissions();

  const entries: MarksheetEntry[] = courses.map((course, index) => {
    const courseId = course.id.toString();
    const progress = getCourseProgress(course.id);
    const testAttempt = (allTestAttempts as Record<string, any>)[courseId];
    const submission = Object.values(allSubmissions).find((s: any) => s.courseId === course.id);
    
    const testScore = testAttempt?.score ?? null;
    const isPassed = testAttempt?.passed ?? false;
    const courseComplete = progress.completedLessons.length >= 10;
    
    let projectStatus: "Submitted" | "Pending" | "N/A" = "N/A";
    if (course.projectRequired) {
      projectStatus = submission ? "Submitted" : "Pending";
    }

    const grade = testScore !== null ? calculateGrade(testScore) : "-";
    
    let status: "Pass" | "Fail" | "Pending" = "Pending";
    if (testScore !== null) {
      status = isPassed ? "Pass" : "Fail";
    }

    return {
      sno: index + 1,
      courseCode: `CS${100 + course.id}`,
      courseId: course.id,
      courseName: course.title,
      credits: course.creditCost || (course.isFree ? 3 : 5),
      maxMarks: 100,
      obtainedMarks: testScore || 0,
      testScore,
      projectStatus,
      labStatus: courseComplete ? "Completed" : "Pending",
      grade,
      status,
    };
  });

  const completedEntries = entries.filter(e => e.status === "Pass");
  const totalCreditsEarned = completedEntries.reduce((sum, e) => sum + e.credits, 0);
  const totalCoursesCompleted = completedEntries.length;
  
  const validScores = entries.filter(e => e.testScore !== null);
  const averageScore = validScores.length > 0 
    ? validScores.reduce((sum, e) => sum + (e.testScore || 0), 0) / validScores.length 
    : 0;
  
  const totalGradePoints = completedEntries.reduce((sum, e) => sum + calculateGradePoints(e.grade), 0);
  const cgpa = completedEntries.length > 0 ? (totalGradePoints / completedEntries.length).toFixed(2) : "0.00";
  
  const classification = getClassification(averageScore);
  const rewardCoins = calculateRewardCoins(classification.label, parseFloat(cgpa));
  const scholarshipEligible = classification.label === "Distinction" || parseFloat(cgpa) >= 8.5;
  const marksheetId = user?.id ? generateMarksheetId(user.id) : "MS-PENDING";
  const verificationCode = marksheetId.replace("MS-", "").replace(/-/g, "");
  const verificationUrl = `${window.location.origin}/verify/marksheet/code/${verificationCode}`;
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long", 
    year: "numeric"
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const courseData = entries.map(e => ({
        sno: e.sno,
        courseCode: e.courseCode,
        courseId: e.courseId,
        courseName: e.courseName,
        credits: e.credits,
        maxMarks: e.maxMarks,
        obtainedMarks: e.obtainedMarks,
        testScore: e.testScore,
        grade: e.grade,
        projectStatus: e.projectStatus,
        labStatus: e.labStatus,
        status: e.status,
      }));

      return apiRequest("/api/marksheet/generate", {
        method: "POST",
        body: JSON.stringify({
          courseData,
          studentName: user?.email?.split("@")[0] || "Student",
          studentEmail: user?.email || "",
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Marksheet Generated",
        description: "Your official marksheet has been created and saved.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate marksheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Verification link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!marksheetRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(marksheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#020617",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${marksheetId}-marksheet.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your marksheet has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-[600px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <motion.div
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="mb-6">
            <Link href="/shishya/dashboard">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur-lg opacity-50" />
                <div className="relative p-3 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <GraduationCap className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-marksheet-title"
                >
                  Academic Marksheet
                </h1>
                <p className="text-sm text-muted-foreground">
                  Official consolidated grade report
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => generateMutation.mutate()}
                className="gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500"
                disabled={generateMutation.isPending}
                data-testid="button-generate"
              >
                <Sparkles className="w-4 h-4" />
                {generateMutation.isPending ? "Generating..." : "Generate Official"}
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                className="gap-2"
                disabled={downloading}
                data-testid="button-download-pdf"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Generating..." : "Download PDF"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCopyLink}
                className="gap-2"
                data-testid="button-copy-link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <div 
              ref={marksheetRef} 
              className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE0YjhhNiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
              
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative border-2 border-cyan-500/30 rounded-lg p-6 backdrop-blur-sm bg-slate-900/50">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-950 border border-cyan-500/30 rounded-full">
                  <span className="text-xs font-medium text-cyan-400">OFFICIAL DOCUMENT</span>
                </div>

                <div className="text-center border-b border-cyan-500/20 pb-6 mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20">
                      <Award className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 
                      className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      OurShiksha Academy
                    </h2>
                  </div>
                  <p className="text-xs text-cyan-500/70 mb-1">Digital Learning Platform</p>
                  <h3 className="text-lg font-semibold text-white mt-4 tracking-wider">CONSOLIDATED ACADEMIC MARKSHEET</h3>
                  <p className="text-sm text-muted-foreground">Academic Year 2024-25</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span className="text-muted-foreground">Marksheet ID:</span>
                      <span className="font-mono font-medium text-white">{marksheetId}</span>
                    </div>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-white">Student:</span> {user?.email?.split('@')[0] || 'Student'}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-white">Email:</span> {user?.email || 'N/A'}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-white">Program:</span> Full Stack Development
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-white">Issue Date:</span> {issueDate}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-lg shadow-cyan-500/20">
                    <QRCodeSVG 
                      value={verificationUrl} 
                      size={90} 
                      bgColor="#ffffff"
                      fgColor="#020617"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                        <th className="border border-cyan-500/30 px-3 py-3 text-left font-semibold text-cyan-300">S.No</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-left font-semibold text-cyan-300">Code</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-left font-semibold text-cyan-300">Course Name</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-center font-semibold text-cyan-300">Credits</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-center font-semibold text-cyan-300">Max</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-center font-semibold text-cyan-300">Score</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-center font-semibold text-cyan-300">Grade</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-center font-semibold text-cyan-300">Project</th>
                        <th className="border border-cyan-500/30 px-3 py-3 text-center font-semibold text-cyan-300">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr 
                          key={entry.sno} 
                          className="hover:bg-cyan-500/5 transition-colors"
                          data-testid={`row-course-${entry.sno}`}
                        >
                          <td className="border border-cyan-500/20 px-3 py-2 text-center text-muted-foreground">{entry.sno}</td>
                          <td className="border border-cyan-500/20 px-3 py-2 font-mono text-xs text-cyan-400">{entry.courseCode}</td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-white">{entry.courseName}</td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-center text-muted-foreground">{entry.credits}</td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-center text-muted-foreground">100</td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-center font-medium text-white">
                            {entry.testScore !== null ? entry.testScore : '-'}
                          </td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-center">
                            {entry.grade !== "-" ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getGradeColor(entry.grade)}`}>
                                {entry.grade}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-center">
                            {entry.projectStatus === "Submitted" ? (
                              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/50">
                                Done
                              </Badge>
                            ) : entry.projectStatus === "Pending" ? (
                              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/50">
                                Pending
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="border border-cyan-500/20 px-3 py-2 text-center">
                            {entry.status === "Pass" ? (
                              <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Pass
                              </span>
                            ) : entry.status === "Fail" ? (
                              <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                                <XCircle className="w-3.5 h-3.5" />
                                Fail
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 border border-cyan-500/20 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Credits Earned</p>
                    <p className="text-2xl font-bold text-white" data-testid="text-total-credits">{totalCreditsEarned}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Courses Passed</p>
                    <p className="text-2xl font-bold text-white" data-testid="text-courses-passed">{totalCoursesCompleted}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-cyan-400" />
                      <p className="text-xs text-muted-foreground">CGPA</p>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" data-testid="text-cgpa">{cgpa}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-3 h-3 text-yellow-400" />
                      <p className="text-xs text-muted-foreground">Classification</p>
                    </div>
                    <Badge 
                      variant={classification.variant} 
                      className={`mt-1 ${classification.color}`}
                      data-testid="badge-classification"
                    >
                      {classification.label}
                    </Badge>
                  </div>
                  <div className="text-center col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <p className="text-xs text-muted-foreground">Reward Coins</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-400" data-testid="text-reward-coins">{rewardCoins}</p>
                  </div>
                </div>

                {scholarshipEligible && (
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-500/20">
                        <Star className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-300">Scholarship Eligible!</p>
                        <p className="text-xs text-amber-400/70">You qualify for academic scholarships based on your performance.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-cyan-500/20 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-cyan-400" />
                        Verification: <span className="text-cyan-400">{verificationUrl}</span>
                      </p>
                      <p>This is a digitally signed computer-generated document.</p>
                      <p>Verified by Acharya Usha - AI Learning Assistant</p>
                    </div>
                    <div className="text-right">
                      <div className="border-t border-dashed border-muted-foreground/50 pt-2 px-4 inline-block min-w-[180px]">
                        <p className="font-medium text-white">Controller of Examinations</p>
                        <p className="text-xs text-muted-foreground">OurShiksha Academy</p>
                        <p className="text-[10px] text-cyan-400 mt-1 font-mono">Digitally Signed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-6 text-center text-sm text-muted-foreground"
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <p>
            Verify this marksheet at:{" "}
            <a 
              href={verificationUrl}
              className="text-cyan-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {verificationUrl}
            </a>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
