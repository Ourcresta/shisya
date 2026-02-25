import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, KeyRound, Shield } from "lucide-react";
import AuthLayout from "./AuthLayout";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState("/shishya/dashboard");
  const [verifyType, setVerifyType] = useState<"shishya" | "guru">("shishya");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const emailParam = params.get("email");
    const redirectParam = params.get("redirect");
    const typeParam = params.get("type");
    if (emailParam) {
      setEmail(emailParam);
    }
    if (redirectParam) {
      setRedirectTo(redirectParam);
    }
    if (typeParam === "guru") {
      setVerifyType("guru");
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
      const endpoint = verifyType === "guru"
        ? "/api/guru/auth/verify-otp"
        : "/api/auth/verify-otp";

      const response = await fetch(endpoint, {
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

      if (verifyType === "guru") {
        toast({
          title: "Guru account activated!",
          description: "You can now access the Guru admin portal",
        });
        setLocation("/guru/dashboard");
      } else {
        login(result.user);
        toast({
          title: "Email verified!",
          description: "Your account is now active",
        });
        setLocation(redirectTo);
      }
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
      const endpoint = verifyType === "guru"
        ? "/api/guru/auth/resend-otp"
        : "/api/auth/resend-otp";

      const response = await fetch(endpoint, {
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
        description: verifyType === "guru"
          ? "A new approval code has been sent to the admin"
          : "A new verification code has been sent to your email",
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

  const isGuru = verifyType === "guru";

  return (
    <AuthLayout>
      <div className="auth-card-icon" style={isGuru ? { background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' } : undefined}>
        {isGuru ? <Shield style={{ color: '#A78BFA' }} /> : <Mail />}
      </div>
      <h2 className="auth-card-title">
        {isGuru ? "Enter Approval Code" : "Verify Your Email"}
      </h2>
      <p className="auth-card-description">
        {isGuru ? (
          <>
            An approval OTP has been sent to the platform admin.<br />
            Enter the code shared by the admin to activate your Guru account for<br />
            <span style={{ color: '#A78BFA', fontWeight: 500 }}>{email}</span>
          </>
        ) : (
          <>
            We sent a verification code to<br />
            <span style={{ color: '#00dce0', fontWeight: 500 }}>{email}</span>
          </>
        )}
      </p>

      <form onSubmit={handleVerify}>
        <div>
          <label className="auth-form-label">
            {isGuru ? "Approval Code" : "Verification Code"}
          </label>
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
          style={isGuru ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' } : undefined}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isGuru ? "Activate Guru Account" : "Verify Email"}
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
