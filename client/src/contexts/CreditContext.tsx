import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface CreditBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

interface EnrollmentInfo {
  id: number;
  userId: string;
  courseId: number;
  enrolledAt: string;
  creditsPaid: number;
}

interface CreditContextType {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  isLoading: boolean;
  error: Error | null;
  refetchCredits: () => void;
  enrollInCourse: (courseId: number, creditCost: number) => Promise<{ success: boolean; error?: string; newBalance?: number }>;
  isEnrolling: boolean;
  checkEnrollment: (courseId: number) => Promise<{ enrolled: boolean; enrollment?: EnrollmentInfo }>;
  enrollments: EnrollmentInfo[];
  isLoadingEnrollments: boolean;
}

const CreditContext = createContext<CreditContextType | null>(null);

export function CreditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const {
    data: creditData,
    isLoading,
    error,
    refetch: refetchCredits,
  } = useQuery<CreditBalance>({
    queryKey: ["/api/user/credits"],
    enabled: !!user,
    staleTime: 30000,
  });

  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
  } = useQuery<EnrollmentInfo[]>({
    queryKey: ["/api/user/credits/enrollments"],
    enabled: !!user,
    staleTime: 30000,
  });

  const enrollMutation = useMutation({
    mutationFn: async ({ courseId, creditCost }: { courseId: number; creditCost: number }) => {
      const response = await apiRequest("POST", "/api/user/credits/enrollments", {
        courseId,
        creditCost,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits/enrollments"] });
    },
  });

  const enrollInCourse = useCallback(
    async (courseId: number, creditCost: number): Promise<{ success: boolean; error?: string; newBalance?: number }> => {
      try {
        const result = await enrollMutation.mutateAsync({ courseId, creditCost });
        if (result.success) {
          return { success: true, newBalance: result.newBalance };
        }
        return { success: false, error: result.error || "Enrollment failed" };
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to enroll in course";
        return { success: false, error: errorMessage };
      }
    },
    [enrollMutation]
  );

  const checkEnrollment = useCallback(
    async (courseId: number): Promise<{ enrolled: boolean; enrollment?: EnrollmentInfo }> => {
      try {
        const response = await fetch(`/api/user/credits/enrollments/check/${courseId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          return { enrolled: false };
        }
        const data = await response.json();
        return { enrolled: data.enrolled, enrollment: data.enrollment };
      } catch {
        return { enrolled: false };
      }
    },
    []
  );

  const value: CreditContextType = {
    balance: creditData?.balance ?? 0,
    totalEarned: creditData?.totalEarned ?? 0,
    totalSpent: creditData?.totalSpent ?? 0,
    isLoading,
    error: error as Error | null,
    refetchCredits,
    enrollInCourse,
    isEnrolling: enrollMutation.isPending,
    checkEnrollment,
    enrollments: enrollmentsData ?? [],
    isLoadingEnrollments,
  };

  return <CreditContext.Provider value={value}>{children}</CreditContext.Provider>;
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
