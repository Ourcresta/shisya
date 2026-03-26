import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

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

interface PublicConfig {
  supportEmail: string;
  privacyEmail: string;
  legalEmail: string;
  companyLocation: string;
  companyName: string;
}

function DarkFooter() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: `1px solid ${C.cardBorder}`, background: C.cardBg }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.purple})` }}>
              <GraduationCap className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>OurShiksha</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { href: "/about", label: "About" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
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

const differentiators = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Usha, our AI tutor, provides personalized guidance using Socratic methods — never giving direct answers, always encouraging genuine understanding.",
    accent: "#6367FF",
  },
  {
    icon: Trophy,
    title: "Learn. Practice. Prove.",
    description: "Complete structured lessons, apply knowledge in guided labs, and demonstrate mastery through rigorous tests and real-world projects.",
    accent: "#F59E0B",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn industry-recognized certificates with QR code verification that employers can instantly validate — no guesswork.",
    accent: "#10B981",
  },
  {
    icon: Target,
    title: "Credit-Based Access",
    description: "Transparent pricing with learning credits. Know exactly what each course costs — no hidden fees or surprise charges.",
    accent: "#A78BFA",
  },
  {
    icon: Shield,
    title: "Academic Integrity",
    description: "Server-side test scoring, one-time attempts, and anti-cheating measures ensure your credentials are truly earned.",
    accent: "#6367FF",
  },
  {
    icon: Users,
    title: "Public Portfolio",
    description: "Showcase your achievements with a shareable portfolio that recruiters and employers can verify at a glance.",
    accent: "#8494FF",
  },
];

const stepsData = [
  { icon: BookOpen, label: "Learn", sub: "Structured lessons" },
  { icon: Target, label: "Practice", sub: "Hands-on labs" },
  { icon: Trophy, label: "Prove", sub: "Real assessments" },
];

export default function About() {
  const { data: config } = useQuery<PublicConfig>({
    queryKey: ["/api/config/public"],
  });

  const companyLocation = config?.companyLocation || "Chennai, Tamil Nadu, India";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.textPrimary }}>
      <LandingNavbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10"
              style={{ background: `radial-gradient(circle, ${C.teal}, transparent)` }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
              style={{ background: `radial-gradient(circle, ${C.purple}, transparent)` }} />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  background: `linear-gradient(135deg, ${C.textPrimary} 0%, ${C.teal} 55%, ${C.purple} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                data-testid="text-about-heading"
              >
                Empowering Learners to<br />Prove Their Skills
              </h1>

              <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: C.textSecondary }}>
                OurShiksha is more than a learning platform. We're building a trusted ecosystem where
                skills are learned, practiced, and verifiably proven — so your effort is never in doubt.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="py-10 md:py-12">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-2xl p-6 md:p-8"
              style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(to bottom, ${C.teal}, ${C.purple})` }} />
                <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Our Mission</h2>
              </div>
              <p className="leading-relaxed mb-5" style={{ color: C.textSecondary }}>
                In a world where online certifications are often questioned, we built OurShiksha to create
                a learning experience that employers can trust. Every certificate, every skill, every achievement
                on our platform is backed by genuine learning and verified assessment.
              </p>

              <div className="flex items-center gap-3 mb-4 mt-7">
                <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(to bottom, ${C.teal}, ${C.purple})` }} />
                <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>The OurShiksha Approach</h2>
              </div>

              <div className="flex items-center gap-2 md:gap-4 flex-wrap mb-5">
                {stepsData.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{ background: "rgba(99,103,255,0.15)", border: "1px solid rgba(99,103,255,0.15)" }}>
                      <step.icon className="w-4 h-4" style={{ color: C.teal }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: C.textPrimary }}>{step.label}</div>
                        <div className="text-xs" style={{ color: C.textSecondary }}>{step.sub}</div>
                      </div>
                    </div>
                    {i < stepsData.length - 1 && (
                      <ArrowRight className="w-4 h-4 shrink-0" style={{ color: C.textSecondary }} />
                    )}
                  </div>
                ))}
              </div>

              <p className="leading-relaxed" style={{ color: C.textSecondary }}>
                Our three-step methodology ensures you don't just consume content — you actively
                apply knowledge through hands-on labs, demonstrate understanding through rigorous
                tests, and build real projects that showcase your capabilities to the world.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Differentiators ── */}
        <section className="py-10 md:py-14 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,103,255,0.15) 0%, rgba(132,148,255,0.15) 55%, transparent 70%)" }} />

          <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
            <motion.div className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                What Makes Us Different
              </h2>
              <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                Features built with learning outcomes — not engagement metrics — in mind
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {differentiators.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group rounded-2xl p-5 transition-all duration-300"
                  style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${item.accent}33`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder; }}
                  data-testid={`card-differentiator-${i}`}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}30` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                  </div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base" style={{ color: C.textPrimary }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className="py-10 md:py-12">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 md:p-8 text-center"
              style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-5" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                Built with Trust &amp; Transparency
              </h2>

              <div className="flex flex-col md:flex-row items-center justify-center gap-5 mb-7">
                {[
                  { icon: MapPin, label: companyLocation, color: C.teal },
                  { icon: CheckCircle2, label: "Secure Razorpay Payments", color: "#10B981" },
                  { icon: Shield, label: "Data Privacy Compliant", color: C.purple },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup">
                <button
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                    color: "#fff",
                    boxShadow: `0 0 20px rgba(99,103,255,0.15)`,
                  }}
                  data-testid="button-start-learning"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Learning Today
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
