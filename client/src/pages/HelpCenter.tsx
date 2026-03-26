import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Sparkles, GraduationCap, MessageSquare, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import type { SitePage, HelpCenterContent, FaqItem } from "@shared/schema";

const C = {
  bg: "#F8F7FF",
  teal: "#6367FF",
  purple: "#8494FF",
  textPrimary: "#1E1B4B",
  textSecondary: "#6B7280",
  cardBg: "#FFFFFF",
  cardBorder: "#EDE9FF",
  heroGrad: "linear-gradient(135deg, #6367FF 0%, #8494FF 60%, #C9BEFF 100%)",
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function DarkFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: `1px solid ${C.cardBorder}`, background: C.cardBg }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.purple})` }}>
              <GraduationCap className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>OurShiksha</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ color: C.textSecondary }} className="hover:text-gray-900 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm" style={{ color: C.textSecondary }}>OurShiksha {year}</p>
        </div>
      </div>
    </footer>
  );
}

export default function HelpCenter() {
  const { data: page, isLoading } = useQuery<SitePage>({
    queryKey: ["/api/pages", "help-center"],
    queryFn: () => fetch("/api/pages/help-center").then((r) => r.json()),
  });

  const content = (page?.content || {}) as HelpCenterContent;
  const faq: FaqItem[] = content.faq || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: C.bg }}>
        <LandingNavbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <Skeleton className="h-10 w-3/4 mx-auto mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
          <Skeleton className="h-5 w-1/2 mx-auto mb-10" style={{ background: "rgba(255,255,255,0.04)" }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 mb-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.textPrimary }}>
      <LandingNavbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-14 pb-10 md:pt-20 md:pb-14">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[130px] opacity-10"
              style={{ background: `radial-gradient(circle, ${C.teal}, transparent)` }} />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-[100px] opacity-10"
              style={{ background: `radial-gradient(circle, ${C.purple}, transparent)` }} />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-medium"
                style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: C.teal }}>
                <HelpCircle className="w-3.5 h-3.5" />
                Help Center
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  background: `linear-gradient(135deg, ${C.textPrimary} 0%, ${C.teal} 55%, ${C.purple} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                data-testid="text-hero-heading"
              >
                {content.heroHeading || "How Can We Help You?"}
              </h1>

              <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: C.textSecondary }}
                data-testid="text-hero-subtext">
                {content.heroSubtext || "Find answers to common questions about OurShiksha."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ Accordion ── */}
        {faq.length > 0 && (
          <section className="py-6 md:py-8">
            <div className="max-w-3xl mx-auto px-4 md:px-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              >
                <Accordion type="single" collapsible className="space-y-2">
                  {faq.map((item: FaqItem, i: number) => (
                    <motion.div key={i} variants={itemVariants}>
                      <AccordionItem
                        value={`faq-${i}`}
                        className="rounded-xl overflow-hidden border-0"
                        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                        data-testid={`faq-item-${i}`}
                      >
                        <AccordionTrigger
                          className="px-5 py-4 text-sm md:text-base font-medium text-left hover:no-underline"
                          style={{ color: C.textPrimary }}
                        >
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent
                          className="px-5 pb-4 text-sm leading-relaxed"
                          style={{ color: C.textSecondary }}
                        >
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── Still need help CTA ── */}
        <section className="py-10 md:py-14">
          <div className="max-w-xl mx-auto px-4 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 md:p-8"
              style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(0,245,255,0.10)", border: "1px solid rgba(0,245,255,0.2)" }}>
                <MessageSquare className="w-5 h-5" style={{ color: C.teal }} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Still need help?
              </h2>
              <p className="text-sm mb-6" style={{ color: C.textSecondary }}>
                Our support team is ready to assist you.
              </p>
              <Link href="/contact">
                <button
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                    color: "#fff",
                    boxShadow: "0 0 20px rgba(0,245,255,0.25)",
                  }}
                  data-testid="button-cta"
                >
                  <Sparkles className="w-4 h-4" />
                  {content.ctaText || "Contact Support"}
                </button>
              </Link>

              <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
                {[
                  { icon: BookOpen, label: "Browse Courses", href: "/courses" },
                  { icon: GraduationCap, label: "Get Started Free", href: "/signup" },
                ].map((item, i) => (
                  <Link key={i} href={item.href}>
                    <div className="flex items-center gap-1.5 text-sm cursor-pointer transition-colors hover:text-gray-900"
                      style={{ color: C.textSecondary }}>
                      <item.icon className="w-4 h-4" style={{ color: C.teal }} />
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <DarkFooter />
    </div>
  );
}
