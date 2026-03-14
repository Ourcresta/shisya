import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  ArrowUp,
  BookOpen,
  LayoutDashboard,
  Award,
  Wallet,
  HelpCircle,
  Sparkles,
  Users,
  Handshake,
  Shield,
  FileText,
  Mail,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

const quickLinks = [
  { label: "Dashboard", href: "/shishya/dashboard", icon: LayoutDashboard },
  { label: "Browse Courses", href: "/courses", icon: BookOpen },
  { label: "My Certificates", href: "/shishya/certificates", icon: Award },
  { label: "Wallet", href: "/shishya/wallet", icon: Wallet },
];

const resourceLinks = [
  { label: "Help Center", href: "/help", icon: HelpCircle },
  { label: "AI Usha Mentor", href: "/ai-usha-mentor", icon: Sparkles },
  { label: "Become a Guru", href: "/become-guru", icon: Users },
  { label: "Partner with Us", href: "/become-a-partner", icon: Handshake },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy", icon: Shield },
  { label: "Terms of Service", href: "/terms", icon: FileText },
  { label: "Contact", href: "/contact", icon: Mail },
];

export function Layout({ children, fullWidth = false }: LayoutProps) {
  const { user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className={`flex-1 ${fullWidth ? "" : "max-w-7xl mx-auto px-4 md:px-8 py-8"}`}>
        {children}
      </main>

      <footer className="border-t dark:border-cyan-500/10 bg-muted/30 mt-auto" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href={user ? "/shishya/dashboard" : "/"} className="flex items-center gap-2 group mb-3" data-testid="footer-brand-link">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  OurShiksha
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering learners with AI
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <link.icon className="w-3.5 h-3.5" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <link.icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t dark:border-cyan-500/10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} OurShiksha. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              {user ? "OurShiksha | Shishya Student Portal" : "Your learning journey starts here."}
            </p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
          data-testid="button-scroll-to-top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
