import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Mail,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

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
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>
              OurShiksha
            </span>
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

const inputStyle: React.CSSProperties = {
  background: "rgba(11,29,58,0.8)",
  border: "1px solid rgba(0,245,255,0.12)",
  color: "#E8F4FF",
  borderRadius: "10px",
};

const labelStyle: React.CSSProperties = {
  color: "#7E99B8",
  fontSize: "13px",
  fontWeight: 500,
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: config } = useQuery<PublicConfig>({
    queryKey: ["/api/config/public"],
  });

  const supportEmail = config?.supportEmail || "support@ourshiksha.com";
  const companyLocation = config?.companyLocation || "Chennai, Tamil Nadu, India";

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/contact", data);
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        toast({ title: "Message Sent", description: result.message || "We'll get back to you soon!" });
      } else {
        toast({ title: "Failed to send", description: result.error || "Please try again later.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message. Please try again later.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoCards = [
    {
      icon: Mail,
      title: "Email Us",
      content: supportEmail,
      isLink: true,
      href: `mailto:${supportEmail}`,
      accent: C.teal,
    },
    {
      icon: MapPin,
      title: "Location",
      content: companyLocation,
      isLink: false,
      accent: C.purple,
    },
    {
      icon: Clock,
      title: "Response Time",
      content: "We typically respond within 24–48 hours on business days.",
      isLink: false,
      accent: "#F59E0B",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.textPrimary }}>
      <LandingNavbar />

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-14 pb-10 md:pt-20 md:pb-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[130px] opacity-10"
              style={{ background: `radial-gradient(circle, ${C.teal}, transparent)` }} />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-[100px] opacity-10"
              style={{ background: `radial-gradient(circle, ${C.purple}, transparent)` }} />
          </div>

          <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-medium"
                style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: C.teal }}>
                <MessageSquare className="w-3.5 h-3.5" />
                Get in Touch
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  background: `linear-gradient(135deg, ${C.textPrimary} 0%, ${C.teal} 55%, ${C.purple} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Contact Us
              </h1>

              <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: C.textSecondary }}>
                Have questions about OurShiksha? We'd love to hear from you.
                Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="pb-14 md:pb-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-3 gap-6">

              {/* Left: Info cards */}
              <motion.div
                className="md:col-span-1 space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {infoCards.map((card, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5"
                    style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${card.accent}15`, border: `1px solid ${card.accent}30` }}>
                        <card.icon className="w-5 h-5" style={{ color: card.accent }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1" style={{ color: C.textPrimary }}>{card.title}</h3>
                        {card.isLink ? (
                          <a
                            href={card.href}
                            className="text-xs hover:underline transition-colors"
                            style={{ color: C.textSecondary }}
                            data-testid="link-email-support"
                          >
                            {card.content}
                          </a>
                        ) : (
                          <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{card.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Right: Form */}
              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div
                  className="rounded-2xl p-6 md:p-7"
                  style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
                >
                  {submitted ? (
                    <div className="text-center py-10">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
                      >
                        <CheckCircle2 className="w-8 h-8" style={{ color: "#10B981" }} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2" style={{ color: C.textPrimary }}>Message Sent!</h3>
                      <p className="text-sm mb-6" style={{ color: C.textSecondary }}>
                        Thank you for reaching out. We'll get back to you soon.
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); form.reset(); }}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.2)", color: C.teal }}
                        data-testid="button-send-another"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel style={labelStyle}>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your name"
                                    {...field}
                                    style={inputStyle}
                                    className="placeholder:text-[#3A5070] focus-visible:ring-[rgba(0,245,255,0.3)] focus-visible:border-[rgba(0,245,255,0.3)]"
                                    data-testid="input-contact-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel style={labelStyle}>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                    style={inputStyle}
                                    className="placeholder:text-[#3A5070] focus-visible:ring-[rgba(0,245,255,0.3)] focus-visible:border-[rgba(0,245,255,0.3)]"
                                    data-testid="input-contact-email"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={labelStyle}>Subject</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="What is this about?"
                                  {...field}
                                  style={inputStyle}
                                  className="placeholder:text-[#3A5070] focus-visible:ring-[rgba(0,245,255,0.3)] focus-visible:border-[rgba(0,245,255,0.3)]"
                                  data-testid="input-contact-subject"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={labelStyle}>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="How can we help you?"
                                  className="min-h-[140px] resize-none placeholder:text-[#3A5070] focus-visible:ring-[rgba(0,245,255,0.3)] focus-visible:border-[rgba(0,245,255,0.3)]"
                                  {...field}
                                  style={inputStyle}
                                  data-testid="input-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                          style={{
                            background: `linear-gradient(135deg, ${C.teal}, ${C.purple})`,
                            color: "#fff",
                            boxShadow: "0 0 20px rgba(0,245,255,0.2)",
                          }}
                          data-testid="button-submit-contact"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Message
                            </>
                          )}
                        </button>
                      </form>
                    </Form>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

      </main>

      <DarkFooter />
    </div>
  );
}
