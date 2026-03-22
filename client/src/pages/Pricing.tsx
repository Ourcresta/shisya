import studyImg from "@assets/image_1774172322092.png";
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
      className="relative rounded-[20px] backdrop-blur-[20px] transition-all duration-300 flex flex-col h-full overflow-hidden"
      style={{
        background: isPopular ? "rgba(0,245,255,0.035)" : C.cardBg,
        border: `1px solid ${isPopular ? "rgba(0,245,255,0.22)" : C.cardBorder}`,
        boxShadow: isPopular ? "0 12px 48px -8px rgba(0,245,255,0.18)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isPopular) {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.18)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 36px -8px rgba(0,245,255,0.1)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
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
      {/* Gradient top accent line for popular */}
      {isPopular && (
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.tealDark}, #818CF8)` }}
        />
      )}

      {isPopular && (
        <div className="absolute top-4 right-4">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
            style={{
              background: "rgba(0,245,255,0.1)",
              border: "1px solid rgba(0,245,255,0.25)",
              color: C.teal,
            }}
          >
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <div className="p-7">
        {/* Plan header row */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isPopular ? "rgba(0,245,255,0.1)" : isFree ? "rgba(255,255,255,0.05)" : "rgba(124,58,237,0.1)",
              border: `1px solid ${isPopular ? "rgba(0,245,255,0.22)" : isFree ? "rgba(255,255,255,0.09)" : "rgba(124,58,237,0.25)"}`,
            }}
          >
            <IconComp className="w-5 h-5" style={{ color: tierColor }} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-base font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
            >
              {plan.name}
            </h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: C.textSecondary }}>
              {plan.subtitle}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          {isFree ? (
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
              >
                Free
              </span>
              <span className="text-sm" style={{ color: C.textSecondary }}>forever</span>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-medium" style={{ color: C.textSecondary }}>₹</span>
                <span
                  className="text-4xl font-bold tabular-nums"
                  style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}
                >
                  {priceNum}
                </span>
                {plan.period && (
                  <span className="text-sm ml-1" style={{ color: C.textSecondary }}>
                    {plan.period}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {plan.coins && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-5"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <Coins className="w-3.5 h-3.5 shrink-0" style={{ color: C.warning }} />
            <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>
              {plan.coins} coins
            </span>
            {plan.coinsLabel && (
              <span className="text-xs" style={{ color: C.textSecondary }}>
                · {plan.coinsLabel}
              </span>
            )}
          </div>
        )}

        <Link href={isLoggedIn ? "/shishya/wallet" : plan.href}>
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            style={
              plan.buttonVariant === "outline" || isFree
                ? {
                    background: "transparent",
                    color: C.teal,
                    border: `1px solid rgba(0,245,255,0.28)`,
                  }
                : {
                    background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                    color: C.bgDeep,
                    boxShadow: "0 4px 18px rgba(0,245,255,0.28)",
                    border: "none",
                  }
            }
            data-testid={`button-plan-${plan.id}`}
          >
            {plan.cta}
          </button>
        </Link>
      </div>

      {/* Feature list */}
      <div
        className="px-7 pb-7 flex-1 pt-4"
        style={{ borderTop: `1px solid ${C.cardBorder}` }}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          What's included
        </p>
        <ul className="space-y-2.5">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px]">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                style={{ background: "rgba(0,245,255,0.1)" }}
              >
                <Check className="w-2.5 h-2.5" style={{ color: C.teal }} />
              </div>
              <span style={{ color: C.textPrimary }}>{feature}</span>
            </li>
          ))}
          {plan.notIncluded.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px]">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <X className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.18)" }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.22)" }}>{feature}</span>
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
        background: `linear-gradient(160deg, #020814 0%, #060D1F 25%, #081428 55%, #0B1D3A 80%, #060D1F 100%)`,
        color: C.textPrimary,
      }}
    >
      <LandingNavbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Ambient gradient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.03) 55%, transparent 70%)",
        }} />
        {/* Dot-grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, rgba(0,245,255,0.025) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        {/* ── Illustration: absolutely anchored top-right ── */}
        <img
          src={studyImg}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute top-0 right-0 select-none pointer-events-none hidden md:block"
          style={{
            height: "420px",
            width: "auto",
            objectFit: "contain",
            opacity: 0.22,
            mixBlendMode: "screen",
            maskImage: [
              "radial-gradient(ellipse 70% 80% at 70% 40%, black 30%, transparent 75%)",
              "linear-gradient(to bottom, black 40%, transparent 100%)",
              "linear-gradient(to left, black 20%, transparent 60%)",
            ].join(", "),
            WebkitMaskImage: [
              "radial-gradient(ellipse 70% 80% at 70% 40%, black 30%, transparent 75%)",
              "linear-gradient(to bottom, black 40%, transparent 100%)",
              "linear-gradient(to left, black 20%, transparent 60%)",
            ].join(", "),
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
            zIndex: 1,
          }}
        />

        {/* Decorative teal glow behind where the image sits */}
        <div
          className="absolute top-0 right-0 pointer-events-none hidden md:block"
          style={{
            width: "480px",
            height: "480px",
            background: "radial-gradient(ellipse 60% 60% at 80% 20%, rgba(0,245,255,0.07) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative" style={{ zIndex: 2 }}>
          <div className="py-12 md:py-16 max-w-[580px]">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.05))",
                border: "1px solid rgba(0,245,255,0.22)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: C.teal }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: C.teal }}>
                Flexible plans for every learner
              </span>
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold mb-4 leading-[1.06]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              data-testid="text-pricing-headline"
            >
              <span style={{ color: C.textPrimary }}>Choose Your</span>
              <br />
              <span style={{
                background: `linear-gradient(100deg, ${C.teal} 0%, #38BDF8 40%, #818CF8 75%, #A78BFA 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Learning Power
              </span>
            </h1>

            <p
              className="text-base md:text-[1.05rem] max-w-[420px] mb-7 leading-relaxed"
              style={{ color: "#7E99B8" }}
              data-testid="text-pricing-subtitle"
            >
              Flexible plans built for serious learners and future professionals.
              Start free, upgrade when you're ready.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: Gift, label: "500 credits free" },
                { icon: CreditCard, label: "No card required" },
                { icon: RefreshCw, label: "Cancel anytime" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#94A3B8",
                  }}
                >
                  <Icon className="w-3 h-3" style={{ color: C.teal }} />
                  {label}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* thin separator */}
      <div className="relative z-10 pointer-events-none" style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,245,255,0.08), transparent)" }} />

      <section className="relative z-10 py-8 md:py-10">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.03) 55%, transparent 70%)",
        }} />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
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

      {/* ── COMPARE PLANS ── */}
      <section className="relative py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.03) 55%, transparent 70%)",
        }} />

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.16)", color: C.teal }}
            >
              <Check className="w-3 h-3" /> Side-by-side breakdown
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, ${C.textPrimary}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
              data-testid="text-comparison-title"
            >
              Compare Plans
            </h2>
            <p style={{ color: C.textSecondary }} className="text-sm max-w-sm mx-auto">
              See exactly what's included in each plan
            </p>
          </div>

          <GlassCard hover={false} className="overflow-hidden">
            <ComparisonTable plans={plans} />
          </GlassCard>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="relative pb-8 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div
            className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.03), rgba(124,58,237,0.02))",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            data-testid="section-trust-bar"
          >
            {trustItems.map((item, i) => (
              <div key={item.title} className="flex items-center gap-3 min-w-0">
                {i > 0 && (
                  <div className="hidden sm:block w-px h-8 shrink-0" style={{ background: "rgba(255,255,255,0.07)" }} />
                )}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.05))",
                    border: "1px solid rgba(0,245,255,0.15)",
                  }}
                >
                  <item.icon className="w-4 h-4" style={{ color: C.teal }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight" style={{ color: C.textPrimary, fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs leading-snug mt-0.5" style={{ color: C.textSecondary }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="relative py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.03) 55%, transparent 70%)",
        }} />
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(0,245,255,0.07), rgba(124,58,237,0.04))",
                  border: "1px solid rgba(0,245,255,0.18)",
                  color: C.teal,
                }}
              >
                <Sparkles className="w-3 h-3" /> FAQ
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                style={{ fontFamily: "var(--font-display)", color: C.textPrimary, letterSpacing: "-0.02em" }}
                data-testid="text-faq-title"
              >
                Frequently Asked
                <br />
                <span style={{
                  background: `linear-gradient(100deg, ${C.teal}, #38BDF8 50%, #818CF8)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Questions</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#7E99B8" }}>
                Everything you need to know before subscribing. Can't find an answer? Reach out to our support team.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-[14px] px-5 border-0"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  data-testid={`faq-question-${index}`}
                >
                  <AccordionTrigger
                    className="hover:no-underline text-left py-4 gap-4"
                    style={{ color: C.textPrimary }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(124,58,237,0.06))",
                          border: "1px solid rgba(0,245,255,0.2)",
                          color: C.teal,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium text-[14px] leading-snug">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent
                    className="pb-4 text-[13.5px] leading-relaxed"
                    style={{
                      color: "#7E99B8",
                      borderLeft: `2px solid rgba(0,245,255,0.18)`,
                      marginLeft: "0.75rem",
                      paddingLeft: "1.25rem",
                    }}
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-10 md:py-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.03) 55%, transparent 70%)",
        }} />
        <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <div
            className="rounded-[24px] p-8 md:p-10"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(124,58,237,0.04) 50%, rgba(0,245,255,0.03) 100%)",
              border: "1px solid rgba(0,245,255,0.14)",
              boxShadow: "0 0 80px -20px rgba(0,245,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                boxShadow: "0 0 40px rgba(0,245,255,0.3)",
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
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-6 mt-auto" style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm" style={{ color: C.textSecondary }}>
          <p>Invest in your future. Start learning today.</p>
        </div>
      </footer>
    </div>
  );
}
