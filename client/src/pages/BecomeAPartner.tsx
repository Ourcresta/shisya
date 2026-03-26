import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap,
  Globe,
  Cpu,
  DollarSign,
  Wrench,
  BookOpen,
  School,
  Building2,
  Briefcase,
  Users,
  Video,
  MonitorPlay,
  Code2,
  ClipboardCheck,
  Brain,
  Award,
  Radio,
  Rocket,
  FileText,
  Send,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Subtitles,
  Mic,
  BarChart3,
  Sparkles,
  Shield,
  CreditCard,
  LineChart,
  BadgeCheck,
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const partnerFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  country: z.string().optional(),
  partnerType: z.enum(["Educator", "Institution", "Industry Expert", "Affiliate"], {
    required_error: "Please select a partner type",
  }),
  expertise: z.string().optional(),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  proposal: z.string().optional(),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

const C = {
  bgPrimary: "#F8F7FF",
  bgSecondary: "#EDE9FF",
  cardBg: "#FFFFFF",
  cardBorder: "#EDE9FF",
  teal: "#6367FF",
  purple: "#8494FF",
  textPrimary: "#1E1B4B",
  textSecondary: "#6B7280",
  heroGrad: "linear-gradient(135deg, #6367FF 0%, #8494FF 60%, #C9BEFF 100%)",
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const whyPartnerData = [
  { icon: Globe, title: "Reach Global Students", desc: "Your courses can reach thousands of learners worldwide." },
  { icon: Cpu, title: "AI Powered Platform", desc: "AI tutors, automated evaluation, and personalized learning paths." },
  { icon: DollarSign, title: "Earn Revenue", desc: "Course sales, revenue sharing, and affiliate earnings." },
  { icon: Wrench, title: "Zero Technical Work", desc: "We handle hosting, video streaming, AI tutors, certificates & student management." },
];

const partnerTypes = [
  {
    icon: BookOpen,
    title: "Educator Partner",
    color: C.teal,
    bestFor: ["Teachers", "Subject Experts", "Professionals"],
    canDo: ["Create video courses", "Create project labs", "Create quizzes", "Host live classes"],
    revenue: "70% Instructor – 30% Platform",
  },
  {
    icon: Building2,
    title: "Institution Partner",
    color: C.purple,
    bestFor: ["Universities", "Colleges", "Coaching Institutes", "Training Centers"],
    canDo: ["Create branded academy", "Publish multiple courses", "Bulk student enrollment", "Certification programs"],
    revenue: "Custom partnership plans",
  },
  {
    icon: Briefcase,
    title: "Industry Expert Partner",
    color: "#10B981",
    bestFor: ["Software Engineers", "Data Scientists", "Designers", "Product Managers", "Entrepreneurs"],
    canDo: ["Career courses", "Industry masterclasses", "Project based learning", "Mentorship programs"],
    revenue: "Custom / program-based",
  },
  {
    icon: Users,
    title: "Affiliate Partner",
    color: "#F59E0B",
    bestFor: ["YouTubers", "Bloggers", "Influencers", "Education Communities"],
    canDo: ["Refer students and earn commissions"],
    revenue: "Up to 20% per course sale",
  },
];

const createItems = [
  { icon: Video, label: "Video Courses" },
  { icon: MonitorPlay, label: "Interactive Lessons" },
  { icon: Code2, label: "Coding Labs" },
  { icon: ClipboardCheck, label: "Quizzes & Exams" },
  { icon: Brain, label: "AI Assisted Learning" },
  { icon: Award, label: "Certification Programs" },
  { icon: Radio, label: "Live Classes" },
  { icon: Rocket, label: "Bootcamps" },
];

const aiFeatures = [
  { icon: MessageSquare, label: "AI Tutor for student doubt solving" },
  { icon: Subtitles, label: "Auto subtitle generation" },
  { icon: Mic, label: "AI voice dubbing" },
  { icon: ClipboardCheck, label: "Auto exam grading" },
  { icon: Sparkles, label: "AI course generation" },
  { icon: BarChart3, label: "Smart learning analytics" },
];

const steps = [
  { num: 1, title: "Apply", desc: "Apply to become a partner" },
  { num: 2, title: "Review", desc: "Our team reviews your profile" },
  { num: 3, title: "Create", desc: "Create and publish courses" },
  { num: 4, title: "Earn", desc: "Start earning revenue" },
];

const benefits = [
  { icon: Globe, label: "Global exposure" },
  { icon: Cpu, label: "AI powered content tools" },
  { icon: Shield, label: "Secure payment system" },
  { icon: LineChart, label: "Student analytics dashboard" },
  { icon: CreditCard, label: "Course monetization" },
  { icon: BadgeCheck, label: "Certification support" },
];

const faqs = [
  { q: "Who can become a partner?", a: "Anyone with valuable knowledge or educational content — teachers, institutions, industry professionals, or content creators." },
  { q: "Is there any joining fee?", a: "No. Joining Our Shiksha as a partner is completely free." },
  { q: "How do I earn money?", a: "Through course sales, revenue sharing, or affiliate commissions depending on your partnership type." },
  { q: "Who owns the content?", a: "Partners retain full ownership of their content. You create it, you own it." },
];

function scrollToApply() {
  document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm"
              style={{ background: `linear-gradient(135deg, ${C.teal}, #06B6D4)` }}>
              <GraduationCap className="w-4 h-4" style={{ color: C.bgPrimary }} />
            </div>
            <span className="font-semibold" style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>OurShiksha</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: C.textSecondary }}>
            {[
              { href: "/", label: "Home" }, { href: "/about", label: "About" },
              { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-gray-900"
                style={{ color: C.textSecondary }}>{l.label}</Link>
            ))}
          </nav>
          <p className="text-sm" style={{ color: C.textSecondary }}>OurShiksha {currentYear}</p>
        </div>
      </div>
    </footer>
  );
}

