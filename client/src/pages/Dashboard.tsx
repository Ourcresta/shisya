import { useMemo } from "react";
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
  BarChart3
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { staggerContainer, staggerItem, slideUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import MotivationBanner from "@/components/MotivationBanner";
import { useCredits } from "@/contexts/CreditContext";
import { getCourseProgress } from "@/lib/progress";
import { getAllSubmissions } from "@/lib/submissions";
import { getTestAttempts } from "@/lib/testAttempts";
import { getAllCertificates } from "@/lib/certificates";
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

function getMotivationalMessage(inProgress: number, completed: number): string {
  if (completed >= 3) return "You're on fire! Keep building those skills.";
  if (inProgress > 0) return "Keep going — you're building real skills.";
  if (completed > 0) return "Great start! Continue your learning journey.";
  return "Your learning journey begins here.";
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

  const learningStatus = getLearningLevel(completedCourses.length, passedTests);
  const motivationalMessage = getMotivationalMessage(inProgressCourses.length, completedCourses.length);

  const allSkills = allCertificates.reduce((acc: string[], cert: any) => {
    if (cert.skills) {
      return [...acc, ...cert.skills];
    }
    return acc;
  }, []);
  const uniqueSkills = Array.from(new Set(allSkills)).slice(0, 8);

  const courseSkills = useMemo(() => {
    const skillMap = new Map<string, { count: number; totalProgress: number }>();
    
    coursesWithProgress.forEach((course) => {
      const skills: string[] = [];
      if (course.skills) {
        if (typeof course.skills === "string") {
          try {
            const parsed = JSON.parse(course.skills);
            if (Array.isArray(parsed)) skills.push(...parsed);
          } catch {
            skills.push(...(course.skills as string).split(",").map(s => s.trim()).filter(Boolean));
          }
        } else if (Array.isArray(course.skills)) {
          skills.push(...course.skills);
        }
      }
      
      skills.forEach(skill => {
        const existing = skillMap.get(skill) || { count: 0, totalProgress: 0 };
        existing.count += 1;
        existing.totalProgress += course.progress;
        skillMap.set(skill, existing);
      });
    });
    
    return skillMap;
  }, [coursesWithProgress]);

  const radarData = useMemo(() => {
    const categories = new Map<string, number[]>();
    const categoryKeywords: Record<string, string[]> = {
      "Frontend": ["react", "html", "css", "javascript", "typescript", "vue", "angular", "ui", "ux", "tailwind", "responsive", "dom"],
      "Backend": ["node", "express", "api", "rest", "server", "python", "django", "flask", "java", "spring", "php"],
      "Database": ["sql", "mongodb", "postgres", "database", "redis", "orm", "drizzle", "prisma", "data model"],
      "DevOps": ["git", "docker", "ci", "cd", "deploy", "aws", "cloud", "linux", "kubernetes", "testing"],
      "Fundamentals": ["algorithm", "data structure", "oop", "design pattern", "architecture", "security", "authentication"],
    };

    courseSkills.forEach((data, skill) => {
      const skillLower = skill.toLowerCase();
      let matched = false;
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => skillLower.includes(kw))) {
          const existing = categories.get(category) || [];
          existing.push(data.totalProgress / data.count);
          categories.set(category, existing);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const existing = categories.get("Other") || [];
        existing.push(data.totalProgress / data.count);
        categories.set("Other", existing);
      }
    });

    return Array.from(categories.entries())
      .map(([name, scores]) => ({
        category: name,
        proficiency: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        fullMark: 100,
      }))
      .slice(0, 6);
  }, [courseSkills]);

  const skillBarData = useMemo(() => {
    return Array.from(courseSkills.entries())
      .map(([skill, data]) => ({
        skill: skill.length > 12 ? skill.slice(0, 12) + "..." : skill,
        fullSkill: skill,
        proficiency: Math.round(data.totalProgress / data.count),
      }))
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 8);
  }, [courseSkills]);

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
    if (overall >= 80) { level = "Expert"; levelColor = "text-amber-500"; }
    else if (overall >= 60) { level = "Proficient"; levelColor = "text-emerald-500"; }
    else if (overall >= 40) { level = "Developing"; levelColor = "text-blue-500"; }
    else if (overall >= 20) { level = "Emerging"; levelColor = "text-violet-500"; }
    else { level = "Novice"; levelColor = "text-muted-foreground"; }

    return { overall, courseScore: Math.round(courseScore), testScore: Math.round(testScore), certScore: Math.round(Math.min(certScore, 100)), level, levelColor };
  }, [coursesWithProgress, allTestAttempts, passedTests, totalCertificates]);

  const SKILL_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#8b5cf6", "#f59e0b", "#06b6d4"];

  const stats = [
    {
      title: "Credits",
      value: creditsLoading ? "..." : balance,
      icon: Coins,
      color: "text-amber-500",
      href: "/shishya/wallet",
    },
    {
      title: "In Progress",
      value: inProgressCourses.length,
      icon: BookOpen,
      color: "text-blue-500",
      href: "/courses",
    },
    {
      title: "Completed",
      value: completedCourses.length,
      icon: CheckCircle,
      color: "text-green-500",
      href: "/courses",
    },
    {
      title: "Certificates",
      value: totalCertificates,
      icon: Award,
      color: "text-yellow-500",
      href: "/shishya/certificates",
    },
    {
      title: "Tests Passed",
      value: passedTests,
      icon: ClipboardCheck,
      color: "text-purple-500",
      href: "/shishya/certificates",
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
    { title: "Portfolio", icon: User, href: "/shishya/profile/portfolio-preview" },
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
  const hasPendingActions = pendingTests.length > 0 || pendingProjects.length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* Motivation Quote Banner */}
        <MotivationBanner className="mb-6" />
        
        {/* ZONE 1: Welcome & Status */}
        <motion.div 
          className="mb-8"
          variants={slideUp}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-col gap-4">
            {/* Welcome Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 
                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                    data-testid="text-welcome"
                  >
                    Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                  </h1>
                  <Badge variant={learningStatus.variant} data-testid="badge-learning-level">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {learningStatus.level}
                  </Badge>
                </div>
                <p className="text-muted-foreground" data-testid="text-motivational">
                  {motivationalMessage}
                </p>
              </div>
            </div>
            
            {/* Quick Links - Horizontal Scrollable */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="shrink-0 gap-1.5"
                    data-testid={`quick-link-${link.title.toLowerCase()}`}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ZONE 2: Learning Snapshot (Metrics) */}
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
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ZONE 3: Primary Action */}
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
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">Continue Learning</span>
                    </div>
                    <h2 
                      className="text-xl font-bold mb-3 truncate"
                      data-testid="text-active-course"
                    >
                      {activeCourse.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <Progress value={activeCourse.progress} className="flex-1 h-2 max-w-xs" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {activeCourse.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {activeCourse.completedLessons} of {activeCourse.totalLessons} lessons completed
                    </p>
                  </div>
                  <Link href={`/shishya/learn/${activeCourse.id}`}>
                    <Button size="lg" data-testid="button-continue-learning">
                      <Play className="w-4 h-4 mr-2" />
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
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
                      You have {pendingTests.length + pendingProjects.length} pending items
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Complete tests and submit projects to earn certificates.
                    </p>
                  </div>
                  <Link href={pendingTests.length > 0 ? `/shishya/tests/${pendingTests[0].id}` : `/shishya/projects/${pendingProjects[0].id}`}>
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

        {/* ZONE 3.5: Skills Analytics */}
        {(radarData.length > 0 || skillBarData.length > 0) && (
          <motion.div
            className="mb-8"
            variants={slideUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Score Card */}
              <Card data-testid="card-performance-score">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="hsl(var(--primary))"
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
                </CardContent>
              </Card>

              {/* Skill Radar Chart */}
              {radarData.length >= 3 && (
                <Card data-testid="card-skill-radar">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Skill Proficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                          dataKey="category" 
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Proficiency"
                          dataKey="proficiency"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Sub-Skill Bar Chart */}
              {skillBarData.length > 0 && (
                <Card className={radarData.length < 3 ? "lg:col-span-2" : ""} data-testid="card-skill-bars">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Skills Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={skillBarData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis 
                          dataKey="skill" 
                          type="category" 
                          width={90} 
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, _name: string, props: any) => [
                            `${value}%`,
                            props.payload.fullSkill,
                          ]}
                        />
                        <Bar dataKey="proficiency" radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {skillBarData.map((_entry, index) => (
                            <Cell key={index} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* ZONE 4: Pending Actions */}
          <motion.div variants={staggerItem}>
            <Card className="h-full overflow-hidden relative bg-gradient-to-br from-card via-card to-primary/5 dark:to-primary/10 border-border/50 dark:border-primary/20">
              {/* Decorative gradient orb */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3 relative">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <span className="dark:bg-gradient-to-r dark:from-foreground dark:to-foreground/80 dark:bg-clip-text">
                    Pending Actions
                  </span>
                </CardTitle>
                {(pendingTests.length > 0 || pendingProjects.length > 0) && (
                  <Badge 
                    className="text-xs font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg dark:shadow-primary/30 animate-pulse"
                  >
                    {pendingTests.length + pendingProjects.length} pending
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3 relative">
                {pendingTests.length === 0 && pendingProjects.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center relative"
                  >
                    {/* Success gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-emerald-500/5 rounded-xl" />
                    
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400/30 via-emerald-500/20 to-teal-500/30 dark:from-green-400/20 dark:via-emerald-500/15 dark:to-teal-500/20 flex items-center justify-center border border-green-500/30 shadow-lg dark:shadow-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40 animate-bounce">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      All caught up!
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[220px]">
                      Great work! Keep learning to unlock new challenges.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {pendingTests.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <div className="p-1 rounded bg-gradient-to-br from-purple-500/20 to-violet-500/10">
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
                              className="group relative flex items-center justify-between gap-3 p-3 rounded-xl border border-purple-300/50 dark:border-purple-500/30 bg-gradient-to-r from-purple-100/80 via-purple-50/50 to-violet-50/30 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-violet-900/10 hover:border-purple-400 dark:hover:border-purple-400/50 hover:shadow-lg dark:hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer overflow-hidden"
                              data-testid={`pending-test-${course.id}`}
                            >
                              {/* Hover glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              <div className="flex items-center gap-3 min-w-0 relative">
                                <div className="relative">
                                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-400/30 group-hover:from-purple-500/30 group-hover:to-violet-500/20 transition-colors shadow-inner">
                                    <ClipboardCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 animate-pulse shadow-lg shadow-purple-500/50" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">Take Assessment</p>
                                    <Badge className="text-[10px] px-2 py-0 h-4 bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-400/50 text-purple-700 dark:text-purple-300 font-medium">
                                      Required
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-purple-600/80 dark:text-purple-400/80 truncate mt-0.5">{course.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 relative">
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1">
                                  Start
                                </span>
                                <div className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                  <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {pendingProjects.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-2 px-1">
                          <div className="p-1 rounded bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
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
                              className="group relative flex items-center justify-between gap-3 p-3 rounded-xl border border-blue-300/50 dark:border-blue-500/30 bg-gradient-to-r from-blue-100/80 via-blue-50/50 to-cyan-50/30 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-cyan-900/10 hover:border-blue-400 dark:hover:border-blue-400/50 hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer overflow-hidden"
                              data-testid={`pending-project-${course.id}`}
                            >
                              {/* Hover glow effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              <div className="flex items-center gap-3 min-w-0 relative">
                                <div className="relative">
                                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-400/30 group-hover:from-blue-500/30 group-hover:to-cyan-500/20 transition-colors shadow-inner">
                                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse shadow-lg shadow-blue-500/50" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">Submit Project</p>
                                    <Badge className="text-[10px] px-2 py-0 h-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-700 dark:text-blue-300 font-medium">
                                      Required
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 truncate mt-0.5">{course.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 relative">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1">
                                  Submit
                                </span>
                                <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                  <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
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

          {/* ZONE 5: Achievements & Proof */}
          <motion.div variants={staggerItem} className="space-y-6">
            {/* Recent Certificates */}
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

            {/* Skills Gained */}
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
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
