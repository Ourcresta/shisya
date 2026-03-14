import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Sparkles, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SitePage, HelpCenterContent, FaqItem } from "@shared/schema";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
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

export default function HelpCenter() {
  const { data: page, isLoading } = useQuery<SitePage>({
    queryKey: ["/api/pages", "help-center"],
    queryFn: () => fetch("/api/pages/help-center").then(r => r.json()),
  });

  const content = (page?.content || {}) as HelpCenterContent;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 mb-3" />)}
        </main>
      </div>
    );
  }

  const faq: FaqItem[] = content.faq || [];

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
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Badge>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
                data-testid="text-hero-heading"
              >
                {content.heroHeading || "How Can We Help You?"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtext">
                {content.heroSubtext || "Find answers to common questions."}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Accordion type="single" collapsible className="w-full">
                {faq.map((item: FaqItem, index: number) => (
                  <motion.div key={index} variants={itemVariants}>
                    <AccordionItem value={`faq-${index}`} data-testid={`faq-item-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                Still need help?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our support team is ready to assist you.
              </p>
              <Link href="/contact">
                <Button size="lg" className="gap-2" data-testid="button-cta">
                  <Sparkles className="w-5 h-5" />
                  {content.ctaText || "Contact Support"}
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
