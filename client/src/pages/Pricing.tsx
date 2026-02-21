import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Gift, 
  Coins, 
  MessageSquare, 
  FlaskConical, 
  ClipboardCheck, 
  FolderKanban, 
  Award, 
  Check, 
  Star, 
  Sparkles,
  Brain,
  Target,
  BookOpen,
  Shield,
  Users,
  TrendingUp,
  ChevronDown,
  Zap,
  Crown,
  Building2,
  CreditCard,
  DollarSign,
  ArrowLeft,
  Home,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader as CardHeaderUI, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";

const ICON_MAP: Record<string, LucideIcon> = {
  Gift, Zap, Crown, Building2, Star, Coins, CreditCard, DollarSign,
};

interface PricingPlan {
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const coinUsage = [
  { icon: MessageSquare, label: "AI Usha Chat", cost: "5 coins / query", description: "Get personalized help from your AI tutor" },
  { icon: FlaskConical, label: "Practice Lab", cost: "20 coins", description: "Hands-on coding exercises" },
  { icon: ClipboardCheck, label: "Test Attempt", cost: "30 coins", description: "Skill assessment tests" },
  { icon: FolderKanban, label: "Project Evaluation", cost: "50 coins", description: "Real-world project reviews" },
  { icon: Award, label: "Certificate Generation", cost: "100 coins", description: "Verified skill certificates" },
];


const features = [
  { icon: Brain, title: "AI Tutor (Usha)", description: "24/7 personalized learning assistant that never gives direct answers" },
  { icon: FlaskConical, title: "Practice-First Learning", description: "Learn by doing with hands-on labs and exercises" },
  { icon: FolderKanban, title: "Real-World Projects", description: "Build portfolio-worthy projects with expert evaluation" },
  { icon: Award, title: "Verified Certificates", description: "Industry-recognized credentials with QR verification" },
  { icon: TrendingUp, title: "Skill Progression", description: "Track your growth with detailed analytics" },
  { icon: Coins, title: "Transparent Coin System", description: "Know exactly what you're spending, no hidden fees" }
];

const faqs = [
  {
    question: "What are coins?",
    answer: "Coins are OurShiksha's internal currency. They're used to access premium features like AI chat, practice labs, tests, project evaluations, and certificate generation. This transparent system ensures you know exactly what you're spending."
  },
  {
    question: "Do coins expire?",
    answer: "Free signup coins never expire. Monthly subscription coins reset at the start of each billing cycle - unused coins don't carry over, so make the most of your learning each month!"
  },
  {
    question: "Can I buy extra coins?",
    answer: "Yes! You can purchase additional coin packs anytime from your Wallet. Extra coins never expire and can be used alongside your subscription coins."
  },
  {
    question: "Can I upgrade anytime?",
    answer: "Absolutely! You can upgrade your plan at any time. When you upgrade, you'll immediately receive the difference in coins for the current billing period."
  },
  {
    question: "Are certificates valid?",
    answer: "Yes! Our certificates are industry-recognized and feature QR codes that link to public verification pages. Employers can verify the authenticity of your credentials instantly."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept UPI, credit/debit cards, net banking, and popular wallets like Google Pay and Paytm through our secure Razorpay integration."
  }
];

export default function Pricing() {
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useQuery<PricingPlan[]>({
    queryKey: ["/api/pricing-plans"],
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 gap-1.5 px-4 py-1.5">
              <Gift className="w-4 h-4" />
              Get FREE 500 Coins on Signup
            </Badge>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Learn Skills. Prove Knowledge.{" "}
              <span className="text-primary">Get Certified.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-Powered Learning with Practice, Projects & Certificates. 
              Choose the plan that fits your learning journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-hero-start-free">
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-hero-view-plans"
              >
                View Plans
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Coins Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 rounded-full bg-amber-500/10">
                <Coins className="w-6 h-6 text-amber-500" />
              </div>
              <h2 
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What Are Coins?
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Coins are OurShiksha's transparent credit system. Know exactly what you're spending - no hidden charges, no surprises.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {coinUsage.map((item, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.label}</h3>
                    <Badge variant="secondary" className="mb-2">
                      <Coins className="w-3 h-3 mr-1" />
                      {item.cost}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing-plans" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Choose Your Learning Plan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade anytime. All plans include access to our course library and AI-powered learning tools.
            </p>
          </motion.div>

          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-full flex flex-col">
                  <CardHeaderUI className="text-center pb-4">
                    <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-6 w-24 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto mt-2" />
                    <Skeleton className="h-10 w-28 mx-auto mt-4" />
                  </CardHeaderUI>
                  <CardContent className="flex-1 space-y-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : plans && plans.length > 0 ? (
            <motion.div
              className={`grid grid-cols-1 md:grid-cols-2 ${plans.length <= 3 ? `lg:grid-cols-${plans.length}` : "lg:grid-cols-4"} gap-6`}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {plans.map((plan, index) => {
                const IconComp = ICON_MAP[plan.iconName] || Gift;
                return (
                  <motion.div key={plan.id} variants={fadeInUp}>
                    <Card 
                      className={`h-full flex flex-col relative ${
                        plan.popular 
                          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                          : 'hover:shadow-md'
                      } transition-all`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="gap-1 bg-primary text-primary-foreground">
                            <Star className="w-3 h-3" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeaderUI className="text-center pb-4">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                          plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.subtitle}</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                        {plan.coins && (
                          <Badge variant="outline" className="mt-2 gap-1">
                            <Coins className="w-3 h-3 text-amber-500" />
                            {plan.coins} coins {plan.coinsLabel}
                          </Badge>
                        )}
                      </CardHeaderUI>
                      
                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {plan.features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.notIncluded.map((feature: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-4 h-4 mt-0.5 shrink-0 text-center">-</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardFooter>
                        <Link href={user ? "/shishya/wallet" : plan.href} className="w-full">
                          <Button 
                            variant={plan.buttonVariant as "default" | "outline" | "secondary"} 
                            className="w-full"
                            data-testid={`button-plan-${plan.name.toLowerCase()}`}
                          >
                            {plan.cta}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Why OurShiksha Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why OurShiksha?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building the future of skill-based education in India
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Built for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Students, professionals, and institutions trust OurShiksha for skill development
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Users className="w-4 h-4" />
                10,000+ Learners
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <BookOpen className="w-4 h-4" />
                50+ Courses
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Award className="w-4 h-4" />
                5,000+ Certificates Issued
              </Badge>
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Shield className="w-4 h-4" />
                Verified & Trusted
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <Gift className="w-4 h-4" />
              Limited Time Offer
            </Badge>
            <h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Start Your Learning Journey Today
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Sign up now and get 500 free coins to explore our AI-powered learning platform
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2" data-testid="button-final-cta">
                <Sparkles className="w-5 h-5" />
                Get 500 Free Coins
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
