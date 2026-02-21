import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { LevelBadge } from "@/components/ui/level-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
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

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Subscription", href: "/pricing" },
];

const udyogDropdownItems = [
  { label: "Internship", href: "#" },
];

const moreDropdownItems = [
  { label: "About Our Shiksha", href: "#" },
  { label: "AI Usha Mentor", href: "#" },
  { label: "Certifications", href: "#" },
  { label: "Become a Guru", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Contact Us", href: "#" },
];

const journeySteps = [
  {
    icon: BookOpen,
    title: "Learn",
    description: "Structured lessons designed for clarity",
  },
  {
    icon: FlaskConical,
    title: "Practice",
    description: "Guided labs to build real skills",
  },
  {
    icon: FolderKanban,
    title: "Build",
    description: "Industry-aligned projects",
  },
  {
    icon: ClipboardCheck,
    title: "Validate",
    description: "Tests and assessments",
  },
  {
    icon: Award,
    title: "Prove",
    description: "Certificates and portfolio",
  },
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

function LandingNavbar() {
  const [location] = useLocation();

  return (
    <nav className="auth-navbar" data-testid="auth-navbar">
      <div className="auth-navbar-inner">
        <Link href="/" className="auth-navbar-brand" data-testid="link-home">
          <img src={sealLogo} alt="OurShiksha" className="auth-navbar-logo" />
          <span className="auth-navbar-brand-text">
            Our <span className="auth-navbar-brand-accent">Shiksha</span>
          </span>
        </Link>

        <div className="auth-navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="auth-navbar-link"
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
              <ChevronDown className="auth-navbar-chevron" />
            </Link>
          ))}
          <div className="auth-navbar-dropdown" data-testid="nav-udyog-dropdown">
            <button className="auth-navbar-link" data-testid="link-nav-udyog">
              Udyog
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu">
              {udyogDropdownItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="auth-navbar-dropdown-item"
                  data-testid={`link-udyog-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="auth-navbar-dropdown" data-testid="nav-more-dropdown">
            <button className="auth-navbar-link" data-testid="link-nav-more">
              More
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu">
              {moreDropdownItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="auth-navbar-dropdown-item"
                  data-testid={`link-more-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-navbar-right">
          <div className="auth-navbar-dropdown auth-navbar-dropdown-right" data-testid="nav-profile-dropdown">
            <button className="auth-navbar-action" data-testid="link-nav-profile">
              Profile
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu auth-navbar-dropdown-menu-right">
              <Link href="/login" className="auth-navbar-dropdown-item" data-testid="link-profile-login">
                Login
              </Link>
              <Link href="/signup" className="auth-navbar-dropdown-item" data-testid="link-profile-signup-shishya">
                Sign up as Shishya
              </Link>
              <Link href="/signup?role=guru" className="auth-navbar-dropdown-item" data-testid="link-profile-signup-guru">
                Sign up as Guru
              </Link>
            </div>
          </div>
          <div className="auth-navbar-dropdown auth-navbar-dropdown-right" data-testid="nav-login-dropdown">
            <button
              className={`auth-navbar-action auth-navbar-login ${location === "/login" ? "auth-navbar-action-active" : ""}`}
              data-testid="link-nav-login"
            >
              Login
              <ChevronDown className="auth-navbar-chevron" />
            </button>
            <div className="auth-navbar-dropdown-menu auth-navbar-dropdown-menu-right">
              <Link href="/login" className="auth-navbar-dropdown-item" data-testid="link-login-login">
                Login
              </Link>
              <Link href="/signup?role=guru" className="auth-navbar-dropdown-item" data-testid="link-login-signup-guru">
                Sign up for Guru
              </Link>
              <Link href="/signup" className="auth-navbar-dropdown-item" data-testid="link-login-signup-shishya">
                Sign up for Shishya
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-background dark:via-background dark:to-background py-16 md:py-24">
      {/* Neon glow orbs for dark mode */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] neon-orb neon-orb-primary opacity-0 dark:opacity-20" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] neon-orb neon-orb-secondary opacity-0 dark:opacity-15" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] neon-orb neon-orb-accent opacity-0 dark:opacity-10" />
      
      {/* Light mode gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 dark:opacity-0" />
      
      {/* Dark mode radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_60%)] opacity-0 dark:opacity-100" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left space-y-6">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight dark:neon-gradient-text"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-hero-headline"
            >
              Learn. Practice. Prove.
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0"
              data-testid="text-hero-subheading"
            >
              OurShiksha is a complete skill-learning platform where students learn concepts,
              practice with hands-on labs, build real projects, pass assessments, and earn
              verified certificates.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {user ? (
                <Link href="/shishya/dashboard">
                  <Button size="lg" className="min-w-[200px] dark:shadow-neon dark:hover:shadow-[0_6px_25px_-5px_rgba(34,211,238,0.5)]" data-testid="button-go-to-shishya">
                    Go to Shishya
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="lg" className="min-w-[200px] dark:shadow-neon dark:hover:shadow-[0_6px_25px_-5px_rgba(34,211,238,0.5)]" data-testid="button-hero-login">
                      <LogIn className="w-5 h-5 mr-2" />
                      Login to Shishya
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button size="lg" variant="outline" className="min-w-[200px] dark:border-primary/40 dark:hover:border-primary dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]" data-testid="button-hero-explore">
                      Explore Courses
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Right side - Usha Avatar */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-400 p-1 shadow-2xl dark:shadow-[0_0_40px_-5px_rgba(34,211,238,0.5)] animate-float">
              <img 
                src={ushaAvatarImage} 
                alt="Usha AI Tutor" 
                className="w-full h-full rounded-full object-cover border-4 border-background"
                data-testid="img-usha-avatar-hero"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center border-4 border-background shadow-lg">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <p 
                className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-primary to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-meet-usha"
              >
                Meet Usha
              </p>
              <p className="text-sm md:text-base text-muted-foreground mt-1">Your AI Learning Companion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="relative py-16 md:py-20 bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent dark:via-primary/10" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 dark:neon-gradient-text"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-journey-title"
          >
            How OurShiksha Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your complete learning journey in 5 simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {journeySteps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 dark:from-card/80 dark:to-card/40 border border-border/50 dark:border-primary/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] dark:hover:border-primary/40 dark:hover:shadow-neon"
              data-testid={`card-journey-step-${index + 1}`}
            >
              <div className="absolute -top-3 left-4 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg dark:shadow-neon">
                {index + 1}
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const featureGradients = [
    "from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/30 dark:to-blue-500/10",
    "from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/10",
    "from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/10",
    "from-orange-500/20 to-amber-500/20 dark:from-orange-500/30 dark:to-amber-500/10",
    "from-blue-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:to-indigo-500/10",
    "from-rose-500/20 to-red-500/20 dark:from-rose-500/30 dark:to-red-500/10",
  ];

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20 dark:from-background dark:via-card/30 dark:to-background overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 dark:neon-gradient-text"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-features-title"
          >
            What Students Get
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master new skills and advance your career
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`relative p-6 rounded-2xl bg-gradient-to-br ${featureGradients[index % featureGradients.length]} border border-border/50 dark:border-primary/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] dark:hover:border-primary/40 dark:hover:shadow-neon group`}
              data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
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
    <Card className="flex flex-col h-full hover-elevate transition-all duration-200" data-testid={`card-preview-course-${course.id}`}>
      <div className="relative aspect-video rounded-t-md overflow-hidden">
        {hasThumbnail ? (
          <img
            src={course.thumbnailUrl!}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
          </div>
        )}
        {course.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-xs">
              {course.category}
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <LevelBadge level={course.level} />
        </div>
      </div>
      <CardHeader className="pb-1 gap-1">
        <h3
          className="text-base font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button variant="outline" className="w-full" data-testid={`button-view-course-${course.id}`}>
            View Course
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function CoursePreviewSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <Skeleton className="aspect-video rounded-t-lg rounded-b-none" />
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="pt-2">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

function CoursePreviewSection() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const previewCourses = courses?.slice(0, 3) || [];

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-background via-background to-muted/20 dark:to-card/20 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.1),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 dark:neon-gradient-text"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-preview-title"
          >
            Featured Courses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start your learning journey with our carefully crafted courses
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <CoursePreviewSkeleton key={i} />)
          ) : previewCourses.length > 0 ? (
            previewCourses.map((course) => <CoursePreviewCard key={course.id} course={course} />)
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No courses available yet. Check back soon!
            </div>
          )}
        </div>
        {previewCourses.length > 0 && (
          <div className="text-center">
            <Link href="/courses">
              <Button variant="outline" size="lg" className="dark:border-primary/40 dark:hover:border-primary dark:hover:shadow-neon" data-testid="button-view-all-courses">
                View All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function RewardsSection() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-slate-900/50 via-background to-cyan-950/30 dark:from-slate-950 dark:via-[#020617] dark:to-cyan-950/50 overflow-hidden">
      {/* Neon gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-tl from-cyan-400/10 via-teal-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-rewards-title"
          >
            Earn While You Learn
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto dark:text-slate-400">
            Complete courses, earn points, and unlock more learning opportunities
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewardsFlow.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 via-slate-900/30 to-cyan-950/20 dark:from-slate-900/80 dark:via-slate-950/60 dark:to-cyan-950/30 border border-cyan-500/20 dark:border-cyan-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-lg dark:hover:shadow-[0_4px_25px_-5px_rgba(34,211,238,0.4)]"
              data-testid={`card-reward-step-${index + 1}`}
            >
              {index < rewardsFlow.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6 text-cyan-400/60 dark:text-cyan-400/80 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                </div>
              )}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-teal-500/10 dark:from-cyan-400/40 dark:via-blue-500/30 dark:to-teal-500/20 flex items-center justify-center mb-4 border border-cyan-400/40 dark:border-cyan-400/50 shadow-lg dark:shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]">
                <step.icon className="w-7 h-7 text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white" style={{ fontFamily: "var(--font-display)" }}>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-background via-purple-500/5 to-background dark:via-purple-500/10 overflow-hidden">
      {/* AI-themed gradient orbs */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 via-primary to-cyan-400 bg-clip-text text-transparent"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-ai-title"
            >
              Meet Usha, Your AI Learning Companion
            </h2>
            <p className="text-muted-foreground text-lg">
              Usha is integrated into every lesson, lab, and project to help you learn effectively. 
              Get instant guidance without direct answers, promoting genuine understanding.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {aiFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/20 transition-all duration-300 hover:border-primary/40" data-testid={`feature-ai-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/10 p-8 flex items-center justify-center border border-primary/20 dark:border-primary/30 backdrop-blur-sm">
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-400 flex items-center justify-center shadow-2xl overflow-hidden border-4 border-primary/40 ring-4 ring-primary/30 ring-offset-4 ring-offset-background dark:shadow-neon-lg animate-float">
                <img 
                  src={ushaAvatarImage} 
                  alt="Usha AI Tutor" 
                  className="w-full h-full object-cover object-center scale-110"
                  data-testid="img-usha-avatar-landing"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-background/90 backdrop-blur-md rounded-xl shadow-lg p-3 md:p-4 border border-primary/30 dark:shadow-neon">
                <p className="text-sm md:text-base font-medium">Need help with this concept?</p>
              </div>
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-background/90 backdrop-blur-md rounded-xl shadow-lg p-3 md:p-4 border border-primary/30 dark:shadow-neon">
                <p className="text-sm md:text-base text-muted-foreground">Ask me anything!</p>
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
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-muted/30 via-background to-primary/5 dark:from-card/30 dark:via-background dark:to-primary/10 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border border-primary/20 rounded-full" />
      <div className="absolute bottom-20 right-20 w-32 h-32 border border-primary/10 rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 dark:neon-gradient-text"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-testimonials-title"
          >
            What Our Students Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from learners who have transformed their careers with OurShiksha
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name} 
              className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-card/80 dark:from-card/80 dark:to-card/40 border border-border/50 dark:border-primary/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] dark:hover:border-primary/40 dark:hover:shadow-neon" 
              data-testid={`card-testimonial-${index + 1}`}
            >
              <div className="absolute -top-3 left-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                  <Quote className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex gap-1 mb-4 pt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="pt-4 border-t border-border/50 dark:border-primary/20">
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-background to-muted/20 dark:to-card/20 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 md:px-8 relative">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 dark:neon-gradient-text"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-faq-title"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about OurShiksha
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-4" data-testid="accordion-faq">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border border-border/50 dark:border-primary/20 rounded-2xl px-4 bg-gradient-to-r from-card/50 to-card/30 dark:from-card/60 dark:to-card/30 backdrop-blur-sm transition-all duration-300 dark:hover:border-primary/40"
              data-testid={`faq-item-${index + 1}`}
            >
              <AccordionTrigger className="hover:no-underline text-left">
                <span className="font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
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
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-tl from-primary/15 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg dark:shadow-neon animate-float">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-4 dark:neon-gradient-text"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid="text-cta-title"
        >
          Start your learning journey with OurShiksha today.
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of students mastering new skills and building their careers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link href="/shishya/dashboard">
              <Button size="lg" className="min-w-[180px] dark:shadow-neon dark:hover:shadow-neon-lg" data-testid="button-cta-shishya">
                Go to Shishya
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="min-w-[150px] dark:shadow-neon dark:hover:shadow-neon-lg" data-testid="button-cta-login">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="min-w-[150px] dark:border-primary/40 dark:hover:border-primary dark:hover:shadow-neon" data-testid="button-cta-signup">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </Button>
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
    <footer className="border-t border-border/50 dark:border-primary/20 py-8 bg-gradient-to-b from-background to-muted/20 dark:to-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm dark:shadow-neon">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold dark:neon-gradient-text" style={{ fontFamily: "var(--font-display)" }}>
              OurShiksha
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground dark:hover:text-primary transition-colors" data-testid="link-home">
              Home
            </Link>
            <Link href="/about" className="hover:text-foreground dark:hover:text-primary transition-colors" data-testid="link-about">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground dark:hover:text-primary transition-colors" data-testid="link-privacy">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground dark:hover:text-primary transition-colors" data-testid="link-terms">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground dark:hover:text-primary transition-colors" data-testid="link-contact">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            OurShiksha {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
