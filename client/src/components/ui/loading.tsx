import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <LoadingSpinner size="lg" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        <div className="h-20 w-full rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
}

export function LoadingSkeleton({ className, variant = "text" }: LoadingSkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rect: "rounded-md",
  };

  return (
    <div 
      className={cn(
        "skeleton-shimmer bg-muted", 
        variantClasses[variant], 
        className
      )} 
    />
  );
}
