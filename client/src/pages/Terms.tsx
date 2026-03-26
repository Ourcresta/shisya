import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, FileText } from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

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
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>OurShiksha</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[{ href: "/about", label: "About" }, { href: "/privacy", label: "Privacy Policy" }, { href: "/terms", label: "Terms" }, { href: "/contact", label: "Contact" }].map((l) => (
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

const sections = [
  {
    title: "1. Platform Usage",
    body: `OurShiksha is an educational platform providing online courses, practice labs, tests, and certification services. By using our platform, you agree to these terms and our commitment to quality education.\n\nYou must be at least 13 years old to use OurShiksha. Users under 18 should have parental consent. We reserve the right to modify or discontinue services with reasonable notice.`,
  },
  {
    title: "2. Account Responsibility",
    body: `You are responsible for maintaining the security of your account credentials. Do not share your login details with others. Each account is personal and non-transferable.\n\nYou must provide accurate information during registration. We may suspend accounts that violate our policies or contain false information.`,
  },
  {
    title: "3. Course Access & Credits",
    body: `OurShiksha uses a credit-based system for accessing premium features. Credits are used for AI tutoring, labs, tests, project evaluations, and certificate generation.`,
    list: [
      "Free signup credits (500) never expire",
      "Subscription credits reset monthly and don't carry over",
      "Purchased coin packs never expire",
      "Credits are non-transferable between accounts",
    ],
  },
  {
    title: "4. Payments & Refunds",
    body: `Payments are processed securely through Razorpay. We accept UPI, cards, net banking, and popular wallets.\n\nRefunds are considered on a case-by-case basis within 7 days of purchase if credits remain unused. Subscription fees are non-refundable once the billing cycle begins. Contact support for refund requests.`,
  },
  {
    title: "5. Academic Integrity",
    body: "We take academic integrity seriously. The following are strictly prohibited:",
    list: [
      "Sharing test questions or answers with others",
      "Using unauthorized assistance during tests",
      "Submitting work that is not your own",
      "Attempting to manipulate scores or certificates",
      "Creating multiple accounts for unfair advantage",
    ],
    footer: "Violations may result in certificate revocation and account termination.",
  },
  {
    title: "6. Certificate Authenticity",
    body: `Certificates issued by OurShiksha are verifiable through our public verification system. Each certificate has a unique ID and QR code.\n\nWe reserve the right to revoke certificates if we discover they were obtained through fraudulent means.`,
  },
  {
    title: "7. Misuse & Termination",
    body: "We may terminate or suspend accounts that:",
    list: [
      "Violate academic integrity policies",
      "Attempt to exploit or hack the platform",
      "Harass other users or staff",
      "Use the platform for illegal activities",
      "Violate any part of these terms",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: `OurShiksha provides educational content "as is" without warranties of any kind. We are not liable for career outcomes, employment decisions, or any indirect damages resulting from platform use.\n\nOur liability is limited to the amount you paid for services in the preceding 12 months.`,
  },
  {
    title: "9. Governing Law",
    body: "These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Chennai, Tamil Nadu, India.",
  },
];

export default function Terms() {
  const { data: config } = useQuery<PublicConfig>({ queryKey: ["/api/config/public"] });
  const legalEmail = config?.legalEmail || "legal@ourshiksha.com";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.textPrimary }}>
      <LandingNavbar />

      <main className="flex-1">
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>


              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Terms of Service
              </h1>
              <p className="mb-8 text-sm" style={{ color: C.textSecondary }}>Last updated: December 2024</p>

              <div
                className="rounded-2xl p-6 md:p-8 space-y-7"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
              >
                {sections.map((s, i) => (
                  <div key={i}>
                    <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>{s.title}</h2>
                    {s.body.split("\n\n").map((para, j) => (
                      <p key={j} className="mb-2 leading-relaxed text-sm" style={{ color: C.textSecondary }}>{para}</p>
                    ))}
                    {s.list && (
                      <ul className="list-disc pl-5 space-y-1.5 mt-2" style={{ color: C.textSecondary }}>
                        {s.list.map((item, k) => <li key={k} className="text-sm">{item}</li>)}
                      </ul>
                    )}
                    {s.footer && <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>{s.footer}</p>}
                  </div>
                ))}

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>10. Contact</h2>
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    For questions about these terms, contact us at{" "}
                    <a href={`mailto:${legalEmail}`} style={{ color: C.teal }} className="hover:underline">
                      {legalEmail}
                    </a>
                  </p>
                </div>
              </div>

            </motion.div>
          </div>
        </section>
      </main>

      <DarkFooter />
    </div>
  );
}
