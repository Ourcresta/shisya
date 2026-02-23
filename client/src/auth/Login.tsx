import { useState, useEffect } from "react";
import { Link, useLocation, useSearch, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, GraduationCap, Shield, ShieldCheck, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";
import AuthLayout from "./AuthLayout";

const guruLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type GuruLoginInput = z.infer<typeof guruLoginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading: authLoading, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"shishya" | "guru">("shishya");
  const [rememberMe, setRememberMe] = useState(false);

  const searchParams = new URLSearchParams(search);
  const redirectTo = searchParams.get("redirect") || "/shishya/dashboard";
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        google_not_configured: "Google login is not configured yet. Please use email/password.",
        microsoft_not_configured: "Microsoft login is not configured yet. Please use email/password.",
        sso_not_configured: "SSO login is not configured yet. Please contact your administrator.",
        google_failed: "Google login failed. Please try again.",
        microsoft_failed: "Microsoft login failed. Please try again.",
        microsoft_token_failed: "Microsoft authentication failed. Please try again.",
        sso_failed: "SSO login failed. Please try again.",
        sso_token_failed: "SSO authentication failed. Please try again.",
        no_code: "Authentication was cancelled. Please try again.",
        no_email: "Could not retrieve your email from the provider.",
      };
      toast({
        title: "Login Issue",
        description: errorMessages[oauthError] || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/login");
    }
  }, [oauthError, toast]);

  const shishyaForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const guruForm = useForm<GuruLoginInput>({
    resolver: zodResolver(guruLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onShishyaSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.needsVerification) {
          toast({ title: "Email not verified", description: "Please verify your email to continue" });
          setLocation(`/verify-otp?email=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent(redirectTo)}`);
          return;
        }
        toast({ title: "Login failed", description: result.error || "Invalid credentials", variant: "destructive" });
        return;
      }
      login(result.user);
      toast({ title: "Welcome back!", description: "You have been logged in successfully" });
      setLocation(redirectTo);
    } catch (error) {
      toast({ title: "Login failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onGuruSubmit = async (data: GuruLoginInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/guru/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        toast({ title: "Login failed", description: result.error || "Invalid credentials", variant: "destructive" });
        return;
      }
      toast({ title: "Welcome to Guru", description: `Logged in as ${result.admin.name}` });
      setLocation("/guru/dashboard");
    } catch (error) {
      toast({ title: "Login failed", description: "Something went wrong. Please try again.", variant: "destructive" });
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

  const currentForm = activeTab === "shishya" ? shishyaForm : guruForm;
  const currentSubmit = activeTab === "shishya" ? onShishyaSubmit : onGuruSubmit;

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

      <h2 className="auth-card-title">Welcome Back</h2>
      <p className="auth-card-description">
        {activeTab === "shishya"
          ? "Log in to continue your learning journey"
          : "Log in to the Guru admin portal"}
      </p>

      <form onSubmit={currentForm.handleSubmit(currentSubmit as any)}>
        <div>
          <label className="auth-form-label">Email</label>
          <div className="auth-input-wrapper">
            <input
              type="email"
              placeholder="you@example.com"
              className="auth-input-field"
              data-testid="input-email"
              {...currentForm.register("email")}
            />
            <Mail className="auth-input-icon" />
          </div>
          {currentForm.formState.errors.email && (
            <p className="auth-error-text">{currentForm.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="auth-form-label">Password</label>
          <div className="auth-input-wrapper">
            <input
              type="password"
              placeholder="Enter your password"
              className="auth-input-field"
              data-testid="input-password"
              {...currentForm.register("password")}
            />
            <Lock className="auth-input-icon" />
          </div>
          {currentForm.formState.errors.password && (
            <p className="auth-error-text">{currentForm.formState.errors.password.message}</p>
          )}
        </div>

        <div className="auth-remember-row">
          <label className="auth-checkbox-label" data-testid="label-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="auth-checkbox"
            />
            <span className="auth-checkbox-custom" />
            Remember me
          </label>
          <button type="button" className="auth-forgot-link" data-testid="link-forgot-password">
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isLoading}
          data-testid="button-login"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Log In
        </button>
      </form>

      <p className="auth-footer-text">
        Don't have an account?{" "}
        <Link href="/signup" className="auth-footer-link" data-testid="link-signup">
          Sign up
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
        <a href="/api/oauth/microsoft" className="auth-social-btn" data-testid="button-microsoft">
          <svg viewBox="0 0 23 23" fill="none" className="w-5 h-5">
            <rect width="11" height="11" fill="#F25022"/>
            <rect x="12" width="11" height="11" fill="#7FBA00"/>
            <rect y="12" width="11" height="11" fill="#00A4EF"/>
            <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
          </svg>
          <span className="auth-social-tooltip">Microsoft</span>
        </a>
        <a href="/api/oauth/sso" className="auth-social-btn" data-testid="button-sso">
          <Building2 className="w-5 h-5" style={{ color: '#8B5CF6' }} />
          <span className="auth-social-tooltip">SSO</span>
        </a>
      </div>

      <div className="auth-security-badge">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your data is encrypted and secure</span>
      </div>
    </AuthLayout>
  );
}
