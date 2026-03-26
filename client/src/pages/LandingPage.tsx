import { type ComponentType } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelBadge } from "@/components/ui/level-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  FolderKanban,
  ClipboardCheck,
  Award,
  Briefcase,
  ArrowRight,
  LogIn,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Globe,
  Sparkles,
  MessageCircle,
  Star,
  Layers,
  Trophy,
  Building2,
  Handshake,
  Play,
  CheckCircle2,
  TrendingUp,
  Zap,
  Users,
  Shield,
  BadgeCheck,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Heart,
  Send,
} from "lucide-react";
import type { Course } from "@shared/schema";
import ushaAvatarImage from "@assets/image_1767697725032.png";
import ushaHeroImage from "@assets/image_1774463715608.png";
import icon3dCourses from "@assets/generated_images/icon-3d-courses.png";
import icon3dLabs from "@assets/generated_images/icon-3d-labs.png";
import icon3dProjects from "@assets/generated_images/icon-3d-projects.png";
import icon3dCertificate from "@assets/generated_images/icon-3d-certificate.png";
import icon3dInternship from "@assets/generated_images/icon-3d-internship.png";
import sealLogo from "@assets/image_1771692892158.png";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const C = {
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F8F7FF",
  cardBg: "#FFFFFF",
  cardBorder: "#EDE9FF",
  teal: "#6367FF",
  purple: "#8494FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  textPrimary: "#1A1A1A",
  textSecondary: "#4B5563",
  highlight: "#FFDBFD",
  lightBg: "#C9BEFF",
};

const HERO_GRAD = "linear-gradient(135deg, #6367FF 0%, #8494FF 60%, #C9BEFF 100%)";
const CTA_GRAD = "linear-gradient(135deg, #6367FF 0%, #8494FF 100%)";

const journeySteps = [
  { icon: BookOpen, title: "Learn", description: "Structured lessons designed for clarity" },
  { icon: FlaskConical, title: "Practice", description: "Guided labs to build real skills" },
  { icon: FolderKanban, title: "Build", description: "Industry-aligned projects" },
  { icon: ClipboardCheck, title: "Validate", description: "Tests and assessments" },
  { icon: Award, title: "Prove", description: "Certificates and portfolio" },
];

interface FeatureItem {
  icon: ComponentType<{ className?: string; style?: Record<string, string> }>;
  imgSrc?: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  { icon: BookOpen, imgSrc: icon3dCourses, title: "Structured Courses", description: "Clear learning paths" },
  { icon: FlaskConical, imgSrc: icon3dLabs, title: "Guided Labs", description: "Hands-on practice" },
  { icon: FolderKanban, imgSrc: icon3dProjects, title: "Real Projects", description: "Build your portfolio" },
  { icon: ClipboardCheck, title: "Skill Assessments", description: "Validate your knowledge" },
  { icon: Award, imgSrc: icon3dCertificate, title: "Verified Certificates", description: "Prove your skills" },
  { icon: Briefcase, title: "Career Portfolio", description: "Showcase your work" },
  { icon: Building2, imgSrc: icon3dInternship, title: "Guaranteed Internship", description: "Real-world work experience" },
  { icon: Handshake, title: "Job Assistance", description: "Placement support & referrals" },
];

const aiFeatures = [
  { icon: Sparkles, title: "Usha AI Tutor", description: "Your personal learning companion" },
  { icon: Globe, title: "Multi-Language", description: "Learn in English, Hindi, or Tamil" },
  { icon: MessageCircle, title: "Smart Hints", description: "Get guidance without answers" },
  { icon: Award, title: "Instant Support", description: "Ask doubts anytime" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Developer",
    content: "Transitioned from non-tech to landing my first dev job — OurShiksha's structured courses made all the difference.",
    rating: 5,
  },
  {
    name: "Rahul Kumar",
    role: "Data Analyst",
    content: "The guided labs gave me real, applicable experience. Exactly what I needed to break into data analytics.",
    rating: 5,
  },
  {
    name: "Ananya Reddy",
    role: "Full Stack Developer",
    content: "Verified certificates that employers trust instantly. My credential QR code has opened more doors than my degree.",
    rating: 5,
  },
];

const faqItems = [
  {
    question: "What is OurShiksha?",
    answer: "A skill-learning platform offering structured courses, hands-on labs, real projects, and verified certificates to help you grow your career.",
  },
  {
    question: "How do learning credits work?",
    answer: "Sign up and receive 500 free credits instantly. Use them to enroll in paid courses — some courses are completely free.",
  },
  {
    question: "Are the certificates industry-recognized?",
    answer: "Yes. Each certificate has a unique QR code that lets employers instantly verify your credentials on our public verification page.",
  },
  {
    question: "Can I learn at my own pace?",
    answer: "Yes — all courses are fully self-paced. Your progress is saved automatically so you can pick up exactly where you left off.",
  },
  {
    question: "What is Usha AI Tutor?",
    answer: "Usha is an AI assistant built into every lesson, lab, and project. She guides you with smart hints instead of direct answers, ensuring genuine learning.",
  },
  {
    question: "How do I get started?",
    answer: "Sign up for free, receive 500 credits, and enroll in any course. No credit card required.",
  },
];

