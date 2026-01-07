import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/Header";
import LearningStats from "@/components/profile/LearningStats";
import SkillsSection from "@/components/profile/SkillsSection";
import PortfolioProjects from "@/components/profile/PortfolioProjects";
import CertificatesSection from "@/components/profile/CertificatesSection";
import AssessmentsSection from "@/components/profile/AssessmentsSection";
import { getProfile, initializeDefaultProfile } from "@/lib/profile";
import { getAllCertificates, initializeMockCertificates } from "@/lib/certificates";
import { getAllSubmissions } from "@/lib/submissions";
import { getAllPassedTests, getPassedTestsCount } from "@/lib/testAttempts";
import type { StudentProfile, Certificate, ProjectSubmission, TestAttempt } from "@shared/schema";
import { 
  ArrowLeft, MapPin, Github, Linkedin, ShieldCheck, 
  GraduationCap, Copy, Check, ExternalLink, Eye, Sparkles, Share2, Globe
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

  useEffect(() => {
    initializeMockCertificates();
    
    // Get profile or initialize a default one
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

  const coursesCompleted = certificates.length;
  const projectsSubmitted = projects.length;
  const certificatesEarned = certificates.length;

  const publicUrl = profile ? `${window.location.origin}/portfolio/${profile.username}` : "";

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8" data-testid="portfolio-preview-page">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/shishya/profile">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="w-6 h-6 text-muted-foreground" />
                Portfolio Preview
              </h1>
              <p className="text-sm text-muted-foreground">
                This is how your portfolio appears to recruiters
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
              {!profile.portfolioVisible ? (
                <Link href="/shishya/profile">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    data-testid="button-publish-portfolio"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Publish Portfolio
                  </Button>
                </Link>
              ) : (
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
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copy Link
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyLink}
                    data-testid="button-share-portfolio"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
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

        {!profile.portfolioVisible && (
          <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Your portfolio is currently <strong>private</strong>. Enable public sharing in your{" "}
                <Link href="/shishya/profile" className="underline">profile settings</Link> to share with recruiters.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Try Neon Portfolio Banner */}
        <Card className="mb-6 border-cyan-500/30 dark:border-cyan-400/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Try the New Neon Portfolio</h3>
                <p className="text-sm text-slate-400">
                  Modern dark theme with 5 color options and stunning effects
                </p>
              </div>
            </div>
            <Link href="/shishya/profile/neon-portfolio">
              <Button 
                variant="default" 
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                data-testid="button-try-neon-portfolio"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Try Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          <motion.div variants={staggerItem}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border">
                    <AvatarImage src={profile.profilePhoto || undefined} alt={profile.fullName} />
                    <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 
                        className="text-2xl sm:text-3xl font-bold"
                        data-testid="text-portfolio-name"
                      >
                        {profile.fullName}
                      </h2>
                      <Badge variant="secondary" className="shrink-0">
                        <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                        Verified by OurShiksha
                      </Badge>
                    </div>
                    
                    {profile.headline && (
                      <p className="text-muted-foreground mt-1" data-testid="text-portfolio-headline">
                        {profile.headline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        @{profile.username}
                      </Badge>
                      
                      {profile.location && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </span>
                      )}
                    </div>

                    {topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {topSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {profile.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" data-testid="link-github">
                            <Github className="w-4 h-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      
                      {profile.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" data-testid="link-linkedin">
                            <Linkedin className="w-4 h-4 mr-1" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {profile.bio && (
            <motion.div variants={staggerItem}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-portfolio-bio">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={staggerItem}>
            <LearningStats 
              coursesCompleted={coursesCompleted}
              projectsSubmitted={projectsSubmitted}
              testsPassed={testsPassed}
              certificatesEarned={certificatesEarned}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardContent className="pt-6">
                <SkillsSection skills={allSkills} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <PortfolioProjects projects={projects} isPublicView />
          </motion.div>

          <motion.div variants={staggerItem}>
            <AssessmentsSection testAttempts={testAttempts} />
          </motion.div>

          <motion.div variants={staggerItem}>
            <CertificatesSection certificates={certificates} isPublicView />
          </motion.div>

          <motion.div 
            variants={staggerItem}
            className="pt-6 border-t text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>This portfolio is generated by</span>
              <span className="font-semibold text-foreground">OurShiksha</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All skills and achievements are verified through course completion, projects, and assessments.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <a 
                href="/verify" 
                className="underline hover:text-foreground transition-colors"
              >
                Verify certificates
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
