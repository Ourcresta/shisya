import type { TestAttempt, TestAttemptAnswer } from "@shared/schema";

const STORAGE_KEY = "shishya_test_attempts";

export interface TestAttemptStore {
  [testId: number]: TestAttempt;
}

export function getTestAttempts(): TestAttemptStore {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getTestAttempt(testId: number): TestAttempt | null {
  const attempts = getTestAttempts();
  return attempts[testId] || null;
}

export function hasAttemptedTest(testId: number): boolean {
  const attempt = getTestAttempt(testId);
  return attempt !== null;
}

export function getTestStatus(testId: number): "not_attempted" | "passed" | "failed" {
  const attempt = getTestAttempt(testId);
  if (!attempt) return "not_attempted";
  return attempt.passed ? "passed" : "failed";
}

export function saveTestAttempt(
  testId: number,
  courseId: number,
  answers: TestAttemptAnswer[],
  scorePercentage: number,
  passed: boolean
): TestAttempt {
  const attempt: TestAttempt = {
    testId,
    courseId,
    answers,
    scorePercentage,
    passed,
    attemptedAt: new Date().toISOString(),
  };

  const attempts = getTestAttempts();
  attempts[testId] = attempt;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error("Failed to save test attempt:", error);
  }

  return attempt;
}

export function clearTestAttempt(testId: number): void {
  const attempts = getTestAttempts();
  delete attempts[testId];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error("Failed to clear test attempt:", error);
  }
}

export function clearAllTestAttempts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear all test attempts:", error);
  }
}

export function getAllPassedTests(): TestAttempt[] {
  const attempts = getTestAttempts();
  return Object.values(attempts)
    .filter(attempt => attempt.passed)
    .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime());
}

export function getPassedTestsCount(): number {
  return getAllPassedTests().length;
}
