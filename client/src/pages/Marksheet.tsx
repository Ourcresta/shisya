import { useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GraduationCap, 
  Download, 
  Copy, 
  Check,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  Trophy,
  User
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseProgress } from "@/lib/progress";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllSubmissions } from "@/lib/submissions";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { getProfile } from "@/lib/profile";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Course } from "@shared/schema";
import stampImage from "@assets/ourshiksha_stamp2_1767767723805.png";
import logoImage from "@assets/ChatGPT_Image_Dec_23,_2025,_10_28_31_PM_1767767974982.png";

interface MarksheetEntry {
  sno: number;
  courseCode: string;
  courseId: number;
  courseName: string;
  programName: string;
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
  if (percentage >= 75) return { label: "Distinction", variant: "default", color: "text-amber-600 bg-amber-100 border-amber-300" };
  if (percentage >= 60) return { label: "First Class", variant: "secondary", color: "text-blue-600 bg-blue-100 border-blue-300" };
  if (percentage >= 50) return { label: "Second Class", variant: "outline", color: "text-indigo-600 bg-indigo-100 border-indigo-300" };
  if (percentage >= 40) return { label: "Pass", variant: "outline", color: "text-green-600 bg-green-100 border-green-300" };
  return { label: "Below Pass", variant: "outline", color: "text-red-600 bg-red-100 border-red-300" };
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    "O": "text-amber-700 bg-amber-100 border-amber-400",
    "A+": "text-emerald-700 bg-emerald-100 border-emerald-400",
    "A": "text-teal-700 bg-teal-100 border-teal-400",
    "B+": "text-blue-700 bg-blue-100 border-blue-400",
    "B": "text-indigo-700 bg-indigo-100 border-indigo-400",
    "C": "text-orange-700 bg-orange-100 border-orange-400",
    "F": "text-red-700 bg-red-100 border-red-400",
  };
  return colors[grade] || "text-gray-600";
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
  
  const profile = getProfile();
  const studentPhoto = profile?.profilePhoto || "";

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
      programName: "Full Stack Development",
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
  const totalCoursesCompleted = completedEntries.length;
  
  const validScores = entries.filter(e => e.testScore !== null);
  const averageScore = validScores.length > 0 
    ? validScores.reduce((sum, e) => sum + (e.testScore || 0), 0) / validScores.length 
    : 0;
  
  const totalGradePoints = completedEntries.reduce((sum, e) => sum + calculateGradePoints(e.grade), 0);
  const cgpa = completedEntries.length > 0 ? (totalGradePoints / completedEntries.length).toFixed(2) : "0.00";
  
  const classification = getClassification(averageScore);
  const scholarshipEligible = classification.label === "Distinction" || parseFloat(cgpa) >= 8.5;
  const marksheetId = user?.id ? generateMarksheetId(user.id) : "MS-PENDING";
  const verificationCode = marksheetId.replace("MS-", "").replace(/-/g, "");
  const verificationUrl = `${window.location.origin}/verify/marksheet/code/${verificationCode}`;
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur-lg opacity-50" />
                <div className="relative p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
                  <GraduationCap className="w-7 h-7 text-blue-600" />
                </div>
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold text-slate-800 dark:text-white"
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
              className="relative bg-white p-6 sm:p-8 rounded-xl overflow-hidden shadow-lg border border-slate-200"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
              
              <div className="relative border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-blue-300 rounded-full">
                  <span className="text-xs font-medium text-blue-700">OFFICIAL DOCUMENT</span>
                </div>

                <div className="border-b border-blue-200 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={logoImage} 
                      alt="OurShiksha Logo" 
                      className="w-28 h-28 object-contain rounded-lg shadow-md"
                    />
                    <div className="flex-1 text-center">
                      <h2 
                        className="text-2xl sm:text-3xl font-bold text-slate-800 text-center"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        OurShiksha Academy
                      </h2>
                      <h3 className="text-lg font-semibold text-slate-800 tracking-wider mt-2 text-center">CONSOLIDATED ACADEMIC MARKSHEET</h3>
                    </div>
                    <div className="p-2 bg-white rounded-lg shadow-md border border-slate-200">
                      <QRCodeSVG 
                        value={verificationUrl} 
                        size={80} 
                        bgColor="#ffffff"
                        fgColor="#1e3a5f"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">Marksheet ID:</span> <span className="font-mono">{marksheetId}</span>
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">Student:</span> {user?.email?.split('@')[0] || 'Student'}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">Email:</span> {user?.email || 'N/A'}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">Issue Date:</span> {issueDate}
                    </p>
                  </div>
                  <div className="w-24 h-28 rounded-lg border-2 border-blue-200 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                    {studentPhoto ? (
                      <img 
                        src={studentPhoto} 
                        alt="Student Photo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                        <th className="border border-blue-200 px-2 py-3 text-left font-semibold text-blue-800">S.No</th>
                        <th className="border border-blue-200 px-2 py-3 text-left font-semibold text-blue-800">Code</th>
                        <th className="border border-blue-200 px-2 py-3 text-left font-semibold text-blue-800">Program Name</th>
                        <th className="border border-blue-200 px-2 py-3 text-left font-semibold text-blue-800">Course Name</th>
                        <th className="border border-blue-200 px-2 py-3 text-center font-semibold text-blue-800">Credits</th>
                        <th className="border border-blue-200 px-2 py-3 text-center font-semibold text-blue-800">Max</th>
                        <th className="border border-blue-200 px-2 py-3 text-center font-semibold text-blue-800">Score</th>
                        <th className="border border-blue-200 px-2 py-3 text-center font-semibold text-blue-800">Grade</th>
                        <th className="border border-blue-200 px-2 py-3 text-center font-semibold text-blue-800">Project</th>
                        <th className="border border-blue-200 px-2 py-3 text-center font-semibold text-blue-800">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr 
                          key={entry.sno} 
                          className="hover:bg-blue-50/50 transition-colors"
                          data-testid={`row-course-${entry.sno}`}
                        >
                          <td className="border border-blue-100 px-2 py-2 text-center text-slate-600">{entry.sno}</td>
                          <td className="border border-blue-100 px-2 py-2 font-mono text-xs text-blue-700">{entry.courseCode}</td>
                          <td className="border border-blue-100 px-2 py-2 text-slate-700 text-xs">{entry.programName}</td>
                          <td className="border border-blue-100 px-2 py-2 text-slate-800">{entry.courseName}</td>
                          <td className="border border-blue-100 px-2 py-2 text-center text-slate-600">{entry.credits}</td>
                          <td className="border border-blue-100 px-2 py-2 text-center text-slate-600">100</td>
                          <td className="border border-blue-100 px-2 py-2 text-center font-medium text-slate-800">
                            {entry.testScore !== null ? entry.testScore : '-'}
                          </td>
                          <td className="border border-blue-100 px-2 py-2 text-center">
                            {entry.grade !== "-" ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${getGradeColor(entry.grade)}`}>
                                {entry.grade}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="border border-blue-100 px-2 py-2 text-center">
                            {entry.projectStatus === "Submitted" ? (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-300">
                                Done
                              </Badge>
                            ) : entry.projectStatus === "Pending" ? (
                              <span className="text-xs text-amber-700">
                                Pending
                              </span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="border border-blue-100 px-2 py-2 text-center">
                            {entry.status === "Pass" ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Pass
                              </span>
                            ) : entry.status === "Fail" ? (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                <XCircle className="w-3.5 h-3.5" />
                                Fail
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Courses Passed</p>
                    <p className="text-2xl font-bold text-slate-800" data-testid="text-courses-passed">{totalCoursesCompleted}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3 text-blue-600" />
                      <p className="text-xs text-slate-500">CGPA</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700" data-testid="text-cgpa">{cgpa}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-3 h-3 text-amber-600" />
                      <p className="text-xs text-slate-500">Classification</p>
                    </div>
                    <Badge 
                      variant={classification.variant} 
                      className={`mt-1 ${classification.color}`}
                      data-testid="badge-classification"
                    >
                      {classification.label}
                    </Badge>
                  </div>
                </div>

                {scholarshipEligible && (
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-100">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-800">Scholarship Eligible!</p>
                        <p className="text-xs text-amber-700/70">You qualify for academic scholarships based on your performance.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-blue-200 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-500 mb-2 text-center">Scan to Verify</p>
                      <QRCodeSVG 
                        value={verificationUrl} 
                        size={80} 
                        bgColor="#ffffff"
                        fgColor="#1e3a5f"
                      />
                    </div>
                    <div className="text-right">
                      <div className="relative inline-block">
                        <img 
                          src={stampImage} 
                          alt="OurShiksha Official Stamp" 
                          className="absolute -top-20 left-1/2 -translate-x-1/2 w-24 h-24 object-contain"
                        />
                        <div className="border-t border-dashed border-slate-400 pt-2 px-4 min-w-[180px] mt-8">
                          <p className="font-medium text-slate-800">Controller of Examinations</p>
                          <p className="text-xs text-slate-600">OurShiksha Academy</p>
                          <p className="text-[10px] text-blue-600 mt-1 font-mono">Digitally Signed</p>
                        </div>
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
            Scan the QR code or visit the verification URL to authenticate this marksheet.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
