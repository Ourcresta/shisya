import { motion } from "framer-motion";
import { Code2, BarChart3, Atom, Lightbulb, BookOpen, Cpu, Globe } from "lucide-react";
import sealLogo from "@assets/image_1771692892158.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const floatingIcons = [
  { Icon: Code2, delay: 0, x: "12%", y: "18%", size: 22 },
  { Icon: BarChart3, delay: 1.5, x: "75%", y: "12%", size: 20 },
  { Icon: Atom, delay: 0.8, x: "20%", y: "68%", size: 24 },
  { Icon: Lightbulb, delay: 2, x: "68%", y: "72%", size: 18 },
  { Icon: BookOpen, delay: 0.5, x: "82%", y: "38%", size: 20 },
  { Icon: Cpu, delay: 1.2, x: "8%", y: "42%", size: 18 },
  { Icon: Globe, delay: 1.8, x: "55%", y: "88%", size: 22 },
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
        <div className="auth-nebula auth-nebula-3" />

        <div className="auth-shooting-star auth-shooting-star-1" />
        <div className="auth-shooting-star auth-shooting-star-2" />
        <div className="auth-shooting-star auth-shooting-star-3" />

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
            <motion.div
              className="auth-seal-container"
              initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="auth-seal-glow" />
              <img
                src={sealLogo}
                alt="OurShiksha Seal"
                className="auth-seal-image"
              />
            </motion.div>

            <h1 className="auth-brand-tagline">Welcome to the Future of Learning</h1>
            <div className="auth-brand-divider" />
            <p className="auth-brand-subtitle">
              Learn. Build. Get Certified.<br />
              Launch Your Career with AI Guidance.
            </p>
            <p className="auth-brand-powered">Powered by Usha AI Mentor</p>
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
