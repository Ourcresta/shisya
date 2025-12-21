import { getCourseProgress } from "./progress";
import { getTestAttempts } from "./testAttempts";
import { getCourseSubmissions } from "./submissions";
import type { Course, ModuleWithLessons } from "@shared/schema";

export interface EligibilityResult {
  eligible: boolean;
  lessonsComplete: boolean;
  testPassed: boolean | null;
  projectSubmitted: boolean | null;
  totalLessons: number;
  completedLessons: number;
}

export function checkCertificateEligibility(
  course: Course,
  modulesWithLessons: ModuleWithLessons[]
): EligibilityResult {
  const progress = getCourseProgress(course.id);
  const testAttempts = getTestAttempts();
  const submissions = getCourseSubmissions(course.id);
  
  const totalLessons = modulesWithLessons.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0
  );
  const completedLessons = progress?.completedLessons.length || 0;
  const lessonsComplete = totalLessons > 0 && completedLessons >= totalLessons;
  
  let testPassed: boolean | null = null;
  if (course.testRequired) {
    const courseTestAttempts = Object.values(testAttempts).filter(
      attempt => attempt.courseId === course.id
    );
    testPassed = courseTestAttempts.some(attempt => attempt.passed);
  }
  
  let projectSubmitted: boolean | null = null;
  if (course.projectRequired) {
    const submittedProjects = Object.values(submissions).filter(
      sub => sub.submitted
    );
    projectSubmitted = submittedProjects.length > 0;
  }
  
  const eligible =
    lessonsComplete &&
    (testPassed === null || testPassed === true) &&
    (projectSubmitted === null || projectSubmitted === true);
  
  return {
    eligible,
    lessonsComplete,
    testPassed,
    projectSubmitted,
    totalLessons,
    completedLessons,
  };
}
