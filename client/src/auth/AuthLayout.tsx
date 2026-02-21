import { motion } from "framer-motion";
import { GraduationCap, Code2, BarChart3, Atom, Lightbulb, BookOpen, Cpu, Globe } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const floatingIcons = [
  { Icon: Code2, delay: 0, x: "15%", y: "20%", size: 22 },
  { Icon: BarChart3, delay: 1.5, x: "70%", y: "15%", size: 20 },
  { Icon: Atom, delay: 0.8, x: "25%", y: "65%", size: 24 },
  { Icon: Lightbulb, delay: 2, x: "65%", y: "70%", size: 18 },
  { Icon: BookOpen, delay: 0.5, x: "80%", y: "40%", size: 20 },
  { Icon: Cpu, delay: 1.2, x: "10%", y: "45%", size: 18 },
  { Icon: Globe, delay: 1.8, x: "50%", y: "85%", size: 22 },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-cosmic-bg">
        <div className="auth-stars" />
        <div className="auth-stars auth-stars-2" />
        <div className="auth-stars auth-stars-3" />

        <div className="auth-nebula auth-nebula-1" />
        <div className="auth-nebula auth-nebula-2" />

        <div className="auth-grid-overlay" />
      </div>

      <div className="auth-split-layout">
        <div className="auth-left-panel">
          <motion.div
            className="auth-branding"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="auth-logo-container">
              <div className="auth-logo-glow" />
              <GraduationCap className="auth-logo-icon" />
            </div>
            <h1 className="auth-brand-title">
              Our<span className="auth-brand-highlight">Shiksha</span>
            </h1>
            <p className="auth-brand-tagline">Welcome to the Future of Learning</p>
            <div className="auth-brand-divider" />
            <p className="auth-brand-subtitle">
              Master coding, earn certificates, and build your career with guided learning paths
            </p>
          </motion.div>

          <div className="auth-floating-icons">
            {floatingIcons.map(({ Icon, delay, x, y, size }, i) => (
              <motion.div
                key={i}
                className="auth-floating-icon"
                style={{ left: x, top: y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + delay * 0.3, duration: 0.5, ease: "easeOut" }}
              >
                <Icon style={{ width: size, height: size }} />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="auth-orb-container"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            <div className="auth-orb">
              <div className="auth-orb-ring auth-orb-ring-1" />
              <div className="auth-orb-ring auth-orb-ring-2" />
              <div className="auth-orb-ring auth-orb-ring-3" />
              <div className="auth-orb-core" />
            </div>
          </motion.div>
        </div>

        <div className="auth-right-panel">
          <motion.div
            className="auth-glass-card"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
