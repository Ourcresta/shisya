import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { 
  getCourseProgress, 
  isLessonCompleted as checkLessonCompleted,
  markLessonComplete as saveLessonComplete,
  markLessonIncomplete as saveLessonIncomplete,
  getCompletedLessonsCount
} from "@/lib/progress";

interface ProgressContextValue {
  version: number;
  refreshProgress: () => void;
  isLessonCompleted: (courseId: number, lessonId: number) => boolean;
  getCompletedCount: (courseId: number) => number;
  getCourseProgressData: (courseId: number) => ReturnType<typeof getCourseProgress>;
  toggleLessonComplete: (courseId: number, lessonId: number) => boolean;
  markLessonComplete: (courseId: number, lessonId: number) => void;
  markLessonIncomplete: (courseId: number, lessonId: number) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);

  const refreshProgress = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  // Listen to storage events for cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "shishya_progress") {
        refreshProgress();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshProgress]);

  // Listen to visibility change to refresh when coming back to the tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshProgress();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refreshProgress]);

  const isLessonCompleted = useCallback((courseId: number, lessonId: number): boolean => {
    return checkLessonCompleted(courseId, lessonId);
  }, [version]);

  const getCompletedCount = useCallback((courseId: number): number => {
    return getCompletedLessonsCount(courseId);
  }, [version]);

  const getCourseProgressData = useCallback((courseId: number) => {
    return getCourseProgress(courseId);
  }, [version]);

  const markLessonComplete = useCallback((courseId: number, lessonId: number) => {
    saveLessonComplete(courseId, lessonId);
    setVersion(v => v + 1);
  }, []);

  const markLessonIncomplete = useCallback((courseId: number, lessonId: number) => {
    saveLessonIncomplete(courseId, lessonId);
    setVersion(v => v + 1);
  }, []);

  const toggleLessonComplete = useCallback((courseId: number, lessonId: number): boolean => {
    const isCompleted = checkLessonCompleted(courseId, lessonId);
    if (isCompleted) {
      saveLessonIncomplete(courseId, lessonId);
    } else {
      saveLessonComplete(courseId, lessonId);
    }
    setVersion(v => v + 1);
    return !isCompleted;
  }, []);

  const value = useMemo(() => ({
    version,
    refreshProgress,
    isLessonCompleted,
    getCompletedCount,
    getCourseProgressData,
    toggleLessonComplete,
    markLessonComplete,
    markLessonIncomplete,
  }), [version, refreshProgress, isLessonCompleted, getCompletedCount, getCourseProgressData, toggleLessonComplete, markLessonComplete, markLessonIncomplete]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgressContext must be used within a ProgressProvider");
  }
  return context;
}

// Hook for course-scoped progress operations
export function useCourseProgress(courseId: number) {
  const context = useProgressContext();
  
  const isLessonCompleted = useCallback((lessonId: number): boolean => {
    return context.isLessonCompleted(courseId, lessonId);
  }, [context, courseId]);

  const toggleLessonComplete = useCallback((lessonId: number): boolean => {
    return context.toggleLessonComplete(courseId, lessonId);
  }, [context, courseId]);

  const completedCount = useMemo(() => {
    return context.getCompletedCount(courseId);
  }, [context, courseId, context.version]);

  const progress = useMemo(() => {
    return context.getCourseProgressData(courseId);
  }, [context, courseId, context.version]);

  return {
    progress,
    completedCount,
    isLessonCompleted,
    toggleLessonComplete,
    refreshProgress: context.refreshProgress,
  };
}
