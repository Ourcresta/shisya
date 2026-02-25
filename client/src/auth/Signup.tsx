import { useState } from "react";
import { Link, useLocation, useSearch, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, GraduationCap, Shield, ShieldCheck, UserPlus, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import AuthLayout from "./AuthLayout";

const guruSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type GuruSignupInput = z.infer<typeof guruSignupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"shishya" | "guru">("shishya");

  const redirectTo = new URLSearchParams(search).get("redirect") || "/shishya/dashboard";

  const shishyaForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const guruForm = useForm<GuruSignupInput>({
    resolver: zodResolver(guruSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onShishyaSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Signup failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification code sent",
        description: "Check your email for the verification code",
      });

      setLocation(`/verify-otp?email=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent(redirectTo)}`);
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGuruSubmit = async (data: GuruSignupInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/guru/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Signup failed",
          description: result.error || "Failed to create admin account",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Approval OTP sent",
        description: "A verification code has been sent to the admin for approval",
      });

      setLocation(`/verify-otp?email=${encodeURIComponent(data.email)}&type=guru&redirect=${encodeURIComponent("/guru/dashboard")}`);
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <Card className="w-full max-w-md bg-slate-900/50 border-cyan-500/20">
          <div className="pt-8 pb-8 space-y-4 px-6">
            <div className="flex justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/shishya/dashboard" />;
  }

  return (
    <AuthLayout>
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === "shishya" ? "auth-tab-active" : ""}`}
          onClick={() => setActiveTab("shishya")}
          data-testid="tab-shishya"
        >
          <GraduationCap className="w-4 h-4" />
          Shishya
        </button>
        <button
          className={`auth-tab ${activeTab === "guru" ? "auth-tab-active" : ""}`}
          onClick={() => setActiveTab("guru")}
          data-testid="tab-guru"
        >
          <Shield className="w-4 h-4" />
          Guru
        </button>
      </div>

      {activeTab === "shishya" ? (
        <>
          <div className="auth-card-icon">
            <UserPlus />
          </div>
          <h2 className="auth-card-title">Create Your Account</h2>
          <p className="auth-card-description">Join SHISHYA and start learning today</p>

          <form onSubmit={shishyaForm.handleSubmit(onShishyaSubmit)}>
            <div>
              <label className="auth-form-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="auth-input-field"
                  data-testid="input-email"
                  {...shishyaForm.register("email")}
                />
                <Mail className="auth-input-icon" />
              </div>
              {shishyaForm.formState.errors.email && (
                <p className="auth-error-text">{shishyaForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="auth-form-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  className="auth-input-field"
                  data-testid="input-password"
                  {...shishyaForm.register("password")}
                />
                <Lock className="auth-input-icon" />
              </div>
              {shishyaForm.formState.errors.password && (
                <p className="auth-error-text">{shishyaForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              data-testid="button-signup"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign Up
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link href="/login" className="auth-footer-link" data-testid="link-login">
              Log in
            </Link>
          </p>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">OR</span>
            <div className="auth-divider-line" />
          </div>

          <div className="auth-social-buttons">
            <a href="/api/oauth/google" className="auth-social-btn" data-testid="button-google">
              <SiGoogle style={{ color: '#4285F4' }} />
              <span className="auth-social-tooltip">Google</span>
            </a>
          </div>

          <div className="auth-security-badge">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Your data is encrypted and secure</span>
          </div>
        </>
      ) : (
        <>
          <div className="auth-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Shield style={{ color: '#A78BFA' }} />
          </div>
          <h2 className="auth-card-title">Register as Guru</h2>
          <p className="auth-card-description">Apply for admin access to the Guru portal</p>

          <form onSubmit={guruForm.handleSubmit(onGuruSubmit)}>
            <div>
              <label className="auth-form-label">Full Name</label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  placeholder="Your full name"
                  className="auth-input-field"
                  data-testid="input-guru-name"
                  {...guruForm.register("name")}
                />
                <User className="auth-input-icon" />
              </div>
              {guruForm.formState.errors.name && (
                <p className="auth-error-text">{guruForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="auth-form-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="auth-input-field"
                  data-testid="input-guru-email"
                  {...guruForm.register("email")}
                />
                <Mail className="auth-input-icon" />
              </div>
              {guruForm.formState.errors.email && (
                <p className="auth-error-text">{guruForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="auth-form-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="auth-input-field"
                  data-testid="input-guru-password"
                  {...guruForm.register("password")}
                />
                <Lock className="auth-input-icon" />
              </div>
              {guruForm.formState.errors.password && (
                <p className="auth-error-text">{guruForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
              data-testid="button-guru-signup"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Request Admin Access
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            padding: '0.75rem 1rem',
            margin: '0.75rem 0 0',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
          }}>
            <p style={{ color: '#94A3B8', fontSize: '0.75rem', lineHeight: 1.5, margin: 0 }}>
              A verification OTP will be sent to the platform admin for approval. You'll need the admin-shared code to complete registration.
            </p>
          </div>

          <p className="auth-footer-text">
            Already have Guru credentials?{" "}
            <Link href="/login" className="auth-footer-link" data-testid="link-guru-login">
              Log in here
            </Link>
          </p>

          <div className="auth-security-badge">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Your data is encrypted and secure</span>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