function PartnerForm() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", country: "", partnerType: undefined,
      expertise: "", linkedin: "", proposal: "",
    },
  });

  const onSubmit = async (data: PartnerFormData) => {
    setSubmitting(true);
    try {
      const message = [
        `Partner Type: ${data.partnerType}`,
        `Phone: ${data.phone || "N/A"}`,
        `Country: ${data.country || "N/A"}`,
        `Experience: ${data.expertise || "N/A"}`,
        `LinkedIn: ${data.linkedin || "N/A"}`,
        `Proposal: ${data.proposal || "N/A"}`,
      ].join("\n");
      await apiRequest("POST", "/api/contact", {
        name: data.fullName, email: data.email,
        subject: `Partner Application - ${data.partnerType}`, message,
      });
      toast({ title: "Application Submitted!", description: "We'll review your application and get back to you soon." });
      reset();
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(99,103,255,0.06)", border: `1px solid ${C.cardBorder}`,
    color: C.textPrimary, borderRadius: "8px", padding: "0.65rem 0.85rem",
    fontSize: "0.9rem", width: "100%", outline: "none",
  };
  const errorInputStyle: React.CSSProperties = { ...inputStyle, borderColor: "#EF4444" };
  const labelStyle: React.CSSProperties = { color: C.textSecondary, fontSize: "0.82rem", fontWeight: 500, marginBottom: "0.35rem", display: "block" };
  const errorStyle: React.CSSProperties = { color: "#EF4444", fontSize: "0.75rem", marginTop: "0.25rem" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="form-partner-apply">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input style={errors.fullName ? errorInputStyle : inputStyle} {...register("fullName")}
            placeholder="Your full name" data-testid="input-fullname" />
          {errors.fullName && <p style={errorStyle}>{errors.fullName.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" style={errors.email ? errorInputStyle : inputStyle} {...register("email")}
            placeholder="you@example.com" data-testid="input-email" />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input type="tel" style={inputStyle} {...register("phone")}
            placeholder="+91 98765 43210" data-testid="input-phone" />
        </div>
        <div>
          <label style={labelStyle}>Country</label>
          <input style={inputStyle} {...register("country")}
            placeholder="India" data-testid="input-country" />
        </div>
        <div className="md:col-span-2">
          <label style={labelStyle}>Partner Type *</label>
          <select style={errors.partnerType ? { ...errorInputStyle, appearance: "none" as const } : { ...inputStyle, appearance: "none" as const }}
            {...register("partnerType")} data-testid="select-partner-type">
            <option value="" style={{ background: C.bgSecondary }}>Select partner type</option>
            <option value="Educator" style={{ background: C.bgSecondary }}>Educator</option>
            <option value="Institution" style={{ background: C.bgSecondary }}>Institution</option>
            <option value="Industry Expert" style={{ background: C.bgSecondary }}>Industry Expert</option>
            <option value="Affiliate" style={{ background: C.bgSecondary }}>Affiliate</option>
          </select>
          {errors.partnerType && <p style={errorStyle}>{errors.partnerType.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label style={labelStyle}>Experience / Expertise</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const }} {...register("expertise")}
            placeholder="Describe your teaching or industry experience" data-testid="input-expertise" />
        </div>
        <div>
          <label style={labelStyle}>LinkedIn Profile</label>
          <input type="url" style={errors.linkedin ? errorInputStyle : inputStyle} {...register("linkedin")}
            placeholder="https://linkedin.com/in/yourprofile" data-testid="input-linkedin" />
          {errors.linkedin && <p style={errorStyle}>{errors.linkedin.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Course Idea / Proposal</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const }} {...register("proposal")}
            placeholder="Brief idea of what you'd like to teach" data-testid="input-proposal" />
        </div>
      </div>
      <button type="submit" disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all"
        style={{
          background: `linear-gradient(135deg, ${C.purple}, ${C.teal})`,
          color: "#fff", border: "none", opacity: submitting ? 0.7 : 1,
        }}
        data-testid="button-submit-application">
        <Send className="w-4 h-4" />
        {submitting ? "Submitting..." : "Apply to Become Partner"}
      </button>
    </form>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3" data-testid="faq-section">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
          <button className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
            style={{ color: C.textPrimary }}
            onClick={() => setOpen(open === i ? null : i)}
            data-testid={`button-faq-${i}`}>
            <span className="font-medium text-sm">{faq.q}</span>
            <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{
              color: C.teal, transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
            }} />
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm" style={{ color: C.textSecondary }} data-testid={`text-faq-answer-${i}`}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function BecomeAPartner() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bgPrimary }}>
      <LandingNavbar />

      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,103,255,0.15), transparent 70%),
                       radial-gradient(ellipse 40% 40% at 80% 20%, rgba(132,148,255,0.10), transparent 60%)`,
        }} />
        <motion.div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
            data-testid="text-hero-heading">
            Become an{" "}
            <span style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Our Shiksha
            </span>{" "}
            Partner
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: C.textSecondary }}
            data-testid="text-hero-subtext">
            Share your knowledge with millions of learners and build a powerful digital education brand with AI-powered learning.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={scrollToApply} className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${C.teal}, #06B6D4)`, color: C.bgPrimary }}
              data-testid="button-cta-educator">Become an Educator</button>
            <button onClick={scrollToApply} className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${C.purple}, #9333EA)`, color: "#fff" }}
              data-testid="button-cta-institution">Partner as an Institution</button>
            <button onClick={scrollToApply} className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: C.cardBg, color: C.teal, border: `1px solid rgba(99,103,255,0.30)` }}
              data-testid="button-cta-affiliate">Become an Affiliate</button>
          </div>
        </motion.div>
      </section>

      <motion.section className="py-16 md:py-20" style={{ background: C.bgSecondary }}
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }} data-testid="text-why-heading">
            Why Partner With Our Shiksha
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: C.textSecondary }}>
            Everything you need to create, publish, and monetize educational content.
          </p>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {whyPartnerData.map((item, i) => (
              <motion.div key={i} variants={staggerItem} className="rounded-xl p-6 text-center transition-all hover:scale-[1.03]"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                data-testid={`card-why-${i}`}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(99,103,255,0.12)" }}>
                  <item.icon className="w-6 h-6" style={{ color: C.teal }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: C.textPrimary }}>{item.title}</h3>
                <p className="text-sm" style={{ color: C.textSecondary }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="py-16 md:py-20"
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }} data-testid="text-types-heading">
            Partnership Types
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: C.textSecondary }}>
            Choose the model that fits you best.
          </p>
          <motion.div className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {partnerTypes.map((p, i) => (
              <motion.div key={i} variants={staggerItem} className="rounded-xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                data-testid={`card-type-${i}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${p.color}15` }}>
                    <p.icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: C.textPrimary }}>{p.title}</h3>
                </div>
                <div className="mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.teal }}>Best for</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {p.bestFor.map((b) => (
                      <span key={b} className="px-2.5 py-0.5 rounded-full text-xs"
                        style={{ background: "rgba(255,255,255,0.06)", color: C.textSecondary }}>{b}</span>
                    ))}
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {p.canDo.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#10B981" }} />
                      {c}
                    </li>
                  ))}
                </ul>
                {p.revenue && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${p.color}15`, color: p.color }}>
                    <DollarSign className="w-3 h-3" /> {p.revenue}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="py-16 md:py-20" style={{ background: C.bgSecondary }}
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }} data-testid="text-create-heading">
            What You Can Create
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: C.textSecondary }}>
            A complete suite of tools to deliver world-class education.
          </p>
          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {createItems.map((item, i) => (
              <motion.div key={i} variants={staggerItem}
                className="rounded-xl p-5 text-center transition-all hover:scale-[1.05]"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                data-testid={`card-create-${i}`}>
                <item.icon className="w-7 h-7 mx-auto mb-3" style={{ color: C.teal }} />
                <span className="text-sm font-medium" style={{ color: C.textPrimary }}>{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="py-16 md:py-20"
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }} data-testid="text-ai-heading">
            AI Powered Learning Features
          </h2>
          <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: C.textSecondary }}>
            Advanced AI tools that make your content smarter and more engaging.
          </p>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {aiFeatures.map((f, i) => (
              <motion.div key={i} variants={staggerItem}
                className="rounded-xl p-5 flex items-center gap-4 transition-all hover:scale-[1.03]"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                data-testid={`card-ai-${i}`}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(132,148,255,0.15)" }}>
                  <f.icon className="w-5 h-5" style={{ color: C.purple }} />
                </div>
                <span className="text-sm font-medium" style={{ color: C.textPrimary }}>{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="py-16 md:py-20" style={{ background: C.bgSecondary }}
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }} data-testid="text-steps-heading">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} className="text-center relative"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                data-testid={`card-step-${i}`}>
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                    color: "#fff",
                  }}>
                  {s.num}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: C.textPrimary }}>{s.title}</h3>
                <p className="text-sm" style={{ color: C.textSecondary }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px"
                    style={{ background: `linear-gradient(90deg, ${C.teal}40, ${C.purple}40)` }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="py-16 md:py-20"
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }} data-testid="text-benefits-heading">
            Partner Benefits
          </h2>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {benefits.map((b, i) => (
              <motion.div key={i} variants={staggerItem}
                className="rounded-xl px-5 py-4 flex items-center gap-3"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                data-testid={`card-benefit-${i}`}>
                <b.icon className="w-5 h-5 flex-shrink-0" style={{ color: "#10B981" }} />
                <span className="text-sm font-medium" style={{ color: C.textPrimary }}>{b.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <section id="apply" className="py-16 md:py-20" style={{ background: C.bgSecondary }}>
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
                data-testid="text-form-heading">
                Partner Application
              </h2>
              <p style={{ color: C.textSecondary }}>Fill in the form below to get started.</p>
            </div>
            <div className="rounded-2xl p-6 md:p-8"
              style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}>
              <PartnerForm />
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section className="py-16 md:py-20"
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
            data-testid="text-faq-heading">
            Frequently Asked Questions
          </h2>
          <FaqAccordion />
        </div>
      </motion.section>

      <section className="py-16 md:py-20" style={{ background: C.bgSecondary }}>
        <motion.div className="max-w-3xl mx-auto px-4 md:px-8 text-center"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
            data-testid="text-footer-cta-heading">
            Ready to share your knowledge with the world?
          </h2>
          <p className="text-lg mb-8" style={{ color: C.textSecondary }}>
            Become an Our Shiksha Partner Today.
          </p>
          <button onClick={scrollToApply}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`, color: "#fff" }}
            data-testid="button-footer-apply">
            <Sparkles className="w-5 h-5" />
            Apply Now
          </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
