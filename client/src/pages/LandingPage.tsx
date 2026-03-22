import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  Quote,
  Layers,
  Trophy,
  Building2,
  Handshake,
} from "lucide-react";
import type { Course } from "@shared/schema";
import ushaAvatarImage from "@assets/image_1767697725032.png";
import sealLogo from "@assets/image_1771692892158.png";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const C = {
  bgPrimary: "#020814",
  bgSecondary: "#060D1F",
  cardBg: "rgba(11,29,58,0.6)",
  cardBorder: "rgba(0,245,255,0.1)",
  teal: "#00F5FF",
  purple: "#7C3AED",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  textPrimary: "#E8F4FF",
  textSecondary: "#7E99B8",
};

const journeySteps = [
  { icon: BookOpen, title: "Learn", description: "Structured lessons designed for clarity" },
  { icon: FlaskConical, title: "Practice", description: "Guided labs to build real skills" },
  { icon: FolderKanban, title: "Build", description: "Industry-aligned projects" },
  { icon: ClipboardCheck, title: "Validate", description: "Tests and assessments" },
  { icon: Award, title: "Prove", description: "Certificates and portfolio" },
];

const features = [
  { icon: BookOpen, title: "Structured Courses", description: "Clear learning paths" },
  { icon: FlaskConical, title: "Guided Labs", description: "Hands-on practice" },
  { icon: FolderKanban, title: "Real Projects", description: "Build your portfolio" },
  { icon: ClipboardCheck, title: "Skill Assessments", description: "Validate your knowledge" },
  { icon: Award, title: "Verified Certificates", description: "Prove your skills" },
  { icon: Briefcase, title: "Career Portfolio", description: "Showcase your work" },
  { icon: Building2, title: "Guaranteed Internship", description: "Real-world work experience" },
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
  glow = false,
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
      className={`rounded-2xl backdrop-blur-sm transition-all duration-300 ${
        hover ? "hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(0,245,255,0.2)]" : ""
      } ${className}`}
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        ...(hover ? {} : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
        }
      }}
      {...props}
    >
      {children}
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
      className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.07] pointer-events-none"
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
    <section className="relative overflow-hidden py-10 md:py-16">
      <SectionGlow position="top-right" color={C.teal} />
      <SectionGlow position="bottom-left" color={C.purple} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-6">
            <div className="min-h-[140px] md:min-h-[170px] lg:min-h-[200px] flex flex-col justify-center">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  background: `linear-gradient(135deg, ${C.textPrimary} 0%, ${C.teal} 50%, ${C.purple} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 400ms ease, transform 400ms ease",
                  textShadow: "0 0 40px rgba(0,245,255,0.15)",
                  filter: visible ? "drop-shadow(0 0 20px rgba(0,245,255,0.2))" : "none",
                }}
                data-testid="text-hero-headline"
              >
                {current.headline}
              </h1>

              <div className="relative inline-block mt-3">
                <p
                  className="text-base md:text-lg font-medium tracking-wide"
                  style={{
                    color: "rgba(148,163,184,0.9)",
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
                    background: `linear-gradient(90deg, ${C.teal}, ${C.purple})`,
                    width: underlineWidth,
                    maxWidth: mode === 0 ? "210px" : "200px",
                    transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                    boxShadow: `0 0 8px rgba(0,245,255,0.5), 0 0 20px rgba(0,245,255,0.2)`,
                    opacity: visible ? 1 : 0,
                  }}
                  data-testid="hero-underline-glow"
                />
              </div>
            </div>

            <p
              className="text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
              style={{ color: C.textSecondary, lineHeight: "1.7" }}
              data-testid="text-hero-subheading"
            >
              Learn skills, build real projects, pass assessments, and earn verified certificates — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {user ? (
                <Link href="/shishya/dashboard">
                  <button
                    className="min-w-[200px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
                      color: C.bgPrimary,
                      boxShadow: `0 4px 20px -4px rgba(0,245,255,0.4)`,
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
                      className="min-w-[200px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
                        color: C.bgPrimary,
                        boxShadow: `0 4px 20px -4px rgba(0,245,255,0.4)`,
                      }}
                      data-testid="button-hero-login"
                    >
                      <LogIn className="w-5 h-5" />
                      Login to Shishya
                    </button>
                  </Link>
                  <Link href="/courses">
                    <button
                      className="min-w-[200px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      style={{
                        background: "transparent",
                        color: C.teal,
                        border: `1px solid rgba(0,245,255,0.3)`,
                        boxShadow: "none",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,245,255,0.2)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.6)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.3)";
                      }}
                      data-testid="button-hero-explore"
                    >
                      Explore Courses
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Social proof stats row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2" data-testid="hero-social-proof">
              {[
                { value: "25K+", label: "Students" },
                { value: "50+", label: "Courses" },
                { value: "IIT", label: "Alumni Designed" },
                { value: "100%", label: "Verified Certs" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start">
                  <span className="text-lg font-bold" style={{ color: C.teal, fontFamily: "var(--font-display)" }}>{stat.value}</span>
                  <span className="text-xs" style={{ color: C.textSecondary }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className="relative w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-full p-1 animate-float"
              style={{
                background: `linear-gradient(135deg, ${C.teal}, ${C.purple}, ${C.teal})`,
                boxShadow: `0 0 50px -10px rgba(0,245,255,0.4)`,
              }}
            >
              <img
                src={ushaAvatarImage}
                alt="Usha AI Tutor"
                className="w-full h-full rounded-full object-cover"
                style={{ border: `4px solid ${C.bgPrimary}` }}
                data-testid="img-usha-avatar-hero"
              />
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${C.success}, #059669)`,
                  border: `4px solid ${C.bgPrimary}`,
                }}
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <p
                className="text-xl md:text-2xl font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                data-testid="text-meet-usha"
              >
                Meet Usha
              </p>
              <p className="text-sm md:text-base mt-1" style={{ color: C.textSecondary }}>Your AI Learning Companion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const journeyColors = [
  { accent: "#00F5FF", glow: "rgba(0,245,255,0.18)", bg: "rgba(0,245,255,0.07)", border: "rgba(0,245,255,0.22)", text: "#00F5FF" },
  { accent: "#A78BFA", glow: "rgba(167,139,250,0.18)", bg: "rgba(167,139,250,0.07)", border: "rgba(167,139,250,0.22)", text: "#A78BFA" },
  { accent: "#34D399", glow: "rgba(52,211,153,0.18)", bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.22)", text: "#34D399" },
  { accent: "#FBBF24", glow: "rgba(251,191,36,0.18)", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.22)", text: "#FBBF24" },
  { accent: "#F472B6", glow: "rgba(244,114,182,0.18)", bg: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.22)", text: "#F472B6" },
];

