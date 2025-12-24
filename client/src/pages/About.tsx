import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Brain, 
  Trophy, 
  Shield, 
  Sparkles, 
  Target,
  BookOpen,
  Award,
  Users,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function Footer() {
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
          <p className="text-sm text-muted-foreground">
            OurShiksha {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function About() {
  const differentiators = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Mithra, our AI tutor, provides personalized guidance using Socratic methods - never giving direct answers, always encouraging understanding."
    },
    {
      icon: Trophy,
      title: "Learn. Practice. Prove.",
      description: "Complete structured lessons, apply knowledge in guided labs, and demonstrate mastery through tests and projects."
    },
    {
      icon: Award,
      title: "Verified Certificates",
      description: "Earn industry-recognized certificates with QR code verification that employers can instantly validate."
    },
    {
      icon: Target,
      title: "Credit-Based Access",
      description: "Transparent pricing with learning credits. Know exactly what each action costs - no hidden fees or surprises."
    },
    {
      icon: Shield,
      title: "Academic Integrity",
      description: "Server-side test scoring, one-time attempts, and anti-cheating measures ensure your credentials are truly earned."
    },
    {
      icon: Users,
      title: "Public Portfolio",
      description: "Showcase your achievements with a shareable portfolio page that recruiters and employers can view."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="max-w-4xl mx-auto px-4 md:px-8 relative">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 gap-1.5 px-4 py-1.5">
                <Sparkles className="w-4 h-4" />
                About OurShiksha
              </Badge>
              
              <h1 
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Empowering Learners to{" "}
                <span className="text-primary">Prove Their Skills</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                OurShiksha is more than a learning platform. We're building a trusted ecosystem 
                where skills are learned, practiced, and verifiably proven.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              className="prose prose-lg dark:prose-invert max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-8">
                In a world where online certifications are often questioned, we built OurShiksha 
                to create a learning experience that employers can trust. Every certificate, 
                every skill, every achievement on our platform is backed by genuine learning 
                and verified assessment.
              </p>
              
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                The OurShiksha Approach
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-medium">Learn</span>
                </div>
                <div className="w-8 h-px bg-border" />
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-medium">Practice</span>
                </div>
                <div className="w-8 h-px bg-border" />
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-medium">Prove</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-8">
                Our three-step methodology ensures you don't just consume content - you actively 
                apply knowledge through hands-on labs, demonstrate understanding through rigorous 
                tests, and build real projects that showcase your capabilities.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-center mb-12"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              What Makes Us Different
            </motion.h2>
            
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {differentiators.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Built with Trust & Transparency
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Chennai, India</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Secure Razorpay Payments</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Data Privacy Compliant</span>
                </div>
              </div>
              
              <Link href="/signup">
                <Button size="lg" className="gap-2" data-testid="button-start-learning">
                  <Sparkles className="w-5 h-5" />
                  Start Learning Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
