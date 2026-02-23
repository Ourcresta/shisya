import { useState } from "react";
import { Link } from "wouter";
import {
  Check,
  X,
  Sparkles,
  Shield,
  Users,
  CreditCard,
  RefreshCw,
  Lock,
  BookOpen,
  Brain,
  Briefcase,
  Award,
  Headphones,
  FileText,
  ChevronDown,
  Zap,
  Crown,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const C = {
  bgDeep: "#050A18",
  bgPrimary: "#0B1D3A",
  bgSecondary: "#0F172A",
  cardBg: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  teal: "#00F5FF",
  tealDark: "#0EA5E9",
  purple: "#7C3AED",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
};

const plans = [
  {
    id: "free",
    name: "Free Explorer",
    subtitle: "Start your learning journey",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Access to free courses",
      "Basic AI Usha access (5/day)",
      "Basic certificates",
      "Community support",
      "Progress tracking",
    ],
    notIncluded: [
      "Premium courses",
      "Internship access",
      "Hiring priority",
      "Priority support",
    ],
    cta: "Get Started Free",
    href: "/signup",
    popular: false,
    tier: 0,
  },
  {
    id: "pro",
    name: "Pro Learner",
    subtitle: "For serious learners",
    monthlyPrice: 999,
    yearlyPrice: 799,
    features: [
      "All courses access",
      "Unlimited AI Usha access",
      "Internship eligibility",
      "Verified certificates",
      "Skill assessments",
      "Portfolio builder",
      "Email support",
    ],
    notIncluded: [
      "Hiring priority",
      "Resume review",
    ],
    cta: "Start Pro Plan",
    href: "/signup",
    popular: true,
    tier: 1,
  },
  {
    id: "elite",
    name: "Elite Career",
    subtitle: "Launch your career",
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    features: [
      "Everything in Pro",
      "Premium internships",
      "Direct hiring priority",
      "Resume & portfolio review",
      "Priority support",
      "Exclusive workshops",
      "Career mentorship",
    ],
    notIncluded: [],
    cta: "Go Elite",
    href: "/signup",
    popular: false,
    tier: 2,
  },
];

const comparisonFeatures = [
  { label: "Course Access", free: "Free only", pro: "All courses", elite: "All + Premium" },
  { label: "AI Mentor (Usha)", free: "5 queries/day", pro: "Unlimited", elite: "Unlimited + Priority" },
  { label: "Internship Access", free: false, pro: true, elite: "Premium" },
  { label: "Verified Certificates", free: "Basic", pro: true, elite: true },
  { label: "Skill Assessments", free: false, pro: true, elite: true },
  { label: "Hiring Support", free: false, pro: false, elite: true },
  { label: "Resume Review", free: false, pro: false, elite: true },
  { label: "Priority Support", free: false, pro: false, elite: true },
];

const trustItems = [
  { icon: Lock, title: "Secure Payments", description: "Stripe & Razorpay encrypted checkout" },
  { icon: RefreshCw, title: "7-Day Refund", description: "No questions asked refund policy" },
  { icon: Users, title: "10,000+ Learners", description: "Trusted by students across India" },
  { icon: Shield, title: "Data Privacy", description: "Your data is encrypted & protected" },
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel anytime from your account settings. You'll continue to have access until the end of your current billing period. No cancellation fees.",
  },
  {
    question: "Do I get a refund if I'm not satisfied?",
    answer: "Absolutely. We offer a 7-day no-questions-asked refund policy. If you're not satisfied within the first 7 days, contact us for a full refund.",
  },
  {
    question: "What payment methods are supported?",
    answer: "We accept UPI, credit/debit cards, net banking, and popular wallets like Google Pay and Paytm through our secure Razorpay integration. International cards via Stripe are also supported.",
  },
  {
    question: "Is internship placement guaranteed?",
    answer: "While we can't guarantee placement, Pro and Elite members get priority access to our internship network. Elite members additionally receive direct hiring priority from our partner companies.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll only pay the prorated difference. Downgrades take effect at the next billing cycle.",
  },
  {
    question: "Do I keep my certificates if I cancel?",
    answer: "Yes, all certificates you've earned are yours forever. They remain publicly verifiable even after cancellation.",
  },
];

