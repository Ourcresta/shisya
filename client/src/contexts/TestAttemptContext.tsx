import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TestAttempt, TestAttemptAnswer } from "@shared/schema";
import { 
  getTestAttempts, 
  getTestAttempt, 
  saveTestAttempt, 
  getTestStatus,
  type TestAttemptStore 
} from "@/lib/testAttempts";

interface TestAttemptContextType {
  attempts: TestAttemptStore;
  getAttempt: (testId: number) => TestAttempt | null;
  getStatus: (testId: number) => "not_attempted" | "passed" | "failed";
  recordAttempt: (
    testId: number,
    courseId: number,
    answers: TestAttemptAnswer[],
    scorePercentage: number,
    passed: boolean
  ) => TestAttempt;
  refreshAttempts: () => void;
  version: number;
}

const TestAttemptContext = createContext<TestAttemptContextType | null>(null);

export function TestAttemptProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<TestAttemptStore>(() => getTestAttempts());
  const [version, setVersion] = useState(0);

  const refreshAttempts = useCallback(() => {
    setAttempts(getTestAttempts());
    setVersion(v => v + 1);
  }, []);

  const getAttempt = useCallback((testId: number) => {
    return getTestAttempt(testId);
  }, []);

  const getStatus = useCallback((testId: number) => {
    return getTestStatus(testId);
  }, []);

  const recordAttempt = useCallback((
    testId: number,
    courseId: number,
    answers: TestAttemptAnswer[],
    scorePercentage: number,
    passed: boolean
  ) => {
    const attempt = saveTestAttempt(testId, courseId, answers, scorePercentage, passed);
    setAttempts(prev => ({ ...prev, [testId]: attempt }));
    setVersion(v => v + 1);
    return attempt;
  }, []);

  return (
    <TestAttemptContext.Provider
      value={{
        attempts,
        getAttempt,
        getStatus,
        recordAttempt,
        refreshAttempts,
        version,
      }}
    >
      {children}
    </TestAttemptContext.Provider>
  );
}

export function useTestAttempts() {
  const context = useContext(TestAttemptContext);
  if (!context) {
    throw new Error("useTestAttempts must be used within a TestAttemptProvider");
  }
  return context;
}
