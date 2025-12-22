import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <div className="flex justify-center">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(location)}`;
    return <Redirect to={redirectUrl} />;
  }

  return <>{children}</>;
}
