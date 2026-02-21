import { useState } from "react";
import { Link, useLocation, useSearch, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, GraduationCap, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading: authLoading, login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = new URLSearchParams(search).get("redirect") || "/shishya/dashboard";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
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
          toast({
            title: "Email not verified",
            description: "Please verify your email to continue",
          });
          setLocation(`/verify-otp?email=${encodeURIComponent(data.email)}&redirect=${encodeURIComponent(redirectTo)}`);
          return;
        }
        toast({
          title: "Login failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      login(result.user);
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully",
      });
      setLocation(redirectTo);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
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
      <div className="auth-card-icon">
        <GraduationCap />
      </div>
      <h2 className="auth-card-title">Welcome Back</h2>
      <p className="auth-card-description">Log in to continue your learning journey</p>

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
              placeholder="Enter your password"
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
        <span className="auth-divider-text">or</span>
        <div className="auth-divider-line" />
      </div>

      <Link href="/guru">
        <button className="auth-guru-btn" data-testid="button-guru">
          <Shield />
          Guru Admin Portal
        </button>
      </Link>
    </AuthLayout>
  );
}
