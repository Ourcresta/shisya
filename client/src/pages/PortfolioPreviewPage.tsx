import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import ProfileForm from "@/components/profile/ProfileForm";
import PortfolioProjects from "@/components/profile/PortfolioProjects";
import CertificatesSection from "@/components/profile/CertificatesSection";
import AssessmentsSection from "@/components/profile/AssessmentsSection";
import { getProfile, saveProfile, initializeDefaultProfile, canMakeProfilePublic, updateProfile } from "@/lib/profile";
import { getAllCertificates, initializeMockCertificates } from "@/lib/certificates";
import { getAllSubmissions } from "@/lib/submissions";
import { getAllPassedTests, getPassedTestsCount } from "@/lib/testAttempts";
import type { StudentProfile, Certificate, ProjectSubmission, TestAttempt } from "@shared/schema";
import { 
  MapPin, Github, Linkedin, ShieldCheck, 
  GraduationCap, Copy, Check, ExternalLink, Eye, Sparkles, Share2, Globe,
  BookOpen, FolderKanban, ClipboardCheck, Award, TrendingUp, 
  Zap, Target, CheckCircle, Link2, BarChart3, Pencil, User,
  Camera, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface ProjectWithDetails extends ProjectSubmission {
  projectTitle?: string;
  courseTitle?: string;
  skills?: string[];
}

export default function PortfolioPreviewPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [testsPassed, setTestsPassed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [mode, setMode] = useState<"overview" | "edit">("overview");
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeMockCertificates();
    
    let p = getProfile();
    if (!p) {
      p = initializeDefaultProfile("New Student");
    }
    setProfile(p);

    setCertificates(getAllCertificates());
    
    const submissions = getAllSubmissions();
    setProjects(submissions.map(sub => ({
      ...sub,
      projectTitle: `Project #${sub.projectId}`,
      courseTitle: `Course #${sub.courseId}`,
    })));

    setTestAttempts(getAllPassedTests());
    setTestsPassed(getPassedTestsCount());
  }, []);

  const allSkills = useMemo(() => {
    const skills: string[] = [];
    
    certificates.forEach(cert => {
      if (cert.skills) {
        skills.push(...cert.skills);
      }
    });
    
    projects.forEach(proj => {
      if (proj.skills) {
        skills.push(...proj.skills);
      }
    });
    
    return skills;
  }, [certificates, projects]);

  const uniqueSkills = useMemo(() => Array.from(new Set(allSkills)).sort(), [allSkills]);

  const coursesCompleted = certificates.length;
  const projectsSubmitted = projects.length;
  const certificatesEarned = certificates.length;

  const canGoPublic = canMakeProfilePublic(coursesCompleted, projectsSubmitted);

  const publicUrl = profile ? `${window.location.origin}/portfolio/${profile.username}` : "";

  const portfolioStrength = useMemo(() => {
    if (!profile) return { score: 0, items: [] };
    const items: { label: string; done: boolean }[] = [
      { label: "Profile photo", done: !!profile.profilePhoto },
      { label: "Headline", done: !!profile.headline },
      { label: "Bio", done: !!profile.bio },
      { label: "Location", done: !!profile.location },
      { label: "Skills", done: uniqueSkills.length > 0 },
      { label: "Social links", done: !!(profile.githubUrl || profile.linkedinUrl) },
      { label: "Projects", done: projects.length > 0 },
      { label: "Certificates", done: certificates.length > 0 },
      { label: "Assessments", done: testsPassed > 0 },
      { label: "Public portfolio", done: !!profile.portfolioVisible },
    ];
    const done = items.filter(i => i.done).length;
    return { score: Math.round((done / items.length) * 100), items };
  }, [profile, uniqueSkills, projects, certificates, testsPassed]);

  const stats = useMemo(() => [
    { label: "Courses", value: coursesCompleted, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Projects", value: projectsSubmitted, icon: FolderKanban, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Tests Passed", value: testsPassed, icon: ClipboardCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Certificates", value: certificatesEarned, icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
  ], [coursesCompleted, projectsSubmitted, testsPassed, certificatesEarned]);

  const recentAchievements = useMemo(() => {
    const achievements: { type: string; title: string; date: string; icon: typeof Award }[] = [];
    
    certificates.slice(0, 3).forEach(cert => {
      achievements.push({
        type: "Certificate",
        title: cert.courseTitle,
        date: new Date(cert.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        icon: Award,
      });
    });

    testAttempts.filter(t => t.passed).slice(0, 3).forEach(test => {
      achievements.push({
        type: "Assessment",
        title: `Assessment #${test.testId} - ${test.scorePercentage}%`,
        date: new Date(test.attemptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        icon: Target,
      });
    });

    projects.slice(0, 3).forEach(proj => {
      achievements.push({
        type: "Project",
        title: proj.projectTitle || `Project #${proj.projectId}`,
        date: proj.submittedAt ? new Date(proj.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
        icon: FolderKanban,
      });
    });

    return achievements.slice(0, 6);
  }, [certificates, testAttempts, projects]);

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Public portfolio link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (values: Partial<StudentProfile>) => {
    setSaving(true);
    try {
      if (!profile) return;
      
      const updated = saveProfile({
        fullName: values.fullName || profile.fullName,
        username: values.username || profile.username,
        bio: values.bio || "",
        profilePhoto: values.profilePhoto || "",
        headline: values.headline || "",
        location: values.location || "",
        githubUrl: values.githubUrl || "",
        linkedinUrl: values.linkedinUrl || "",
        portfolioVisible: profile.portfolioVisible,
      });
      
      setProfile(updated);
      setMode("overview");
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = (visible: boolean) => {
    if (!profile) return;
    
    if (visible && !canGoPublic) {
      toast({
        title: "Cannot make profile public",
        description: "Complete at least one course or submit a project first.",
        variant: "destructive",
      });
      return;
    }

    const updated = updateProfile({ portfolioVisible: visible });
    if (updated) {
      setProfile(updated);
      toast({
        title: visible ? "Portfolio is now public" : "Portfolio is now private",
        description: visible 
          ? "Anyone with your portfolio link can view it."
          : "Only you can see your portfolio.",
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 2MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const updated = updateProfile({ profilePhoto: base64 });
      if (updated) {
        setProfile(updated);
        toast({ title: "Photo updated", description: "Your profile photo has been updated" });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-48 bg-muted rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const topSkills = Array.from(new Set(allSkills)).slice(0, 5);

  const strengthColor = portfolioStrength.score >= 80 ? "text-emerald-500" 
    : portfolioStrength.score >= 50 ? "text-amber-500" 
    : "text-red-500";

  const strengthLabel = portfolioStrength.score >= 80 ? "Strong" 
    : portfolioStrength.score >= 50 ? "Good" 
    : "Needs Work";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6" data-testid="portfolio-preview-page">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                My Profile
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your profile and see how recruiters view it
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center rounded-lg border p-0.5">
                <Button
                  variant={mode === "overview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("overview")}
                  data-testid="button-mode-overview"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Overview
                </Button>
                <Button
                  variant={mode === "edit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("edit")}
                  data-testid="button-mode-edit"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>

              {mode === "overview" && profile.portfolioVisible && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
                    data-testid="button-copy-public-link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <a href={`/portfolio/${profile.username}`} target="_blank" rel="noopener noreferrer" data-testid="button-view-public">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Public
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {mode === "edit" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileForm 
              profile={profile} 
              onSave={handleSaveProfile}
              isPending={saving}
            />
          </motion.div>
        ) : (
          <>
            {!profile.portfolioVisible && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-md bg-amber-200/50 dark:bg-amber-800/30 shrink-0 mt-0.5">
                        <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Portfolio is Private</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                          Enable public sharing to let recruiters find you.
                        </p>
                      </div>
                      {canGoPublic && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleVisibility(true)}
                          className="shrink-0 text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-700"
                          data-testid="button-publish-portfolio"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Publish
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={staggerItem}>
                <Card className="overflow-hidden">
                  <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_60%)]" />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          {profile.portfolioVisible ? (
                            <><Eye className="w-3 h-3" /> Public</>
                          ) : (
                            <><EyeOff className="w-3 h-3" /> Private</>
                          )}
                        </span>
                        <Switch
                          checked={profile.portfolioVisible}
                          onCheckedChange={handleToggleVisibility}
                          disabled={!canGoPublic && !profile.portfolioVisible}
                          data-testid="switch-visibility"
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                  <CardContent className="relative px-6 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-14">
                      <div className="relative shrink-0 group">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          data-testid="input-photo-upload"
                        />
                        <div className="p-1 rounded-full bg-background">
                          <div className="p-0.5 rounded-full bg-gradient-to-br from-primary via-primary/50 to-primary/20">
                            <Avatar 
                              className="w-24 h-24 border-4 border-background cursor-pointer"
                              onClick={() => photoInputRef.current?.click()}
                            >
                              <AvatarImage src={profile.profilePhoto || undefined} alt={profile.fullName} />
                              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer m-1"
                          onClick={() => photoInputRef.current?.click()}
                          data-testid="button-change-photo"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        {profile.portfolioVisible && (
                          <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full">
                            <div className="p-1 rounded-full bg-emerald-500">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-2 sm:pt-6">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h2 
                                className="text-2xl font-bold"
                                data-testid="text-portfolio-name"
                              >
                                {profile.fullName}
                              </h2>
                              <Badge variant="secondary" className="shrink-0">
                                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                                Verified
                              </Badge>
                            </div>
                            
                            {profile.headline ? (
                              <p className="text-muted-foreground text-sm" data-testid="text-portfolio-headline">
                                {profile.headline}
                              </p>
                            ) : (
                              <button 
                                onClick={() => setMode("edit")}
                                className="text-sm text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1"
                                data-testid="button-add-headline"
                              >
                                <Pencil className="w-3 h-3" />
                                Add a headline
                              </button>
                            )}

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                @{profile.username}
                              </Badge>
                              {profile.location && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {profile.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setMode("edit")}
                              data-testid="button-edit-profile"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {profile.githubUrl && (
                              <Button variant="outline" size="icon" asChild>
                                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" data-testid="link-github">
                                  <Github className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {profile.linkedinUrl && (
                              <Button variant="outline" size="icon" asChild>
                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">
                                  <Linkedin className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        {topSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {topSkills.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {uniqueSkills.length > 5 && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                +{uniqueSkills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={staggerItem}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {stats.map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div>
                            <div className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                              {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1" data-testid="card-portfolio-strength">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Portfolio Strength
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                            <circle
                              cx="50" cy="50" r="40" fill="none"
                              stroke={portfolioStrength.score >= 80 ? "hsl(142 76% 36%)" : portfolioStrength.score >= 50 ? "hsl(38 92% 50%)" : "hsl(0 72% 51%)"}
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${portfolioStrength.score * 2.51} 251`}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-xl font-bold ${strengthColor}`}>{portfolioStrength.score}%</span>
                            <span className="text-[10px] text-muted-foreground">{strengthLabel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {portfolioStrength.items.map((item) => (
                          <button
                            key={item.label} 
                            className="flex items-center gap-2 text-xs w-full text-left"
                            onClick={() => {
                              if (!item.done) setMode("edit");
                            }}
                            data-testid={`strength-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.done ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                            <span className={item.done ? "text-foreground" : "text-muted-foreground hover:text-primary transition-colors cursor-pointer"}>
                              {item.label}
                            </span>
                            {item.done ? (
                              <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />
                            ) : (
                              <Pencil className="w-3 h-3 text-muted-foreground/40 ml-auto shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {profile.bio ? (
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            About
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setMode("edit")}
                            className="h-7 w-7"
                            data-testid="button-edit-bio"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-portfolio-bio">
                          {profile.bio}
                        </p>
                        {recentAchievements.length > 0 && (
                          <div className="mt-5 pt-4 border-t">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3" />
                              Recent Achievements
                            </h4>
                            <div className="space-y-2.5">
                              {recentAchievements.slice(0, 4).map((achievement, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <achievement.icon className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{achievement.title}</p>
                                    <p className="text-[10px] text-muted-foreground">{achievement.type}</p>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground shrink-0">{achievement.date}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          {recentAchievements.length > 0 ? "Recent Achievements" : "About"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recentAchievements.length > 0 ? (
                          <div className="space-y-3">
                            {recentAchievements.map((achievement, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                  <achievement.icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{achievement.title}</p>
                                  <p className="text-xs text-muted-foreground">{achievement.type}</p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{achievement.date}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-3">Tell recruiters about yourself</p>
                            <Button variant="outline" size="sm" onClick={() => setMode("edit")} data-testid="button-add-bio">
                              <Pencil className="w-4 h-4 mr-1" />
                              Add Bio
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Card className="border-cyan-500/20 dark:border-cyan-400/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">Neon Portfolio Theme</h3>
                        <p className="text-xs text-slate-400">
                          Modern dark theme with 5 color options
                        </p>
                      </div>
                    </div>
                    <Link href="/shishya/profile/neon-portfolio">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-cyan-500 text-white border-cyan-500"
                        data-testid="button-try-neon-portfolio"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Try Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview" className="gap-1.5" data-testid="tab-overview">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Skills
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="gap-1.5" data-testid="tab-projects">
                      <FolderKanban className="w-3.5 h-3.5" />
                      Projects
                      {projects.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{projects.length}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="assessments" className="gap-1.5" data-testid="tab-assessments">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Assessments
                    </TabsTrigger>
                    <TabsTrigger value="certificates" className="gap-1.5" data-testid="tab-certificates">
                      <Award className="w-3.5 h-3.5" />
                      Certificates
                      {certificates.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{certificates.length}</Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Skills
                          <span className="text-xs font-normal text-muted-foreground">(auto-generated from learning)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {uniqueSkills.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {uniqueSkills.map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="secondary"
                                  className="text-xs"
                                  data-testid={`skill-badge-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="pt-4 border-t">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Skill Categories
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(() => {
                                  const categories: Record<string, string[]> = {};
                                  uniqueSkills.forEach(skill => {
                                    const lower = skill.toLowerCase();
                                    let cat = "General";
                                    if (["react", "html", "css", "javascript", "typescript", "vue", "angular", "tailwind", "jsx", "responsive design"].some(k => lower.includes(k))) cat = "Frontend";
                                    else if (["node", "express", "api", "rest", "python", "django", "flask", "java", "mongodb", "sql"].some(k => lower.includes(k))) cat = "Backend";
                                    else if (["git", "docker", "aws", "cloud", "devops", "ci", "deploy", "linux"].some(k => lower.includes(k))) cat = "DevOps & Cloud";
                                    else if (["design", "ui", "ux", "figma"].some(k => lower.includes(k))) cat = "Design";
                                    if (!categories[cat]) categories[cat] = [];
                                    categories[cat].push(skill);
                                  });
                                  return Object.entries(categories).map(([cat, skills]) => (
                                    <div key={cat} className="p-3 rounded-lg bg-muted/50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium">{cat}</span>
                                        <Badge variant="outline" className="text-[10px]">{skills.length}</Badge>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {skills.map(s => (
                                          <span key={s} className="text-[11px] text-muted-foreground">{s}{skills.indexOf(s) < skills.length - 1 ? "," : ""}</span>
                                        ))}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Complete courses and projects to build your skills portfolio
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="projects" className="mt-4">
                    <PortfolioProjects projects={projects} isPublicView />
                  </TabsContent>

                  <TabsContent value="assessments" className="mt-4">
                    <AssessmentsSection testAttempts={testAttempts} />
                  </TabsContent>

                  <TabsContent value="certificates" className="mt-4">
                    <CertificatesSection certificates={certificates} isPublicView />
                  </TabsContent>
                </Tabs>
              </motion.div>

              <motion.div 
                variants={staggerItem}
                className="pt-4 border-t text-center"
              >
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span>Portfolio by</span>
                  <span className="font-semibold text-foreground">OurShiksha</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  All skills and achievements verified through course completion, projects, and assessments.
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  <a 
                    href="/verify" 
                    className="underline hover:text-foreground transition-colors"
                  >
                    Verify certificates
                  </a>
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