function JourneySection() {
  return (
    <section className="relative py-8 md:py-12 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 tracking-widest uppercase"
            style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)", color: C.teal }}>
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
                    background: `linear-gradient(160deg, ${col.bg}, rgba(255,255,255,0.02))`,
                    border: `1px solid ${col.border}`,
                    boxShadow: `0 0 20px -10px ${col.glow}`,
                    margin: "0 5px",
                  }}
                >
                  {/* Watermark number */}
                  <div
                    className="absolute -right-1 -bottom-3 text-[72px] font-black leading-none select-none pointer-events-none"
                    style={{ color: col.accent, opacity: 0.06, fontFamily: "var(--font-display)" }}
                  >
                    {index + 1}
                  </div>
                  {/* Step badge + icon row */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: col.accent, color: "#050A18" }}
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
                  <h3 className="text-sm font-bold mb-1 text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{step.description}</p>

                  {!isLast && (
                    <div
                      className="absolute top-1/2 -right-[6px] -translate-y-1/2 z-10 w-2.5 h-2.5 rounded-full"
                      style={{ background: col.accent, boxShadow: `0 0 6px ${col.accent}` }}
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
                  style={{ background: col.accent, color: "#050A18" }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>{step.title}</div>
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
  "#00F5FF", "#A78BFA", "#34D399", "#FBBF24",
  "#F472B6", "#60A5FA", "#FB923C", "#A3E635",
];

function FeaturesSection() {
  return (
    <section className="relative py-8 md:py-12 overflow-hidden">
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 tracking-widest uppercase"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#A78BFA" }}>
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
                className="relative group rounded-xl p-3.5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `2px solid ${accent}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = `${accent}08`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px -8px ${accent}40`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}
                >
                  <feature.icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="font-medium text-white text-xs leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>
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
      className="flex flex-col h-full rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.3)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 30px -8px rgba(0,245,255,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
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
            style={{ background: `linear-gradient(135deg, rgba(0,245,255,0.1), rgba(124,58,237,0.08))` }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,245,255,0.15)", border: "1px solid rgba(0,245,255,0.25)" }}
            >
              <BookOpen className="w-7 h-7" style={{ color: C.teal }} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/60 via-transparent to-transparent" />
        {course.category && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: `${C.teal}CC`, color: C.bgPrimary, backdropFilter: "blur(8px)" }}
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
          className="text-base font-semibold leading-snug line-clamp-2 text-white"
          style={{ fontFamily: "var(--font-display)" }}
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
              background: "transparent",
              color: C.teal,
              border: `1px solid rgba(0,245,255,0.3)`,
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
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.4)",
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
                ? "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(6,182,212,0.04))"
                : "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(139,92,246,0.06))",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: isTrack ? "rgba(0,245,255,0.12)" : "rgba(124,58,237,0.15)",
                border: `1px solid ${isTrack ? "rgba(0,245,255,0.22)" : "rgba(124,58,237,0.28)"}`,
              }}
            >
              {isTrack
                ? <Layers className="w-7 h-7" style={{ color: C.teal }} />
                : <Trophy className="w-7 h-7" style={{ color: "#A78BFA" }} />
              }
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080F1E]/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: isTrack ? "rgba(0,245,255,0.82)" : "rgba(124,58,237,0.85)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            {isTrack ? "🛤 Track" : "🎓 Program"}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {group.price > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(245,158,11,0.88)", color: "#fff" }}>
              {group.price} Credits
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.88)", color: "#fff" }}>
              FREE
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-1" style={{ fontFamily: "var(--font-display)" }}>
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
          <span className="capitalize px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            {group.level}
          </span>
        </div>

        {group.courses.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {group.courses.slice(0, 3).map((c, i) => (
              <div key={c.id} className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                <span
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
                  style={{ background: "rgba(0,245,255,0.1)", color: C.teal }}
                >
                  {i + 1}
                </span>
                <span className="truncate">{c.title}</span>
              </div>
            ))}
            {group.courseCount > 3 && (
              <span className="text-xs pl-6" style={{ color: "rgba(148,163,184,0.5)" }}>+{group.courseCount - 3} more</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          <Link href={`/group/${group.id}`}>
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: isTrack ? "rgba(0,245,255,0.08)" : "rgba(124,58,237,0.1)",
                color: isTrack ? C.teal : "#A78BFA",
                border: `1px solid ${isTrack ? "rgba(0,245,255,0.2)" : "rgba(124,58,237,0.25)"}`,
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
      setTimeout(() => {
        setCourseIdx(i => (i + 1) % allCourses.length);
        setCourseVisible(true);
      }, FADE);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [allCourses.length]);

  useEffect(() => {
    if (tracks.length <= 1) return;
    const t = setInterval(() => {
      setTrackVisible(false);
      setTimeout(() => {
        setTrackIdx(i => (i + 1) % tracks.length);
        setTrackVisible(true);
      }, FADE);
    }, INTERVAL + 700);
    return () => clearInterval(t);
  }, [tracks.length]);

  useEffect(() => {
    if (programs.length <= 1) return;
    const t = setInterval(() => {
      setProgramVisible(false);
      setTimeout(() => {
        setProgramIdx(i => (i + 1) % programs.length);
        setProgramVisible(true);
      }, FADE);
    }, INTERVAL + 1400);
    return () => clearInterval(t);
  }, [programs.length]);

  const isLoading = coursesLoading || groupsLoading;

  if (isLoading) {
    return (
      <section className="relative py-12 md:py-16 overflow-hidden">
        <SectionGlow position="center" color={C.teal} />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="h-5 w-32 rounded-full mx-auto mb-3 animate-pulse" style={{ background: "rgba(0,245,255,0.1)" }} />
          <div className="h-9 w-64 rounded-xl mx-auto mb-10 animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl h-72 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
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
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />
      <SectionGlow position="top-right" color={C.purple} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: C.teal }}
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
          className="rounded-3xl p-4 md:p-6"
          style={{
            background: "linear-gradient(145deg, rgba(6,13,31,0.9) 0%, rgba(11,29,58,0.85) 100%)",
            border: "1px solid rgba(0,245,255,0.12)",
            boxShadow: "0 0 60px -20px rgba(0,245,255,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

            {/* ── Courses ── */}
            <div className="flex flex-col gap-3">
              <Link href="/courses" className="block">
                <span
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{ color: C.teal, background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.18)", fontFamily: "var(--font-display)" }}
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
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", height: "240px" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.28)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(0,245,255,0.15)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                          }}
                          data-testid={`card-featured-course-${course.id}`}
                        >
                          <div className="relative overflow-hidden" style={{ height: "130px", flexShrink: 0 }}>
                            {course.thumbnailUrl ? (
                              <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.06))" }}>
                                <BookOpen className="w-10 h-10" style={{ color: "rgba(0,245,255,0.45)" }} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/60 via-transparent to-transparent" />
                            <div className="absolute top-2 right-2">
                              {isFree ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>FREE</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}>{course.creditCost} cr</span>
                              )}
                            </div>
                          </div>
                          <div className="p-3 flex flex-col gap-1.5 flex-1">
                            <h4 className="text-xs font-semibold leading-snug line-clamp-2 text-white flex-1" style={{ fontFamily: "var(--font-display)" }}>{course.title}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <LevelBadge level={(course.level || "beginner") as "beginner" | "intermediate" | "advanced"} />
                              {course.duration && <span className="text-[10px]" style={{ color: C.textSecondary }}>{course.duration}</span>}
                            </div>
                            <div className="mt-auto text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg"
                              style={{ background: "rgba(0,245,255,0.07)", color: C.teal, border: "1px solid rgba(0,245,255,0.15)" }}>
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
                      style={{ width: i === courseIdx ? "16px" : "6px", height: "4px", background: i === courseIdx ? C.teal : "rgba(255,255,255,0.15)" }} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Tracks ── */}
            <div className="flex flex-col gap-3">
              <Link href="/courses?tab=track" className="block">
                <span
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{ color: C.teal, background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.18)", fontFamily: "var(--font-display)" }}
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
                      style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.1)", height: "240px" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.3)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(0,245,255,0.12)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.1)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                      data-testid={`card-featured-track-${track.id}`}
                    >
                      <div className="relative overflow-hidden" style={{ height: "130px", flexShrink: 0 }}>
                        {track.thumbnailUrl ? (
                          <img src={track.thumbnailUrl} alt={track.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.09), rgba(6,182,212,0.05))" }}>
                            <Layers className="w-10 h-10" style={{ color: "rgba(0,245,255,0.45)" }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060D1F]/70 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(0,245,255,0.18)", color: C.teal, border: "1px solid rgba(0,245,255,0.3)" }}>Track</span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <h4 className="text-xs font-semibold leading-snug line-clamp-2 text-white flex-1" style={{ fontFamily: "var(--font-display)" }}>{track.name}</h4>
                        <p className="text-[10px]" style={{ color: C.textSecondary }}>
                          {track.courseCount} {track.courseCount === 1 ? "Course" : "Courses"}{track.totalDuration ? ` · ${track.totalDuration}` : ""}
                        </p>
                        <div className="mt-auto text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg"
                          style={{ background: "rgba(0,245,255,0.07)", color: C.teal, border: "1px solid rgba(0,245,255,0.15)" }}>
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
                      style={{ width: i === trackIdx ? "16px" : "6px", height: "4px", background: i === trackIdx ? C.teal : "rgba(255,255,255,0.15)" }} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Programs ── */}
            <div className="flex flex-col gap-3">
              <Link href="/courses?tab=program" className="block">
                <span
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  style={{ color: "#A78BFA", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", fontFamily: "var(--font-display)" }}
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
                      style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.15)", height: "240px" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.35)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(124,58,237,0.15)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.15)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                      data-testid={`card-featured-program-${program.id}`}
                    >
                      <div className="relative overflow-hidden" style={{ height: "130px", flexShrink: 0 }}>
                        {program.thumbnailUrl ? (
                          <img src={program.thumbnailUrl} alt={program.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(139,92,246,0.06))" }}>
                            <GraduationCap className="w-10 h-10" style={{ color: "rgba(139,92,246,0.55)" }} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#060D1F]/70 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(124,58,237,0.22)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.35)" }}>Program</span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <h4 className="text-xs font-semibold leading-snug line-clamp-2 text-white flex-1" style={{ fontFamily: "var(--font-display)" }}>{program.name}</h4>
                        <p className="text-[10px]" style={{ color: C.textSecondary }}>
                          {program.courseCount} {program.courseCount === 1 ? "Course" : "Courses"}{program.totalDuration ? ` · ${program.totalDuration}` : ""}
                        </p>
                        <div className="mt-auto text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg"
                          style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.25)" }}>
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
                      style={{ width: i === programIdx ? "16px" : "6px", height: "4px", background: i === programIdx ? "#A78BFA" : "rgba(255,255,255,0.15)" }} />
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
    <section className="relative py-8 md:py-12 overflow-hidden">
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#A78BFA" }}>
              AI-Powered Learning
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
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
                        background: `linear-gradient(135deg, rgba(0,245,255,0.12), rgba(124,58,237,0.08))`,
                        border: "1px solid rgba(0,245,255,0.18)",
                      }}
                    >
                      <feature.icon className="w-4 h-4" style={{ color: C.teal }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-white">{feature.title}</h4>
                      <p className="text-[10px]" style={{ color: C.textSecondary }}>{feature.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div
              className="relative rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,245,255,0.12)",
                padding: "32px",
                width: "100%",
                maxWidth: "340px",
              }}
            >
              <div
                className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden animate-float"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, ${C.purple}, ${C.teal})`,
                  boxShadow: `0 0 40px -8px rgba(0,245,255,0.4)`,
                  border: `3px solid rgba(0,245,255,0.3)`,
                }}
              >
                <img
                  src={ushaAvatarImage}
                  alt="Usha AI Tutor"
                  className="w-full h-full object-cover object-center scale-110"
                  data-testid="img-usha-avatar-landing"
                />
              </div>
              {/* Floating chat bubbles */}
              <div
                className="absolute top-4 right-4 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <p className="text-xs font-medium text-white">Need a hint? 💡</p>
              </div>
              <div
                className="absolute bottom-4 left-4 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.15)" }}
              >
                <p className="text-xs" style={{ color: C.teal }}>Ask Usha anytime</p>
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
    <section className="relative py-8 md:py-12 overflow-hidden">
      <SectionGlow position="center" color={C.purple} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 tracking-widest uppercase"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#FBBF24" }}>
            Student Reviews
          </div>
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
              className="relative p-4"
              data-testid={`card-testimonial-${index + 1}`}
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-3 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                "{testimonial.content}"
              </p>
              <div className="pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(0,245,255,0.12)", color: C.teal }}>
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-xs text-white">{testimonial.name}</p>
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
    <section className="relative py-8 md:py-12 overflow-hidden">
      <SectionGlow position="top-right" color={C.teal} />
      <SectionGlow position="bottom-left" color={C.purple} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-start">

          {/* Left: sticky header */}
          <div className="lg:sticky lg:top-24">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-4 tracking-widest uppercase"
              style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)", color: C.teal }}
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

            {/* Quick stats */}
            <div className="flex flex-col gap-3">
              {[
                { value: "6", label: "topics answered" },
                { value: "500", label: "free credits on signup" },
                { value: "0", label: "credit card required" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.09)" }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: C.teal, fontFamily: "var(--font-display)", minWidth: "2rem" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs" style={{ color: C.textSecondary }}>{stat.label}</span>
                </div>
              ))}
            </div>
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
                        ? "linear-gradient(135deg, rgba(0,245,255,0.05), rgba(124,58,237,0.03))"
                        : "rgba(255,255,255,0.03)",
                      border: isOpen
                        ? "1px solid rgba(0,245,255,0.2)"
                        : "1px solid rgba(255,255,255,0.07)",
                      boxShadow: isOpen ? "0 0 24px -8px rgba(0,245,255,0.12)" : "none",
                    }}
                    data-testid={`faq-item-${index + 1}`}
                  >
                    <AccordionTrigger className="hover:no-underline text-left px-4 py-3.5 group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Number badge */}
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300"
                          style={{
                            background: isOpen ? C.teal : "rgba(255,255,255,0.08)",
                            color: isOpen ? C.bgPrimary : C.textSecondary,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <span
                          className="font-medium text-sm transition-colors duration-200"
                          style={{ color: isOpen ? C.textPrimary : "rgba(255,255,255,0.85)" }}
                        >
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div
                        className="pl-9 text-sm leading-relaxed"
                        style={{ color: C.textSecondary, borderLeft: `2px solid rgba(0,245,255,0.15)`, paddingLeft: "1.25rem" }}
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
    <section className="relative py-8 md:py-12 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        <div
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.05) 100%)",
            border: "1px solid rgba(0,245,255,0.15)",
            boxShadow: "0 0 60px -20px rgba(0,245,255,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Inner decorative glows */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
            style={{ background: "rgba(0,245,255,0.07)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
            style={{ background: "rgba(124,58,237,0.07)" }} />

          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
                  boxShadow: `0 0 28px -4px rgba(0,245,255,0.5)`,
                }}
              >
                <GraduationCap className="w-7 h-7" style={{ color: C.bgPrimary }} />
              </div>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
              data-testid="text-cta-title"
            >
              Start your learning journey today.
            </h2>
            <p className="mb-8 max-w-xl mx-auto text-base" style={{ color: C.textSecondary, lineHeight: "1.7" }}>
              Join thousands of students mastering real skills, earning verified certificates, and launching careers — with OurShiksha.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link href="/shishya/dashboard">
              <button
                className="min-w-[180px] px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
                  color: C.bgPrimary,
                  boxShadow: `0 4px 20px -4px rgba(0,245,255,0.4)`,
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
                    background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
                    color: C.bgPrimary,
                    boxShadow: `0 4px 20px -4px rgba(0,245,255,0.4)`,
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
                    color: C.teal,
                    border: `1px solid rgba(0,245,255,0.3)`,
                  }}
                  data-testid="button-cta-signup"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </button>
              </Link>
            </>
          )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
              }}
            >
              <GraduationCap className="w-4 h-4" style={{ color: C.bgPrimary }} />
            </div>
            <span
              className="font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              OurShiksha
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: C.textSecondary }}>
            {[
              { href: "/", label: "Home", testId: "link-home" },
              { href: "/about", label: "About", testId: "link-about" },
              { href: "/privacy", label: "Privacy Policy", testId: "link-privacy" },
              { href: "/terms", label: "Terms of Service", testId: "link-terms" },
              { href: "/contact", label: "Contact", testId: "link-contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors"
                style={{ color: C.textSecondary }}
                data-testid={link.testId}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm" style={{ color: C.textSecondary }} data-testid="text-copyright">
            OurShiksha {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(160deg, #020814 0%, #060D1F 25%, #081428 55%, #0B1D3A 80%, #060D1F 100%)`,
        color: C.textPrimary,
      }}
    >
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <JourneySection />
        <FeaturesSection />
        <AISection />
        <FeaturedCoursesSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
