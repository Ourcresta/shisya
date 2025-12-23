import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/contexts/CreditContext";
import { useToast } from "@/hooks/use-toast";
import { Coins, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Course {
  id: number;
  title: string;
  creditCost?: number | null;
  isFree?: boolean | null;
}

interface EnrollmentModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrollmentSuccess?: () => void;
}

export function EnrollmentModal({
  course,
  open,
  onOpenChange,
  onEnrollmentSuccess,
}: EnrollmentModalProps) {
  const { balance, enrollInCourse, isEnrolling } = useCredits();
  const { toast } = useToast();
  const [enrollmentStatus, setEnrollmentStatus] = useState<"idle" | "success" | "error">("idle");

  if (!course) return null;

  const creditCost = course.isFree ? 0 : (course.creditCost ?? 0);
  const isFree = course.isFree || creditCost === 0;
  const hasEnoughCredits = isFree || balance >= creditCost;

  const handleEnroll = async () => {
    setEnrollmentStatus("idle");
    
    const result = await enrollInCourse(course.id, creditCost);
    
    if (result.success) {
      setEnrollmentStatus("success");
      toast({
        title: "Enrollment Successful",
        description: isFree 
          ? `You've enrolled in "${course.title}"!`
          : `You've enrolled in "${course.title}" for ${creditCost} credits.`,
      });
      
      setTimeout(() => {
        onOpenChange(false);
        setEnrollmentStatus("idle");
        onEnrollmentSuccess?.();
      }, 1500);
    } else {
      setEnrollmentStatus("error");
      toast({
        title: "Enrollment Failed",
        description: result.error || "Unable to enroll in this course.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-enrollment">
        <DialogHeader>
          <DialogTitle data-testid="text-enrollment-title">
            {enrollmentStatus === "success" ? "Enrollment Complete" : "Enroll in Course"}
          </DialogTitle>
          <DialogDescription data-testid="text-enrollment-course">
            {course.title}
          </DialogDescription>
        </DialogHeader>

        {enrollmentStatus === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-center text-muted-foreground">
              You're now enrolled! Redirecting to course...
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="text-sm text-muted-foreground">Course Cost</span>
              {isFree ? (
                <Badge variant="secondary" data-testid="badge-free">
                  Free
                </Badge>
              ) : (
                <div className="flex items-center gap-2" data-testid="text-credit-cost">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">{creditCost} credits</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="text-sm text-muted-foreground">Your Balance</span>
              <div className="flex items-center gap-2" data-testid="text-user-balance">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">{balance} credits</span>
              </div>
            </div>

            {!isFree && (
              <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
                <span className="text-sm text-muted-foreground">After Enrollment</span>
                <div className="flex items-center gap-2" data-testid="text-remaining-balance">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">{balance - creditCost} credits</span>
                </div>
              </div>
            )}

            {!hasEnoughCredits && (
              <div className="flex items-start gap-2 p-4 rounded-md bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Insufficient Credits</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need {creditCost - balance} more credits to enroll in this course.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {enrollmentStatus !== "success" && (
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isEnrolling}
              data-testid="button-cancel-enrollment"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={!hasEnoughCredits || isEnrolling}
              data-testid="button-confirm-enrollment"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : isFree ? (
                "Enroll for Free"
              ) : (
                `Enroll for ${creditCost} Credits`
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
