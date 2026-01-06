import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, initializeDefaultProfile } from "@/lib/profile";
import { getAllCertificates, initializeMockCertificates } from "@/lib/certificates";
import { getAllSubmissions } from "@/lib/submissions";
import { getPassedTestsCount } from "@/lib/testAttempts";
import type { StudentProfile, Certificate, ProjectSubmission } from "@shared/schema";
import { 
  ArrowLeft, Github, Linkedin, Twitter, Facebook, Mail,
  Download, ExternalLink, Eye, Code, Palette, Layers, 
  Globe, Smartphone, Server, Database, Zap, Sparkles,
  GraduationCap, Award, Briefcase, Send, MapPin, Check,
  Copy, Menu, X, ChevronRight, Star, Calendar, FileText, ScrollText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PortfolioTheme = "neon" | "cyberpunk" | "minimal" | "ocean" | "sunset";

interface ThemeColors {
  primary: string;
  primaryGlow: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textMuted: string;
  accent: string;
  cardBg: string;
  borderColor: string;
}

const themes: Record<PortfolioTheme, ThemeColors> = {
  neon: {
    primary: "#22d3ee",
    primaryGlow: "rgba(34, 211, 238, 0.4)",
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    accent: "#06b6d4",
    cardBg: "rgba(30, 41, 59, 0.8)",
    borderColor: "rgba(34, 211, 238, 0.2)",
  },
  cyberpunk: {
    primary: "#f0abfc",
    primaryGlow: "rgba(240, 171, 252, 0.4)",
    background: "#0c0a1d",
    backgroundSecondary: "#1a1633",
    text: "#faf5ff",
    textMuted: "#a78bfa",
    accent: "#c084fc",
    cardBg: "rgba(26, 22, 51, 0.8)",
    borderColor: "rgba(240, 171, 252, 0.2)",
  },
  minimal: {
    primary: "#3b82f6",
    primaryGlow: "rgba(59, 130, 246, 0.3)",
    background: "#09090b",
    backgroundSecondary: "#18181b",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    accent: "#60a5fa",
    cardBg: "rgba(24, 24, 27, 0.9)",
    borderColor: "rgba(59, 130, 246, 0.15)",
  },
  ocean: {
    primary: "#2dd4bf",
    primaryGlow: "rgba(45, 212, 191, 0.4)",
    background: "#042f2e",
    backgroundSecondary: "#134e4a",
    text: "#f0fdfa",
    textMuted: "#5eead4",
    accent: "#14b8a6",
    cardBg: "rgba(19, 78, 74, 0.8)",
    borderColor: "rgba(45, 212, 191, 0.2)",
  },
  sunset: {
    primary: "#fb923c",
    primaryGlow: "rgba(251, 146, 60, 0.4)",
    background: "#1c1917",
    backgroundSecondary: "#292524",
    text: "#fafaf9",
    textMuted: "#a8a29e",
    accent: "#f97316",
    cardBg: "rgba(41, 37, 36, 0.8)",
    borderColor: "rgba(251, 146, 60, 0.2)",
  },
};

const skillIcons: Record<string, typeof Code> = {
  "HTML": Code,
  "CSS": Palette,
  "JavaScript": Zap,
  "React": Layers,
  "Node.js": Server,
  "Python": Code,
  "UI/UX": Palette,
  "Database": Database,
  "Mobile": Smartphone,
  "Web": Globe,
};

interface PortfolioData {
  profile: StudentProfile | null;
  certificates: Certificate[];
  projects: ProjectSubmission[];
  skills: string[];
  stats: {
    coursesCompleted: number;
    projectsSubmitted: number;
    testsPassed: number;
    certificatesEarned: number;
  };
}

interface NeonPortfolioProps {
  isPreview?: boolean;
  username?: string;
}

export default function NeonPortfolioPage({ isPreview = false }: NeonPortfolioProps) {
  const params = useParams<{ username: string }>();
  const [location] = useLocation();
  const { toast } = useToast();
  
  const [currentTheme, setCurrentTheme] = useState<PortfolioTheme>("neon");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<PortfolioData>({
    profile: null,
    certificates: [],
    projects: [],
    skills: [],
    stats: { coursesCompleted: 0, projectsSubmitted: 0, testsPassed: 0, certificatesEarned: 0 },
  });

  const theme = themes[currentTheme];
  const isPublicView = location.includes("/portfolio/") || location.includes("/profile/");

  useEffect(() => {
    initializeMockCertificates();
    
    // Get profile or initialize a default one for preview mode
    let profile = getProfile();
    if (!profile && isPreview) {
      profile = initializeDefaultProfile("New Student");
    }
    
    const certificates = getAllCertificates();
    const submissions = getAllSubmissions();
    const testsPassed = getPassedTestsCount();
    
    const allSkills: string[] = [];
    certificates.forEach(cert => {
      if (cert.skills) allSkills.push(...cert.skills);
    });

    setData({
      profile,
      certificates,
      projects: submissions,
      skills: Array.from(new Set(allSkills)),
      stats: {
        coursesCompleted: certificates.length,
        projectsSubmitted: submissions.length,
        testsPassed,
        certificatesEarned: certificates.length,
      },
    });
  }, [params.username, isPreview]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "skills", "portfolio", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleCopyLink = () => {
    const url = data.profile ? `${window.location.origin}/portfolio/${data.profile.username}` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied", description: "Portfolio link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const { profile, certificates, projects, skills, stats } = data;

  if (!profile) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.background }}
      >
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div 
            className="w-24 h-24 rounded-full"
            style={{ background: theme.backgroundSecondary }}
          />
          <div 
            className="h-6 w-48 rounded"
            style={{ background: theme.backgroundSecondary }}
          />
        </div>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "portfolio", label: "Portfolio" },
    { id: "contact", label: "Contact" },
  ];

  const themeOptions: { id: PortfolioTheme; label: string }[] = [
    { id: "neon", label: "Neon" },
    { id: "cyberpunk", label: "Cyberpunk" },
    { id: "minimal", label: "Minimal" },
    { id: "ocean", label: "Ocean" },
    { id: "sunset", label: "Sunset" },
  ];

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundSecondary} 100%)`,
        color: theme.text,
        fontFamily: "'Inter', 'Poppins', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        
        .neon-glow {
          box-shadow: 0 0 20px ${theme.primaryGlow}, 0 0 40px ${theme.primaryGlow};
        }
        
        .neon-text {
          text-shadow: 0 0 10px ${theme.primaryGlow}, 0 0 20px ${theme.primaryGlow};
        }
        
        .glass-card {
          background: ${theme.cardBg};
          backdrop-filter: blur(12px);
          border: 1px solid ${theme.borderColor};
        }
        
        .hexagon-frame {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: ${theme.primary};
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .skill-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px ${theme.primaryGlow};
        }

        .project-card:hover {
          transform: scale(1.02);
        }
        
        .glow-button {
          background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
          box-shadow: 0 4px 15px ${theme.primaryGlow};
          transition: all 0.3s ease;
        }
        
        .glow-button:hover {
          box-shadow: 0 6px 25px ${theme.primaryGlow};
          transform: translateY(-2px);
        }

        .social-icon {
          border: 2px solid ${theme.borderColor};
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          border-color: ${theme.primary};
          background: ${theme.primaryGlow};
          transform: translateY(-3px);
        }
      `}</style>

      {isPreview && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-between gap-2"
          style={{ background: theme.backgroundSecondary, borderBottom: `1px solid ${theme.borderColor}` }}
        >
          <div className="flex items-center gap-3">
            <Link href="/shishya/profile">
              <Button variant="ghost" size="icon" style={{ color: theme.text }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" style={{ color: theme.textMuted }} />
              <span className="text-sm" style={{ color: theme.textMuted }}>Preview Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              {themeOptions.map(t => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTheme(t.id)}
                  className="px-2 py-1 text-xs rounded-md transition-all"
                  style={{
                    background: currentTheme === t.id ? theme.primary : "transparent",
                    color: currentTheme === t.id ? theme.background : theme.textMuted,
                  }}
                  data-testid={`button-theme-${t.id}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyLink}
              style={{ borderColor: theme.borderColor, color: theme.text }}
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              Copy
            </Button>
            <Button 
              size="sm"
              className="glow-button text-white"
              asChild
            >
              <a href={`/neon-portfolio/${profile.username}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </a>
            </Button>
          </div>
        </div>
      )}

      <nav 
        className={`fixed ${isPreview ? "top-12" : "top-0"} left-0 right-0 z-40 py-4 px-6 md:px-12 transition-all`}
        style={{ 
          background: `${theme.background}dd`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.borderColor}`,
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold"
            style={{ color: theme.primary }}
          >
            Portfolio.
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(item.id)}
                className={`nav-link relative text-sm font-medium transition-colors ${
                  activeSection === item.id ? "active" : ""
                }`}
                style={{ color: activeSection === item.id ? theme.primary : theme.textMuted }}
                data-testid={`nav-${item.id}`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: theme.backgroundSecondary }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 py-4 border-t"
              style={{ borderColor: theme.borderColor }}
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left py-3 px-4 rounded-lg transition-colors"
                  style={{ 
                    color: activeSection === item.id ? theme.primary : theme.textMuted,
                    background: activeSection === item.id ? theme.primaryGlow : "transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section 
        id="home" 
        className={`min-h-screen flex items-center ${isPreview ? "pt-24" : "pt-16"} px-6 md:px-12`}
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-lg" style={{ color: theme.textMuted }}>
              Hello, It's Me
            </p>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              data-testid="text-hero-name"
            >
              {profile.fullName}
            </h1>
            
            <p className="text-xl md:text-2xl">
              And I'm a{" "}
              <span 
                className="font-semibold neon-text"
                style={{ color: theme.primary }}
              >
                {profile.headline || "Developer"}
              </span>
            </p>
            
            <p style={{ color: theme.textMuted }} className="max-w-md">
              {profile.bio || "Passionate about creating amazing digital experiences and bringing ideas to life through code."}
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              {profile.githubUrl && (
                <a 
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon w-10 h-10 rounded-full flex items-center justify-center"
                  data-testid="social-github"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a 
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon w-10 h-10 rounded-full flex items-center justify-center"
                  data-testid="social-linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              <a 
                href={`mailto:${profile.username}@example.com`}
                className="social-icon w-10 h-10 rounded-full flex items-center justify-center"
                data-testid="social-email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <div 
                className="social-icon w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                data-testid="social-twitter"
              >
                <Twitter className="w-5 h-5" />
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                className="glow-button px-8 py-3 rounded-full text-white font-medium flex items-center gap-2"
                data-testid="button-download-cv"
              >
                <Download className="w-4 h-4" />
                Download CV
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full floating"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primary}40, ${theme.accent}20)`,
                  transform: "scale(1.15)",
                }}
              />
              <div 
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden neon-glow floating"
                style={{ 
                  background: theme.backgroundSecondary,
                  boxShadow: `0 0 40px ${theme.primary}40, 0 0 80px ${theme.primary}20`,
                }}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage 
                    src={profile.profilePhoto || undefined} 
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback 
                    className="w-full h-full text-6xl font-bold flex items-center justify-center"
                    style={{ background: theme.backgroundSecondary, color: theme.primary }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              About <span style={{ color: theme.primary }}>Me</span>
            </h2>
            <div 
              className="w-20 h-1 mx-auto rounded-full"
              style={{ background: theme.primary }}
            />
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: theme.primary }}>
                Who I Am
              </h3>
              <p style={{ color: theme.textMuted }} className="leading-relaxed">
                {profile.bio || 
                  "I'm a passionate developer focused on creating beautiful and functional web experiences. With a strong foundation in modern technologies and a keen eye for design, I bring ideas to life through clean, efficient code."}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                {profile.location && (
                  <div className="flex items-center gap-2" style={{ color: theme.textMuted }}>
                    <MapPin className="w-4 h-4" style={{ color: theme.primary }} />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-2" style={{ color: theme.textMuted }}>
                  <Calendar className="w-4 h-4" style={{ color: theme.primary }} />
                  Joined OurShiksha
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "Courses", value: stats.coursesCompleted, icon: GraduationCap },
                { label: "Projects", value: stats.projectsSubmitted, icon: Briefcase },
                { label: "Tests Passed", value: stats.testsPassed, icon: Award },
                { label: "Certificates", value: stats.certificatesEarned, icon: Star },
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="glass-card rounded-xl p-6 text-center"
                >
                  <stat.icon 
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: theme.primary }}
                  />
                  <div 
                    className="text-3xl font-bold neon-text"
                    style={{ color: theme.primary }}
                  >
                    {stat.value}+
                  </div>
                  <div style={{ color: theme.textMuted }} className="text-sm mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="skills" className="py-20 px-6 md:px-12" style={{ background: theme.backgroundSecondary }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              My <span style={{ color: theme.primary }}>Skills</span>
            </h2>
            <div 
              className="w-20 h-1 mx-auto rounded-full"
              style={{ background: theme.primary }}
            />
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(skills.length > 0 ? skills : ["HTML", "CSS", "JavaScript", "React", "Node.js", "Python", "UI/UX", "Database"]).map((skill, index) => {
              const IconComponent = skillIcons[skill] || Code;
              return (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="skill-card glass-card rounded-xl p-6 text-center transition-all cursor-default"
                  data-testid={`skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div 
                    className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${theme.primary}20` }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: theme.primary }} />
                  </div>
                  <h4 className="font-semibold">{skill}</h4>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              My <span style={{ color: theme.primary }}>Portfolio</span>
            </h2>
            <div 
              className="w-20 h-1 mx-auto rounded-full"
              style={{ background: theme.primary }}
            />
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(projects.length > 0 ? projects : [
              { projectId: 1, courseId: 1, githubUrl: "#", description: "A modern web application built with React" },
              { projectId: 2, courseId: 2, githubUrl: "#", description: "Full-stack e-commerce platform" },
              { projectId: 3, courseId: 3, githubUrl: "#", description: "Real-time chat application" },
            ]).map((project, index) => (
              <motion.div
                key={project.projectId}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="project-card glass-card rounded-2xl overflow-hidden transition-all"
                data-testid={`project-card-${project.projectId}`}
              >
                <div 
                  className="h-48 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}30, ${theme.accent}20)` }}
                >
                  <Layers className="w-16 h-16" style={{ color: theme.primary }} />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Project #{project.projectId}
                  </h3>
                  <p style={{ color: theme.textMuted }} className="text-sm mb-4">
                    {(project as any).description || (project as any).notes || "A creative project showcasing modern development skills."}
                  </p>
                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium"
                        style={{ color: theme.primary }}
                      >
                        <Github className="w-4 h-4" />
                        Code
                      </a>
                    )}
                    <button
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{ color: theme.primary }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {certificates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <h3 className="text-2xl font-bold text-center">
                  <span style={{ color: theme.primary }}>Certificates</span> Earned
                </h3>
                <a
                  href={isPreview ? "/shishya/marksheet" : `/verify/marksheet/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all glow-button text-white"
                  data-testid="button-total-marksheet"
                >
                  <ScrollText className="w-4 h-4" />
                  Total Marksheet
                </a>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.slice(0, 6).map((cert, index) => (
                  <div 
                    key={cert.certificateId}
                    className="glass-card rounded-xl p-6"
                    data-testid={`certificate-${cert.certificateId}`}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${theme.primary}20` }}
                      >
                        <Award className="w-6 h-6" style={{ color: theme.primary }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{cert.courseTitle}</h4>
                        <p style={{ color: theme.textMuted }} className="text-sm mt-1">
                          Completed Course
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {cert.skills?.slice(0, 3).map(skill => (
                            <span 
                              key={skill}
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ 
                                background: `${theme.primary}20`,
                                color: theme.primary,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <a
                          href={`/verify/certificate/${cert.certificateId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium transition-all"
                          style={{ 
                            background: `${theme.primary}20`,
                            color: theme.primary,
                            border: `1px solid ${theme.primary}40`,
                          }}
                          data-testid={`button-open-certificate-${cert.certificateId}`}
                        >
                          <FileText className="w-4 h-4" />
                          Open Certificate
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <section id="contact" className="py-20 px-6 md:px-12" style={{ background: theme.backgroundSecondary }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Contact <span style={{ color: theme.primary }}>Me</span>
            </h2>
            <div 
              className="w-20 h-1 mx-auto rounded-full"
              style={{ background: theme.primary }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textMuted }}
                  >
                    Your Name
                  </label>
                  <Input 
                    placeholder="John Doe"
                    className="w-full rounded-xl border-0 focus:ring-2"
                    style={{ 
                      background: theme.background,
                      color: theme.text,
                    }}
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textMuted }}
                  >
                    Your Email
                  </label>
                  <Input 
                    type="email"
                    placeholder="john@example.com"
                    className="w-full rounded-xl border-0 focus:ring-2"
                    style={{ 
                      background: theme.background,
                      color: theme.text,
                    }}
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme.textMuted }}
                >
                  Your Message
                </label>
                <Textarea 
                  placeholder="Hello, I'd like to connect..."
                  rows={5}
                  className="w-full rounded-xl border-0 focus:ring-2 resize-none"
                  style={{ 
                    background: theme.background,
                    color: theme.text,
                  }}
                  data-testid="input-contact-message"
                />
              </div>
              <div className="text-center">
                <button 
                  type="submit"
                  className="glow-button px-8 py-3 rounded-full text-white font-medium inline-flex items-center gap-2"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <footer 
        className="py-8 px-6 md:px-12 border-t"
        style={{ borderColor: theme.borderColor }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" style={{ color: theme.primary }} />
            <span style={{ color: theme.textMuted }} className="text-sm">
              Portfolio powered by <span style={{ color: theme.primary }} className="font-semibold">OurShiksha</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {profile.githubUrl && (
              <a 
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.textMuted }}
                className="hover:opacity-80 transition-opacity"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {profile.linkedinUrl && (
              <a 
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: theme.textMuted }}
                className="hover:opacity-80 transition-opacity"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            <a 
              href={`mailto:${profile.username}@example.com`}
              style={{ color: theme.textMuted }}
              className="hover:opacity-80 transition-opacity"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
          
          <p style={{ color: theme.textMuted }} className="text-sm">
            &copy; {new Date().getFullYear()} {profile.fullName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function NeonPortfolioPreview() {
  return <NeonPortfolioPage isPreview />;
}

export function PublicNeonPortfolio() {
  return <NeonPortfolioPage isPreview={false} />;
}