function GlassCard({
  children,
  className = "",
  hover = true,
  style,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  return (
    <div
      className={`rounded-[20px] backdrop-blur-[20px] transition-all duration-300 ${
        hover ? "hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-8px_rgba(0,245,255,0.15)]" : ""
      } ${className}`}
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.2)";
      }}
      onMouseLeave={(e) => {
        if (hover) (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function SectionGlow({ position = "center", color = C.teal }: { position?: string; color?: string }) {
  const posStyles: Record<string, React.CSSProperties> = {
    center: { top: "50%", left: "50%", transform: "translate(-50%,-50%)" },
    "top-right": { top: "-10%", right: "-5%" },
    "bottom-left": { bottom: "-10%", left: "-5%" },
    "top-left": { top: "0", left: "10%" },
  };
  return (
    <div
      className="absolute w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.06] pointer-events-none"
      style={{ background: `radial-gradient(circle, ${color}, transparent)`, ...posStyles[position] }}
    />
  );
}

function BillingToggle({
  isYearly,
  onToggle,
}: {
  isYearly: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-16">
      <span
        className="text-sm font-medium transition-colors"
        style={{ color: !isYearly ? C.textPrimary : C.textSecondary }}
      >
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none"
        style={{
          background: isYearly
            ? `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`
            : "rgba(255,255,255,0.12)",
          border: `1px solid ${isYearly ? "rgba(0,245,255,0.4)" : "rgba(255,255,255,0.15)"}`,
          boxShadow: isYearly ? "0 0 20px rgba(0,245,255,0.2)" : "none",
        }}
        data-testid="toggle-billing"
      >
        <div
          className="absolute top-1 w-6 h-6 rounded-full transition-all duration-300"
          style={{
            left: isYearly ? "calc(100% - 28px)" : "4px",
            background: isYearly ? C.bgDeep : "rgba(255,255,255,0.8)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        />
      </button>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-medium transition-colors"
          style={{ color: isYearly ? C.textPrimary : C.textSecondary }}
        >
          Yearly
        </span>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: "rgba(245,158,11,0.15)",
            color: C.warning,
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          Save 20%
        </span>
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  isYearly,
  isLoggedIn,
}: {
  plan: (typeof plans)[0];
  isYearly: boolean;
  isLoggedIn: boolean;
}) {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const isFree = price === 0;
  const isPopular = plan.popular;

  return (
    <div
      className={`relative rounded-[20px] backdrop-blur-[20px] transition-all duration-300 flex flex-col h-full ${
        isPopular ? "lg:scale-105 z-10" : "hover:-translate-y-1.5"
      }`}
      style={{
        background: isPopular
          ? "rgba(0,245,255,0.04)"
          : C.cardBg,
        border: `1px solid ${
          isPopular ? "rgba(0,245,255,0.25)" : C.cardBorder
        }`,
        boxShadow: isPopular
          ? "0 8px 40px -8px rgba(0,245,255,0.15), 0 0 0 1px rgba(0,245,255,0.08)"
          : "none",
      }}
      onMouseEnter={(e) => {
        if (!isPopular) {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.2)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px -8px rgba(0,245,255,0.12)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isPopular) {
          (e.currentTarget as HTMLElement).style.borderColor = C.cardBorder;
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }
      }}
      data-testid={`card-plan-${plan.id}`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
              color: C.bgDeep,
              boxShadow: "0 4px 15px rgba(0,245,255,0.3)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Most Popular
          </span>
        </div>
      )}

      <div className="p-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: plan.tier === 0
              ? "rgba(255,255,255,0.06)"
              : plan.tier === 1
              ? "rgba(0,245,255,0.1)"
              : "rgba(124,58,237,0.12)",
            border: `1px solid ${
              plan.tier === 0
                ? "rgba(255,255,255,0.1)"
                : plan.tier === 1
                ? "rgba(0,245,255,0.25)"
                : "rgba(124,58,237,0.3)"
            }`,
          }}
        >
          {plan.tier === 0 && <GraduationCap className="w-7 h-7" style={{ color: C.textSecondary }} />}
          {plan.tier === 1 && <Zap className="w-7 h-7" style={{ color: C.teal }} />}
          {plan.tier === 2 && <Crown className="w-7 h-7" style={{ color: C.purple }} />}
        </div>

        <h3
          className="text-xl font-bold mb-1"
          style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
        >
          {plan.name}
        </h3>
        <p className="text-sm mb-6" style={{ color: C.textSecondary }}>
          {plan.subtitle}
        </p>

        <div className="mb-6">
          {isFree ? (
            <div>
              <span
                className="text-5xl font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: C.textPrimary,
                }}
              >
                Free
              </span>
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                Forever
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg" style={{ color: C.textSecondary }}>
                  ₹
                </span>
                <span
                  className="text-5xl font-bold tabular-nums"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: C.textPrimary,
                  }}
                >
                  {price}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                /month {isYearly && "· billed yearly"}
              </p>
              {isYearly && (
                <p className="text-xs mt-1" style={{ color: C.warning }}>
                  Save ₹{(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
                </p>
              )}
            </div>
          )}
        </div>

        <Link href={isLoggedIn ? "/shishya/wallet" : plan.href}>
          <button
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            style={
              isFree
                ? {
                    background: "transparent",
                    color: C.teal,
                    border: `1px solid rgba(0,245,255,0.3)`,
                  }
                : plan.tier === 2
                ? {
                    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                    color: C.bgDeep,
                    boxShadow: "0 4px 20px rgba(0,245,255,0.3)",
                    border: "none",
                  }
                : {
                    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                    color: C.bgDeep,
                    boxShadow: "0 4px 20px rgba(0,245,255,0.3)",
                    border: "none",
                  }
            }
            data-testid={`button-plan-${plan.id}`}
          >
            {plan.cta}
          </button>
        </Link>
      </div>

      <div className="px-8 pb-8 flex-1" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
        <p className="text-xs font-semibold uppercase tracking-wider mt-6 mb-4" style={{ color: C.textSecondary }}>
          What's included
        </p>
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />
              <span style={{ color: C.textPrimary }}>{feature}</span>
            </li>
          ))}
          {plan.notIncluded.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "rgba(255,255,255,0.15)" }} />
              <span style={{ color: "rgba(255,255,255,0.25)" }}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: C.textSecondary }}>
              Feature
            </th>
            {["Free Explorer", "Pro Learner", "Elite Career"].map((name, i) => (
              <th
                key={name}
                className="text-center py-4 px-6 text-sm font-semibold"
                style={{
                  color: i === 1 ? C.teal : C.textPrimary,
                  fontFamily: "var(--font-display)",
                }}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((row, index) => (
            <tr
              key={row.label}
              style={{
                borderTop: `1px solid ${C.cardBorder}`,
                background: index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
              }}
            >
              <td className="py-4 px-6 text-sm" style={{ color: C.textPrimary }}>
                {row.label}
              </td>
              {[row.free, row.pro, row.elite].map((val, i) => (
                <td key={i} className="text-center py-4 px-6 text-sm">
                  {val === true ? (
                    <Check className="w-5 h-5 mx-auto" style={{ color: C.teal }} />
                  ) : val === false ? (
                    <X className="w-5 h-5 mx-auto" style={{ color: "rgba(255,255,255,0.12)" }} />
                  ) : (
                    <span style={{ color: C.textSecondary }}>{val}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${C.bgDeep} 0%, ${C.bgPrimary} 30%, ${C.bgSecondary} 100%)`,
        color: C.textPrimary,
      }}
    >
      <LandingNavbar />

      <section className="relative overflow-hidden pt-16 pb-8 md:pt-24 md:pb-12">
        <SectionGlow position="top-right" color={C.teal} />
        <SectionGlow position="bottom-left" color={C.purple} />

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(0,245,255,0.06)",
              border: "1px solid rgba(0,245,255,0.15)",
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: C.teal }} />
            <span className="text-sm font-medium" style={{ color: C.teal }}>
              Flexible plans for every learner
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{
              fontFamily: "var(--font-display)",
              background: `linear-gradient(135deg, ${C.textPrimary} 30%, ${C.teal} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              lineHeight: "1.15",
            }}
            data-testid="text-pricing-headline"
          >
            Choose Your Learning Power
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-4"
            style={{ color: C.textSecondary, lineHeight: "1.7" }}
            data-testid="text-pricing-subtitle"
          >
            Flexible plans built for serious learners and future professionals.
            Start free, upgrade when you're ready.
          </p>
        </div>
      </section>

      <section className="relative z-10 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <BillingToggle
            isYearly={isYearly}
            onToggle={() => setIsYearly(!isYearly)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={isYearly}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-24 overflow-hidden">
        <SectionGlow position="center" color={C.teal} />

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              data-testid="text-comparison-title"
            >
              Compare Plans
            </h2>
            <p style={{ color: C.textSecondary }} className="max-w-xl mx-auto">
              See exactly what's included in each plan
            </p>
          </div>

          <GlassCard hover={false} className="overflow-hidden">
            <ComparisonTable />
          </GlassCard>
        </div>
      </section>

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              data-testid="text-trust-title"
            >
              Your Trust, Our Priority
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <GlassCard key={item.title} className="p-6 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "rgba(0,245,255,0.08)",
                    border: "1px solid rgba(0,245,255,0.15)",
                  }}
                >
                  <item.icon className="w-6 h-6" style={{ color: C.teal }} />
                </div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: C.textPrimary, fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  {item.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              data-testid="text-faq-title"
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: C.textSecondary }}>
              Everything you need to know before subscribing
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-[16px] px-6 backdrop-blur-[20px] border-0"
                style={{
                  background: C.cardBg,
                  border: `1px solid ${C.cardBorder}`,
                }}
                data-testid={`faq-question-${index}`}
              >
                <AccordionTrigger
                  className="hover:no-underline text-left py-5"
                  style={{ color: C.textPrimary }}
                >
                  <span className="font-medium text-[15px]">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent
                  className="pb-5 text-[14px] leading-relaxed"
                  style={{ color: C.textSecondary }}
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="relative py-16 md:py-20 overflow-hidden">
        <SectionGlow position="center" color={C.teal} />

        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <GlassCard
            hover={false}
            className="p-10 md:p-14"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.04), rgba(124,58,237,0.03))",
              border: "1px solid rgba(0,245,255,0.12)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                boxShadow: "0 0 30px rgba(0,245,255,0.25)",
              }}
            >
              <GraduationCap className="w-8 h-8" style={{ color: C.bgDeep }} />
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: C.textPrimary,
              }}
              data-testid="text-cta-title"
            >
              Start Your Learning Journey Today
            </h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: C.textSecondary }}>
              Join thousands of students mastering skills, earning certificates, and building careers with OurShiksha.
            </p>
            <Link href="/signup">
              <button
                className="px-10 py-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] inline-flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                  color: C.bgDeep,
                  boxShadow: "0 4px 20px rgba(0,245,255,0.3)",
                }}
                data-testid="button-final-cta"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </GlassCard>
        </div>
      </section>

      <footer className="relative z-10 py-6 mt-auto" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm" style={{ color: C.textSecondary }}>
          <p>Invest in your future. Start learning today.</p>
        </div>
      </footer>
    </div>
  );
}
