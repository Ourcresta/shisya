import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Search, CheckCircle, XCircle, Award, Briefcase,
  Calendar, User, Tag, Star, Download, ExternalLink,
  Sparkles, GraduationCap, ArrowRight, Copy, Check
} from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { format } from "date-fns";

const C = {
  teal: "#6367FF",
  tealDark: "#4F46E5",
  purple: "#8494FF",
  bgDeep: "#F8F7FF",
  cardBg: "#FFFFFF",
  cardBorder: "#EDE9FF",
  textPrimary: "#1E1B4B",
  textSecondary: "#6B7280",
  heroGrad: "linear-gradient(135deg, #6367FF 0%, #8494FF 60%, #C9BEFF 100%)",
};

interface CertResult {
  valid: true;
  platform: "ourshiksha" | "ourudyog";
  certificateId: string;
  studentName: string;
  title: string;
  subtitle: string;
  type: string;
  level: string;
  skills: string;
  completionDate: string;
  performanceScore?: number;
  duration?: string;
}

type VerifyResponse = CertResult | { valid: false; error: string };

const SAMPLE_IDS = [
  "e.g. ABCD-EFGH-JKLM",
  "e.g. UD-2025-INTERN-001",
  "e.g. CERT-XXXX-XXXX",
];

export default function CertVerificationHub() {
  const [inputId, setInputId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const id = inputId.trim();
    if (!id) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/public/verify-certificate/${encodeURIComponent(id)}`);
      const data: VerifyResponse = await res.json();
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isShiksha = result?.valid && result.platform === "ourshiksha";
  const isUdyog = result?.valid && result.platform === "ourudyog";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: C.bgDeep,
        color: C.textPrimary,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <LandingNavbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(99,103,255,0.12) 0%, rgba(132,148,255,0.06) 55%, transparent 70%)",
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, rgba(99,103,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }} />

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 pt-12 pb-8 text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(99,103,255,0.15), rgba(132,148,255,0.15))",
              border: "1px solid rgba(99,103,255,0.30)",
              boxShadow: "0 0 40px rgba(99,103,255,0.15)",
            }}
          >
            <Shield className="w-8 h-8" style={{ color: C.teal }} />
          </div>

          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(99,103,255,0.10), rgba(132,148,255,0.06))",
              border: "1px solid rgba(99,103,255,0.22)",
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: C.teal }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: C.teal }}>
              Trusted Verification System
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}
          >
            <span style={{ color: C.textPrimary }}>Verify Your</span>{" "}
            <span style={{
              background: `linear-gradient(100deg, ${C.teal} 0%, #38BDF8 40%, #818CF8 75%, #A78BFA 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Certificate
            </span>
          </h1>

          <p className="text-base md:text-lg max-w-lg mx-auto mb-8" style={{ color: C.textSecondary, lineHeight: "1.6" }}>
            Enter your certificate number to instantly validate authenticity for
            <span style={{ color: C.teal }}> Our Shiksha</span> courses and
            <span style={{ color: "#A78BFA" }}> Our Udyog</span> internships.
          </p>

          {/* ── Search Form ── */}
          <form onSubmit={handleVerify} className="max-w-xl mx-auto">
            <div
              className="relative flex items-center rounded-2xl overflow-hidden"
              style={{
                background: "rgba(11,29,58,0.7)",
                border: `1px solid ${inputId ? "rgba(99,103,255,0.15)" : "rgba(99,103,255,0.15)"}`,
                boxShadow: inputId ? "0 0 0 3px rgba(99,103,255,0.09)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <Search className="absolute left-4 w-5 h-5 shrink-0" style={{ color: C.teal, opacity: 0.7 }} />
              <input
                ref={inputRef}
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Enter Certificate ID  (e.g. ABCD-EFGH-JKLM)"
                className="flex-1 bg-transparent outline-none py-4 pl-12 pr-4 text-sm md:text-base placeholder:text-[#3E5A7A]"
                style={{ color: C.textPrimary, fontFamily: "var(--font-mono, monospace)" }}
                data-testid="input-certificate-id"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!inputId.trim() || loading}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`,
                  color: C.bgDeep,
                }}
                data-testid="button-verify-certificate"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Verify <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            <p className="text-xs mt-2.5" style={{ color: "#3E5A7A" }}>
              Supports Our Shiksha course certificates & Our Udyog internship certificates
            </p>
          </form>
        </div>
      </section>

      {/* ── RESULT ── */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 w-full pb-16">
        <AnimatePresence mode="wait">

          {/* Loading skeleton */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="rounded-2xl p-8 space-y-5"
                style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: "blur(20px)" }}
              >
                {[80, 60, 40, 55].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 rounded-full animate-pulse"
                    style={{ width: `${w}%`, background: "rgba(99,103,255,0.10)" }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Network error */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-6 text-center"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
              data-testid="alert-network-error"
            >
              <XCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "#F87171" }} />
              <p style={{ color: "#FCA5A5" }}>{error}</p>
            </motion.div>
          )}

          {/* ── INVALID ── */}
          {!loading && result && !result.valid && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div
                className="rounded-2xl p-8 text-center"
                style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)", backdropFilter: "blur(20px)" }}
                data-testid="card-invalid-certificate"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <XCircle className="w-10 h-10" style={{ color: "#F87171" }} />
                </div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
                >
                  Invalid Certificate
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: C.textPrimary }}>
                  Certificate Not Found
                </h2>
                <p className="text-sm mb-6" style={{ color: C.textSecondary }}>
                  No certificate matching <span className="font-mono" style={{ color: "#FCA5A5" }}>{inputId}</span> was found in our records.
                  Please double-check the ID and try again.
                </p>
                <button
                  onClick={() => { setResult(null); setInputId(""); inputRef.current?.focus(); }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: C.textPrimary }}
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* ── VALID ── */}
          {!loading && result && result.valid && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              data-testid="card-valid-certificate"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: C.cardBg,
                  border: `1px solid ${isShiksha ? "rgba(99,103,255,0.28)" : "rgba(167,139,250,0.22)"}`,
                  backdropFilter: "blur(20px)",
                  boxShadow: isShiksha
                    ? "0 0 60px -10px rgba(99,103,255,0.15)"
                    : "0 0 60px -10px rgba(167,139,250,0.12)",
                }}
              >
                {/* Top accent bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: isShiksha
                      ? `linear-gradient(90deg, ${C.teal}, #38BDF8, ${C.purple})`
                      : `linear-gradient(90deg, #A78BFA, #8494FF, #38BDF8)`,
                  }}
                />

                <div className="p-7">
                  {/* Status badge row */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isShiksha ? "rgba(99,103,255,0.12)" : "rgba(167,139,250,0.1)",
                          border: isShiksha ? "1px solid rgba(99,103,255,0.28)" : "1px solid rgba(167,139,250,0.22)",
                        }}
                      >
                        {isShiksha
                          ? <GraduationCap className="w-6 h-6" style={{ color: C.teal }} />
                          : <Briefcase className="w-6 h-6" style={{ color: "#A78BFA" }} />
                        }
                      </div>
                      <div>
                        <div
                          className="text-xs font-semibold tracking-wide uppercase mb-0.5"
                          style={{ color: isShiksha ? C.teal : "#A78BFA" }}
                        >
                          {isShiksha ? "Our Shiksha" : "Our Udyog"}
                        </div>
                        <div className="text-xs" style={{ color: C.textSecondary }}>
                          {isShiksha ? "Course Certificate" : "Internship Certificate"}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
                      data-testid="badge-valid-status"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified Valid
                    </div>
                  </div>

                  {/* Student name headline */}
                  <div className="mb-6">
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: C.textSecondary }}>
                      Awarded To
                    </p>
                    <h2
                      className="text-2xl font-bold"
                      style={{ fontFamily: "var(--font-display)", color: C.textPrimary, letterSpacing: "-0.02em" }}
                      data-testid="text-student-name"
                    >
                      {result.studentName}
                    </h2>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <DetailCell
                      icon={<Award className="w-4 h-4" style={{ color: C.teal }} />}
                      label={isUdyog ? "Internship" : "Course"}
                      value={result.title}
                      testId="text-course-title"
                    />
                    <DetailCell
                      icon={<Tag className="w-4 h-4" style={{ color: isShiksha ? C.teal : "#A78BFA" }} />}
                      label={isUdyog ? "Role" : "Certificate Type"}
                      value={result.subtitle}
                    />
                    <DetailCell
                      icon={<Calendar className="w-4 h-4" style={{ color: C.teal }} />}
                      label="Completion Date"
                      value={format(new Date(result.completionDate), "MMMM d, yyyy")}
                      testId="text-completion-date"
                    />
                    {result.level && (
                      <DetailCell
                        icon={<Star className="w-4 h-4" style={{ color: C.teal }} />}
                        label={isUdyog ? "Domain" : "Level"}
                        value={result.level}
                      />
                    )}
                    {isUdyog && result.duration && (
                      <DetailCell
                        icon={<Briefcase className="w-4 h-4" style={{ color: "#A78BFA" }} />}
                        label="Duration"
                        value={result.duration}
                      />
                    )}
                    {isUdyog && result.performanceScore !== undefined && (
                      <DetailCell
                        icon={<Star className="w-4 h-4" style={{ color: "#A78BFA" }} />}
                        label="Performance Score"
                        value={`${result.performanceScore}%`}
                      />
                    )}
                  </div>

                  {/* Skills (OurShiksha only) */}
                  {isShiksha && result.skills && (
                    <div
                      className="rounded-xl p-4 mb-6"
                      style={{ background: "rgba(99,103,255,0.15)", border: "1px solid rgba(99,103,255,0.12)" }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: C.textSecondary }}>
                        Skills Validated
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.skills.split(",").filter(Boolean).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: "rgba(99,103,255,0.12)", border: "1px solid rgba(99,103,255,0.15)", color: C.teal }}
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificate ID row */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3 mb-6"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: C.textSecondary }}>Certificate ID</p>
                      <p
                        className="text-sm font-mono font-medium mt-0.5"
                        style={{ color: C.textPrimary, letterSpacing: "0.04em" }}
                        data-testid="text-certificate-id"
                      >
                        {result.certificateId}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(result.certificateId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: "rgba(99,103,255,0.09)", border: "1px solid rgba(99,103,255,0.15)", color: C.teal }}
                      data-testid="button-copy-cert-id"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={isShiksha ? `/verify/${result.certificateId}` : `/shishya/udyog/certificate/${result.certificateId}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={{
                        background: isShiksha
                          ? `linear-gradient(135deg, ${C.teal}, ${C.tealDark})`
                          : `linear-gradient(135deg, #A78BFA, #8494FF)`,
                        color: isShiksha ? C.bgDeep : "#fff",
                        boxShadow: isShiksha ? "0 4px 20px rgba(99,103,255,0.30)" : "0 4px 20px rgba(132,148,255,0.15)",
                      }}
                      data-testid="button-view-certificate"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Certificate
                    </Link>

                    <Link
                      href={isShiksha ? `/shishya/certificates/${result.certificateId}` : `/shishya/udyog`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                      style={{
                        background: "rgba(99,103,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: C.textPrimary,
                      }}
                      data-testid="button-download-certificate"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Platform info chips (idle state) ── */}
        {!result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex flex-col sm:flex-row gap-3"
          >
            {[
              {
                icon: GraduationCap,
                label: "Our Shiksha",
                sub: "Course completion certificates",
                color: C.teal,
                bg: "rgba(99,103,255,0.08)",
                border: "rgba(99,103,255,0.16)",
              },
              {
                icon: Briefcase,
                label: "Our Udyog",
                sub: "Virtual internship certificates",
                color: "#A78BFA",
                bg: "rgba(167,139,250,0.05)",
                border: "rgba(167,139,250,0.14)",
              },
            ].map(({ icon: Icon, label, sub, color, bg, border }) => (
              <div
                key={label}
                className="flex-1 flex items-center gap-3 rounded-xl px-4 py-4"
                style={{ background: bg, border: `1px solid ${border}` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${bg}`, border: `1px solid ${border}` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color, fontFamily: "var(--font-display)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <footer className="relative z-10 mt-auto py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center text-sm" style={{ color: C.textSecondary }}>
          <p>OurShiksha Certificate Verification · Powered by Our Platform</p>
        </div>
      </footer>
    </div>
  );
}

function DetailCell({
  icon, label, value, testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  testId?: string;
}) {
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#4E6D8C" }}>{label}</span>
      </div>
      <p className="text-sm font-semibold leading-snug" style={{ color: "#D0E8FF" }} data-testid={testId}>
        {value}
      </p>
    </div>
  );
}
