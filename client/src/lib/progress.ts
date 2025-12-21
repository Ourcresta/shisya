import type { CourseProgress, LessonProgress } from "@shared/schema";

const PROGRESS_KEY = "shisya_progress";

function getStoredProgress(): Record<number, CourseProgress> {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<number, CourseProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getCourseProgress(courseId: number): CourseProgress {
  const allProgress = getStoredProgress();
  return allProgress[courseId] || { courseId, completedLessons: [] };
}

export function isLessonCompleted(courseId: number, lessonId: number): boolean {
  const progress = getCourseProgress(courseId);
  return progress.completedLessons.some((l) => l.lessonId === lessonId);
}

export function markLessonComplete(courseId: number, lessonId: number): void {
  const allProgress = getStoredProgress();
  const courseProgress = allProgress[courseId] || { courseId, completedLessons: [] };
  
  if (!courseProgress.completedLessons.some((l) => l.lessonId === lessonId)) {
    const lessonProgress: LessonProgress = {
      lessonId,
      completedAt: new Date().toISOString(),
    };
    courseProgress.completedLessons.push(lessonProgress);
    allProgress[courseId] = courseProgress;
    saveProgress(allProgress);
  }
}

export function markLessonIncomplete(courseId: number, lessonId: number): void {
  const allProgress = getStoredProgress();
  const courseProgress = allProgress[courseId];
  
  if (courseProgress) {
    courseProgress.completedLessons = courseProgress.completedLessons.filter(
      (l) => l.lessonId !== lessonId
    );
    allProgress[courseId] = courseProgress;
    saveProgress(allProgress);
  }
}

export function getCompletedLessonsCount(courseId: number): number {
  const progress = getCourseProgress(courseId);
  return progress.completedLessons.length;
}
