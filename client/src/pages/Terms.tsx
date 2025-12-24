import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, FileText } from "lucide-react";
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

export default function Terms() {
  const { data: config } = useQuery<PublicConfig>({
    queryKey: ["/api/config/public"],
  });

  const legalEmail = config?.legalEmail || "legal@ourshiksha.com";

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
                <FileText className="w-4 h-4" />
                Legal
              </Badge>
              
              <h1 
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>
              
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Platform Usage</h2>
                  <p className="text-muted-foreground">
                    OurShiksha is an educational platform providing online courses, practice labs, 
                    tests, and certification services. By using our platform, you agree to these 
                    terms and our commitment to quality education.
                  </p>
                  <p className="text-muted-foreground">
                    You must be at least 13 years old to use OurShiksha. Users under 18 should 
                    have parental consent. We reserve the right to modify or discontinue services 
                    with reasonable notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Account Responsibility</h2>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the security of your account credentials. 
                    Do not share your login details with others. Each account is personal and 
                    non-transferable.
                  </p>
                  <p className="text-muted-foreground">
                    You must provide accurate information during registration. We may suspend 
                    accounts that violate our policies or contain false information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Course Access & Credits</h2>
                  <p className="text-muted-foreground">
                    OurShiksha uses a credit-based system for accessing premium features. 
                    Credits are used for AI tutoring, labs, tests, project evaluations, and 
                    certificate generation.
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Free signup credits (500) never expire</li>
                    <li>Subscription credits reset monthly and don't carry over</li>
                    <li>Purchased coin packs never expire</li>
                    <li>Credits are non-transferable between accounts</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Payments & Refunds</h2>
                  <p className="text-muted-foreground">
                    Payments are processed securely through Razorpay. We accept UPI, cards, 
                    net banking, and popular wallets.
                  </p>
                  <p className="text-muted-foreground">
                    Refunds are considered on a case-by-case basis within 7 days of purchase 
                    if credits remain unused. Subscription fees are non-refundable once the 
                    billing cycle begins. Contact support for refund requests.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Academic Integrity</h2>
                  <p className="text-muted-foreground">
                    We take academic integrity seriously. The following are strictly prohibited:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Sharing test questions or answers with others</li>
                    <li>Using unauthorized assistance during tests</li>
                    <li>Submitting work that is not your own</li>
                    <li>Attempting to manipulate scores or certificates</li>
                    <li>Creating multiple accounts for unfair advantage</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Violations may result in certificate revocation and account termination.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Certificate Authenticity</h2>
                  <p className="text-muted-foreground">
                    Certificates issued by OurShiksha are verifiable through our public 
                    verification system. Each certificate has a unique ID and QR code.
                  </p>
                  <p className="text-muted-foreground">
                    We reserve the right to revoke certificates if we discover they were 
                    obtained through fraudulent means. Certificate authenticity is guaranteed 
                    for legitimately earned credentials.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Misuse & Termination</h2>
                  <p className="text-muted-foreground">
                    We may terminate or suspend accounts that:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Violate academic integrity policies</li>
                    <li>Attempt to exploit or hack the platform</li>
                    <li>Harass other users or staff</li>
                    <li>Use the platform for illegal activities</li>
                    <li>Violate any part of these terms</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    OurShiksha provides educational content "as is" without warranties of 
                    any kind. We are not liable for career outcomes, employment decisions, 
                    or any indirect damages resulting from platform use.
                  </p>
                  <p className="text-muted-foreground">
                    Our liability is limited to the amount you paid for services in the 
                    preceding 12 months.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
                  <p className="text-muted-foreground">
                    These terms are governed by the laws of India. Any disputes shall be 
                    resolved in the courts of Chennai, Tamil Nadu, India.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
                  <p className="text-muted-foreground">
                    For questions about these terms, contact us at{" "}
                    <a href={`mailto:${legalEmail}`} className="text-primary hover:underline">
                      {legalEmail}
                    </a>
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
