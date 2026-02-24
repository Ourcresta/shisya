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
  Coins,
  Wallet,
  Gift,
  Globe,
  Sparkles,
  MessageCircle,
  Star,
  Quote,
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
];

const rewardsFlow = [
  { icon: BookOpen, title: "Complete Courses", description: "Finish lessons and projects" },
  { icon: Coins, title: "Earn Points", description: "Get rewarded for learning" },
  { icon: Wallet, title: "Fill Your Wallet", description: "Points go to your wallet" },
  { icon: Gift, title: "Unlock Rewards", description: "Use for new courses" },
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
    <section className="relative overflow-hidden py-20 md:py-28">
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

function JourneySection() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em",
            }}
            data-testid="text-journey-title"
          >
            How OurShiksha Works
          </h2>
          <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
            Your complete learning journey in 5 simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {journeySteps.map((step, index) => (
            <GlassCard
              key={step.title}
              className="relative flex flex-col items-center text-center p-6"
              data-testid={`card-journey-step-${index + 1}`}
            >
              <div
                className="absolute -top-3 left-4 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
                  color: C.bgPrimary,
                  boxShadow: `0 0 12px rgba(0,245,255,0.4)`,
                }}
              >
                {index + 1}
              </div>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: "rgba(0,245,255,0.1)",
                  border: "1px solid rgba(0,245,255,0.2)",
                }}
              >
                <step.icon className="w-7 h-7" style={{ color: C.teal }} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-display)" }}>
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: C.textSecondary }}>{step.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const iconColors = [C.teal, C.purple, C.success, C.warning, C.teal, C.purple];

  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            data-testid="text-features-title"
          >
            What Students Get
          </h2>
          <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
            Everything you need to master new skills and advance your career
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const accent = iconColors[index % iconColors.length];
            return (
              <GlassCard
                key={feature.title}
                className="p-6"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${accent}15`,
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: accent }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm" style={{ color: C.textSecondary }}>{feature.description}</p>
                  </div>
                </div>
              </GlassCard>
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

function CoursePreviewSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const previewCourses = courses?.slice(0, 3) || [];

  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <CoursePreviewSkeleton key={i} />)
          ) : previewCourses.length > 0 ? (
            previewCourses.map((course) => <CoursePreviewCard key={course.id} course={course} />)
          ) : (
            <div className="col-span-full text-center py-12" style={{ color: C.textSecondary }}>
              No courses available yet. Check back soon!
            </div>
          )}
        </div>
        {previewCourses.length > 0 && (
          <div className="text-center">
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
        )}
      </div>
    </section>
  );
}

function RewardsSection() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="top-left" color={C.teal} />
      <SectionGlow position="top-right" color={C.purple} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.teal}, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            data-testid="text-rewards-title"
          >
            Earn While You Learn
          </h2>
          <p style={{ color: C.textSecondary }} className="max-w-2xl mx-auto">
            Complete courses, earn points, and unlock more learning opportunities
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewardsFlow.map((step, index) => (
            <GlassCard
              key={step.title}
              className="relative flex flex-col items-center text-center p-6"
              data-testid={`card-reward-step-${index + 1}`}
            >
              {index < rewardsFlow.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6" style={{ color: `${C.teal}99` }} />
                </div>
              )}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: "rgba(0,245,255,0.1)",
                  border: "1px solid rgba(0,245,255,0.25)",
                  boxShadow: "0 0 20px -5px rgba(0,245,255,0.2)",
                }}
              >
                <step.icon className="w-7 h-7" style={{ color: C.teal }} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-display)" }}>
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: C.textSecondary }}>{step.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="top-right" color={C.purple} />
      <SectionGlow position="bottom-left" color={C.teal} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
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
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="center" color={C.purple} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
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
    <section className="relative py-20 md:py-24 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
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
    <section className="relative py-20 md:py-24 overflow-hidden">
      <SectionGlow position="center" color={C.teal} />

      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
            style={{
              background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`,
              boxShadow: `0 0 30px -5px rgba(0,245,255,0.4)`,
            }}
          >
            <GraduationCap className="w-8 h-8" style={{ color: C.bgPrimary }} />
          </div>
        </div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-display)",
            background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          data-testid="text-cta-title"
        >
          Start your learning journey with OurShiksha today.
        </h2>
        <p className="mb-8 max-w-2xl mx-auto" style={{ color: C.textSecondary }}>
          Join thousands of students mastering new skills and building their careers.
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
        <RewardsSection />
        <AISection />
        <CoursePreviewSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
