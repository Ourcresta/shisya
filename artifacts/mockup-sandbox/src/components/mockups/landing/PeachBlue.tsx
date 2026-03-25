import { useState, useEffect, useRef } from "react";
import {
  GraduationCap, BookOpen, FlaskConical, FolderKanban, ClipboardCheck,
  Award, Briefcase, ArrowRight, ChevronRight, Globe, Sparkles, MessageCircle,
  Star, Quote, Building2, Handshake, CheckCircle2, Zap, Trophy,
  Menu, X, ChevronDown, Play,
} from "lucide-react";

const P = {
  peach:    "#F97316",
  peachLight:"#FFF1E8",
  peachMid: "#FED7AA",
  blue:     "#2563EB",
  blueLight:"#EFF6FF",
  blueMid:  "#BFDBFE",
  bg:       "#FFFBF8",
  bgAlt:    "#FFF5EE",
  cardBg:   "#FFFFFF",
  cardBorder:"#FED7AA",
  cardBorderBlue:"#BFDBFE",
  text:     "#1E293B",
  textSec:  "#64748B",
  textMuted:"#94A3B8",
  success:  "#10B981",
  nav:      "#FFFFFF",
};

const journeySteps = [
  { icon: BookOpen,      label: "Learn",    color: P.blue },
  { icon: FlaskConical,  label: "Practice", color: P.peach },
  { icon: FolderKanban,  label: "Build",    color: P.blue },
  { icon: ClipboardCheck,label: "Validate", color: P.peach },
  { icon: Award,         label: "Prove",    color: P.blue },
];

const features = [
  { icon: BookOpen,       title: "Structured Courses",     desc: "Clear learning paths",              color: P.blue },
  { icon: FlaskConical,   title: "Guided Labs",            desc: "Hands-on practice",                 color: P.peach },
  { icon: FolderKanban,   title: "Real Projects",          desc: "Build your portfolio",              color: P.blue },
  { icon: ClipboardCheck, title: "Skill Assessments",      desc: "Validate your knowledge",           color: P.peach },
  { icon: Award,          title: "Verified Certificates",  desc: "Prove your skills",                 color: P.blue },
  { icon: Briefcase,      title: "Career Portfolio",       desc: "Showcase your work",                color: P.peach },
  { icon: Building2,      title: "Guaranteed Internship",  desc: "Real-world experience",             color: P.blue },
  { icon: Handshake,      title: "Job Assistance",         desc: "Placement support & referrals",     color: P.peach },
];

const aiFeatures = [
  { icon: Sparkles,       title: "Usha AI Tutor",          desc: "Your personal learning companion",  color: P.peach },
  { icon: Globe,          title: "Multi-Language",         desc: "English, Hindi, Tamil and more",    color: P.blue },
  { icon: MessageCircle,  title: "Smart Hints",            desc: "Guidance without spoiling answers", color: P.peach },
  { icon: Award,          title: "24/7 Support",           desc: "Ask doubts anytime",                color: P.blue },
];

const testimonials = [
  { name: "Priya Sharma",  role: "Software Developer",  rating: 5, content: "Transitioned from non-tech to landing my first dev job — OurShiksha's structured courses made all the difference." },
  { name: "Rahul Kumar",   role: "Data Analyst",        rating: 5, content: "The guided labs gave me real, applicable experience. Exactly what I needed to break into data analytics." },
  { name: "Ananya Reddy",  role: "Full Stack Developer",rating: 5, content: "Verified certificates that employers trust instantly. My credential QR code has opened more doors than my degree." },
];

const faqItems = [
  { q: "What is OurShiksha?",              a: "A skill-learning platform offering structured courses, hands-on labs, real projects, and verified certificates to help you grow your career." },
  { q: "How do learning credits work?",    a: "Sign up and receive 500 free credits instantly. Use them to enroll in paid courses — some courses are completely free." },
  { q: "Are certificates industry-recognized?", a: "Yes. Each certificate has a unique QR code that lets employers instantly verify your credentials on our public verification page." },
  { q: "Can I learn at my own pace?",      a: "Yes — all courses are fully self-paced. Your progress is saved automatically so you can pick up exactly where you left off." },
  { q: "What is Usha AI Tutor?",           a: "Usha is an AI assistant built into every lesson, lab, and project. She guides you with smart hints instead of direct answers." },
];

