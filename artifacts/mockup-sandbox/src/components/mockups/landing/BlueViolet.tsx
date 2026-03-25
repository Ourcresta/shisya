import { useState, useEffect, useRef } from "react";
import {
  GraduationCap, BookOpen, FlaskConical, FolderKanban, ClipboardCheck,
  Award, Briefcase, ArrowRight, ChevronRight, Globe, Sparkles, MessageCircle,
  Star, Building2, Handshake, CheckCircle2, Trophy, Menu, X, Play,
  BarChart2, Target, Zap, Brain, Layers, ShieldCheck,
} from "lucide-react";

const C = {
  primary:    "#6367FF",
  secondary:  "#8494FF",
  lightBg:    "#C9BEFF",
  highlight:  "#FFDBFD",
  textPrimary:"#1A1A1A",
  textSec:    "#4B5563",
  textMuted:  "#9CA3AF",
  white:      "#FFFFFF",
  bgPage:     "#F8F7FF",
  bgSection:  "#FFFFFF",
  cardBg:     "#FFFFFF",
  borderLight:"#EDE9FF",
  grad:       "linear-gradient(135deg, #6367FF 0%, #8494FF 100%)",
  gradHero:   "linear-gradient(135deg, #6367FF 0%, #8494FF 60%, #B9BEFF 100%)",
  gradPink:   "linear-gradient(135deg, #FFDBFD 0%, #E9D5FF 100%)",
};

