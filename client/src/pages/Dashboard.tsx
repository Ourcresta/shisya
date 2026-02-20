import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Award, 
  FileText, 
  ClipboardCheck, 
  Play, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  User,
  FolderOpen,
  Trophy,
  Zap,
  Code2,
  Coins,
  GraduationCap,
  Library,
  TrendingUp,
  BarChart3,
  Flame,
  Brain,
  Clock,
  Signal,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer
} from "recharts";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditContext";
import { getCourseProgress } from "@/lib/progress";
import { getPersonalizedRecommendations } from "@/lib/recommendations";
import { getAllSubmissions } from "@/lib/submissions";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllCertificates } from "@/lib/certificates";
import { getLabProgressStore, getAllCompletedLabs } from "@/lib/labProgress";
import { getProfile } from "@/lib/profile";
import type { Course } from "@shared/schema";

interface CourseWithProgress extends Course {
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

function getLearningLevel(completedCourses: number, passedTests: number): { level: string; variant: "default" | "secondary" | "outline" } {
  const score = completedCourses * 2 + passedTests;
  if (score >= 10) return { level: "Advanced", variant: "default" };
  if (score >= 4) return { level: "Intermediate", variant: "secondary" };
  return { level: "Beginner", variant: "outline" };
}

function getMotivationalMessage(inProgress: number, completed: number, pendingCount: number): string {
  if (pendingCount > 0) return `You have ${pendingCount} pending action${pendingCount > 1 ? "s" : ""} — complete them to earn certificates.`;
  if (completed >= 3) return "You're on fire! Keep building those skills.";
  if (inProgress > 0) return "Keep going — you're building real skills.";
  if (completed > 0) return "Great start! Continue your learning journey.";
  return "Your learning journey begins here.";
}

function getFirstName(user: any): string {
  const profile = getProfile();
  if (profile?.fullName) {
    return profile.fullName.split(" ")[0];
  }
  if (user?.email) {
    return user.email.split("@")[0];
  }
  return "";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getLearningStreak(): number {
  try {
    const streakData = localStorage.getItem("shishya_streak");
    if (!streakData) return 0;
    const parsed = JSON.parse(streakData);
    const today = new Date().toDateString();
    if (parsed.lastDate === today) return parsed.count || 1;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (parsed.lastDate === yesterday) return parsed.count || 0;
    return 0;
  } catch {
    return 0;
  }
}

function updateLearningStreak(): void {
  try {
    const today = new Date().toDateString();
    const streakData = localStorage.getItem("shishya_streak");
    if (streakData) {
      const parsed = JSON.parse(streakData);
      if (parsed.lastDate === today) return;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (parsed.lastDate === yesterday) {
        localStorage.setItem("shishya_streak", JSON.stringify({ lastDate: today, count: (parsed.count || 0) + 1 }));
      } else {
        localStorage.setItem("shishya_streak", JSON.stringify({ lastDate: today, count: 1 }));
      }
    } else {
      localStorage.setItem("shishya_streak", JSON.stringify({ lastDate: today, count: 1 }));
    }
  } catch {}
}

function getAIInsight(performanceScore: { overall: number; courseScore: number; testScore: number; certScore: number; level: string }): string {
  if (performanceScore.overall === 0) return "Start a course to activate your AI learning intelligence.";
  
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  if (performanceScore.courseScore >= 70) strengths.push("core subject mastery");
  else if (performanceScore.courseScore < 40) improvements.push("completing more lessons");
  
  if (performanceScore.testScore >= 70) strengths.push("analytical performance");
  else if (performanceScore.testScore < 40) improvements.push("practicing assessments");
  
  if (performanceScore.certScore >= 70) strengths.push("industry credentials");
  else if (performanceScore.certScore < 40) improvements.push("earning certifications");
  
  if (strengths.length > 0 && improvements.length > 0) {
    return `Strong in ${strengths.join(" & ")}. Focus on ${improvements.join(" & ")} to advance your intelligence index.`;
  }
  if (strengths.length > 0) {
    return `Excellent ${strengths.join(" & ")}! You're progressing toward ${performanceScore.level} status.`;
  }
  if (improvements.length > 0) {
    return `Focus on ${improvements.join(" & ")} to boost your index. Every step matters!`;
  }
  return "Consistent learning detected. Your intelligence index is growing steadily.";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { balance, isLoading: creditsLoading } = useCredits();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const allSubmissions = getAllSubmissions();
  const allTestAttempts = getTestAttempts();
  const allCertificates = getAllCertificates();
  const labStore = getLabProgressStore();
  const completedLabs = getAllCompletedLabs();
  const firstName = getFirstName(user);
  const greeting = getGreeting();
  const streak = getLearningStreak();

  updateLearningStreak();

  const [showScoreDetails, setShowScoreDetails] = useState(false);

  const coursesWithProgress: CourseWithProgress[] = courses.map((course) => {
    const progress = getCourseProgress(course.id);
    const completedLessons = progress.completedLessons.length;
    const totalLessons = 10;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return {
      ...course,
      progress: Math.min(progressPercent, 100),
      completedLessons,
      totalLessons,
    };
  });

  const inProgressCourses = coursesWithProgress.filter(
    (c) => c.progress > 0 && c.progress < 100
  );
  const completedCourses = coursesWithProgress.filter((c) => c.progress === 100);

  const passedTests = Object.values(allTestAttempts).filter((a: any) => a.passed).length;
  const totalCertificates = allCertificates.length;

  const pendingTests = coursesWithProgress.filter(c => {
    const courseId = c.id.toString();
    const attempt = (allTestAttempts as Record<string, any>)[courseId];
    return c.progress === 100 && (!attempt || !attempt.passed);
  });

  const pendingProjects = coursesWithProgress.filter(c => {
    const courseId = c.id.toString();
    const submission = (allSubmissions as Record<string, any>)[courseId];
    return c.progress === 100 && c.projectRequired && !submission;
  });

  const pendingLabs = useMemo(() => {
    const labs: { courseId: number; title: string; remaining: number; total: number }[] = [];
    coursesWithProgress.forEach(c => {
      if (c.progress > 0) {
        const courseLabs = labStore[c.id];
        if (courseLabs) {
          const completedCount = Object.values(courseLabs).filter((p: any) => p.completed).length;
          const totalLabs = Object.keys(courseLabs).length;
          if (totalLabs > 0 && completedCount < totalLabs) {
            labs.push({ courseId: c.id, title: c.title, remaining: totalLabs - completedCount, total: totalLabs });
          }
        }
      }
    });
    return labs;
  }, [coursesWithProgress, labStore]);

  const totalPendingActions = pendingTests.length + pendingProjects.length + pendingLabs.length;

  const learningStatus = getLearningLevel(completedCourses.length, passedTests);
  const motivationalMessage = getMotivationalMessage(inProgressCourses.length, completedCourses.length, totalPendingActions);

  const allSkills = allCertificates.reduce((acc: string[], cert: any) => {
    if (cert.skills) {
      return [...acc, ...cert.skills];
    }
    return acc;
  }, []);
  const uniqueSkills = Array.from(new Set(allSkills)).slice(0, 8);

  const competencyScores = useMemo(() => {
    const totalCourses = coursesWithProgress.length;
    if (totalCourses === 0) return null;

    const avgCourseProgress = coursesWithProgress.reduce((s, c) => s + c.progress, 0) / totalCourses;
    const coreMastery = Math.round(avgCourseProgress);

    const totalLabEntries = Object.values(labStore).reduce((sum, courseLabs) => {
      return sum + Object.keys(courseLabs).length;
    }, 0);
    const completedLabCount = completedLabs.length;
    const submittedProjects = Object.keys(allSubmissions).length;
    const totalProjectable = coursesWithProgress.filter(c => c.projectRequired).length;
    const labScore = totalLabEntries > 0 ? (completedLabCount / totalLabEntries) * 100 : 0;
    const projectScore = totalProjectable > 0 ? (submittedProjects / totalProjectable) * 100 : 0;
    const practicalApplication = Math.round((labScore * 0.6 + projectScore * 0.4));

    const testTotal = Object.keys(allTestAttempts).length;
    const analyticalAbility = testTotal > 0 ? Math.round((passedTests / testTotal) * 100) : 0;

    const enrolledCount = coursesWithProgress.filter(c => c.progress > 0).length;
    const digitalSkills = Math.round(totalCourses > 0 ? (enrolledCount / totalCourses) * 100 : 0);

    const industryReadiness = Math.round(totalCourses > 0 ? Math.min((totalCertificates / totalCourses) * 100, 100) : 0);

    return { coreMastery, practicalApplication, analyticalAbility, digitalSkills, industryReadiness };
  }, [coursesWithProgress, labStore, completedLabs, allSubmissions, allTestAttempts, passedTests, totalCertificates]);

  const competencyRadarData = useMemo(() => {
    if (!competencyScores) return [];
    return [
      { category: "Core Mastery", score: competencyScores.coreMastery, fullMark: 100 },
      { category: "Practical", score: competencyScores.practicalApplication, fullMark: 100 },
      { category: "Analytical", score: competencyScores.analyticalAbility, fullMark: 100 },
      { category: "Digital Skills", score: competencyScores.digitalSkills, fullMark: 100 },
      { category: "Industry Ready", score: competencyScores.industryReadiness, fullMark: 100 },
    ];
  }, [competencyScores]);

  const aiSuggestions = useMemo(() => {
    if (!competencyScores) return [];
    const suggestions: { text: string; priority: "high" | "medium" | "low" }[] = [];
    
    if (competencyScores.practicalApplication < 50) {
      suggestions.push({ text: "Complete pending labs to strengthen practical skills", priority: "high" });
    }
    if (competencyScores.analyticalAbility < 40) {
      suggestions.push({ text: "Practice assessments to improve analytical ability", priority: "high" });
    }
    if (competencyScores.industryReadiness < 30) {
      suggestions.push({ text: "Earn certifications to boost industry readiness", priority: "high" });
    }
    if (competencyScores.coreMastery < 60) {
      suggestions.push({ text: "Finish more course lessons to build core mastery", priority: "medium" });
    }
    if (competencyScores.digitalSkills < 50) {
      suggestions.push({ text: "Explore and enroll in more courses", priority: "medium" });
    }
    if (pendingProjects.length > 0) {
      suggestions.push({ text: `Submit ${pendingProjects.length} pending project${pendingProjects.length > 1 ? "s" : ""}`, priority: "medium" });
    }
    if (pendingTests.length > 0) {
      suggestions.push({ text: `Take ${pendingTests.length} pending assessment${pendingTests.length > 1 ? "s" : ""}`, priority: "low" });
    }
    if (suggestions.length === 0) {
      suggestions.push({ text: "Keep up the great work! Continue exploring new courses", priority: "low" });
    }
    return suggestions.slice(0, 4);
  }, [competencyScores, pendingProjects, pendingTests]);

  const weeklyGrowth = useMemo(() => {
    try {
      const data = localStorage.getItem("shishya_weekly_scores");
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          const latest = parsed[parsed.length - 1]?.score || 0;
          const previous = parsed[parsed.length - 2]?.score || 0;
          return latest - previous;
        }
      }
    } catch {}
    return 0;
  }, []);

