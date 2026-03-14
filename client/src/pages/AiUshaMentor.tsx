import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, MessageCircle, Clock, User, BookOpen, GraduationCap, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";
import type { SitePage, AiUshaMentorContent, TitleDescriptionItem } from "@shared/schema";

const iconMap: Record<string, LucideIcon> = {
  "Socratic Method": MessageCircle,
  "24/7 Availability": Clock,
  "Personalized Guidance": User,
  "Context-Aware": BookOpen,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>OurShiksha</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors" data-testid="link-about">About</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors" data-testid="link-contact">Contact</Link>
          </nav>
          <p className="text-sm text-muted-foreground">OurShiksha {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}

export default function AiUshaMentor() {
  const { data: page, isLoading } = useQuery<SitePage>({
    queryKey: ["/api/pages", "ai-usha-mentor"],
    queryFn: () => fetch("/api/pages/ai-usha-mentor").then(r => r.json()),
  });

  const content = (page?.content || {}) as AiUshaMentorContent;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
        </main>
      </div>
    );
  }

  const features: TitleDescriptionItem[] = content.features || [];

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
                <Brain className="w-4 h-4" />
                AI Mentor
              </Badge>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-hero-heading"
              >
                {content.heroHeading || "Meet Usha — Your AI Learning Companion"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtext">
                {content.heroSubtext || "Your personal AI mentor powered by the Socratic method."}
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
              How Usha Helps You Learn
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {features.map((feature: TitleDescriptionItem, index: number) => {
                const Icon = iconMap[feature.title] || Sparkles;
                return (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="h-full" data-testid={`card-feature-${index}`}>
                      <CardContent className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Link href="/signup">
                <Button size="lg" className="gap-2" data-testid="button-cta">
                  <Sparkles className="w-5 h-5" />
                  {content.ctaText || "Start Learning with Usha"}
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