function FloatingCard({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 text-sm font-medium"
      style={{ background: C.white, color: C.textPrimary, border: `1px solid ${C.borderLight}`, ...style }}
    >
      {children}
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const navLinks = ["Courses", "AI Tutor", "Certificates", "About"];
  return (
    <nav style={{ background: C.white, borderBottom: `1px solid ${C.borderLight}` }} className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.grad }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-lg" style={{ color: C.textPrimary }}>
            Our<span style={{ color: C.primary }}>Shiksha</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a key={l} href="#" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: C.textSec }}>{l}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-opacity hover:opacity-70" style={{ color: C.primary }}>
            Log In
          </button>
          <button className="px-5 py-2 text-sm font-bold text-white rounded-xl shadow transition-opacity hover:opacity-90" style={{ background: C.grad }}>
            Get Started Free
          </button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: C.textPrimary }}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-2 border-t" style={{ borderColor: C.borderLight }}>
          {navLinks.map((l) => (
            <a key={l} href="#" className="block py-2 text-sm font-medium" style={{ color: C.textSec }}>{l}</a>
          ))}
          <button className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: C.grad }}>
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 3000);
    return () => clearInterval(t);
  }, []);
  const headlines = ["Learn. Build. Get Certified.", "Upskill. Practice. Excel.", "Code. Create. Conquer."];
  return (
    <section className="relative overflow-hidden py-20 px-6" style={{ background: C.gradHero }}>
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: C.highlight }} />
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
        style={{ background: "#fff" }} />

      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left content */}
        <div className="flex-1 space-y-7 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
            <Sparkles className="w-3.5 h-3.5" />
            India's Premier AI Learning Platform
          </div>
          <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="block opacity-90 text-2xl mb-1 font-semibold">Your Path to Mastery</span>
            <span key={tick}>{headlines[tick % headlines.length]}</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-lg leading-relaxed">
            An AI-powered e-learning platform combining structured courses, hands-on labs,
            real projects, and a personal AI tutor — Usha — to accelerate your career.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <button className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform hover:scale-105"
              style={{ background: C.white, color: C.primary }}>
              Start Learning Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm border-2 border-white/40 text-white hover:bg-white/10 transition-colors">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>
          <div className="flex items-center gap-6 pt-1">
            {["500 Free Credits", "Self-Paced", "Verified Certs"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-white/80">
                <CheckCircle2 className="w-3.5 h-3.5" /> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Floating UI cards */}
        <div className="flex-1 relative h-72 md:h-80 w-full hidden md:block">
          {/* Main card */}
          <div className="absolute top-0 right-0 w-64 rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: C.white }}>
            <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: C.borderLight }}>
              <span className="text-xs font-bold" style={{ color: C.textPrimary }}>My Progress</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: C.highlight, color: C.primary }}>Active</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "Python Basics", pct: 78, color: C.primary },
                { label: "Web Dev Bootcamp", pct: 45, color: C.secondary },
                { label: "Data Science", pct: 20, color: "#A78BFA" },
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: C.textSec }}>{c.label}</span>
                    <span className="font-semibold" style={{ color: c.color }}>{c.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: C.borderLight }}>
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating notification cards */}
          <FloatingCard style={{ position: "absolute", top: "160px", right: "220px", animation: "floatA 4s ease-in-out infinite" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.highlight }}>
              <Award className="w-4 h-4" style={{ color: C.primary }} />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: C.textPrimary }}>Certificate Earned!</div>
              <div className="text-xs" style={{ color: C.textMuted }}>Python Developer</div>
            </div>
          </FloatingCard>

          <FloatingCard style={{ position: "absolute", top: "230px", right: "30px", animation: "floatB 5s ease-in-out infinite" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EFF6FF" }}>
              <Brain className="w-4 h-4" style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: C.textPrimary }}>Usha AI says…</div>
              <div className="text-xs" style={{ color: C.textMuted }}>Try the next lab 🎯</div>
            </div>
          </FloatingCard>

          <FloatingCard style={{ position: "absolute", top: "310px", right: "160px", animation: "floatC 3.5s ease-in-out infinite" }}>
            <div className="flex -space-x-2">
              {["P", "R", "A", "K"].map((l, i) => (
                <div key={i} className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold border-2 border-white"
                  style={{ background: [C.primary, C.secondary, "#A78BFA", "#F472B6"][i] }}>{l}</div>
              ))}
            </div>
            <span className="text-xs" style={{ color: C.textSec }}>+12,000 learners</span>
          </FloatingCard>
        </div>
      </div>

      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { icon: Trophy, value: "12,000+", label: "Active Learners" },
    { icon: BookOpen, value: "150+",   label: "Expert Courses" },
    { icon: Award,   value: "95%",     label: "Completion Rate" },
    { icon: Briefcase, value: "3.2×",  label: "Average Salary Lift" },
  ];
  return (
    <section style={{ background: C.bgSection, borderBottom: `1px solid ${C.borderLight}` }} className="py-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.gradPink }}>
              <s.icon className="w-5 h-5" style={{ color: C.primary }} />
            </div>
            <div>
              <div className="text-xl font-extrabold font-['Space_Grotesk']" style={{ color: C.primary }}>{s.value}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JourneySection() {
  const steps = [
    { icon: BookOpen,       label: "Learn",    desc: "Structured lessons",      bg: "#EDE9FF", color: C.primary },
    { icon: FlaskConical,   label: "Practice", desc: "Guided labs",             bg: "#EFF6FF", color: "#3B82F6" },
    { icon: FolderKanban,   label: "Build",    desc: "Real projects",           bg: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: C.white, text: C.white },
    { icon: ClipboardCheck, label: "Validate", desc: "Assessments & tests",     bg: C.highlight, color: "#A855F7" },
  ];
  return (
    <section className="py-16 px-6" style={{ background: C.bgPage }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: C.textPrimary }}>
          Your <span style={{ color: C.primary }}>Learning Journey</span>
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: C.textSec }}>
          A structured, step-by-step path from beginner to certified professional.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={s.label} className="rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              style={{ background: typeof s.bg === "string" ? s.bg : undefined, border: s.text ? "none" : `1px solid ${C.borderLight}` }}>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: s.text ? "rgba(255,255,255,0.2)" : C.borderLight }}>
                  <s.icon className="w-5 h-5" style={{ color: s.text ? C.white : s.color }} />
                </div>
                <span className="text-lg font-bold opacity-20" style={{ color: s.text ? C.white : s.color }}>0{i + 1}</span>
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: s.text || C.textPrimary }}>{s.label}</div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: s.text ? "rgba(255,255,255,0.7)" : C.textSec }}>{s.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: s.text ? C.white : s.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoursesSection() {
  const courses = [
    { title: "Python for Beginners",      tag: "Programming",  level: "Beginner", rating: 4.9, students: "3.2k", color: C.primary,    icon: Brain },
    { title: "Full-Stack Web Dev",        tag: "Web Dev",      level: "Intermediate", rating: 4.8, students: "2.1k", color: "#3B82F6", icon: Layers },
    { title: "Data Science Bootcamp",     tag: "Data",         level: "Intermediate", rating: 4.7, students: "1.8k", color: "#A855F7", icon: BarChart2 },
    { title: "AI & Machine Learning",     tag: "AI/ML",        level: "Advanced", rating: 4.9, students: "980",  color: "#F472B6",    icon: Sparkles },
    { title: "UI/UX Design Mastery",      tag: "Design",       level: "Beginner", rating: 4.8, students: "1.5k", color: C.secondary,  icon: Target },
    { title: "Cloud Computing (AWS)",     tag: "Cloud",        level: "Advanced", rating: 4.6, students: "720",  color: "#10B981",    icon: Globe },
  ];
  return (
    <section className="py-16 px-6" style={{ background: C.bgSection }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold" style={{ color: C.textPrimary }}>
              Featured <span style={{ color: C.primary }}>Courses</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: C.textSec }}>Curated by industry experts. Loved by learners.</p>
          </div>
          <button className="hidden md:flex items-center gap-1 text-sm font-semibold" style={{ color: C.primary }}>
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.map((c) => (
            <div key={c.title}
              className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              style={{ background: C.cardBg, border: `1px solid ${C.borderLight}` }}>
              {/* Banner */}
              <div className="h-28 flex items-center justify-center relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${c.color}22 0%, ${c.color}44 100%)`, borderBottom: `1px solid ${C.borderLight}` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${c.color}22` }}>
                  <c.icon className="w-7 h-7" style={{ color: c.color }} />
                </div>
                <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{ background: c.color }}>{c.level}</div>
              </div>
              {/* Info */}
              <div className="p-4 space-y-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${c.color}15`, color: c.color }}>{c.tag}</span>
                <div className="text-sm font-bold leading-snug" style={{ color: C.textPrimary }}>{c.title}</div>
                <div className="flex items-center justify-between text-xs" style={{ color: C.textMuted }}>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" style={{ color: "#F59E0B" }} />
                    <span className="font-semibold" style={{ color: C.textPrimary }}>{c.rating}</span>
                    <span>({c.students} students)</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: C.primary }}>
                    Enroll <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  const reasons = [
    { icon: Brain,       title: "AI-Powered Tutor",    desc: "Usha guides you 24/7 with smart, contextual hints — never just answers.",       color: C.primary },
    { icon: ShieldCheck, title: "Verified Certificates", desc: "QR-coded credentials employers can verify in seconds.",                         color: "#10B981" },
    { icon: Zap,         title: "Learn at Your Pace",  desc: "Self-paced, mobile-friendly. Your progress syncs across all devices.",           color: "#F59E0B" },
    { icon: Building2,   title: "Real Internships",    desc: "Land a virtual internship after course completion. Gain real work experience.",   color: C.secondary },
    { icon: BarChart2,   title: "Analytics Dashboard", desc: "Track quiz scores, project grades, lab time, and overall performance.",          color: "#A855F7" },
    { icon: Handshake,   title: "Job Assistance",      desc: "Resume review, mock interviews, and employer referrals — all in one place.",      color: "#F472B6" },
  ];
  return (
    <section className="py-16 px-6" style={{ background: C.bgPage }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: C.textPrimary }}>
          Why <span style={{ color: C.primary }}>OurShiksha</span>?
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: C.textSec }}>
          Built for the way modern learners actually learn.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {reasons.map((r) => (
            <div key={r.title}
              className="rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              style={{ background: C.cardBg, border: `1px solid ${C.borderLight}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${r.color}15` }}>
                <r.icon className="w-5 h-5" style={{ color: r.color }} />
              </div>
              <div className="text-sm font-bold" style={{ color: C.textPrimary }}>{r.title}</div>
              <p className="text-xs leading-relaxed" style={{ color: C.textSec }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const items = [
    { name: "Priya Sharma",  role: "Software Developer",  rating: 5, content: "Went from zero coding knowledge to landing a dev job in 8 months. The structured path and Usha AI kept me on track every single day." },
    { name: "Rahul Kumar",   role: "Data Analyst",        rating: 5, content: "The guided labs are the best part. Real datasets, real problems. Not toy exercises — actual work experience." },
    { name: "Ananya Reddy",  role: "Full Stack Developer",rating: 5, content: "My QR-coded certificate opened more doors than my college degree. Employers love that they can verify it instantly." },
  ];
  return (
    <section className="py-16 px-6" style={{ background: C.bgSection }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: C.textPrimary }}>
          Loved by <span style={{ color: C.primary }}>12,000+ Learners</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div key={i} className="rounded-2xl p-6 space-y-4 hover:-translate-y-1 transition-transform"
              style={{ background: i === 1 ? C.grad : C.cardBg, border: `1px solid ${i === 1 ? "transparent" : C.borderLight}` }}>
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: i === 1 ? C.highlight : "#F59E0B" }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: i === 1 ? "rgba(255,255,255,0.9)" : C.textSec }}>
                "{t.content}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: i === 1 ? "rgba(255,255,255,0.2)" : C.borderLight }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: i === 1 ? "rgba(255,255,255,0.25)" : C.grad }}>{t.name[0]}</div>
                <div>
                  <div className="text-xs font-bold" style={{ color: i === 1 ? C.white : C.textPrimary }}>{t.name}</div>
                  <div className="text-xs" style={{ color: i === 1 ? "rgba(255,255,255,0.6)" : C.textMuted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-6 text-center relative overflow-hidden" style={{ background: C.grad }}>
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: C.highlight }} />
      <div className="relative max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="font-['Space_Grotesk'] text-3xl md:text-4xl font-extrabold text-white">
          Start Your Journey Today
        </h2>
        <p className="text-white/80 text-base">
          Join 12,000+ learners. 500 free credits on signup. No card needed.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button className="px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform hover:scale-105"
            style={{ background: C.white, color: C.primary }}>
            Create Free Account
          </button>
          <button className="px-8 py-3 rounded-xl font-bold text-sm border-2 border-white/40 text-white hover:bg-white/10 transition-colors">
            Browse Courses →
          </button>
        </div>
        <div className="flex items-center justify-center gap-8 pt-2">
          {["Free to start", "Self-paced", "Verified certificates"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-white/80">
              <CheckCircle2 className="w-3.5 h-3.5" /> {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const links = {
    "Platform": ["Courses", "Labs", "Projects", "Certificates"],
    "Company":  ["About Us", "Blog", "Careers", "Press"],
    "Support":  ["Help Center", "Contact", "Privacy", "Terms"],
  };
  return (
    <footer className="py-12 px-6" style={{ background: "#0F0F1A" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b" style={{ borderColor: "#1E1E2E" }}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.grad }}>
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-['Space_Grotesk'] font-bold text-base text-white">
                Our<span style={{ color: C.lightBg }}>Shiksha</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
              AI-powered learning. Real skills. Verified credentials. Your career, accelerated.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: C.lightBg }}>{category}</div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs hover:text-white transition-colors" style={{ color: "#6B7280" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "#4B5563" }}>© 2025 OurShiksha. All rights reserved.</p>
          <p className="text-xs" style={{ color: "#4B5563" }}>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  );
}

export function BlueViolet() {
  return (
    <div className="min-h-screen font-['Inter']">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <JourneySection />
      <CoursesSection />
      <WhySection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
