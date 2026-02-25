import { useState } from "react";
import { Link, useLocation, useSearch, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, GraduationCap, Shield, ShieldCheck, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import AuthLayout from "./AuthLayout";

export default function Signup() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"shishya" | "guru">("shishya");

  const redirectTo = new URLSearchParams(search).get("redirect") || "/shishya/dashboard";

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
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

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="auth-form-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="auth-input-field"
                  data-testid="input-email"
                  {...form.register("email")}
                />
                <Mail className="auth-input-icon" />
              </div>
              {form.formState.errors.email && (
                <p className="auth-error-text">{form.formState.errors.email.message}</p>
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
                  {...form.register("password")}
                />
                <Lock className="auth-input-icon" />
              </div>
              {form.formState.errors.password && (
                <p className="auth-error-text">{form.formState.errors.password.message}</p>
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
          <div className="auth-card-icon">
            <Shield />
          </div>
          <h2 className="auth-card-title">Guru Admin Access</h2>
          <p className="auth-card-description">Admin accounts are managed by the platform</p>

          <div style={{
            textAlign: 'center',
            padding: '2rem 1.5rem',
            margin: '1rem 0',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.06)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Shield style={{ width: '24px', height: '24px', color: '#A78BFA' }} />
            </div>
            <p style={{ color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Guru accounts are provisioned by administrators
            </p>
            <p style={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.5 }}>
              If you are an instructor or admin, please contact the platform administrator to get your credentials.
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