const stats = [
  { value: "12,000+", label: "Active Students" },
  { value: "150+",    label: "Courses" },
  { value: "95%",     label: "Completion Rate" },
  { value: "3.2x",    label: "Avg Salary Bump" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav style={{ background: P.nav, borderBottom: `1px solid ${P.peachMid}` }}
      className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${P.peach}, ${P.blue})` }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-lg" style={{ color: P.text }}>
            Our<span style={{ color: P.peach }}>Shiksha</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: P.textSec }}>
          {["Courses", "AI Tutor", "Certifications", "Internship"].map((item) => (
            <a key={item} href="#" className="hover:opacity-80 transition-opacity" style={{ color: P.textSec }}>
              {item}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors"
            style={{ borderColor: P.peach, color: P.peach, background: "transparent" }}>
            Log In
          </button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${P.peach}, ${P.blue})` }}>
            Get Started Free
          </button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: P.text }}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-5 pb-4 space-y-2 border-t" style={{ borderColor: P.peachMid, background: P.nav }}>
          {["Courses", "AI Tutor", "Certifications", "Internship"].map((item) => (
            <a key={item} href="#" className="block py-2 text-sm font-medium" style={{ color: P.textSec }}>{item}</a>
          ))}
          <button className="w-full mt-2 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${P.peach}, ${P.blue})` }}>
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const headlines = ["Learn. Build. Prove.", "Get Matched. Work. Prove.", "Upskill. Certify. Shine."];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % headlines.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ background: `linear-gradient(160deg, ${P.bg} 0%, ${P.bgAlt} 60%, ${P.peachLight} 100%)` }}
      className="relative overflow-hidden py-20 px-5">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: P.peach }} />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{ background: P.blue }} />
      <div className="relative max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: P.peachLight, border: `1px solid ${P.peachMid}`, color: P.peach }}>
          <Sparkles className="w-3.5 h-3.5" />
          India's #1 Skills Learning Platform
        </div>
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl font-extrabold leading-tight" style={{ color: P.text }}>
          <span key={idx} style={{ color: P.peach }} className="block">
            {headlines[idx]}
          </span>
          <span className="block text-2xl md:text-3xl mt-2 font-bold" style={{ color: P.textSec }}>
            Certified by OurShiksha.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-lg" style={{ color: P.textSec }}>
          Master in-demand skills through structured courses, guided labs, real projects,
          and an AI tutor that never sleeps. Get a verified certificate — and land your next opportunity.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition-opacity text-sm md:text-base"
            style={{ background: `linear-gradient(135deg, ${P.peach} 0%, #EA580C 100%)` }}>
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold border-2 hover:opacity-80 transition-opacity text-sm md:text-base"
            style={{ borderColor: P.blue, color: P.blue, background: P.blueLight }}>
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl p-4 shadow-sm"
              style={{ background: P.cardBg, border: `1px solid ${P.cardBorder}` }}>
              <div className="text-2xl font-extrabold font-['Space_Grotesk']" style={{ color: P.peach }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: P.textSec }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="py-16 px-5" style={{ background: P.cardBg }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: P.text }}>
          Your Learning <span style={{ color: P.peach }}>Journey</span>
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0">
          {journeySteps.map((step, i) => (
            <div key={step.label} className="flex flex-col md:flex-row items-center">
              <div className="flex flex-col items-center gap-2 px-4 py-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow"
                  style={{ background: step.color === P.peach ? P.peachLight : P.blueLight, border: `2px solid ${step.color}` }}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: P.text }}>{step.label}</span>
              </div>
              {i < journeySteps.length - 1 && (
                <ChevronRight className="w-5 h-5 hidden md:block shrink-0" style={{ color: P.textMuted }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 px-5" style={{ background: P.bg }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: P.text }}>
          Everything You Need to <span style={{ color: P.blue }}>Succeed</span>
        </h2>
        <p className="text-center text-sm mb-10" style={{ color: P.textSec }}>
          One platform. Every tool you need from first lesson to first job.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
              style={{ background: P.cardBg, border: `1px solid ${f.color === P.peach ? P.cardBorder : P.cardBorderBlue}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: f.color === P.peach ? P.peachLight : P.blueLight }}>
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: P.text }}>{f.title}</div>
                <div className="text-xs mt-0.5" style={{ color: P.textSec }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="py-16 px-5" style={{ background: `linear-gradient(135deg, ${P.peachLight} 0%, ${P.blueLight} 100%)` }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: P.peachMid, color: P.peach }}>
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Learning
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold" style={{ color: P.text }}>
              Meet <span style={{ color: P.peach }}>Usha</span>, Your<br />AI Learning Companion
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: P.textSec }}>
              Usha is embedded into every lesson, lab, and project. She answers your doubts
              with contextual hints — not giveaways — ensuring you truly learn.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: P.cardBg, border: `1px solid ${f.color === P.peach ? P.cardBorder : P.cardBorderBlue}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: f.color === P.peach ? P.peachLight : P.blueLight }}>
                    <f.icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: P.text }}>{f.title}</div>
                    <div className="text-xs" style={{ color: P.textSec }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-3xl"
                style={{ background: `linear-gradient(135deg, ${P.peachLight}, ${P.blueLight})`, border: `2px solid ${P.peachMid}` }} />
              <div className="absolute inset-4 rounded-2xl overflow-hidden flex flex-col"
                style={{ background: P.cardBg, border: `1px solid ${P.cardBorder}` }}>
                <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: P.peachMid }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${P.peach}, ${P.blue})` }}>U</div>
                  <span className="text-xs font-semibold" style={{ color: P.text }}>Usha AI</span>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-hidden">
                  {[
                    { from: "user", msg: "I'm stuck on async functions" },
                    { from: "usha", msg: "Think of async as a promise to do something later. What happens if you await it?" },
                    { from: "user", msg: "It waits for the result?" },
                    { from: "usha", msg: "Exactly! Now try applying that in line 12 of your lab 🎯" },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%] px-3 py-1.5 rounded-xl text-xs leading-snug"
                        style={m.from === "user"
                          ? { background: P.peachLight, color: P.text, border: `1px solid ${P.peachMid}` }
                          : { background: P.blueLight, color: P.text, border: `1px solid ${P.blueMid}` }}>
                        {m.msg}
                      </div>
                    </div>
                  ))}
                </div>
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
    <section className="py-16 px-5" style={{ background: P.cardBg }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: P.text }}>
          What Our <span style={{ color: P.peach }}>Learners</span> Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl p-6 space-y-4 shadow-sm"
              style={{ background: i % 2 === 0 ? P.peachLight : P.blueLight, border: `1px solid ${i % 2 === 0 ? P.cardBorder : P.cardBorderBlue}` }}>
              <Quote className="w-6 h-6 opacity-40" style={{ color: i % 2 === 0 ? P.peach : P.blue }} />
              <p className="text-sm leading-relaxed" style={{ color: P.text }}>{t.content}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: P.peach }} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${P.peach}, ${P.blue})` }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: P.text }}>{t.name}</div>
                  <div className="text-xs" style={{ color: P.textSec }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 px-5" style={{ background: P.bg }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: P.text }}>
          Frequently Asked <span style={{ color: P.blue }}>Questions</span>
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: P.cardBg, border: `1px solid ${open === i ? P.peach : P.cardBorder}` }}>
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold" style={{ color: P.text }}>{item.q}</span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform"
                  style={{ color: P.peach, transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm" style={{ color: P.textSec }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-5 text-center"
      style={{ background: `linear-gradient(135deg, ${P.peach} 0%, ${P.blue} 100%)` }}>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-white/20">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-4xl font-extrabold text-white">
          Ready to Level Up Your Career?
        </h2>
        <p className="text-white/80 text-sm md:text-base">
          Join 12,000+ learners. Start free — no credit card needed.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button className="px-8 py-3 rounded-xl font-bold text-sm md:text-base shadow-lg transition-opacity hover:opacity-90"
            style={{ background: P.cardBg, color: P.peach }}>
            Get Started Free
          </button>
          <button className="px-8 py-3 rounded-xl font-bold text-sm md:text-base border-2 border-white/50 text-white hover:bg-white/10 transition-colors">
            Browse Courses →
          </button>
        </div>
        <div className="flex items-center justify-center gap-6 pt-2">
          {["500 Free Credits", "Self-Paced Learning", "Verified Certificates"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-white/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 px-5" style={{ background: P.text }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${P.peach}, ${P.blue})` }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-['Space_Grotesk'] font-bold text-base text-white">
            Our<span style={{ color: P.peach }}>Shiksha</span>
          </span>
        </div>
        <p className="text-xs" style={{ color: P.textMuted }}>
          © 2025 OurShiksha. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs" style={{ color: P.textMuted }}>
          {["Privacy", "Terms", "Contact"].map((item) => (
            <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function PeachBlue() {
  return (
    <div className="min-h-screen font-['Inter']" style={{ background: P.bg }}>
      <Navbar />
      <HeroSection />
      <JourneySection />
      <FeaturesSection />
      <AISection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
