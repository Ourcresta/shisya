import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
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
  Gift,
  Star,
  Coins,
  DollarSign,
  Building2,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

const ICON_MAP: Record<string, LucideIcon> = {
  Gift, Zap, Crown, Building2, Star, Coins, CreditCard, DollarSign, GraduationCap, BookOpen,
};

interface DBPlan {
  id: number;
  name: string;
  subtitle: string | null;
  price: string;
  period: string | null;
  coins: string | null;
  coinsLabel: string | null;
  iconName: string;
  features: string[];
  notIncluded: string[];
  cta: string;
  href: string;
  buttonVariant: string;
  popular: boolean;
  orderIndex: number;
  isActive: boolean;
}

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

const fallbackPlans: DBPlan[] = [
  {
    id: 1,
    name: "Free Explorer",
    subtitle: "Start your learning journey",
    price: "₹0",
    period: null,
    coins: "500",
    coinsLabel: "one-time",
    iconName: "Gift",
    features: ["Access to free courses", "Basic AI Usha access (5/day)", "Basic certificates", "Community support", "Progress tracking"],
    notIncluded: ["Premium courses", "Internship access", "Hiring priority", "Priority support"],
    cta: "Get Started Free",
    href: "/signup",
    buttonVariant: "outline",
    popular: false,
    orderIndex: 0,
    isActive: true,
  },
  {
    id: 2,
    name: "Pro Learner",
    subtitle: "For serious learners",
    price: "₹499",
    period: "/ month",
    coins: "6,000",
    coinsLabel: "per month",
    iconName: "Crown",
    features: ["All courses access", "Unlimited AI Usha access", "Internship eligibility", "Verified certificates", "Skill assessments", "Portfolio builder", "Email support"],
    notIncluded: ["Hiring priority", "Resume review"],
    cta: "Start Pro Plan",
    href: "/signup",
    buttonVariant: "default",
    popular: true,
    orderIndex: 1,
    isActive: true,
  },
  {
    id: 3,
    name: "Elite Career",
    subtitle: "Launch your career",
    price: "₹999",
    period: "/ month",
    coins: "15,000",
    coinsLabel: "per month",
    iconName: "Building2",
    features: ["Everything in Pro", "Premium internships", "Direct hiring priority", "Resume & portfolio review", "Priority support", "Exclusive workshops", "Career mentorship"],
    notIncluded: [],
    cta: "Go Elite",
    href: "/signup",
    buttonVariant: "default",
    popular: false,
    orderIndex: 2,
    isActive: true,
  },
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

function PricingCard({
  plan,
  isLoggedIn,
  tierIndex,
  totalPlans,
}: {
  plan: DBPlan;
  isLoggedIn: boolean;
  tierIndex: number;
  totalPlans: number;
}) {
  const isFree = plan.price === "₹0" || plan.price === "0" || plan.price.toLowerCase() === "free";
  const isPopular = plan.popular;
  const IconComp = ICON_MAP[plan.iconName] || Gift;

  const priceNum = plan.price.replace(/[^\d]/g, "");

  const tierColor = isPopular
    ? C.teal
    : tierIndex === 0
    ? C.textSecondary
    : tierIndex >= totalPlans - 1
    ? C.purple
    : C.teal;

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
            background: isPopular ? "rgba(0,245,255,0.1)" : isFree ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.12)",
            border: `1px solid ${isPopular ? "rgba(0,245,255,0.25)" : isFree ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.3)"}`,
          }}
        >
          <IconComp className="w-7 h-7" style={{ color: tierColor }} />
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
                style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
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
                <span className="text-lg" style={{ color: C.textSecondary }}>₹</span>
                <span
                  className="text-5xl font-bold tabular-nums"
                  style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
                >
                  {priceNum}
                </span>
              </div>
              {plan.period && (
                <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                  {plan.period}
                </p>
              )}
            </div>
          )}
        </div>

        {plan.coins && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <Coins className="w-4 h-4" style={{ color: C.warning }} />
            <span className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {plan.coins} coins
            </span>
            {plan.coinsLabel && (
              <span className="text-xs" style={{ color: C.textSecondary }}>
                {plan.coinsLabel}
              </span>
            )}
          </div>
        )}

        <Link href={isLoggedIn ? "/shishya/wallet" : plan.href}>
          <button
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            style={
              plan.buttonVariant === "outline" || isFree
                ? {
                    background: "transparent",
                    color: C.teal,
                    border: `1px solid rgba(0,245,255,0.3)`,
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

function ComparisonTable({ plans }: { plans: DBPlan[] }) {
  const featureSet = new Set<string>();
  plans.forEach(p => {
    p.features.forEach(f => featureSet.add(f));
    p.notIncluded.forEach(f => featureSet.add(f));
  });
  const allFeatures = Array.from(featureSet);

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            <th className="text-left py-4 px-6 text-sm font-semibold" style={{ color: C.textSecondary }}>
              Feature
            </th>
            {plans.map((p) => (
              <th
                key={p.id}
                className="text-center py-4 px-6 text-sm font-semibold"
                style={{
                  color: p.popular ? C.teal : C.textPrimary,
                  fontFamily: "var(--font-display)",
                }}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, index) => (
            <tr
              key={feature}
              style={{
                borderTop: `1px solid ${C.cardBorder}`,
                background: index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
              }}
            >
              <td className="py-4 px-6 text-sm" style={{ color: C.textPrimary }}>
                {feature}
              </td>
              {plans.map((p) => {
                const included = p.features.includes(feature);
                return (
                  <td key={p.id} className="text-center py-4 px-6 text-sm">
                    {included ? (
                      <Check className="w-5 h-5 mx-auto" style={{ color: C.teal }} />
                    ) : (
                      <X className="w-5 h-5 mx-auto" style={{ color: "rgba(255,255,255,0.12)" }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Pricing() {
  const { user } = useAuth();

  const { data: dbPlans, isLoading } = useQuery<DBPlan[]>({
    queryKey: ["/api/pricing-plans"],
  });

  const plans = dbPlans && dbPlans.length > 0 ? dbPlans : fallbackPlans;
  const gridCols = plans.length <= 2 ? "md:grid-cols-2" : plans.length === 3 ? "md:grid-cols-3" : plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-5";

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
          <div className="mb-16" />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-[20px] backdrop-blur-[20px] p-8 flex flex-col h-full"
                  style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}` }}
                >
                  <div className="text-center space-y-4">
                    <Skeleton className="w-14 h-14 rounded-2xl mx-auto" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-40 mx-auto" />
                    <Skeleton className="h-12 w-24 mx-auto" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                  <div className="mt-8 space-y-3">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${gridCols} gap-6 lg:gap-8 items-stretch`}>
              {plans.map((plan, index) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isLoggedIn={!!user}
                  tierIndex={index}
                  totalPlans={plans.length}
                />
              ))}
            </div>
          )}
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
            <ComparisonTable plans={plans} />
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