function GlassCard({
  children,
  className = "",
  hover = true,
  style,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${
        hover ? "hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(99,103,255,0.18)]" : ""
      } ${className}`}
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        boxShadow: "0 1px 4px rgba(99,103,255,0.06)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,103,255,0.35)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px -8px rgba(99,103,255,0.18)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
          (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(99,103,255,0.06)";
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function StatsBar() {
  const stats = [
    { value: "25K+", label: "Active Learners", icon: Users },
    { value: "100+", label: "Expert Courses", icon: BookOpen },
    { value: "4.9★", label: "Student Rating", icon: Star },
    { value: "10K+", label: "Certs Issued", icon: Award },
  ];
  return (
    <div style={{ background: "#FFFFFF", borderBottom: "1px solid #EDE9FF" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-3 py-3"
              style={{
                borderRight: i < 3 ? "1px solid #EDE9FF" : "none",
                borderLeft: i === 0 ? "none" : undefined,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(99,103,255,0.08)", border: "1px solid rgba(99,103,255,0.15)" }}
              >
                <stat.icon className="w-4 h-4" style={{ color: C.teal }} />
              </div>
              <div>
                <div className="text-base font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>{stat.value}</div>
                <div className="text-[11px] mt-0.5" style={{ color: C.textSecondary }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionGlow({ position = "center", color = C.teal }: { position?: string; color?: string }) {
  const posStyles: Record<string, React.CSSProperties> = {
    center: { top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
    "top-right": { top: "0", right: "0" },
    "bottom-left": { bottom: "0", left: "0" },
    "top-left": { top: "0", left: "10%" },
  };
  return (
    <div
      className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.08] pointer-events-none"
      style={{ background: `radial-gradient(circle, ${color}, transparent)`, ...posStyles[position] }}
    />
  );
}

function HeroSection() {
  const { user } = useAuth();
  const [mode, setMode] = useState(0);
  const [visible, setVisible] = useState(true);
  const [underlineWidth, setUnderlineWidth] = useState("0%");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modes = [
    { headline: "Learn. Build. Prove.", subtext: "Certified by Our Shiksha." },
    { headline: "Get Matched. Work. Prove.", subtext: "Certified by Our Udyog." },
  ];

  const triggerSwitch = useCallback(() => {
    setVisible(false);
    setUnderlineWidth("0%");
    timerRef.current = setTimeout(() => {
      setMode((prev) => (prev + 1) % 2);
      setVisible(true);
      setTimeout(() => setUnderlineWidth("100%"), 50);
    }, 420);
  }, []);

  useEffect(() => {
    setUnderlineWidth("100%");
    const interval = setInterval(triggerSwitch, 4000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerSwitch]);

  const current = modes[mode];

  return (
    <section
      className="relative overflow-x-hidden"
      style={{ background: HERO_GRAD, minHeight: "clamp(520px, 80vh, 760px)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(201,190,255,0.15)" }} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 h-full">
        <div className="grid lg:grid-cols-2 gap-0 items-end h-full">

          {/* Left: Text content */}
          <div className="text-center lg:text-left space-y-6 py-14 lg:py-20 xl:py-24">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", backdropFilter: "blur(8px)" }}>
              <Sparkles className="w-3.5 h-3.5" />
              India's Premier AI Learning Platform
            </div>

            <div className="min-h-[140px] md:min-h-[170px] lg:min-h-[190px] flex flex-col justify-center">
              <p
                className="text-base md:text-lg font-medium mb-2"
                style={{ color: "rgba(255,255,255,0.8)", letterSpacing: "0.01em" }}
              >
                Your Path to Mastery
              </p>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 400ms ease, transform 400ms ease",
                }}
                data-testid="text-hero-headline"
              >
                {current.headline}
              </h1>

              <div className="relative mt-3">
                <p
                  className="text-sm md:text-base font-medium"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(10px)",
                    transition: "opacity 400ms ease 80ms, transform 400ms ease 80ms",
                    letterSpacing: "0.04em",
                  }}
                  data-testid="text-hero-subtext"
                >
                  {current.subtext}
                </p>
                <div
                  className="mt-2 h-[2px] rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    width: underlineWidth,
                    maxWidth: mode === 0 ? "210px" : "220px",
                    transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                    opacity: visible ? 1 : 0,
                  }}
                  data-testid="hero-underline-glow"
                />
              </div>
            </div>

            <p
              className="text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
              style={{ color: "rgba(255,255,255,0.82)", lineHeight: "1.7" }}
              data-testid="text-hero-subheading"
            >
              An AI-powered e-learning platform combining structured courses, hands-on labs, real projects, and a personal AI tutor —Usha— to accelerate your career.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {user ? (
                <Link href="/shishya/dashboard">
                  <button
                    className="min-w-[190px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    style={{
                      background: "#FFFFFF",
                      color: C.teal,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                    }}
                    data-testid="button-go-to-shishya"
                  >
                    Go to Shishya
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button
                      className="min-w-[190px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      style={{
                        background: "#FFFFFF",
                        color: C.teal,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                      }}
                      data-testid="button-hero-login"
                    >
                      Start Learning Free
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                  <Link href="/courses">
                    <button
                      className="min-w-[170px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      style={{
                        background: "transparent",
                        color: "#FFFFFF",
                        border: "1.5px solid rgba(255,255,255,0.55)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.55)";
                      }}
                      data-testid="button-hero-explore"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Watch Demo
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Social proof pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-1" data-testid="hero-social-proof">
              {[
                { icon: CheckCircle2, label: "500 Free Credits" },
                { icon: TrendingUp, label: "Self-Paced" },
                { icon: Award, label: "Verified Certs" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <item.icon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.7)" }} />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Usha character + floating cards */}
          <div className="hidden lg:flex relative items-end justify-center lg:justify-end self-end">
            {/* Usha full-body image */}
            <div className="relative" style={{ width: "100%", maxWidth: "520px" }}>
              <img
                src={ushaHeroImage}
                alt="Usha AI Tutor"
                className="relative z-10 w-full object-contain object-bottom"
                style={{
                  height: "clamp(440px, 72vh, 680px)",
                  transform: "translateY(0)",
                  filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.22))",
                }}
                data-testid="img-usha-avatar-hero"
              />

              {/* Floating: My Progress card — top right */}
              <div
                className="absolute z-20 rounded-2xl"
                style={{
                  top: "48px",
                  right: "-24px",
                  background: "#FFFFFF",
                  border: "1px solid #EDE9FF",
                  padding: "14px 16px",
                  minWidth: "190px",
                  boxShadow: "0 8px 32px rgba(99,103,255,0.18)",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1A1A1A" }}>My Progress</span>
                  <span style={{ fontSize: "10px", background: C.highlight, color: C.teal, padding: "2px 8px", borderRadius: "8px", fontWeight: 600 }}>Active</span>
                </div>
                {[{ label: "Python Basics", pct: 76 }, { label: "Web Dev Bootcamp", pct: 60 }, { label: "Data Science", pct: 20 }].map(item => (
                  <div key={item.label} className="mb-1.5">
                    <div className="flex justify-between mb-0.5">
                      <span style={{ fontSize: "10px", color: C.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: C.teal }}>{item.pct}%</span>
                    </div>
                    <div style={{ height: "3px", background: "#EDE9FF", borderRadius: "4px" }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: CTA_GRAD, borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating: Certificate Earned — right mid */}
              <div
                className="absolute z-20 flex items-center gap-2.5 rounded-2xl"
                style={{
                  top: "240px",
                  right: "-28px",
                  background: "#FFFFFF",
                  border: "1px solid #EDE9FF",
                  padding: "11px 16px",
                  boxShadow: "0 8px 24px rgba(99,103,255,0.16)",
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: CTA_GRAD }}>
                  <Award className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#1A1A1A" }}>Certificate Earned!</p>
                  <p style={{ fontSize: "10px", color: C.textSecondary }}>Python Developer</p>
                </div>
              </div>

              {/* Floating: Usha says — bottom right */}
              <div
                className="absolute z-20 flex items-center gap-2.5 rounded-2xl"
                style={{
                  bottom: "64px",
                  right: "-24px",
                  background: "#FFFFFF",
                  border: "1px solid #EDE9FF",
                  padding: "11px 16px",
                  boxShadow: "0 8px 24px rgba(99,103,255,0.15)",
                  maxWidth: "200px",
                }}
              >
                <img src={ushaAvatarImage} alt="Usha" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#1A1A1A" }}>Usha AI says...</p>
                  <p style={{ fontSize: "10px", color: C.textSecondary }}>Try the next lab! 💡</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

const journeyColors = [
  { accent: "#6367FF", glow: "rgba(99,103,255,0.15)", bg: "rgba(99,103,255,0.06)", border: "rgba(99,103,255,0.2)", text: "#6367FF" },
  { accent: "#8494FF", glow: "rgba(132,148,255,0.15)", bg: "rgba(132,148,255,0.06)", border: "rgba(132,148,255,0.2)", text: "#8494FF" },
  { accent: "#10B981", glow: "rgba(16,185,129,0.15)", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", text: "#10B981" },
  { accent: "#F59E0B", glow: "rgba(245,158,11,0.15)", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", text: "#F59E0B" },
  { accent: "#EC4899", glow: "rgba(236,72,153,0.15)", bg: "rgba(236,72,153,0.06)", border: "rgba(236,72,153,0.2)", text: "#EC4899" },
];

function JourneySection() {
  return (
    <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgSecondary }}>
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 tracking-widest uppercase"
            style={{ background: "rgba(99,103,255,0.08)", border: "1px solid rgba(99,103,255,0.2)", color: C.teal }}>
            How It Works
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
            data-testid="text-journey-title"
          >
            Your Learning Journey
          </h2>
          <p style={{ color: C.textSecondary }} className="text-sm">5 steps from zero to certified</p>
        </div>

        {/* Desktop: horizontal compact timeline */}
        <div className="hidden lg:flex items-stretch gap-0 relative">
          {journeySteps.map((step, index) => {
            const col = journeyColors[index];
            const isLast = index === journeySteps.length - 1;
            return (
              <div key={step.title} className="flex-1 flex items-stretch relative" data-testid={`card-journey-step-${index + 1}`}>
                <div
                  className="relative flex flex-col flex-1 rounded-xl p-4 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(160deg, ${col.bg}, ${C.cardBg})`,
                    border: `1px solid ${col.border}`,
                    boxShadow: `0 2px 16px -8px ${col.glow}`,
                    margin: "0 5px",
                  }}
                >
                  <div
                    className="absolute -right-1 -bottom-3 text-[72px] font-black leading-none select-none pointer-events-none"
                    style={{ color: col.accent, opacity: 0.05, fontFamily: "var(--font-display)" }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: col.accent, color: "#FFFFFF" }}
                    >
                      {index + 1}
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: col.bg, border: `1px solid ${col.border}` }}
                    >
                      <step.icon className="w-4 h-4" style={{ color: col.accent }} />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{step.description}</p>

                  {!isLast && (
                    <div
                      className="absolute top-1/2 -right-[6px] -translate-y-1/2 z-10 w-2.5 h-2.5 rounded-full"
                      style={{ background: col.accent }}
                    />
                  )}
                </div>
                {!isLast && (
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 flex items-center justify-center z-20">
                    <div style={{ width: 2, height: 20, borderLeft: `2px dashed ${col.accent}`, opacity: 0.3 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: compact horizontal scrollable pills */}
        <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
          {journeySteps.map((step, index) => {
            const col = journeyColors[index];
            return (
              <div
                key={step.title}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ background: col.bg, border: `1px solid ${col.border}`, minWidth: "120px" }}
                data-testid={`card-journey-step-mobile-${index + 1}`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: col.accent, color: "#FFFFFF" }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>{step.title}</div>
                  <div className="text-[10px]" style={{ color: C.textSecondary }}>{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const featureAccents = [
  "#6367FF", "#8494FF", "#10B981", "#F59E0B",
  "#EC4899", "#3B82F6", "#F97316", "#84CC16",
];

function FeaturesSection() {
  return (
    <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgPrimary }}>
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 tracking-widest uppercase"
            style={{ background: "rgba(132,148,255,0.1)", border: "1px solid rgba(132,148,255,0.25)", color: C.purple }}>
            Platform Features
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
            data-testid="text-features-title"
          >
            Everything You Need
          </h2>
          <p style={{ color: C.textSecondary }} className="text-sm">8 pillars of a complete learning experience</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {features.map((feature, index) => {
            const accent = featureAccents[index % featureAccents.length];
            return (
              <div
                key={feature.title}
                className="relative group rounded-xl p-3.5 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-3"
                style={{
                  background: "#FAFAFE",
                  border: "1px solid #EDE9FF",
                  borderLeft: `3px solid ${accent}`,
                  boxShadow: "0 1px 6px rgba(99,103,255,0.05)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = `${accent}07`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 18px -6px ${accent}35`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#FAFAFE";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 6px rgba(99,103,255,0.05)";
                }}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {/* Icon container */}
                <div
                  className="flex items-center justify-center shrink-0 rounded-lg"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: feature.imgSrc ? "transparent" : `${accent}14`,
                    border: feature.imgSrc ? "none" : `1px solid ${accent}28`,
                  }}
                >
                  {feature.imgSrc ? (
                    <img
                      src={feature.imgSrc}
                      alt={feature.title}
                      style={{
                        width: "36px",
                        height: "36px",
                        objectFit: "contain",
                        filter: "drop-shadow(0 2px 6px rgba(99,103,255,0.25))",
                      }}
                    />
                  ) : (
                    <feature.icon className="w-4 h-4" style={{ color: accent }} />
                  )}
                </div>
                {/* Text */}
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs leading-tight truncate" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>
                    {feature.title}
                  </h3>
                  <p className="text-[10px] mt-0.5 leading-relaxed line-clamp-2" style={{ color: C.textSecondary }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CoursePreviewCard({ course }: { course: Course }) {
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = course.thumbnailUrl && !imgError;
  const rating = (course as any).rating ?? 0;

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        boxShadow: "0 2px 12px rgba(99,103,255,0.08)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,103,255,0.35)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 30px -8px rgba(99,103,255,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(99,103,255,0.08)";
      }}
      data-testid={`card-preview-course-${course.id}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {hasThumbnail ? (
          <img
            src={course.thumbnailUrl!}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, rgba(99,103,255,0.08), rgba(132,148,255,0.06))` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(99,103,255,0.12)", border: "1px solid rgba(99,103,255,0.22)" }}
            >
              <BookOpen className="w-7 h-7" style={{ color: C.teal }} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        {course.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: C.teal, color: "#FFFFFF", backdropFilter: "blur(8px)" }}
            >
              {course.category}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <LevelBadge level={course.level} />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3
          className="text-base font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
        >
          {course.title}
        </h3>
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium" style={{ color: C.textSecondary }}>{rating.toFixed(1)}</span>
          </div>
        )}
        {course.description && (
          <p className="text-sm line-clamp-3" style={{ color: C.textSecondary }}>{course.description}</p>
        )}
      </div>
      <div className="p-4 pt-0">
        <Link href={`/courses/${course.id}`} className="block">
          <button
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            style={{
              background: "rgba(99,103,255,0.06)",
              color: C.teal,
              border: `1px solid rgba(99,103,255,0.2)`,
            }}
            data-testid={`button-view-course-${course.id}`}
          >
            View Course
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}

interface CourseGroupLanding {
  id: number;
  name: string;
  description: string | null;
  level: string;
  groupType: string;
  thumbnailUrl: string | null;
  price: number;
  courseCount: number;
  aggregatedSkills: string;
  courses: Course[];
}

function GroupCard({ group }: { group: CourseGroupLanding }) {
  const isTrack = group.groupType === "track";
  return (
    <div
      className="w-[300px] md:w-[340px] shrink-0 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        boxShadow: "0 4px 20px rgba(99,103,255,0.1)",
      }}
    >
      <div className="relative aspect-video overflow-hidden">
        {group.thumbnailUrl ? (
          <img
            src={group.thumbnailUrl}
            alt={group.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: isTrack
                ? "linear-gradient(135deg, rgba(99,103,255,0.08), rgba(132,148,255,0.04))"
                : "linear-gradient(135deg, rgba(132,148,255,0.1), rgba(201,190,255,0.06))",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: isTrack ? "rgba(99,103,255,0.12)" : "rgba(132,148,255,0.15)",
                border: `1px solid ${isTrack ? "rgba(99,103,255,0.22)" : "rgba(132,148,255,0.28)"}`,
              }}
            >
              {isTrack
                ? <Layers className="w-7 h-7" style={{ color: C.teal }} />
                : <Trophy className="w-7 h-7" style={{ color: C.purple }} />
              }
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: isTrack ? C.teal : C.purple,
              color: "#fff",
            }}
          >
            {isTrack ? "🛤 Track" : "🎓 Program"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {group.price > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}>
              {group.price} Credits
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>
              FREE
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-base leading-snug line-clamp-1" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>
            {group.name}
          </h3>
          {group.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: C.textSecondary }}>{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: C.textSecondary }}>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {group.courseCount} courses
          </span>
          <span className="capitalize px-2 py-0.5 rounded-full" style={{ background: "rgba(99,103,255,0.07)", color: C.teal }}>
            {group.level}
          </span>
        </div>

        {group.courses.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {group.courses.slice(0, 3).map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                <span
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
                  style={{ background: "rgba(99,103,255,0.1)", color: C.teal }}
                >
                  {i + 1}
                </span>
                <span className="truncate">{c.title}</span>
              </div>
            ))}
            {group.courseCount > 3 && (
              <span className="text-xs pl-6" style={{ color: C.textSecondary }}>+{group.courseCount - 3} more</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          <Link href={`/group/${group.id}`}>
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: isTrack ? "rgba(99,103,255,0.07)" : "rgba(132,148,255,0.1)",
                color: isTrack ? C.teal : C.purple,
                border: `1px solid ${isTrack ? "rgba(99,103,255,0.2)" : "rgba(132,148,255,0.25)"}`,
              }}
              data-testid={`button-view-group-${group.id}`}
            >
              View Courses
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedCoursesSection() {
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  const { data: groups, isLoading: groupsLoading } = useQuery<CourseGroupLanding[]>({
    queryKey: ["/api/course-groups"],
  });

  const allCourses = courses ?? [];
  const tracks = (groups ?? []).filter(g => g.groupType === "track");
  const programs = (groups ?? []).filter(g => g.groupType === "program");

  const [courseIdx, setCourseIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [programIdx, setProgramIdx] = useState(0);
  const [courseVisible, setCourseVisible] = useState(true);
  const [trackVisible, setTrackVisible] = useState(true);
  const [programVisible, setProgramVisible] = useState(true);

  const INTERVAL = 3000;
  const FADE = 400;

  useEffect(() => {
    if (allCourses.length <= 1) return;
    const t = setInterval(() => {
      setCourseVisible(false);
      setTimeout(() => { setCourseIdx(i => (i + 1) % allCourses.length); setCourseVisible(true); }, FADE);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [allCourses.length]);

  useEffect(() => {
    if (tracks.length <= 1) return;
    const t = setInterval(() => {
      setTrackVisible(false);
      setTimeout(() => { setTrackIdx(i => (i + 1) % tracks.length); setTrackVisible(true); }, FADE);
    }, INTERVAL + 700);
    return () => clearInterval(t);
  }, [tracks.length]);

  useEffect(() => {
    if (programs.length <= 1) return;
    const t = setInterval(() => {
      setProgramVisible(false);
      setTimeout(() => { setProgramIdx(i => (i + 1) % programs.length); setProgramVisible(true); }, FADE);
    }, INTERVAL + 1400);
    return () => clearInterval(t);
  }, [programs.length]);

  const isLoading = coursesLoading || groupsLoading;

  if (isLoading) {
    return (
      <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgSecondary }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="h-5 w-32 rounded-full mx-auto mb-3 animate-pulse" style={{ background: "rgba(99,103,255,0.1)" }} />
          <div className="h-9 w-64 rounded-xl mx-auto mb-10 animate-pulse" style={{ background: "rgba(99,103,255,0.07)" }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl h-72 animate-pulse" style={{ background: "rgba(99,103,255,0.05)" }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const course = allCourses[courseIdx];
  const track = tracks[trackIdx];
  const program = programs[programIdx];

  const fadeStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(6px)",
    transition: `opacity ${FADE}ms ease, transform ${FADE}ms ease`,
  });

  return (
    <section className="relative py-8 md:py-10 overflow-hidden" style={{ background: C.bgSecondary }}>
      <SectionGlow position="center" color={C.teal} />
      <SectionGlow position="top-right" color={C.purple} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ background: "rgba(99,103,255,0.08)", border: "1px solid rgba(99,103,255,0.2)", color: C.teal }}
          >
            <span style={{ fontSize: "8px" }}>●</span> Our Catalogue
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em",
            }}
            data-testid="text-preview-title"
          >
            Featured Courses
          </h2>
        </div>

        <div
          className="rounded-3xl p-3 md:p-4"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EDE9FF",
            boxShadow: "0 4px 40px rgba(99,103,255,0.1)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

            {/* ── Courses ── */}
            <div className="flex flex-col gap-3">
              <Link href="/courses" className="block">
                <span
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{ color: C.teal, background: "rgba(99,103,255,0.07)", border: "1px solid rgba(99,103,255,0.18)", fontFamily: "var(--font-display)" }}
                  data-testid="button-header-courses"
                >
                  Courses <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              {!course ? (
                <p className="text-xs py-8 text-center" style={{ color: C.textSecondary }}>No courses yet</p>
              ) : (
                <div style={fadeStyle(courseVisible)}>
                  {(() => {
                    const isFree = course.isFree || !course.creditCost || course.creditCost === 0;
                    return (
                      <Link href={`/courses/${course.id}`}>
                        <div
                          className="rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
                          style={{ background: "#FAFAFE", border: "1px solid #EDE9FF", height: "240px" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,103,255,0.3)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(99,103,255,0.15)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#EDE9FF";
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                          }}
                          data-testid={`card-featured-course-${course.id}`}
                        >
                          <div className="relative overflow-hidden" style={{ height: "130px", flexShrink: 0 }}>
                            {course.thumbnailUrl ? (
                              <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(99,103,255,0.08), rgba(132,148,255,0.05))" }}>
                                <BookOpen className="w-10 h-10" style={{ color: "rgba(99,103,255,0.45)" }} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                            <div className="absolute top-2 right-2">
                              {isFree ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>FREE</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}>{course.creditCost} cr</span>
                              )}
                            </div>
                          </div>
                          <div className="p-3 flex flex-col gap-1.5 flex-1">
                            <h4 className="text-xs font-semibold leading-snug line-clamp-2 flex-1" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>{course.title}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <LevelBadge level={(course.level || "beginner") as "beginner" | "intermediate" | "advanced"} />
                              {course.duration && <span className="text-[10px]" style={{ color: C.textSecondary }}>{course.duration}</span>}
                            </div>
                            <div className="mt-auto text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg"
                              style={{ background: "rgba(99,103,255,0.07)", color: C.teal, border: "1px solid rgba(99,103,255,0.15)" }}>
                              View Course <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })()}
                </div>
              )}
              {allCourses.length > 1 && (
                <div className="flex justify-center gap-1 mt-1">
                  {allCourses.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-300"
                      style={{ width: i === courseIdx ? "16px" : "6px", height: "4px", background: i === courseIdx ? C.teal : "rgba(99,103,255,0.15)" }} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Tracks ── */}
            <div className="flex flex-col gap-3">
              <Link href="/courses?tab=track" className="block">
                <span
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{ color: C.teal, background: "rgba(99,103,255,0.07)", border: "1px solid rgba(99,103,255,0.18)", fontFamily: "var(--font-display)" }}
                  data-testid="button-header-tracks"
                >
                  Tracks <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              {!track ? (
                <p className="text-xs py-8 text-center" style={{ color: C.textSecondary }}>No tracks yet</p>
              ) : (
                <div style={fadeStyle(trackVisible)}>
                  <Link href={`/courses/group/${track.id}`}>
                    <div
                      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
                      style={{ background: "rgba(99,103,255,0.03)", border: "1px solid rgba(99,103,255,0.12)", height: "240px" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,103,255,0.32)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(99,103,255,0.12)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,103,255,0.12)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                      data-testid={`card-featured-track-${track.id}`}
                    >
                      <div className="relative overflow-hidden" style={{ height: "130px", flexShrink: 0 }}>
                        {track.thumbnailUrl ? (
                          <img src={track.thumbnailUrl} alt={track.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(99,103,255,0.08), rgba(132,148,255,0.05))" }}>
                            <Layers className="w-10 h-10" style={{ color: "rgba(99,103,255,0.45)" }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(99,103,255,0.15)", color: C.teal, border: "1px solid rgba(99,103,255,0.25)" }}>Track</span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <h4 className="text-xs font-semibold leading-snug line-clamp-2 flex-1" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>{track.name}</h4>
                        <p className="text-[10px]" style={{ color: C.textSecondary }}>
                          {track.courseCount} {track.courseCount === 1 ? "Course" : "Courses"}{(track as any).totalDuration ? ` · ${(track as any).totalDuration}` : ""}
                        </p>
                        <div className="mt-auto text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg"
                          style={{ background: "rgba(99,103,255,0.07)", color: C.teal, border: "1px solid rgba(99,103,255,0.15)" }}>
                          View Track <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              {tracks.length > 1 && (
                <div className="flex justify-center gap-1 mt-1">
                  {tracks.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-300"
                      style={{ width: i === trackIdx ? "16px" : "6px", height: "4px", background: i === trackIdx ? C.teal : "rgba(99,103,255,0.15)" }} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Programs ── */}
            <div className="flex flex-col gap-3">
              <Link href="/courses?tab=program" className="block">
                <span
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{ color: C.purple, background: "rgba(132,148,255,0.08)", border: "1px solid rgba(132,148,255,0.25)", fontFamily: "var(--font-display)" }}
                  data-testid="button-header-programs"
                >
                  Programs <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              {!program ? (
                <p className="text-xs py-8 text-center" style={{ color: C.textSecondary }}>No programs yet</p>
              ) : (
                <div style={fadeStyle(programVisible)}>
                  <Link href={`/courses/group/${program.id}`}>
                    <div
                      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
                      style={{ background: "rgba(132,148,255,0.04)", border: "1px solid rgba(132,148,255,0.15)", height: "240px" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,148,255,0.35)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(132,148,255,0.15)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,148,255,0.15)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                      data-testid={`card-featured-program-${program.id}`}
                    >
                      <div className="relative overflow-hidden" style={{ height: "130px", flexShrink: 0 }}>
                        {program.thumbnailUrl ? (
                          <img src={program.thumbnailUrl} alt={program.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(132,148,255,0.1), rgba(201,190,255,0.06))" }}>
                            <GraduationCap className="w-10 h-10" style={{ color: "rgba(132,148,255,0.55)" }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(132,148,255,0.18)", color: C.purple, border: "1px solid rgba(132,148,255,0.3)" }}>Program</span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <h4 className="text-xs font-semibold leading-snug line-clamp-2 flex-1" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>{program.name}</h4>
                        <p className="text-[10px]" style={{ color: C.textSecondary }}>
                          {program.courseCount} {program.courseCount === 1 ? "Course" : "Courses"}{(program as any).totalDuration ? ` · ${(program as any).totalDuration}` : ""}
                        </p>
                        <div className="mt-auto text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg"
                          style={{ background: "rgba(132,148,255,0.1)", color: C.purple, border: "1px solid rgba(132,148,255,0.22)" }}>
                          View Program <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              {programs.length > 1 && (
                <div className="flex justify-center gap-1 mt-1">
                  {programs.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-300"
                      style={{ width: i === programIdx ? "16px" : "6px", height: "4px", background: i === programIdx ? C.purple : "rgba(132,148,255,0.15)" }} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgPrimary }}>
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(132,148,255,0.1)", border: "1px solid rgba(132,148,255,0.25)", color: C.purple }}>
              AI-Powered Learning
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
              data-testid="text-ai-title"
            >
              Meet Usha, Your AI Tutor
            </h2>
            <p className="text-sm" style={{ color: C.textSecondary, lineHeight: "1.7" }}>
              Built into every lesson, lab, and project. Usha gives you smart hints — not direct answers — so you develop real understanding.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {aiFeatures.map((feature) => (
                <GlassCard
                  key={feature.title}
                  className="p-3"
                  data-testid={`feature-ai-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, rgba(99,103,255,0.1), rgba(132,148,255,0.07))`,
                        border: "1px solid rgba(99,103,255,0.18)",
                      }}
                    >
                      <feature.icon className="w-4 h-4" style={{ color: C.teal }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs" style={{ color: C.textPrimary }}>{feature.title}</h4>
                      <p className="text-[10px]" style={{ color: C.textSecondary }}>{feature.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          {/* Usha Chat Mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div
              className="relative w-full"
              style={{ maxWidth: "320px", background: "#F8F7FF", border: `1px solid ${C.cardBorder}`, borderRadius: "20px", boxShadow: "0 8px 48px rgba(99,103,255,0.15)", overflow: "hidden" }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: CTA_GRAD }}>
                <img src={ushaAvatarImage} alt="Usha" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" data-testid="img-usha-avatar-landing" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">Usha AI Tutor</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                    <span className="text-[10px] text-white/80">Online · Asks smart hints</span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-white/60" />
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3">
                {/* Student */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]" style={{ background: CTA_GRAD }}>
                    <p className="text-xs text-white">Why does my for loop skip the last item? 😕</p>
                  </div>
                </div>
                {/* Usha */}
                <div className="flex gap-2 items-end">
                  <img src={ushaAvatarImage} alt="Usha" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  <div className="rounded-2xl rounded-bl-sm px-3 py-2" style={{ background: "#FFFFFF", border: `1px solid ${C.cardBorder}` }}>
                    <p className="text-xs" style={{ color: C.textPrimary }}>Try checking your loop's end condition — is it <code className="px-1 rounded text-[10px]" style={{ background: "rgba(99,103,255,0.1)", color: C.teal }}>{"< n"}</code> or <code className="px-1 rounded text-[10px]" style={{ background: "rgba(99,103,255,0.1)", color: C.teal }}>{"<= n"}</code>? 🤔</p>
                  </div>
                </div>
                {/* Student */}
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]" style={{ background: "rgba(99,103,255,0.09)", border: `1px solid rgba(99,103,255,0.2)` }}>
                    <p className="text-xs" style={{ color: C.teal }}>Oh! I used {"< n"} but needed {"<= n"}. Fixed it! ✅</p>
                  </div>
                </div>
                {/* Usha */}
                <div className="flex gap-2 items-end">
                  <img src={ushaAvatarImage} alt="Usha" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  <div className="rounded-2xl rounded-bl-sm px-3 py-2" style={{ background: "#FFFFFF", border: `1px solid ${C.cardBorder}` }}>
                    <p className="text-xs" style={{ color: C.textPrimary }}>You solved it yourself — that's real learning! 🎉</p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex gap-2 items-end">
                  <img src={ushaAvatarImage} alt="Usha" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  <div className="rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1" style={{ background: "#FFFFFF", border: `1px solid ${C.cardBorder}` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.teal, animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.teal, animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: C.teal, animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#FFFFFF", border: `1px solid ${C.cardBorder}` }}>
                  <span className="text-xs flex-1 select-none" style={{ color: "#9CA3AF" }}>Ask Usha anything...</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: CTA_GRAD }}>
                    <Send className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgSecondary }}>
      <SectionGlow position="center" color={C.purple} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-7">
          <h2
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em",
            }}
            data-testid="text-testimonials-title"
          >
            What Our Students Say
          </h2>
          <p style={{ color: C.textSecondary }} className="text-sm">Real stories from real learners</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <GlassCard
              key={testimonial.name}
              className="relative p-5"
              data-testid={`card-testimonial-${index + 1}`}
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                "{testimonial.content}"
              </p>
              <div className="pt-3 flex items-center gap-2.5" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: CTA_GRAD, color: "#FFFFFF" }}>
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-xs" style={{ color: C.textPrimary }}>{testimonial.name}</p>
                  <p className="text-[10px]" style={{ color: C.textSecondary }}>{testimonial.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgPrimary }}>
      <SectionGlow position="top-right" color={C.teal} />
      <SectionGlow position="bottom-left" color={C.purple} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-start">

          {/* Left: sticky header */}
          <div className="lg:sticky lg:top-24">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-4 tracking-widest uppercase"
              style={{ background: "rgba(99,103,255,0.08)", border: "1px solid rgba(99,103,255,0.2)", color: C.teal }}
            >
              FAQ
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
              data-testid="text-faq-title"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-sm mb-6" style={{ color: C.textSecondary, lineHeight: "1.6" }}>
              Everything you need to know before you start. Can't find your answer?{" "}
              <Link href="/contact" className="underline underline-offset-2" style={{ color: C.teal }}>Contact us</Link>.
            </p>
          </div>

          {/* Right: styled accordion */}
          <div>
            <Accordion
              type="single"
              collapsible
              className="space-y-2"
              data-testid="accordion-faq"
              onValueChange={(val) => setOpenItem(val || null)}
            >
              {faqItems.map((item, index) => {
                const isOpen = openItem === `item-${index}`;
                return (
                  <AccordionItem
                    key={item.question}
                    value={`item-${index}`}
                    className="rounded-xl overflow-hidden border-0 transition-all duration-300"
                    style={{
                      background: isOpen
                        ? "linear-gradient(135deg, rgba(99,103,255,0.05), rgba(132,148,255,0.03))"
                        : "#FAFAFE",
                      border: isOpen
                        ? "1px solid rgba(99,103,255,0.22)"
                        : "1px solid #EDE9FF",
                      boxShadow: isOpen ? "0 0 24px -8px rgba(99,103,255,0.12)" : "none",
                    }}
                    data-testid={`faq-item-${index + 1}`}
                  >
                    <AccordionTrigger className="hover:no-underline text-left px-4 py-3.5 group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300"
                          style={{
                            background: isOpen ? CTA_GRAD : "rgba(99,103,255,0.1)",
                            color: isOpen ? "#FFFFFF" : C.teal,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <span
                          className="font-medium text-sm transition-colors duration-200"
                          style={{ color: isOpen ? C.textPrimary : C.textPrimary }}
                        >
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div
                        className="pl-9 text-sm leading-relaxed"
                        style={{ color: C.textSecondary, borderLeft: `2px solid rgba(99,103,255,0.2)`, paddingLeft: "1.25rem" }}
                      >
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { user } = useAuth();

  return (
    <section className="relative py-10 md:py-14 overflow-hidden" style={{ background: C.bgSecondary }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        <div
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            background: HERO_GRAD,
            boxShadow: "0 12px 60px rgba(99,103,255,0.3)",
          }}
        >
          {/* Inner decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
            style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
            style={{ background: "rgba(201,190,255,0.2)" }} />

          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
              data-testid="text-cta-title"
            >
              Start your learning journey today.
            </h2>
            <p className="mb-8 max-w-xl mx-auto text-base" style={{ color: "rgba(255,255,255,0.82)", lineHeight: "1.7" }}>
              Join thousands of students mastering real skills, earning verified certificates, and launching careers — with OurShiksha.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link href="/shishya/dashboard">
                  <button
                    className="min-w-[180px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    style={{
                      background: "#FFFFFF",
                      color: C.teal,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                    }}
                    data-testid="button-cta-shishya"
                  >
                    Go to Shishya
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button
                      className="min-w-[150px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      style={{
                        background: "#FFFFFF",
                        color: C.teal,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                      }}
                      data-testid="button-cta-login"
                    >
                      <LogIn className="w-5 h-5" />
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button
                      className="min-w-[150px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      style={{
                        background: "transparent",
                        color: "#FFFFFF",
                        border: "1.5px solid rgba(255,255,255,0.55)",
                      }}
                      data-testid="button-cta-signup"
                    >
                      <UserPlus className="w-5 h-5" />
                      Sign Up Free
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-6">
              {[
                { icon: BadgeCheck, label: "500 free credits on signup" },
                { icon: Shield, label: "No credit card required" },
                { icon: CheckCircle2, label: "Cancel anytime" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.7)" }} />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      heading: "Platform",
      links: [
        { href: "/courses", label: "Courses", testId: "link-courses" },
        { href: "/pricing", label: "Pricing", testId: "link-pricing" },
        { href: "/ai-usha-mentor", label: "Usha AI", testId: "link-usha" },
        { href: "/become-guru", label: "Become a Guru", testId: "link-become-guru" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { href: "/help-center", label: "Help Center", testId: "link-help" },
        { href: "/about", label: "About Us", testId: "link-about" },
        { href: "/contact", label: "Contact", testId: "link-contact" },
        { href: "/become-a-partner", label: "Partner With Us", testId: "link-partner" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy", testId: "link-privacy" },
        { href: "/terms", label: "Terms of Service", testId: "link-terms" },
        { href: "/verify-certificate", label: "Verify Certificate", testId: "link-verify" },
      ],
    },
  ];

  const socials = [
    { href: "#", icon: Linkedin, label: "LinkedIn" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Youtube, label: "YouTube" },
    { href: "#", icon: Instagram, label: "Instagram" },
  ];

  return (
    <footer style={{ background: HERO_GRAD }}>
      {/* Main link grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)" }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white" style={{ fontFamily: "var(--font-display)", fontSize: "16px" }}>
                OurShiksha
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.78)", lineHeight: "1.7" }}>
              India's premier AI-powered e-learning platform combining courses, labs, projects, and Usha AI — your path to mastery.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { icon: BadgeCheck, label: "AI-Powered" },
                { icon: Shield, label: "SSL Secured" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <b.icon className="w-3 h-3 text-white" />
                  <span className="text-[11px] text-white font-medium">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)";
                  }}
                >
                  <s.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4 className="font-semibold text-xs mb-4 tracking-widest uppercase text-white" style={{ letterSpacing: "0.1em" }}>
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-all flex items-center gap-1.5 group hover:text-white"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                      data-testid={link.testId}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 transition-all text-white" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}
        >
          <p className="text-xs order-2 sm:order-1 text-white" style={{ color: "rgba(255,255,255,0.7)" }} data-testid="text-copyright">
            © {currentYear} OurShiksha. All rights reserved. · Made with <Heart className="w-3 h-3 fill-red-300 text-red-300 inline-block mx-0.5" /> in India
          </p>
          <div className="flex items-center gap-3 order-1 sm:order-2">
            {[
              { icon: BadgeCheck, label: "Verified Certs" },
              { icon: Users, label: "25K+ Learners" },
              { icon: Star, label: "4.9 Rating" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col landing-page-light"
      style={{
        background: "#FFFFFF",
        color: C.textPrimary,
      }}
    >
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <JourneySection />
        <FeaturesSection />
        <AISection />
        <FeaturedCoursesSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
    </div>
  );
}
