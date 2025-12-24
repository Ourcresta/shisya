import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/Header";
import { LevelBadge } from "@/components/ui/level-badge";
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
} from "lucide-react";
import type { Course } from "@shared/schema";

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

function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-hero-headline"
          >
            Learn. Practice. Prove.
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            data-testid="text-hero-subheading"
          >
            OurShiksha is a complete skill-learning platform where students learn concepts,
            practice with hands-on labs, build real projects, pass assessments, and earn
            verified certificates.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link href="/shishya/dashboard">
                <Button size="lg" className="min-w-[200px]" data-testid="button-go-to-shishya">
                  Go to Shishya
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="min-w-[200px]" data-testid="button-hero-login">
                    <LogIn className="w-5 h-5 mr-2" />
                    Login to Shishya
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" className="min-w-[200px]" data-testid="button-hero-explore">
                    Explore Courses
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
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
              className="relative flex flex-col items-center text-center p-6 rounded-xl bg-muted/30"
              data-testid={`card-journey-step-${index + 1}`}
            >
              <div className="absolute -top-3 left-4 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
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
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-features-title"
          >
            What Students Get
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master new skills and advance your career
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="relative"
              data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoursePreviewCard({ course }: { course: Course }) {
  return (
    <Card className="flex flex-col h-full" data-testid={`card-preview-course-${course.id}`}>
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <LevelBadge level={course.level} />
        </div>
      </div>
      <CardHeader className="pb-2">
        <h3
          className="text-lg font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>
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
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
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
              <Button variant="outline" size="lg" data-testid="button-view-all-courses">
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

function CTASection() {
  const { user } = useAuth();

  return (
    <section className="py-16 md:py-20 bg-primary/5">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
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
              <Button size="lg" className="min-w-[180px]" data-testid="button-cta-shishya">
                Go to Shishya
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="min-w-[150px]" data-testid="button-cta-login">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="min-w-[150px]" data-testid="button-cta-signup">
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
    <footer className="border-t py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              OurShiksha
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-home">
              Home
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors" data-testid="link-about">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact">
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
      <Header />
      <main className="flex-1">
        <HeroSection />
        <JourneySection />
        <FeaturesSection />
        <CoursePreviewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
