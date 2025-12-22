import type { ProjectSubmission } from "@shared/schema";

const STORAGE_KEY = "shisya_project_submissions";

interface SubmissionsStore {
  [courseId: number]: {
    [projectId: number]: ProjectSubmission;
  };
}

// Get all submissions from localStorage
function getSubmissionsStore(): SubmissionsStore {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Save submissions to localStorage
function saveSubmissionsStore(store: SubmissionsStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save submissions:", error);
  }
}

// Get submission for a specific project
export function getProjectSubmission(courseId: number, projectId: number): ProjectSubmission | null {
  const store = getSubmissionsStore();
  return store[courseId]?.[projectId] || null;
}

// Check if a project has been submitted
export function isProjectSubmitted(courseId: number, projectId: number): boolean {
  const submission = getProjectSubmission(courseId, projectId);
  return submission?.submitted === true;
}

// Save a project submission
export function saveProjectSubmission(
  courseId: number,
  projectId: number,
  data: { githubUrl: string; liveUrl?: string; notes?: string }
): ProjectSubmission {
  const store = getSubmissionsStore();
  
  const submission: ProjectSubmission = {
    projectId,
    courseId,
    githubUrl: data.githubUrl,
    liveUrl: data.liveUrl || null,
    notes: data.notes || null,
    submitted: true,
    submittedAt: new Date().toISOString(),
  };

  if (!store[courseId]) {
    store[courseId] = {};
  }
  store[courseId][projectId] = submission;
  
  saveSubmissionsStore(store);
  return submission;
}

// Get all submissions for a course
export function getCourseSubmissions(courseId: number): Record<number, ProjectSubmission> {
  const store = getSubmissionsStore();
  return store[courseId] || {};
}

// Get count of submitted projects for a course
export function getSubmittedProjectsCount(courseId: number): number {
  const submissions = getCourseSubmissions(courseId);
  return Object.values(submissions).filter(s => s.submitted).length;
}

// Check if all projects in a course are submitted
export function areAllProjectsSubmitted(courseId: number, totalProjects: number): boolean {
  if (totalProjects === 0) return false;
  return getSubmittedProjectsCount(courseId) >= totalProjects;
}

// Get all submissions across all courses
export function getAllSubmissions(): ProjectSubmission[] {
  const store = getSubmissionsStore();
  const submissions: ProjectSubmission[] = [];
  
  Object.values(store).forEach((courseSubmissions) => {
    Object.values(courseSubmissions as Record<number, ProjectSubmission>).forEach((submission: ProjectSubmission) => {
      if (submission.submitted) {
        submissions.push(submission);
      }
    });
  });
  
  return submissions.sort((a, b) => 
    new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  );
}
