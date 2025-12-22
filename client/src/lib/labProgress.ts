import type { LabProgress, CourseLabProgress } from "@shared/schema";

const STORAGE_KEY = "shishya_lab_progress";

interface LabProgressStore {
  [courseId: number]: CourseLabProgress;
}

export function getLabProgressStore(): LabProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLabProgressStore(store: LabProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save lab progress:", error);
  }
}

export function getLabProgress(courseId: number, labId: number): LabProgress | null {
  const store = getLabProgressStore();
  return store[courseId]?.[labId] || null;
}

export function isLabCompleted(courseId: number, labId: number): boolean {
  const progress = getLabProgress(courseId, labId);
  return progress?.completed || false;
}

export function getCompletedLabsCount(courseId: number): number {
  const store = getLabProgressStore();
  const courseProgress = store[courseId];
  if (!courseProgress) return 0;
  
  return Object.values(courseProgress).filter(p => p.completed).length;
}

export function markLabCompleted(courseId: number, labId: number, userCode: string): LabProgress {
  const store = getLabProgressStore();
  
  if (!store[courseId]) {
    store[courseId] = {};
  }
  
  const progress: LabProgress = {
    labId,
    completed: true,
    completedAt: new Date().toISOString(),
    userCode,
  };
  
  store[courseId][labId] = progress;
  saveLabProgressStore(store);
  
  return progress;
}

export function saveLabCode(courseId: number, labId: number, userCode: string): void {
  const store = getLabProgressStore();
  
  if (!store[courseId]) {
    store[courseId] = {};
  }
  
  const existing = store[courseId][labId];
  store[courseId][labId] = {
    labId,
    completed: existing?.completed || false,
    completedAt: existing?.completedAt || null,
    userCode,
  };
  
  saveLabProgressStore(store);
}

export function getSavedLabCode(courseId: number, labId: number): string | null {
  const progress = getLabProgress(courseId, labId);
  return progress?.userCode || null;
}

export function getAllCompletedLabs(): { courseId: number; labId: number; completedAt: string }[] {
  const store = getLabProgressStore();
  const completed: { courseId: number; labId: number; completedAt: string }[] = [];
  
  Object.entries(store).forEach(([courseIdStr, courseProgress]) => {
    const courseId = parseInt(courseIdStr, 10);
    Object.values(courseProgress as CourseLabProgress).forEach((progress: LabProgress) => {
      if (progress.completed && progress.completedAt) {
        completed.push({
          courseId,
          labId: progress.labId,
          completedAt: progress.completedAt,
        });
      }
    });
  });
  
  return completed.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}
