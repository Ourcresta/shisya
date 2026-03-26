import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Shield } from "lucide-react";
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

export default function Privacy() {
  const { data: config } = useQuery<PublicConfig>({ queryKey: ["/api/config/public"] });

  const privacyEmail = config?.privacyEmail || "privacy@ourshiksha.com";
  const companyLocation = config?.companyLocation || "Chennai, Tamil Nadu, India";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.textPrimary }}>
      <LandingNavbar />

      <main className="flex-1">
        <section className="py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-medium"
                style={{ background: "rgba(99,103,255,0.08)", border: "1px solid rgba(99,103,255,0.2)", color: C.teal }}>
                <Shield className="w-3.5 h-3.5" />
                Privacy
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Privacy Policy
              </h1>
              <p className="mb-8 text-sm" style={{ color: C.textSecondary }}>Last updated: December 2024</p>

              <div
                className="rounded-2xl p-6 md:p-8 space-y-8"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(12px)" }}
              >
                {[
                  {
                    title: "Introduction",
                    content: `OurShiksha ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our educational platform.`,
                  },
                ].map((s, i) => (
                  <div key={i}>
                    <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>{s.title}</h2>
                    <p style={{ color: C.textSecondary }}>{s.content}</p>
                  </div>
                ))}

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Data We Collect</h2>
                  <p className="mb-3" style={{ color: C.textSecondary }}>We collect information you provide directly:</p>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ color: C.textSecondary }}>
                    <li><strong style={{ color: C.textPrimary }}>Account Data:</strong> Name, email address, password (hashed)</li>
                    <li><strong style={{ color: C.textPrimary }}>Profile Data:</strong> Bio, location, social links, profile photo</li>
                    <li><strong style={{ color: C.textPrimary }}>Learning Data:</strong> Course progress, test scores, project submissions</li>
                    <li><strong style={{ color: C.textPrimary }}>Payment Data:</strong> Transaction IDs, credit balance (card details handled by Razorpay)</li>
                    <li><strong style={{ color: C.textPrimary }}>Communication:</strong> Support messages, contact form submissions</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>How We Use Your Data</h2>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ color: C.textSecondary }}>
                    <li>Provide and improve our educational services</li>
                    <li>Track your learning progress and issue certificates</li>
                    <li>Process payments and manage credits</li>
                    <li>Send important account and service notifications</li>
                    <li>Respond to support inquiries</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Payment Handling</h2>
                  <p className="mb-2" style={{ color: C.textSecondary }}>
                    All payment processing is handled by Razorpay, a PCI-DSS compliant payment gateway. We never store your full card details.
                    Only transaction references and amounts are stored for record-keeping.
                  </p>
                  <p style={{ color: C.textSecondary }}>
                    Razorpay's privacy policy:{" "}
                    <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer"
                      style={{ color: C.teal }} className="hover:underline">
                      razorpay.com/privacy
                    </a>
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Cookies &amp; Analytics</h2>
                  <p className="mb-2" style={{ color: C.textSecondary }}>We use essential cookies for:</p>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ color: C.textSecondary }}>
                    <li>Session management (keeping you logged in)</li>
                    <li>Theme preferences (light/dark mode)</li>
                    <li>Learning progress tracking</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Data Security</h2>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ color: C.textSecondary }}>
                    <li>Passwords hashed with bcrypt (12 rounds)</li>
                    <li>HTTPS encryption for all data transmission</li>
                    <li>HTTP-only session cookies</li>
                    <li>Regular security audits</li>
                    <li>Secure cloud hosting on Replit</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Data Sharing</h2>
                  <p className="mb-2 font-medium" style={{ color: C.textPrimary }}>We do not sell your personal data.</p>
                  <p className="mb-2" style={{ color: C.textSecondary }}>We may share data only in these cases:</p>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ color: C.textSecondary }}>
                    <li>With your consent (e.g., public portfolio)</li>
                    <li>Payment processors (Razorpay) for transactions</li>
                    <li>Legal requirements or court orders</li>
                    <li>Certificate verification (public verification page)</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Your Rights</h2>
                  <ul className="list-disc pl-5 space-y-1.5" style={{ color: C.textSecondary }}>
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and associated data</li>
                    <li>Export your learning progress and certificates</li>
                    <li>Opt out of non-essential communications</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Data Retention</h2>
                  <p style={{ color: C.textSecondary }}>
                    We retain your data as long as your account is active. Upon account deletion, we remove personal data within 30 days.
                    Certificate records may be retained for verification purposes.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Children's Privacy</h2>
                  <p style={{ color: C.textSecondary }}>
                    OurShiksha is not intended for children under 13. We do not knowingly collect data from children under 13.
                    If you believe a child has provided us data, please contact us immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Indian Data Practices</h2>
                  <p style={{ color: C.textSecondary }}>
                    We comply with applicable Indian data protection regulations. Our servers and data processing are designed with
                    Indian users in mind. We follow best practices as recommended by Indian regulatory authorities.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Policy Updates</h2>
                  <p style={{ color: C.textSecondary }}>
                    We may update this policy periodically. Significant changes will be communicated via email or platform notification.
                    Continued use after updates constitutes acceptance.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: C.textPrimary }}>Contact for Data Queries</h2>
                  <p style={{ color: C.textSecondary }}>
                    For privacy-related questions or data requests, contact us at:{" "}
                    <a href={`mailto:${privacyEmail}`} style={{ color: C.teal }} className="hover:underline">
                      {privacyEmail}
                    </a>
                  </p>
                  <p className="mt-1" style={{ color: C.textSecondary }}>
                    OurShiksha<br />{companyLocation}
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
