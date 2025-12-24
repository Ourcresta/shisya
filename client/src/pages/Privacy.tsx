import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";

interface PublicConfig {
  supportEmail: string;
  privacyEmail: string;
  legalEmail: string;
  companyLocation: string;
  companyName: string;
}

function Footer() {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              OurShiksha
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            OurShiksha {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Privacy() {
  const { data: config } = useQuery<PublicConfig>({
    queryKey: ["/api/config/public"],
  });

  const privacyEmail = config?.privacyEmail || "privacy@ourshiksha.com";
  const companyLocation = config?.companyLocation || "Chennai, Tamil Nadu, India";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <Shield className="w-4 h-4" />
                Privacy
              </Badge>
              
              <h1 
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
              
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                  <p className="text-muted-foreground">
                    OurShiksha ("we", "our", "us") is committed to protecting your privacy. 
                    This policy explains how we collect, use, and safeguard your information 
                    when you use our educational platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Data We Collect</h2>
                  <p className="text-muted-foreground mb-3">
                    We collect information you provide directly:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li><strong>Account Data:</strong> Name, email address, password (hashed)</li>
                    <li><strong>Profile Data:</strong> Bio, location, social links, profile photo</li>
                    <li><strong>Learning Data:</strong> Course progress, test scores, project submissions</li>
                    <li><strong>Payment Data:</strong> Transaction IDs, credit balance (card details handled by Razorpay)</li>
                    <li><strong>Communication:</strong> Support messages, contact form submissions</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">How We Use Your Data</h2>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide and improve our educational services</li>
                    <li>Track your learning progress and issue certificates</li>
                    <li>Process payments and manage credits</li>
                    <li>Send important account and service notifications</li>
                    <li>Respond to support inquiries</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Payment Handling</h2>
                  <p className="text-muted-foreground">
                    All payment processing is handled by Razorpay, a PCI-DSS compliant payment 
                    gateway. We never store your full card details. Only transaction references 
                    and amounts are stored for record-keeping.
                  </p>
                  <p className="text-muted-foreground">
                    Razorpay's privacy policy applies to payment data:{" "}
                    <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      razorpay.com/privacy
                    </a>
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Cookies & Analytics</h2>
                  <p className="text-muted-foreground">
                    We use essential cookies for:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Session management (keeping you logged in)</li>
                    <li>Theme preferences (light/dark mode)</li>
                    <li>Learning progress tracking</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We may use analytics to understand platform usage and improve our services. 
                    No personal data is shared with analytics providers.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Passwords hashed with bcrypt (12 rounds)</li>
                    <li>HTTPS encryption for all data transmission</li>
                    <li>HTTP-only session cookies</li>
                    <li>Regular security audits</li>
                    <li>Secure cloud hosting on Replit</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
                  <p className="text-muted-foreground">
                    <strong>We do not sell your personal data.</strong>
                  </p>
                  <p className="text-muted-foreground">
                    We may share data only in these cases:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>With your consent (e.g., public portfolio)</li>
                    <li>Payment processors (Razorpay) for transactions</li>
                    <li>Legal requirements or court orders</li>
                    <li>Certificate verification (public verification page)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                  <p className="text-muted-foreground">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and associated data</li>
                    <li>Export your learning progress and certificates</li>
                    <li>Opt out of non-essential communications</li>
                  </ul>
                  <p className="text-muted-foreground">
                    To exercise these rights, contact us at the address below.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain your data as long as your account is active. Upon account 
                    deletion, we remove personal data within 30 days. Certificate records 
                    may be retained for verification purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
                  <p className="text-muted-foreground">
                    OurShiksha is not intended for children under 13. We do not knowingly 
                    collect data from children under 13. If you believe a child has provided 
                    us data, please contact us immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Indian Data Practices</h2>
                  <p className="text-muted-foreground">
                    We comply with applicable Indian data protection regulations. Our servers 
                    and data processing are designed with Indian users in mind. We follow 
                    best practices as recommended by Indian regulatory authorities.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Policy Updates</h2>
                  <p className="text-muted-foreground">
                    We may update this policy periodically. Significant changes will be 
                    communicated via email or platform notification. Continued use after 
                    updates constitutes acceptance.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">Contact for Data Queries</h2>
                  <p className="text-muted-foreground">
                    For privacy-related questions or data requests, contact us at:{" "}
                    <a href={`mailto:${privacyEmail}`} className="text-primary hover:underline">
                      {privacyEmail}
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    OurShiksha<br />
                    {companyLocation}
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
