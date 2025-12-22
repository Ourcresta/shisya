import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, KeyRound } from "lucide-react";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification code to<br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  data-testid="input-otp"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
              data-testid="button-verify"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify Email
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <Button
              variant="ghost"
              className="p-0 h-auto text-primary"
              disabled={isResending || resendCooldown > 0}
              onClick={handleResend}
              data-testid="button-resend"
            >
              {isResending ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : null}
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
