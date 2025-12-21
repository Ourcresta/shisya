import { useState, useCallback, useMemo } from "react";
import { 
  getCourseProgress, 
  isLessonCompleted as checkLessonCompleted,
  markLessonComplete as saveLessonComplete,
  markLessonIncomplete as saveLessonIncomplete,
  getCompletedLessonsCount
} from "@/lib/progress";

// Custom hook for managing lesson progress with React state
export function useProgress(courseId: number) {
  // Use a version counter to force re-renders when progress changes
  const [version, setVersion] = useState(0);

  const progress = useMemo(() => {
    // This dependency on version ensures we re-read from localStorage
    void version;
    return getCourseProgress(courseId);
  }, [courseId, version]);

  const completedCount = useMemo(() => {
    void version;
    return getCompletedLessonsCount(courseId);
  }, [courseId, version]);

  const isLessonCompleted = useCallback((lessonId: number): boolean => {
    return checkLessonCompleted(courseId, lessonId);
  }, [courseId, version]);

  const markLessonComplete = useCallback((lessonId: number) => {
    saveLessonComplete(courseId, lessonId);
    setVersion(v => v + 1);
  }, [courseId]);

  const markLessonIncomplete = useCallback((lessonId: number) => {
    saveLessonIncomplete(courseId, lessonId);
    setVersion(v => v + 1);
  }, [courseId]);

  const toggleLessonComplete = useCallback((lessonId: number): boolean => {
    const isCompleted = checkLessonCompleted(courseId, lessonId);
    if (isCompleted) {
      saveLessonIncomplete(courseId, lessonId);
    } else {
      saveLessonComplete(courseId, lessonId);
    }
    setVersion(v => v + 1);
    return !isCompleted;
  }, [courseId]);

  const refreshProgress = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  return {
    progress,
    completedCount,
    isLessonCompleted,
    markLessonComplete,
    markLessonIncomplete,
    toggleLessonComplete,
    refreshProgress,
  };
}
