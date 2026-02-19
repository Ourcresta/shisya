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
  Copy, Menu, X, ChevronRight, Star, Calendar, FileText, ScrollText, ShieldCheck
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

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
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
        className={`min-h-screen flex items-center relative ${isPreview ? "pt-24" : "pt-16"} px-6 md:px-12`}
        style={{ overflow: "hidden" }}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "hidden" }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${4 + i * 2}px`,
                height: `${4 + i * 2}px`,
                background: theme.primary,
                opacity: 0.15 + i * 0.03,
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, i % 2 === 0 ? 15 : -15, 0],
                opacity: [0.1 + i * 0.03, 0.25 + i * 0.03, 0.1 + i * 0.03],
              }}
              transition={{
                duration: 4 + i * 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
          <div
            className="absolute rounded-full"
            style={{
              width: "500px",
              height: "500px",
              background: `radial-gradient(circle, ${theme.primary}08 0%, transparent 70%)`,
              right: "-100px",
              top: "10%",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "400px",
              height: "400px",
              background: `radial-gradient(circle, ${theme.accent}06 0%, transparent 70%)`,
              left: "-80px",
              bottom: "5%",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
              style={{ background: `${theme.primary}15`, border: `1px solid ${theme.primary}30`, color: theme.primary }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: theme.primary, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: theme.primary }} />
              </span>
              Available for opportunities
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
              data-testid="text-hero-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {profile.fullName.split(" ").map((word, idx) => (
                <span key={idx}>
                  {idx === profile.fullName.split(" ").length - 1 ? (
                    <span style={{ color: theme.primary }} className="neon-text">{word}</span>
                  ) : (
                    <>{word} </>
                  )}
                </span>
              ))}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="text-xl md:text-2xl font-light"
              style={{ color: theme.textMuted }}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-8 h-[2px] inline-block"
                  style={{ background: theme.primary }}
                />
                <span 
                  className="font-semibold"
                  style={{ color: theme.primary }}
                >
                  {profile.headline || "Developer"}
                </span>
              </span>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              style={{ color: theme.textMuted }} 
              className="max-w-lg text-base leading-relaxed"
            >
              {profile.bio || "Passionate about creating amazing digital experiences and bringing ideas to life through code."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              {[
                { value: stats.coursesCompleted, label: "Courses" },
                { value: stats.projectsSubmitted, label: "Projects" },
                { value: stats.certificatesEarned, label: "Certs" },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  {i > 0 && <span style={{ color: theme.borderColor }} className="text-lg">|</span>}
                  <span className="text-xl font-bold" style={{ color: theme.primary }}>{s.value}</span>
                  <span className="text-xs" style={{ color: theme.textMuted }}>{s.label}</span>
                </div>
              ))}
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-4 pt-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <button 
                className="glow-button px-8 py-3 rounded-full text-white font-medium flex items-center gap-2"
                data-testid="button-download-cv"
                onClick={() => scrollToSection("portfolio")}
              >
                <Briefcase className="w-4 h-4" />
                View Portfolio
              </button>
              <button 
                className="px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all"
                style={{ 
                  border: `1px solid ${theme.borderColor}`,
                  color: theme.text,
                  background: `${theme.primary}08`,
                }}
                onClick={() => scrollToSection("contact")}
                data-testid="button-hero-contact"
              >
                <Mail className="w-4 h-4" />
                Contact Me
              </button>
            </motion.div>

            <motion.div 
              className="flex items-center gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.85 }}
            >
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
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative">
              <svg 
                className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)]"
                viewBox="0 0 320 320"
                style={{ filter: `drop-shadow(0 0 12px ${theme.primary}30)` }}
              >
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.primary} stopOpacity="0.8" />
                    <stop offset="50%" stopColor={theme.accent} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={theme.primary} stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="160" cy="160" r="150"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="2"
                  strokeDasharray="12 8"
                  style={{ animation: "spin 25s linear infinite" }}
                />
                <circle
                  cx="160" cy="160" r="140"
                  fill="none"
                  stroke={theme.primary}
                  strokeWidth="1"
                  strokeOpacity="0.15"
                />
              </svg>

              <motion.div
                className="absolute -top-2 -right-2 z-20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                style={{ 
                  background: theme.primary, 
                  color: theme.background,
                  boxShadow: `0 4px 20px ${theme.primaryGlow}`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 200 }}
              >
                <ShieldCheck className="w-3 h-3" />
                Verified
              </motion.div>

              <div 
                className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden"
                style={{ 
                  background: theme.backgroundSecondary,
                  boxShadow: `0 0 50px ${theme.primary}25, 0 0 100px ${theme.primary}10, inset 0 0 30px ${theme.primary}08`,
                  border: `2px solid ${theme.primary}30`,
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

              {[
                { icon: Code, pos: "top-4 -left-8", delay: 1.1 },
                { icon: Layers, pos: "bottom-8 -left-6", delay: 1.3 },
                { icon: Zap, pos: "-bottom-2 right-4", delay: 1.5 },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className={`absolute ${item.pos} z-20`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: item.delay, type: "spring", stiffness: 150 }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: theme.cardBg,
                      border: `1px solid ${theme.borderColor}`,
                      backdropFilter: "blur(8px)",
                      boxShadow: `0 4px 15px ${theme.primary}15`,
                    }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button
            onClick={() => scrollToSection("about")}
            className="flex flex-col items-center gap-2 group"
            data-testid="button-scroll-down"
          >
            <span className="text-xs" style={{ color: theme.textMuted }}>Scroll Down</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronRight className="w-5 h-5 rotate-90" style={{ color: theme.primary }} />
            </motion.div>
          </button>
        </motion.div>
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
