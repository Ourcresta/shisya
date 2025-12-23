import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import LearningStats from "@/components/profile/LearningStats";
import SkillsSection from "@/components/profile/SkillsSection";
import PortfolioProjects from "@/components/profile/PortfolioProjects";
import CertificatesSection from "@/components/profile/CertificatesSection";
import { getProfile, saveProfile, initializeDefaultProfile, canMakeProfilePublic, updateProfile } from "@/lib/profile";
import { getAllCertificates, initializeMockCertificates } from "@/lib/certificates";
import { getAllSubmissions } from "@/lib/submissions";
import { getPassedTestsCount } from "@/lib/testAttempts";
import type { StudentProfile, Certificate, ProjectSubmission } from "@shared/schema";
import { User, Settings, Pencil, AlertCircle, Eye } from "lucide-react";
import { Link } from "wouter";

interface ProjectWithDetails extends ProjectSubmission {
  projectTitle?: string;
  courseTitle?: string;
  skills?: string[];
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [testsPassed, setTestsPassed] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initializeMockCertificates();
    
    let p = getProfile();
    if (!p) {
      p = initializeDefaultProfile("Demo Student");
    }
    setProfile(p);

    setCertificates(getAllCertificates());
    
    const submissions = getAllSubmissions();
    setProjects(submissions.map(sub => ({
      ...sub,
      projectTitle: `Project #${sub.projectId}`,
      courseTitle: `Course #${sub.courseId}`,
    })));

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

  const canGoPublic = canMakeProfilePublic(coursesCompleted, projectsSubmitted);

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
      setActiveTab("overview");
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
        title: visible ? "Profile is now public" : "Profile is now private",
        description: visible 
          ? "Anyone with your profile link can view it."
          : "Only you can see your profile.",
      });
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8" data-testid="profile-page">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/shishya/profile/portfolio-preview">
                <Button variant="outline" size="sm" data-testid="button-preview-portfolio">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Portfolio
                </Button>
              </Link>
              <TabsList>
                <TabsTrigger value="overview" data-testid="tab-overview">
                  <User className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="edit" data-testid="tab-edit">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-0">
            <Card>
              <CardContent className="pt-6">
                <ProfileHeader 
                  profile={profile} 
                  editable 
                  onToggleVisibility={handleToggleVisibility}
                  canMakePublic={canGoPublic}
                />
              </CardContent>
            </Card>

            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-bio">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            <LearningStats 
              coursesCompleted={coursesCompleted}
              projectsSubmitted={projectsSubmitted}
              testsPassed={testsPassed}
              certificatesEarned={certificatesEarned}
            />

            <Card>
              <CardContent className="pt-6">
                <SkillsSection skills={allSkills} />
              </CardContent>
            </Card>

            <PortfolioProjects projects={projects} />

            <CertificatesSection certificates={certificates} />

            {!profile.bio && !profile.headline && (
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="flex items-start gap-3 pt-6">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Complete your profile
                    </p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                      Add a headline and bio to make your profile stand out to recruiters.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setActiveTab("edit")}
                      data-testid="button-complete-profile"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            <ProfileForm 
              profile={profile} 
              onSave={handleSaveProfile}
              isPending={saving}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
