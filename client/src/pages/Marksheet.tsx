import { useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  XCircle
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseProgress } from "@/lib/progress";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllSubmissions } from "@/lib/submissions";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Course } from "@shared/schema";

interface MarksheetEntry {
  sno: number;
  courseCode: string;
  courseName: string;
  credits: number;
  testScore: number | null;
  projectStatus: "Submitted" | "Pending" | "N/A";
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

function getClassification(percentage: number): { label: string; variant: "default" | "secondary" | "outline" } {
  if (percentage >= 75) return { label: "Distinction", variant: "default" };
  if (percentage >= 60) return { label: "First Class", variant: "secondary" };
  if (percentage >= 40) return { label: "Pass", variant: "outline" };
  return { label: "Below Pass", variant: "outline" };
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

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const allTestAttempts = getTestAttempts();
  const allSubmissions = getAllSubmissions();

  const entries: MarksheetEntry[] = courses.map((course, index) => {
    const courseId = course.id.toString();
    const progress = getCourseProgress(course.id);
    const testAttempt = (allTestAttempts as Record<string, any>)[courseId];
    const submission = (allSubmissions as Record<string, any>)[courseId];
    
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
      courseName: course.title,
      credits: course.creditCost || (course.isFree ? 3 : 5),
      testScore,
      projectStatus,
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
  const marksheetId = user?.id ? generateMarksheetId(user.id) : "MS-PENDING";
  const verificationUrl = `${window.location.origin}/verify/marksheet/${marksheetId}`;
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long", 
    year: "numeric"
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
        backgroundColor: "#ffffff",
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
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-[600px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
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
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)" }}
                  data-testid="text-marksheet-title"
                >
                  Academic Marksheet
                </h1>
                <p className="text-sm text-muted-foreground">
                  Consolidated grade report for all courses
                </p>
              </div>
            </div>
            <div className="flex gap-2">
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
            <div ref={marksheetRef} className="bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-lg border shadow-sm">
              <div className="border-2 border-gray-300 dark:border-gray-700 p-6">
                <div className="text-center border-b-2 border-gray-300 dark:border-gray-700 pb-4 mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Award className="w-8 h-8 text-primary" />
                    <h2 
                      className="text-xl sm:text-2xl font-bold text-primary"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      OurShiksha Academy
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Digital Learning Platform</p>
                  <h3 className="text-lg font-semibold mt-3">OFFICIAL ACADEMIC MARKSHEET</h3>
                  <p className="text-sm text-muted-foreground">Academic Year 2024-25</p>
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1.5 text-sm">
                    <p><span className="font-medium">Marksheet ID:</span> {marksheetId}</p>
                    <p><span className="font-medium">Student Name:</span> {user?.email?.split('@')[0] || 'Student'}</p>
                    <p><span className="font-medium">Email:</span> {user?.email || 'N/A'}</p>
                    <p><span className="font-medium">Program:</span> Full Stack Development</p>
                    <p><span className="font-medium">Issue Date:</span> {issueDate}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <QRCodeSVG value={verificationUrl} size={80} />
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left font-semibold">S.No</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left font-semibold">Course Code</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left font-semibold">Course Name</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center font-semibold">Credits</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center font-semibold">Score</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center font-semibold">Grade</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center font-semibold">Project</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr 
                          key={entry.sno} 
                          className="hover:bg-muted/30 dark:hover:bg-gray-800/50"
                          data-testid={`row-course-${entry.sno}`}
                        >
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{entry.sno}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 font-mono text-xs">{entry.courseCode}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">{entry.courseName}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{entry.credits}</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">
                            {entry.testScore !== null ? `${entry.testScore}%` : '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center font-semibold">
                            {entry.grade}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">
                            {entry.projectStatus === "Submitted" ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                Submitted
                              </Badge>
                            ) : entry.projectStatus === "Pending" ? (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                Pending
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">
                            {entry.status === "Pass" ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Pass
                              </span>
                            ) : entry.status === "Fail" ? (
                              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 dark:bg-gray-800/30 rounded-lg mb-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Credits</p>
                    <p className="text-xl font-bold" data-testid="text-total-credits">{totalCreditsEarned}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Courses Passed</p>
                    <p className="text-xl font-bold" data-testid="text-courses-passed">{totalCoursesCompleted}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">CGPA</p>
                    <p className="text-xl font-bold" data-testid="text-cgpa">{cgpa}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Classification</p>
                    <Badge variant={classification.variant} className="mt-1" data-testid="badge-classification">
                      {classification.label}
                    </Badge>
                  </div>
                </div>

                <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="text-xs text-muted-foreground">
                      <p>Verification: {verificationUrl}</p>
                      <p className="mt-1">This is a computer-generated document.</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="border-t border-gray-400 dark:border-gray-600 pt-1 inline-block min-w-[150px]">
                        <p className="font-medium">Controller of Examinations</p>
                        <p className="text-xs text-muted-foreground">OurShiksha Academy</p>
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
              className="text-primary hover:underline"
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
