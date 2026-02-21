import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, KeyRound } from "lucide-react";
import AuthLayout from "./AuthLayout";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState("/shishya/dashboard");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const emailParam = params.get("email");
    const redirectParam = params.get("redirect");
    if (emailParam) {
      setEmail(emailParam);
    }
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }
  }, [search]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Verification failed",
          description: result.error || "Invalid verification code",
          variant: "destructive",
        });
        return;
      }

      login(result.user);
      toast({
        title: "Email verified!",
        description: "Your account is now active",
      });
      setLocation(redirectTo);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Resend failed",
          description: result.error || "Failed to resend code",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email",
      });
      setResendCooldown(60);
    } catch (error) {
      toast({
        title: "Resend failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card-icon">
        <Mail />
      </div>
      <h2 className="auth-card-title">Verify Your Email</h2>
      <p className="auth-card-description">
        We sent a verification code to<br />
        <span style={{ color: '#00dce0', fontWeight: 500 }}>{email}</span>
      </p>

      <form onSubmit={handleVerify}>
        <div>
          <label className="auth-form-label">Verification Code</label>
          <div className="auth-input-wrapper">
            <input
              type="text"
              placeholder="000000"
              className="auth-input-field auth-otp-input"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              data-testid="input-otp"
            />
            <KeyRound className="auth-input-icon" />
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isLoading || otp.length !== 6}
          data-testid="button-verify"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Verify Email
        </button>
      </form>

      <p className="auth-footer-text">
        Didn't receive the code?{" "}
        <button
          className="auth-resend-btn"
          disabled={isResending || resendCooldown > 0}
          onClick={handleResend}
          data-testid="button-resend"
        >
          {isResending && <Loader2 className="w-3 h-3 inline animate-spin mr-1" />}
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </p>
    </AuthLayout>
  );
}