  const performanceScore = useMemo(() => {
    const courseWeight = 0.4;
    const testWeight = 0.3;
    const certWeight = 0.3;
    
    const courseScore = coursesWithProgress.length > 0
      ? coursesWithProgress.reduce((sum, c) => sum + c.progress, 0) / coursesWithProgress.length
      : 0;
    
    const testTotal = Object.keys(allTestAttempts).length;
    const testScore = testTotal > 0 ? (passedTests / testTotal) * 100 : 0;
    
    const certScore = coursesWithProgress.length > 0
      ? (totalCertificates / coursesWithProgress.length) * 100
      : 0;
    
    const overall = Math.round(
      courseScore * courseWeight + testScore * testWeight + Math.min(certScore, 100) * certWeight
    );

    let level: string;
    let levelColor: string;
    if (overall >= 80) { level = "Distinguished"; levelColor = "text-amber-500"; }
    else if (overall >= 60) { level = "Advanced"; levelColor = "text-emerald-500"; }
    else if (overall >= 40) { level = "Progressing"; levelColor = "text-blue-500"; }
    else if (overall >= 20) { level = "Emerging"; levelColor = "text-violet-500"; }
    else { level = "Beginner"; levelColor = "text-muted-foreground"; }

    return { overall, courseScore: Math.round(courseScore), testScore: Math.round(testScore), certScore: Math.round(Math.min(certScore, 100)), level, levelColor };
  }, [coursesWithProgress, allTestAttempts, passedTests, totalCertificates]);

