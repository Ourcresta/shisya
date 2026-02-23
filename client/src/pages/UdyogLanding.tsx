import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Code, Award, ArrowRight, Rocket, Users, Trophy, Sparkles, ChevronRight, Clock, Target, Zap, Eye } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stats = [
  { label: "500+ Projects", icon: Briefcase },
  { label: "10K+ Interns", icon: Users },
  { label: "95% Placement", icon: Trophy },
  { label: "AI-Powered", icon: Sparkles },
];

const features = [
  {
    icon: Briefcase,
    title: "Virtual Internship",
    description: "Work on real industry projects in a simulated company environment",
  },
  {
    icon: Code,
    title: "Live Industry Projects",
    description: "Build production-grade applications with AI-guided mentorship",
  },
  {
    icon: Award,
    title: "Industry Certification",
    description: "Earn verified certificates recognized by top companies",
  },
];

const steps = [
  {
    icon: Target,
    title: "Take AI Assessment",
    description: "Our AI evaluates your skills to find the perfect match",
  },
  {
    icon: Zap,
    title: "Get Assigned",
    description: "AI assigns you a role based on your skill level",
  },
  {
    icon: Award,
    title: "Build & Certify",
    description: "Complete tasks, submit work, earn your certificate",
  },
];

const levelColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

function getCtaHref(user: any) {
  return user ? "/shishya/udyog/assess" : "/login?redirect=/shishya/udyog/assess";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function UdyogLanding() {
  const { user } = useAuth();
  const ctaHref = getCtaHref(user);
  const [viewingInternship, setViewingInternship] = useState<any | null>(null);

  const { data: internships, isLoading } = useQuery<any[]>({
    queryKey: ["/api/udyog/internships"],
  });

  const scrollToPrograms = () => {
    document.getElementById("programs-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0e1a 0%, #111827 100%)" }}>
      <LandingNavbar />
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)" }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] right-[5%] w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)" }}
          animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[30%] w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)" }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-udyog-hero-heading"
            >
              Step Into Industry With{" "}
              <span
                className="bg-clip-text text-transparent whitespace-nowrap"
                style={{
                  backgroundImage: "linear-gradient(135deg, #22D3EE, #14B8A6, #22D3EE)",
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 3s ease infinite",
                }}
              >
                Our Udyog
              </span>
            </h1>
            <p
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              data-testid="text-udyog-hero-subtext"
            >
              AI-Powered Virtual Internship System — Experience real-world projects under AI guidance
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  className="min-w-[220px] text-white border-0"
                  style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                  data-testid="button-start-internship"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Internship Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="min-w-[220px] border-cyan-500/30 text-cyan-400 bg-transparent"
                onClick={scrollToPrograms}
                data-testid="button-explore-programs"
              >
                Explore Programs
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative px-4 pb-16">
        <motion.div
          className="max-w-4xl mx-auto rounded-2xl border border-white/10 p-6 backdrop-blur-xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          data-testid="stats-bar"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <stat.icon className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="text-sm md:text-base font-medium text-gray-300">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How Udyog Works - Feature Cards */}
      <section className="relative px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-how-udyog-works"
            >
              How{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}>
                Our Udyog
              </span>{" "}
              Works
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A structured path from assessment to certification
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="relative group rounded-2xl border border-white/10 p-6 backdrop-blur-xl transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.03)" }}
                whileHover={{ borderColor: "rgba(34,211,238,0.3)", boxShadow: "0 0 30px rgba(34,211,238,0.1)" }}
                data-testid={`card-feature-${index + 1}`}
              >
                <div className="absolute -top-3 -left-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-cyan-400 border border-cyan-500/30" style={{ background: "rgba(34,211,238,0.1)" }}>
                  {index + 1}
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border border-cyan-500/20" style={{ background: "rgba(34,211,238,0.1)" }}>
                  <feature.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Steps */}
      <section className="relative px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-how-it-works"
            >
              Your Journey in 3 Steps
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-y-1/2" />

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  className="relative text-center"
                  data-testid={`step-${index + 1}`}
                >
                  <div className="relative z-10 mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(20,184,166,0.1))" }}>
                    <step.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider">Step {index + 1}</div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Internship Programs */}
      <section className="relative px-4 py-16 md:py-20" id="programs-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-available-programs"
            >
              Available Internship Programs
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose from our curated programs designed with industry partners
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <Skeleton className="h-6 w-3/4 mb-3 bg-white/10" />
                  <Skeleton className="h-4 w-1/2 mb-2 bg-white/10" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-white/10" />
                  <Skeleton className="h-8 w-24 bg-white/10" />
                </div>
              ))}
            </div>
          ) : internships && internships.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {internships.map((internship: any) => (
                <motion.div
                  key={internship.id}
                  variants={itemVariants}
                  className="rounded-2xl border border-white/10 p-6 backdrop-blur-xl transition-all duration-300"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  whileHover={{ borderColor: "rgba(34,211,238,0.3)", boxShadow: "0 0 30px rgba(34,211,238,0.1)" }}
                  data-testid={`card-internship-${internship.id}`}
                >
                  <h3 className="text-lg font-semibold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    {internship.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {internship.skillLevel && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors[internship.skillLevel?.toLowerCase()] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}`}>
                        {internship.skillLevel}
                      </span>
                    )}
                    {internship.domain && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                        {internship.domain}
                      </span>
                    )}
                  </div>
                  {internship.duration && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{internship.duration}</span>
                    </div>
                  )}
                  {internship.shortDescription && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{internship.shortDescription}</p>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                      onClick={() => setViewingInternship(internship)}
                      data-testid={`button-view-details-${internship.id}`}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Details
                    </Button>
                    <Link href={ctaHref}>
                      <Button
                        size="sm"
                        className="ml-auto text-white border-0"
                        style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                        data-testid={`button-apply-${internship.id}`}
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16 rounded-2xl border border-white/10 backdrop-blur-xl"
              style={{ background: "rgba(255,255,255,0.02)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              data-testid="text-coming-soon"
            >
              <Rocket className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Coming Soon
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                New internship programs are being curated by our AI and industry partners. Check back soon!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative px-4 py-20 md:py-28">
        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
            data-testid="text-bottom-cta"
          >
            Ready to Begin Your Industry Journey?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of students building real skills through AI-powered virtual internships
          </p>
          <Link href={ctaHref}>
            <Button
              size="lg"
              className="min-w-[200px] text-white border-0"
              style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
              data-testid="button-start-now"
            >
              Start Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <Dialog open={!!viewingInternship} onOpenChange={(open) => { if (!open) setViewingInternship(null); }}>
        <DialogContent className="max-w-lg border-white/10 text-white" style={{ background: "linear-gradient(180deg, #0f1629 0%, #111827 100%)" }}>
          <DialogHeader>
            <DialogTitle className="text-white" data-testid="text-view-detail-title">
              {viewingInternship?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">Internship Program Details</DialogDescription>
          </DialogHeader>
          {viewingInternship && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm whitespace-pre-wrap" data-testid="text-view-detail-description">
                {viewingInternship.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {viewingInternship.skillLevel && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelColors[viewingInternship.skillLevel?.toLowerCase()] || "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}`}>
                    {viewingInternship.skillLevel}
                  </span>
                )}
                {viewingInternship.domain && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                    {viewingInternship.domain}
                  </span>
                )}
              </div>
              {viewingInternship.duration && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{viewingInternship.duration}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/10">
                <Link href={ctaHref}>
                  <Button
                    className="w-full text-white border-0"
                    style={{ background: "linear-gradient(135deg, #22D3EE, #14B8A6)" }}
                    data-testid="button-apply-from-detail"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}