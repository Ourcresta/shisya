import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, MessageCircle, Clock, User, BookOpen, GraduationCap, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import type { SitePage, AiUshaMentorContent, TitleDescriptionItem } from "@shared/schema";

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

const iconMap: Record<string, LucideIcon> = {
  "Socratic Method": MessageCircle,
  "24/7 Availability": Clock,
  "Personalized Guidance": User,
  "Context-Aware": BookOpen,
};

const ACCENT_COLORS = ["#6367FF", "#8494FF", "#C9BEFF", "#10B981"];

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
            {[{ href: "/about", label: "About" }, { href: "/contact", label: "Contact" }].map((l) => (
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

export default function AiUshaMentor() {
  const { data: page, isLoading } = useQuery<SitePage>({
    queryKey: ["/api/pages", "ai-usha-mentor"],
    queryFn: () => fetch("/api/pages/ai-usha-mentor").then((r) => r.json()),
  });

  const content = (page?.content || {}) as AiUshaMentorContent;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: C.bg }}>
        <LandingNavbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <Skeleton className="h-10 w-3/4 mx-auto mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
          <Skeleton className="h-5 w-1/2 mx-auto mb-10" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />)}
          </div>
        </main>
      </div>
    );
  }

  const features: TitleDescriptionItem[] = content.features || [];

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
                {content.heroHeading || "Meet Usha — Your AI Learning Companion"}
              </h1>

              <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: C.textSecondary }}
                data-testid="text-hero-subtext">
                {content.heroSubtext || "Your personal AI mentor powered by the Socratic method."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Features grid ── */}
        {features.length > 0 && (
          <section className="py-8 md:py-12 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,103,255,0.04) 0%, rgba(132,148,255,0.02) 55%, transparent 70%)" }} />

            <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-center mb-8"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: C.textPrimary }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                How Usha Helps You Learn
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-5">
                {features.map((feature: TitleDescriptionItem, i: number) => {
                  const Icon = iconMap[feature.title] || Sparkles;
                  const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl p-5 transition-all duration-300"
                      style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}33`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder; }}
                      data-testid={`card-feature-${i}`}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <h3 className="font-semibold mb-2 text-sm md:text-base" style={{ color: C.textPrimary }}>{feature.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="py-10 md:py-14">
          <div className="max-w-xl mx-auto px-4 md:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Link href="/signup">
                <button
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                    color: "#fff",
                    boxShadow: "0 0 24px rgba(99,103,255,0.25)",
                  }}
                  data-testid="button-cta"
                >
                  <Sparkles className="w-4 h-4" />
                  {content.ctaText || "Start Learning with Usha"}
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

      </main>
      <DarkFooter />
    </div>
  );
}