  const aiInsight = useMemo(() => getAIInsight(performanceScore), [performanceScore]);

  const recommendations = useMemo(() => {
    return getPersonalizedRecommendations(courses, 6);
  }, [courses]);

  useMemo(() => {
    if (performanceScore.overall > 0) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const data = localStorage.getItem("shishya_weekly_scores");
        const scores: { date: string; score: number }[] = data ? JSON.parse(data) : [];
        if (scores.length === 0 || scores[scores.length - 1].date !== today) {
          scores.push({ date: today, score: performanceScore.overall });
          if (scores.length > 7) scores.splice(0, scores.length - 7);
          localStorage.setItem("shishya_weekly_scores", JSON.stringify(scores));
        }
      } catch {}
    }
    return null;
  }, [performanceScore.overall]);

  const stats = [
    {
      title: "Credits",
      value: creditsLoading ? "..." : balance,
      icon: Coins,
      color: "text-amber-500",
      href: "/shishya/wallet",
      subtitle: "Learning Points",
    },
    {
      title: "In Progress",
      value: inProgressCourses.length,
      icon: BookOpen,
      color: "text-blue-500",
      href: "/courses",
      subtitle: inProgressCourses.length > 0 ? `${Math.round(inProgressCourses.reduce((s, c) => s + c.progress, 0) / inProgressCourses.length)}% avg.` : "Start learning",
    },
    {
      title: "Completed",
      value: completedCourses.length,
      icon: CheckCircle,
      color: "text-green-500",
      href: "/courses",
      subtitle: completedCourses.length > 0 ? `${courses.length} total courses` : "Keep going!",
    },
    {
      title: "Certificates",
      value: totalCertificates,
      icon: Award,
      color: "text-yellow-500",
      href: "/shishya/certificates",
      subtitle: totalCertificates > 0 ? "Verified credentials" : "Earn your first",
    },
    {
      title: "Tests Passed",
      value: passedTests,
      icon: ClipboardCheck,
      color: "text-purple-500",
      href: "/shishya/certificates",
      subtitle: passedTests > 0 ? `${Object.keys(allTestAttempts).length} attempted` : "Take a test",
    },
  ];

  const quickLinks = [
    { title: "My Learnings", icon: Library, href: "/shishya/my-learnings" },
    { title: "Courses", icon: BookOpen, href: "/courses" },
    { title: "Projects", icon: FolderOpen, href: "/shishya/projects" },
    { title: "Tests", icon: ClipboardCheck, href: "/shishya/tests" },
    { title: "Labs", icon: Code2, href: "/shishya/labs" },
    { title: "Marksheet", icon: GraduationCap, href: "/shishya/marksheet" },
    { title: "Certificates", icon: Award, href: "/shishya/certificates" },
    { title: "Portfolio", icon: User, href: "/shishya/profile" },
  ];

  if (coursesLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </Layout>
    );
  }

  const activeCourse = inProgressCourses[0];
  const hasPendingActions = totalPendingActions > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        <motion.div 
          className="mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="relative rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold shrink-0">
                {firstName ? firstName.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 
                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                    data-testid="text-welcome"
                  >
                    {greeting}{firstName ? `, ${firstName}` : ''}
                  </h1>
                  <Badge variant={learningStatus.variant} data-testid="badge-learning-level">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {learningStatus.level}
                  </Badge>
                  {streak > 0 && (
                    <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700" data-testid="badge-streak">
                      <Flame className="w-3 h-3 mr-1" />
                      {streak} day streak
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground" data-testid="text-motivational">
                  {motivationalMessage}
                </p>

                <div className="mt-4 bg-muted/50 rounded-lg p-3">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {quickLinks.map((link) => (
                      <Link key={link.title} href={link.href}>
                        <div
                          className="flex flex-col items-center gap-1 cursor-pointer hover-elevate rounded-lg p-2"
                          data-testid={`quick-link-${link.title.toLowerCase()}`}
                        >
                          <div className="p-2 rounded-full bg-background">
                            <link.icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">{link.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={staggerItem}>
              <Link href={stat.href}>
                <Card 
                  className="hover-elevate cursor-pointer transition-all"
                  data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                        <p className="text-2xl sm:text-3xl font-bold mt-0.5">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{stat.subtitle}</p>
                      </div>
                      <div className={`p-2 rounded-lg shrink-0 ${
                        stat.title === "Credits" ? "bg-amber-100 dark:bg-amber-900/30" :
                        stat.title === "In Progress" ? "bg-blue-100 dark:bg-blue-900/30" :
                        stat.title === "Completed" ? "bg-green-100 dark:bg-green-900/30" :
                        stat.title === "Certificates" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                        "bg-purple-100 dark:bg-purple-900/30"
                      }`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          {activeCourse ? (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Continue Learning</span>
                      {activeCourse.level && (
                        <Badge variant="outline" className="text-[10px]">
                          <Signal className="w-3 h-3 mr-1" />
                          {activeCourse.level}
                        </Badge>
                      )}
                    </div>
                    <h2 
                      className="text-xl font-bold mb-3 truncate"
                      data-testid="text-active-course"
                    >
                      {activeCourse.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <Progress value={activeCourse.progress} className="flex-1 h-2 max-w-xs" />
                      <div className="flex items-center gap-1.5">
                        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                          <circle cx="12" cy="12" r="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${activeCourse.progress * 0.628} 62.8`} />
                        </svg>
                        <span className="text-sm font-medium text-muted-foreground">
                          {activeCourse.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        {activeCourse.completedLessons} of {activeCourse.totalLessons} lessons completed
                      </p>
                      {activeCourse.duration && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activeCourse.duration}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {activeCourse.thumbnailUrl && (
                      <img 
                        src={activeCourse.thumbnailUrl} 
                        alt="" 
                        className="w-20 h-20 rounded-lg object-cover hidden sm:block" 
                      />
                    )}
                    <Link href={`/shishya/learn/${activeCourse.id}`}>
                      <Button size="lg" data-testid="button-continue-learning">
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : hasPendingActions ? (
            <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Complete Pending Actions</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      You have {totalPendingActions} pending item{totalPendingActions > 1 ? "s" : ""}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Complete tests, submit projects, and finish labs to earn certificates.
                    </p>
                  </div>
                  <Link href={pendingTests.length > 0 ? `/shishya/tests/${pendingTests[0].id}` : pendingProjects.length > 0 ? `/shishya/projects/${pendingProjects[0].id}` : `/shishya/labs/${pendingLabs[0]?.courseId}`}>
                    <Button size="lg" variant="outline" data-testid="button-complete-pending">
                      Take Action
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Start Learning</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      Your learning journey begins here
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Browse our courses and start building real-world skills today.
                    </p>
                  </div>
                  <Link href="/courses">
                    <Button size="lg" data-testid="button-browse-courses">
                      Browse Courses
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div className="mb-8" variants={slideUp} initial="initial" animate="animate" transition={{ delay: 0.15 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-performance-score">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI Performance Index
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-28 h-28" style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.2))" }}>
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--chart-2))" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${performanceScore.overall * 2.64} 264`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold" data-testid="text-performance-score">{performanceScore.overall}</span>
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={performanceScore.levelColor} data-testid="badge-performance-level">
                    {performanceScore.level}
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium">{performanceScore.courseScore}%</span>
                    </div>
                    <Progress value={performanceScore.courseScore} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Test Performance</span>
                      <span className="font-medium">{performanceScore.testScore}%</span>
                    </div>
                    <Progress value={performanceScore.testScore} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Certification Rate</span>
                      <span className="font-medium">{performanceScore.certScore}%</span>
                    </div>
                    <Progress value={performanceScore.certScore} className="h-1.5" />
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed" data-testid="text-ai-insight">
                      {aiInsight}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Weekly Growth
                  </span>
                  <span className={`font-semibold ${weeklyGrowth > 0 ? "text-green-500" : weeklyGrowth < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {weeklyGrowth > 0 ? "+" : ""}{weeklyGrowth}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card data-testid="card-competency-radar">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    AI Competency Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {competencyRadarData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={competencyRadarData} cx="50%" cy="50%" outerRadius="70%">
                          <defs>
                            <linearGradient id="competencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Competency" dataKey="score" stroke="hsl(var(--primary))" fill="url(#competencyGradient)" strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 mt-3 justify-center">
                        {competencyRadarData.map(item => (
                          <Badge key={item.category} variant="outline" className="text-[10px] gap-1">
                            {item.category}: {item.score}%
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">Start learning to see your AI competency analysis.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-growth-plan">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Growth & Improvement Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/50">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          suggestion.priority === "high" ? "bg-red-500" : 
                          suggestion.priority === "medium" ? "bg-amber-500" : "bg-green-500"
                        }`} />
                        <p className="text-sm text-muted-foreground">{suggestion.text}</p>
                      </div>
                    ))}
                  </div>
                  {competencyScores && (
                    <div className="mt-4">
                      <button 
                        onClick={() => setShowScoreDetails(!showScoreDetails)}
                        className="flex items-center gap-1 text-xs text-primary font-medium"
                        data-testid="button-why-score"
                      >
                        {showScoreDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        Why this score?
                      </button>
                      {showScoreDetails && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                          {competencyScores.coreMastery < 50 && <p>- Course completion rate is below average</p>}
                          {competencyScores.practicalApplication < 50 && <p>- Lab and project completion needs improvement</p>}
                          {competencyScores.analyticalAbility < 50 && <p>- Test pass rate could be higher</p>}
                          {competencyScores.industryReadiness < 30 && <p>- No certifications earned recently</p>}
                          {competencyScores.digitalSkills < 50 && <p>- Explore more courses to improve digital skills</p>}
                          {Object.values(competencyScores).every(v => v >= 50) && <p>- Great overall performance across all competencies</p>}
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {recommendations.length > 0 && (
          <motion.div 
            className="mb-8"
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card data-testid="card-recommendations">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Recommended for You
                </CardTitle>
                <Link href="/courses">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Browse All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map(({ course, reasons }, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link href={`/shishya/course/${course.id}`}>
                        <Card className="hover-elevate cursor-pointer h-full" data-testid={`recommendation-${course.id}`}>
                          <CardContent className="p-0">
                            {course.thumbnailUrl ? (
                              <div className="h-28 w-full overflow-hidden rounded-t-xl">
                                <img
                                  src={course.thumbnailUrl}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-28 w-full rounded-t-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-primary/40" />
                              </div>
                            )}
                            <div className="p-3 space-y-2">
                              <h4 className="text-sm font-medium line-clamp-2 leading-tight" data-testid={`text-rec-title-${course.id}`}>
                                {course.title}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] py-0">
                                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                </Badge>
                                {course.isFree && (
                                  <Badge variant="secondary" className="text-[10px] py-0 text-emerald-600 dark:text-emerald-400">
                                    Free
                                  </Badge>
                                )}
                                {course.category && (
                                  <Badge variant="secondary" className="text-[10px] py-0">
                                    {course.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                {reasons.map((reason, rIdx) => (
                                  <p key={rIdx} className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                                    {reason}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Pending Actions
                </CardTitle>
                {hasPendingActions && (
                  <Badge variant="secondary" className="text-xs">
                    {totalPendingActions} pending
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {!hasPendingActions ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      All caught up!
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[220px]">
                      Great work! Keep learning to unlock new challenges.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTests.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <ClipboardCheck className="w-3 h-3 text-purple-500" />
                          </div>
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            Tests to Complete
                          </span>
                        </div>
                        {pendingTests.map((course, index) => (
                          <Link 
                            key={`test-${course.id}`} 
                            href={`/shishya/tests/${course.id}`}
                            className="block"
                          >
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between gap-3 border rounded-lg p-3 hover-elevate cursor-pointer"
                              data-testid={`pending-test-${course.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                  <ClipboardCheck className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium truncate">Take Assessment</p>
                                    <Badge variant="secondary" className="text-[10px]">Required</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">{course.title}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {pendingProjects.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2 px-1">
                          <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <FileText className="w-3 h-3 text-blue-500" />
                          </div>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Projects to Submit
                          </span>
                        </div>
                        {pendingProjects.map((course, index) => (
                          <Link 
                            key={`project-${course.id}`} 
                            href={`/shishya/projects/${course.id}`}
                            className="block"
                          >
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (pendingTests.length + index) * 0.1 }}
                              className="flex items-center justify-between gap-3 border rounded-lg p-3 hover-elevate cursor-pointer"
                              data-testid={`pending-project-${course.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                  <FileText className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium truncate">Submit Project</p>
                                    <Badge variant="secondary" className="text-[10px]">Required</Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">{course.title}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {pendingLabs.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2 px-1">
                          <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                            <Code2 className="w-3 h-3 text-emerald-500" />
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Labs to Complete
                          </span>
                        </div>
                        {pendingLabs.map((lab, index) => (
                          <Link 
                            key={`lab-${lab.courseId}`} 
                            href={`/shishya/labs/${lab.courseId}`}
                            className="block"
                          >
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (pendingTests.length + pendingProjects.length + index) * 0.1 }}
                              className="flex items-center justify-between gap-3 border rounded-lg p-3 hover-elevate cursor-pointer"
                              data-testid={`pending-lab-${lab.courseId}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                  <Code2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium truncate">
                                      {lab.remaining} Lab{lab.remaining > 1 ? "s" : ""} Remaining
                                    </p>
                                    <Badge variant="secondary" className="text-[10px]">
                                      {lab.total - lab.remaining}/{lab.total} done
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">{lab.title}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-6">
            <Card data-testid="card-quick-summary">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Quick Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-[10px] text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{completedLabs.length}</p>
                    <p className="text-[10px] text-muted-foreground">Labs Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{streak}</p>
                    <p className="text-[10px] text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Recent Certificates
                </CardTitle>
                {totalCertificates > 0 && (
                  <Link href="/shishya/certificates">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                {allCertificates.length > 0 ? (
                  <div className="space-y-2">
                    {allCertificates.slice(0, 3).map((cert: any) => (
                      <Link 
                        key={cert.certificateId} 
                        href={`/shishya/certificates/${cert.certificateId}`}
                        className="block"
                      >
                        <div 
                          className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                          data-testid={`certificate-${cert.certificateId}`}
                        >
                          <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30">
                            <Award className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{cert.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(cert.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      Complete courses and pass tests to earn certificates.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Skills Gained
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uniqueSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="secondary"
                        className="text-xs"
                        data-testid={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Skills will appear here as you complete courses.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {completedLabs.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    Labs Completed
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {completedLabs.length} total
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Practice progress</span>
                        <span className="font-medium">{completedLabs.length} labs</span>
                      </div>
                      <Progress 
                        value={Math.min((completedLabs.length / Math.max(completedLabs.length + pendingLabs.reduce((s, l) => s + l.remaining, 0), 1)) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                  {completedLabs.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Last completed: {new Date(completedLabs[0].completedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
