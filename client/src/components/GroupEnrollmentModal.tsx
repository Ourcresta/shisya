import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Coins,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  X,
  BookOpen,
  Layers,
  Trophy,
} from "lucide-react";
import type { Course } from "@shared/schema";

interface GroupDetail {
  id: number;
  name: string;
  groupType: string;
  price: number;
  courses: Course[];
}

interface GroupEnrollmentModalProps {
  group: GroupDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrollmentSuccess?: () => void;
}

const C = {
  teal: "#00F5FF",
  purple: "#7C3AED",
  bgCard: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  textSecondary: "#94A3B8",
};

export function GroupEnrollmentModal({
  group,
  open,
  onOpenChange,
  onEnrollmentSuccess,
}: GroupEnrollmentModalProps) {
  const { user } = useAuth();
  const { balance, enrollInCourse, enrollments } = useCredits();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [enrollingIndex, setEnrollingIndex] = useState<number>(-1);
  const [enrolledInSession, setEnrolledInSession] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"idle" | "enrolling" | "success" | "error">("idle");

  if (!group) return null;

  const isTrack = group.groupType === "track";
  const accentColor = isTrack ? C.teal : "#A78BFA";
  const accentBg = isTrack ? "rgba(0,245,255,0.1)" : "rgba(124,58,237,0.15)";
  const accentBorder = isTrack ? "rgba(0,245,255,0.2)" : "rgba(124,58,237,0.3)";

  const isAlreadyEnrolled = (courseId: number) =>
    enrollments.some(e => e.courseId === courseId) || enrolledInSession.has(courseId);

  const unenrolledCourses = group.courses.filter(c => !isAlreadyEnrolled(c.id));

  const totalCost = unenrolledCourses.reduce((sum, c) => {
    if (c.isFree || !c.creditCost) return sum;
    return sum + c.creditCost;
  }, 0);

  const hasEnoughCredits = balance >= totalCost;

  const handleContinueEnroll = async () => {
    if (unenrolledCourses.length === 0) {
      onOpenChange(false);
      onEnrollmentSuccess?.();
      return;
    }

    setStatus("enrolling");
    let anyFailed = false;

    for (let i = 0; i < unenrolledCourses.length; i++) {
      const course = unenrolledCourses[i];
      const cost = course.isFree || !course.creditCost ? 0 : course.creditCost;
      setEnrollingIndex(i);

      const result = await enrollInCourse(course.id, cost);
      if (result.success) {
        setEnrolledInSession(prev => new Set([...prev, course.id]));
      } else {
        anyFailed = true;
        toast({
          title: "Enrollment Failed",
          description: `Could not enroll in "${course.title}". ${result.error || ""}`,
          variant: "destructive",
        });
      }
    }

    setEnrollingIndex(-1);

    if (!anyFailed) {
      setStatus("success");
      toast({
        title: "All Courses Enrolled!",
        description: `You're now enrolled in all ${group.courses.length} courses in this ${isTrack ? "track" : "program"}.`,
      });
      setTimeout(() => {
        onOpenChange(false);
        setStatus("idle");
        setEnrolledInSession(new Set());
        onEnrollmentSuccess?.();
      }, 2000);
    } else {
      setStatus("idle");
    }
  };

  const handleClose = () => {
    if (status === "enrolling") return;
    onOpenChange(false);
    setStatus("idle");
    setEnrolledInSession(new Set());
    setEnrollingIndex(-1);
  };

  const handleLoginToEnroll = () => {
    onOpenChange(false);
    navigate("/login");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        style={{
          background: "#0B1D3A",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        }}
        data-testid="dialog-group-enrollment"
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
            >
              {isTrack
                ? <Layers className="w-4.5 h-4.5" style={{ color: accentColor }} />
                : <Trophy className="w-4.5 h-4.5" style={{ color: accentColor }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-white text-base font-semibold leading-snug" data-testid="text-group-modal-title">
                Enroll in {isTrack ? "Track" : "Program"}
              </DialogTitle>
              <p className="text-sm mt-0.5 truncate" style={{ color: C.textSecondary }} data-testid="text-group-modal-name">
                {group.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <CheckCircle className="w-9 h-9 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">All Enrolled!</p>
              <p className="text-sm mt-1" style={{ color: C.textSecondary }}>
                You're now enrolled in all {group.courses.length} courses. Closing shortly…
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2" data-testid="list-group-courses">
              {group.courses.map((course, idx) => {
                const cost = course.isFree || !course.creditCost ? 0 : course.creditCost;
                const enrolled = isAlreadyEnrolled(course.id);
                const isEnrollingThis = status === "enrolling" && unenrolledCourses[enrollingIndex]?.id === course.id;

                return (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      background: enrolled
                        ? "rgba(16,185,129,0.07)"
                        : isEnrollingThis
                        ? "rgba(0,245,255,0.06)"
                        : C.bgCard,
                      border: `1px solid ${enrolled ? "rgba(16,185,129,0.2)" : isEnrollingThis ? "rgba(0,245,255,0.2)" : C.cardBorder}`,
                    }}
                    data-testid={`row-group-course-${course.id}`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: "rgba(255,255,255,0.06)", color: C.textSecondary }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{course.title}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEnrollingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
                      ) : enrolled ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400" data-testid={`badge-enrolled-${course.id}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enrolled
                        </div>
                      ) : cost === 0 ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}
                          data-testid={`badge-free-${course.id}`}
                        >
                          FREE
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "#F59E0B" }} data-testid={`text-cost-${course.id}`}>
                          <Coins className="w-3.5 h-3.5" />
                          <span className="font-semibold">{cost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {user ? (
              <div className="px-6 pb-6 pt-4 space-y-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {unenrolledCourses.length === 0 ? (
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl text-sm"
                    style={{ background: "rgba(16,185,129,0.08)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    You're already enrolled in all courses in this {isTrack ? "track" : "program"}!
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm" style={{ color: C.textSecondary }}>Your balance</span>
                      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#F59E0B" }} data-testid="text-group-balance">
                        <Coins className="w-4 h-4" />
                        {balance} credits
                      </div>
                    </div>

                    {totalCost > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm" style={{ color: C.textSecondary }}>Total cost</span>
                        <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#F59E0B" }} data-testid="text-group-total-cost">
                          <Coins className="w-4 h-4" />
                          {totalCost} credits
                        </div>
                      </div>
                    )}

                    {!hasEnoughCredits && totalCost > 0 && (
                      <div
                        className="flex items-start gap-2 p-3 rounded-xl text-sm"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                        data-testid="alert-insufficient-credits"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-400">Insufficient Credits</p>
                          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                            You need {totalCost - balance} more credits.{" "}
                            <button
                              onClick={() => { handleClose(); navigate("/shishya/wallet"); }}
                              className="underline text-blue-400 hover:text-blue-300"
                              data-testid="link-top-up-credits"
                            >
                              Top up credits
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={status === "enrolling"}
                    className="flex-1 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                    data-testid="button-group-discard"
                  >
                    {unenrolledCourses.length === 0 ? "Close" : "Discard"}
                  </Button>

                  {unenrolledCourses.length > 0 && (
                    <Button
                      onClick={handleContinueEnroll}
                      disabled={(!hasEnoughCredits && totalCost > 0) || status === "enrolling"}
                      className="flex-[2] font-semibold text-sm"
                      style={{
                        background: (!hasEnoughCredits && totalCost > 0) || status === "enrolling"
                          ? "rgba(255,255,255,0.08)"
                          : isTrack
                          ? "linear-gradient(135deg, rgba(0,245,255,0.85), rgba(6,182,212,0.8))"
                          : "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(139,92,246,0.85))",
                        color: (!hasEnoughCredits && totalCost > 0) ? C.textSecondary : "#fff",
                        boxShadow: (!hasEnoughCredits && totalCost > 0) || status === "enrolling"
                          ? "none"
                          : isTrack
                          ? "0 4px 16px -4px rgba(0,245,255,0.3)"
                          : "0 4px 16px -4px rgba(124,58,237,0.4)",
                      }}
                      data-testid="button-continue-enroll"
                    >
                      {status === "enrolling" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enrolling {enrollingIndex + 1} of {unenrolledCourses.length}…
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Continue Enroll
                          {totalCost > 0 && ` · ${totalCost} Credits`}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6 pt-4 space-y-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  {totalCost > 0
                    ? `This ${isTrack ? "track" : "program"} requires ${totalCost} credits. Log in to enroll.`
                    : `Log in to start learning this ${isTrack ? "track" : "program"} for free.`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                    data-testid="button-group-discard-guest"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Discard
                  </Button>
                  <Button
                    onClick={handleLoginToEnroll}
                    className="flex-[2] font-semibold"
                    style={{
                      background: isTrack
                        ? "linear-gradient(135deg, rgba(0,245,255,0.85), rgba(6,182,212,0.8))"
                        : "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(139,92,246,0.85))",
                      color: "#fff",
                      boxShadow: isTrack
                        ? "0 4px 16px -4px rgba(0,245,255,0.3)"
                        : "0 4px 16px -4px rgba(124,58,237,0.4)",
                    }}
                    data-testid="button-login-to-enroll"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Enroll
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
