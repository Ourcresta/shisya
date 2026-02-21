import { useState } from "react";
import { Link, useLocation, useSearch, Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import AuthLayout from "./AuthLayout";

export default function Signup() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    </AuthLayout>
  );
}
