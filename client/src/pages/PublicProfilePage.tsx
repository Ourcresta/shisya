import { useState, useEffect, useMemo } from "react";
import { useRoute, Link } from "wouter";
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
import { getProfileByUsername, isProfilePublic } from "@/lib/profile";
import { getAllCertificates, initializeMockCertificates } from "@/lib/certificates";
import { getAllSubmissions } from "@/lib/submissions";
import { getPassedTestsCount, getAllPassedTests } from "@/lib/testAttempts";
import type { StudentProfile, Certificate, ProjectSubmission, TestAttempt } from "@shared/schema";
import { MapPin, Github, Linkedin, ShieldCheck, Lock, GraduationCap, Home } from "lucide-react";

interface ProjectWithDetails extends ProjectSubmission {
  projectTitle?: string;
  courseTitle?: string;
  skills?: string[];
}

export default function PublicProfilePage() {
  const [, profileParams] = useRoute("/profile/:username");
  const [, portfolioParams] = useRoute("/portfolio/:username");
  const username = profileParams?.username || portfolioParams?.username;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [testsPassed, setTestsPassed] = useState(0);

  useEffect(() => {
    if (!username) {
      setNotFound(true);
      return;
    }

    initializeMockCertificates();
    
    const p = getProfileByUsername(username);
    if (!p) {
      setNotFound(true);
      return;
    }

    setProfile(p);
    setIsPublic(p.portfolioVisible);

    if (p.portfolioVisible) {
      setCertificates(getAllCertificates());
      const submissions = getAllSubmissions();
      setProjects(submissions.map(sub => ({
        ...sub,
        projectTitle: `Project #${sub.projectId}`,
        courseTitle: `Course #${sub.courseId}`,
      })));
      setTestAttempts(getAllPassedTests());
      setTestsPassed(getPassedTestsCount());
    }
  }, [username]);

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

  const topSkills = useMemo(() => {
    return Array.from(new Set(allSkills)).slice(0, 5);
  }, [allSkills]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This profile doesn't exist or may have been removed.
          </p>
          <Link href="/">
            <Button data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Go to Courses
            </Button>
          </Link>
        </main>
      </div>
    );
  }

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

  if (!isPublic) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">This Profile is Private</h1>
          <p className="text-muted-foreground mb-6">
            The owner of this profile has chosen to keep it private.
          </p>
          <Link href="/">
            <Button data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Go to Courses
            </Button>
          </Link>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8" data-testid="public-profile-page">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border">
                <AvatarImage src={profile.profilePhoto || undefined} alt={profile.fullName} />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 
                    className="text-2xl sm:text-3xl font-bold truncate"
                    data-testid="text-profile-name"
                  >
                    {profile.fullName}
                  </h1>
                  <Badge variant="secondary" className="shrink-0">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    Verified by OurShiksha
                  </Badge>
                </div>
                
                {profile.headline && (
                  <p className="text-muted-foreground mt-1" data-testid="text-profile-headline">
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

        {profile.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-bio">
                {profile.bio}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <LearningStats 
            coursesCompleted={coursesCompleted}
            projectsSubmitted={projectsSubmitted}
            testsPassed={testsPassed}
            certificatesEarned={certificatesEarned}
          />

          <Card>
            <CardContent className="pt-6">
              <SkillsSection skills={allSkills} showEmpty={false} />
            </CardContent>
          </Card>

          <PortfolioProjects projects={projects} showEmpty={false} isPublicView />

          <AssessmentsSection testAttempts={testAttempts} showEmpty={false} isPublicView />

          <CertificatesSection certificates={certificates} showEmpty={false} isPublicView />
        </div>

        <div className="mt-12 pt-6 border-t text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            <span>This portfolio is generated by</span>
            <span className="font-semibold text-foreground">OurShiksha</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All skills and achievements are verified through course completion, projects, and assessments.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <Link href="/verify" className="underline hover:text-foreground transition-colors">
              Verify certificates
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
