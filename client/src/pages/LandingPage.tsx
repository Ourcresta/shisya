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
  bgPrimary: "#0B1D3A",
  bgSecondary: "#0F172A",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.08)",
  teal: "#00F5FF",
  purple: "#7C3AED",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
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
    content: "OurShiksha helped me transition from a non-tech background to landing my first developer job. The structured courses and hands-on projects made all the difference.",
    rating: 5,
  },
  {
    name: "Rahul Kumar",
    role: "Data Analyst",
    content: "The Python for Data Science course was exactly what I needed. The guided labs gave me practical experience that I could apply immediately at work.",
    rating: 5,
  },
  {
    name: "Ananya Reddy",
    role: "Full Stack Developer",
    content: "What I love about OurShiksha is the certificate verification system. Employers can verify my credentials instantly, which has opened many doors for me.",
    rating: 5,
  },
];

const faqItems = [
  {
    question: "What is OurShiksha?",
    answer: "OurShiksha is a comprehensive skill-learning platform designed for students and professionals. We offer structured courses, hands-on labs, real projects, and verified certificates to help you master new skills and advance your career.",
  },
  {
    question: "How do learning credits work?",
    answer: "When you sign up, you receive 500 free learning credits. You can use these credits to enroll in paid courses. Some courses are completely free. As you complete courses, you can earn more credits through our rewards system.",
  },
  {
    question: "Are the certificates industry-recognized?",
    answer: "Yes! Our certificates come with QR codes for instant verification. Employers and recruiters can verify your credentials on our public verification page, ensuring authenticity and building trust.",
  },
  {
    question: "Can I learn at my own pace?",
    answer: "Absolutely! All our courses are self-paced. You can learn whenever it suits you, track your progress, and pick up right where you left off. Your progress is saved automatically.",
  },
  {
    question: "What is Usha AI Tutor?",
    answer: "Usha is our AI-powered learning assistant integrated into every lesson, lab, and project. Usha helps you understand concepts by providing hints and explanations without giving away direct answers, promoting genuine learning.",
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up for a free account to receive 500 learning credits. Browse our course catalog, enroll in a course that interests you, and start learning immediately. No credit card required!",
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
    <section className="relative overflow-hidden py-14 md:py-20">
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
              className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0"
              style={{ color: C.textSecondary, lineHeight: "1.8" }}
              data-testid="text-hero-subheading"
            >
              OurShiksha is a complete skill-learning platform where students learn concepts,
              practice with hands-on labs, build real projects, pass assessments, and earn
              verified certificates.
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
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase"
            style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)", color: C.teal }}>
            How It Works
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
            data-testid="text-journey-title"
          >
            How OurShiksha Works
          </h2>
          <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
            Your complete learning journey in 5 simple steps
          </p>
        </div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:flex items-stretch gap-0 relative">
          {journeySteps.map((step, index) => {
            const col = journeyColors[index];
            const isLast = index === journeySteps.length - 1;
            return (
              <div key={step.title} className="flex-1 flex items-stretch relative" data-testid={`card-journey-step-${index + 1}`}>
                <div
                  className="relative flex flex-col flex-1 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(160deg, ${col.bg}, rgba(255,255,255,0.02))`,
                    border: `1px solid ${col.border}`,
                    boxShadow: `0 0 30px -10px ${col.glow}`,
                    margin: "0 6px",
                  }}
                >
                  {/* Watermark number */}
                  <div
                    className="absolute -right-2 -bottom-4 text-[90px] font-black leading-none select-none pointer-events-none"
                    style={{ color: col.accent, opacity: 0.07, fontFamily: "var(--font-display)" }}
                  >
                    {index + 1}
                  </div>
                  {/* Step badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-5 shrink-0"
                    style={{ background: col.accent, color: "#050A18", boxShadow: `0 0 14px ${col.glow}` }}
                  >
                    {index + 1}
                  </div>
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: col.bg, border: `1px solid ${col.border}` }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: col.accent }} />
                  </div>
                  <h3 className="text-base font-bold mb-2 text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{step.description}</p>

                  {/* Connector line (right side) */}
                  {!isLast && (
                    <div
                      className="absolute top-1/2 -right-[7px] -translate-y-1/2 z-10 w-3 h-3 rounded-full"
                      style={{ background: col.accent, boxShadow: `0 0 8px ${col.accent}` }}
                    />
                  )}
                </div>
                {/* Dotted connector between cards */}
                {!isLast && (
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 flex items-center justify-center z-20">
                    <div style={{ width: 2, height: 24, borderLeft: `2px dashed ${col.accent}`, opacity: 0.35 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical stacked timeline */}
        <div className="flex lg:hidden flex-col gap-4 relative">
          <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(0,245,255,0.3), rgba(244,114,182,0.3))" }} />
          {journeySteps.map((step, index) => {
            const col = journeyColors[index];
            return (
              <div key={step.title} className="flex gap-4 relative pl-14" data-testid={`card-journey-step-mobile-${index + 1}`}>
                {/* Number bubble on the timeline */}
                <div
                  className="absolute left-2.5 top-5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10"
                  style={{ background: col.accent, color: "#050A18", boxShadow: `0 0 12px ${col.glow}` }}
                >
                  {index + 1}
                </div>
                <div
                  className="flex-1 rounded-2xl p-4 overflow-hidden"
                  style={{ background: col.bg, border: `1px solid ${col.border}` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${col.accent}18`, border: `1px solid ${col.border}` }}
                    >
                      <step.icon className="w-4 h-4" style={{ color: col.accent }} />
                    </div>
                    <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm" style={{ color: C.textSecondary }}>{step.description}</p>
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
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#A78BFA" }}>
            Platform Features
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
            data-testid="text-features-title"
          >
            What Students Get
          </h2>
          <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
            Everything you need to master new skills and advance your career
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => {
            const accent = featureAccents[index % featureAccents.length];
            return (
              <div
                key={feature.title}
                className="relative group rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `3px solid ${accent}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = `${accent}09`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px -8px ${accent}33`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {/* Giant ghost icon watermark */}
                <div
                  className="absolute -right-3 -bottom-3 pointer-events-none select-none"
                  style={{ opacity: 0.06 }}
                >
                  <feature.icon style={{ width: 80, height: 80, color: accent }} />
                </div>

                {/* Icon badge */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: accent }} />
                </div>

                <h3 className="font-semibold text-white mb-1.5 text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                  {feature.description}
                </p>
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

function CoursePreviewSkeleton() {
  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden animate-pulse"
      style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
    >
      <div className="aspect-video" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="p-4 space-y-3 flex-1">
        <div className="h-5 rounded" style={{ background: "rgba(255,255,255,0.08)", width: "75%" }} />
        <div className="space-y-2">
          <div className="h-4 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "100%" }} />
          <div className="h-4 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "60%" }} />
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="h-10 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }} />
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

function CourseGroupsMarquee() {
  const { data: groups, isLoading } = useQuery<CourseGroupLanding[]>({
    queryKey: ["/api/course-groups"],
  });

  if (isLoading || !groups || groups.length === 0) return null;

  const items = groups.length < 4 ? [...groups, ...groups, ...groups] : [...groups, ...groups];
  const durationSec = items.length * 6;

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="center" color={C.purple} />
      <SectionGlow position="top-right" color={C.teal} />

      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll ${durationSec}s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
          <div className="text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.purple})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              data-testid="text-combo-title"
            >
              Explore Our Learning Tracks & Programs
            </h2>
            <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
              Curated bundles of courses designed to take you from beginner to job-ready
            </p>
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <div className="marquee-track flex gap-5 py-4" style={{ width: "max-content" }}>
            {items.map((group, idx) => {
              const isTrack = group.groupType === "track";
              return (
                <div
                  key={`${group.id}-${idx}`}
                  className="w-[300px] md:w-[340px] shrink-0 rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px -8px rgba(0,0,0,0.4)",
                  }}
                  data-testid={`card-group-${group.id}-${idx}`}
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
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 text-center">
          <Link href="/courses?tab=track">
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.05)", color: C.textSecondary, border: "1px solid rgba(255,255,255,0.08)" }}
              data-testid="button-view-all-groups"
            >
              See all Tracks & Programs
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CoursePreviewSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  if (isLoading) {
    return (
      <section className="relative py-12 md:py-16 overflow-hidden">
        <SectionGlow position="center" color={C.teal} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="h-8 w-56 rounded-xl mx-auto mb-4 animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="h-4 w-80 rounded mx-auto animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[220px] shrink-0 h-64 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) return null;

  const items = courses.length < 5
    ? [...courses, ...courses, ...courses]
    : courses.length < 8
    ? [...courses, ...courses]
    : [...courses, ...courses];

  const durationSec = Math.max(25, items.length * 4);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <style>{`
        @keyframes marquee-ltr {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .marquee-ltr-track {
          animation: marquee-ltr ${durationSec}s linear infinite;
          will-change: transform;
        }
        .marquee-ltr-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
          <div className="text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              data-testid="text-preview-title"
            >
              Featured Courses
            </h2>
            <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
              Start your learning journey with our carefully crafted courses
            </p>
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          }}
        >
          <div className="marquee-ltr-track flex gap-4 py-4" style={{ width: "max-content" }}>
            {items.map((course, idx) => {
              const isFree = course.isFree || !course.creditCost || course.creditCost === 0;
              return (
                <Link key={`${course.id}-${idx}`} href={`/courses/${course.id}`}>
                  <div
                    className="w-[220px] shrink-0 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 4px 20px -6px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.25)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px -6px rgba(0,245,255,0.15)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px -6px rgba(0,0,0,0.4)";
                    }}
                    data-testid={`card-featured-course-${course.id}-${idx}`}
                  >
                    <div className="relative overflow-hidden" style={{ height: "120px" }}>
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.07), rgba(124,58,237,0.06))" }}
                        >
                          <BookOpen className="w-8 h-8" style={{ color: "rgba(0,245,255,0.5)" }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/50 via-transparent to-transparent" />
                      <div className="absolute top-2 right-2">
                        {isFree ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.88)", color: "#fff" }}>FREE</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(245,158,11,0.88)", color: "#fff" }}>{course.creditCost} cr</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <h3
                        className="text-xs font-semibold leading-snug line-clamp-2 text-white"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <LevelBadge level={(course.level || "beginner") as "beginner" | "intermediate" | "advanced"} />
                        {course.language && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full uppercase" style={{ background: "rgba(255,255,255,0.06)", color: C.textSecondary }}>
                            {course.language}
                          </span>
                        )}
                      </div>
                      <div
                        className="mt-auto pt-1.5 text-[11px] font-semibold flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(0,245,255,0.07)", color: C.teal, border: "1px solid rgba(0,245,255,0.15)" }}
                      >
                        View Course
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 text-center">
          <Link href="/courses">
            <button
              className="px-8 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 mx-auto hover:scale-[1.02]"
              style={{
                background: "transparent",
                color: C.teal,
                border: `1px solid rgba(0,245,255,0.3)`,
              }}
              data-testid="button-view-all-courses"
            >
              View All Courses
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#A78BFA" }}>
              AI-Powered Learning
            </div>
          <h2
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.01em",
              }}
              data-testid="text-ai-title"
            >
              Meet Usha, Your AI Learning Companion
            </h2>
            <p className="text-lg" style={{ color: C.textSecondary, lineHeight: "1.8" }}>
              Usha is integrated into every lesson, lab, and project to help you learn effectively.
              Get instant guidance without direct answers, promoting genuine understanding.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {aiFeatures.map((feature) => (
                <GlassCard
                  key={feature.title}
                  className="p-3"
                  data-testid={`feature-ai-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.1))`,
                        border: "1px solid rgba(0,245,255,0.2)",
                      }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: C.teal }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-white">{feature.title}</h4>
                      <p className="text-xs" style={{ color: C.textSecondary }}>{feature.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          <div className="relative">
            <GlassCard className="aspect-square max-w-md mx-auto p-8 flex items-center justify-center" hover={false}>
              <div
                className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center overflow-hidden animate-float"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, ${C.purple}, ${C.teal})`,
                  boxShadow: `0 0 50px -10px rgba(0,245,255,0.4)`,
                  border: `4px solid rgba(0,245,255,0.3)`,
                }}
              >
                <img
                  src={ushaAvatarImage}
                  alt="Usha AI Tutor"
                  className="w-full h-full object-cover object-center scale-110"
                  data-testid="img-usha-avatar-landing"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/30 to-transparent pointer-events-none" />
              </div>
              <GlassCard
                className="absolute top-4 right-4 md:top-8 md:right-8 p-3 md:p-4"
                hover={false}
              >
                <p className="text-sm md:text-base font-medium text-white">Need help with this concept?</p>
              </GlassCard>
              <GlassCard
                className="absolute bottom-4 left-4 md:bottom-8 md:left-8 p-3 md:p-4"
                hover={false}
              >
                <p className="text-sm md:text-base" style={{ color: C.textSecondary }}>Ask me anything!</p>
              </GlassCard>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="center" color={C.purple} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#FBBF24" }}>
            Student Reviews
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            data-testid="text-testimonials-title"
          >
            What Our Students Say
          </h2>
          <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
            Hear from learners who have transformed their careers with OurShiksha
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <GlassCard
              key={testimonial.name}
              className="relative p-6"
              data-testid={`card-testimonial-${index + 1}`}
            >
              <div className="absolute -top-3 left-6">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,245,255,0.15)", border: "1px solid rgba(0,245,255,0.3)" }}
                >
                  <Quote className="w-4 h-4" style={{ color: C.teal }} />
                </div>
              </div>
              <div className="flex gap-1 mb-4 pt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                "{testimonial.content}"
              </p>
              <div className="pt-4" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                <p className="font-semibold text-sm text-white">{testimonial.name}</p>
                <p className="text-xs" style={{ color: C.textSecondary }}>{testimonial.role}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-widest uppercase"
            style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)", color: C.teal }}>
            FAQ
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            data-testid="text-faq-title"
          >
            Frequently Asked Questions
          </h2>
          <p style={{ color: C.textSecondary }}>
            Everything you need to know about OurShiksha
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="rounded-2xl px-5 backdrop-blur-sm transition-all duration-300 border-0"
              style={{
                background: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
              }}
              data-testid={`faq-item-${index + 1}`}
            >
              <AccordionTrigger className="hover:no-underline text-left text-white">
                <span className="font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent style={{ color: C.textSecondary }}>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTASection() {
  const { user } = useAuth();

  return (
    <section className="relative py-12 md:py-16 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        <div
          className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
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
        background: `linear-gradient(180deg, ${C.bgPrimary} 0%, ${C.bgSecondary} 40%, #0B1120 100%)`,
        color: C.textPrimary,
      }}
    >
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <JourneySection />
        <FeaturesSection />
        <AISection />
        <CoursePreviewSection />
        <CourseGroupsMarquee />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
