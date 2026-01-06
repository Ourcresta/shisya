import { db } from "../db";
import {
  motivationRules,
  ruleTriggerLogs,
  studentStreaks,
  userProgress,
  userTestAttempts,
  userProjectSubmissions,
  userCertificates,
  courseEnrollments,
} from "@shared/schema";
import type { MotivationRule, StudentSignals, RuleAction } from "@shared/schema";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";
import { evaluateAllConditions, parseConditions } from "./ruleEvaluator";
import { executeAllActions, parseActions } from "./rewardDispatcher";

interface EvaluationResult {
  ruleId: number;
  ruleName: string;
  triggered: boolean;
  actionsExecuted: { success: boolean; actionType: string; details: Record<string, unknown> }[];
  skipped?: string;
}

export async function collectStudentSignals(
  userId: string,
  courseId?: number
): Promise<StudentSignals> {
  const now = new Date();
  
  const lessonsQuery = courseId
    ? db.select({ count: count() }).from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.courseId, courseId)))
    : db.select({ count: count() }).from(userProgress)
        .where(eq(userProgress.userId, userId));
  
  const testsQuery = courseId
    ? db.select({ count: count() }).from(userTestAttempts)
        .where(and(eq(userTestAttempts.userId, userId), eq(userTestAttempts.courseId, courseId)))
    : db.select({ count: count() }).from(userTestAttempts)
        .where(eq(userTestAttempts.userId, userId));
  
  const projectsQuery = courseId
    ? db.select({ count: count() }).from(userProjectSubmissions)
        .where(and(eq(userProjectSubmissions.userId, userId), eq(userProjectSubmissions.courseId, courseId)))
    : db.select({ count: count() }).from(userProjectSubmissions)
        .where(eq(userProjectSubmissions.userId, userId));
  
  const certificatesQuery = db.select({ count: count() }).from(userCertificates)
    .where(eq(userCertificates.userId, userId));
  
  const enrollmentsQuery = db.select({ count: count() }).from(courseEnrollments)
    .where(eq(courseEnrollments.userId, userId));
  
  const streakQuery = db.select().from(studentStreaks)
    .where(eq(studentStreaks.userId, userId))
    .limit(1);
  
  const avgScoreQuery = db.select({
    avgScore: sql<number>`COALESCE(AVG(${userTestAttempts.scorePercentage}), 0)`,
  }).from(userTestAttempts).where(eq(userTestAttempts.userId, userId));

  const [
    lessonsResult,
    testsResult,
    projectsResult,
    certificatesResult,
    enrollmentsResult,
    streakResult,
    avgScoreResult,
  ] = await Promise.all([
    lessonsQuery,
    testsQuery,
    projectsQuery,
    certificatesQuery,
    enrollmentsQuery,
    streakQuery,
    avgScoreQuery,
  ]);

  const streak = streakResult[0];
  let daysSinceLastActivity = 0;
  if (streak?.lastActivityDate) {
    const lastActivity = new Date(streak.lastActivityDate);
    daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  }

  let courseProgressPercent = 0;
  if (courseId) {
    const totalLessons = lessonsResult[0]?.count || 0;
    courseProgressPercent = totalLessons > 0 ? Math.min(100, Math.round((Number(lessonsResult[0]?.count || 0) / 10) * 100)) : 0;
  }

  return {
    userId,
    courseId,
    lessonsCompleted: Number(lessonsResult[0]?.count || 0),
    testsCompleted: Number(testsResult[0]?.count || 0),
    projectsSubmitted: Number(projectsResult[0]?.count || 0),
    courseProgressPercent,
    avgTestScore: Number(avgScoreResult[0]?.avgScore || 0),
    daysSinceLastActivity,
    streakCount: streak?.currentStreak || 0,
    totalActiveDays: streak?.totalActiveDays || 0,
    coursesEnrolled: Number(enrollmentsResult[0]?.count || 0),
    coursesCompleted: Number(certificatesResult[0]?.count || 0),
    certificatesEarned: Number(certificatesResult[0]?.count || 0),
  };
}

async function canTriggerRule(
  rule: MotivationRule,
  userId: string,
  courseId?: number
): Promise<{ canTrigger: boolean; reason?: string }> {
  const cooldownHours = rule.cooldownHours || 24;
  const cooldownDate = new Date();
  cooldownDate.setHours(cooldownDate.getHours() - cooldownHours);

  const recentTriggers = await db.select()
    .from(ruleTriggerLogs)
    .where(
      and(
        eq(ruleTriggerLogs.ruleId, rule.id),
        eq(ruleTriggerLogs.userId, userId),
        gte(ruleTriggerLogs.triggeredAt, cooldownDate)
      )
    )
    .limit(1);

  if (recentTriggers.length > 0) {
    return { canTrigger: false, reason: "Rule in cooldown period" };
  }

  if (rule.maxTriggerCount !== null) {
    const totalTriggers = await db.select({ count: count() })
      .from(ruleTriggerLogs)
      .where(
        and(
          eq(ruleTriggerLogs.ruleId, rule.id),
          eq(ruleTriggerLogs.userId, userId)
        )
      );

    if (Number(totalTriggers[0]?.count || 0) >= rule.maxTriggerCount) {
      return { canTrigger: false, reason: "Max trigger limit reached" };
    }
  }

  return { canTrigger: true };
}

async function logRuleTrigger(
  ruleId: number,
  userId: string,
  courseId: number | undefined,
  signals: StudentSignals,
  actionsExecuted: RuleAction[]
): Promise<void> {
  await db.insert(ruleTriggerLogs).values({
    ruleId,
    userId,
    courseId,
    triggerCount: 1,
    actionsExecuted: JSON.stringify(actionsExecuted),
    inputSignals: JSON.stringify(signals),
  });
}

export async function evaluateRulesForStudent(
  userId: string,
  courseId?: number
): Promise<EvaluationResult[]> {
  const results: EvaluationResult[] = [];

  const activeRules = await db.select()
    .from(motivationRules)
    .where(eq(motivationRules.isActive, true))
    .orderBy(desc(motivationRules.priority));

  if (activeRules.length === 0) {
    console.log("[MotivationEngine] No active rules found");
    return results;
  }

  const signals = await collectStudentSignals(userId, courseId);
  console.log("[MotivationEngine] Collected signals for user:", userId, signals);

  for (const rule of activeRules) {
    if (!rule.isGlobal && rule.courseId !== courseId) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        actionsExecuted: [],
        skipped: "Course-specific rule does not match",
      });
      continue;
    }

    const { canTrigger, reason } = await canTriggerRule(rule, userId, courseId);
    if (!canTrigger) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        actionsExecuted: [],
        skipped: reason,
      });
      continue;
    }

    const conditions = parseConditions(rule.conditions);
    const conditionsMet = evaluateAllConditions(conditions, signals);

    if (!conditionsMet) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        actionsExecuted: [],
        skipped: "Conditions not met",
      });
      continue;
    }

    console.log(`[MotivationEngine] Rule "${rule.name}" triggered for user ${userId}`);

    const actions = parseActions(rule.actions);
    const actionResults = await executeAllActions(actions, signals, rule.id);

    await logRuleTrigger(rule.id, userId, courseId, signals, actions);

    results.push({
      ruleId: rule.id,
      ruleName: rule.name,
      triggered: true,
      actionsExecuted: actionResults,
    });
  }

  return results;
}

export async function updateStudentStreak(userId: string): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const existingStreak = await db.select()
    .from(studentStreaks)
    .where(eq(studentStreaks.userId, userId))
    .limit(1);

  if (existingStreak.length === 0) {
    await db.insert(studentStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: now,
      streakStartDate: today,
      totalActiveDays: 1,
    });
    return;
  }

  const streak = existingStreak[0];
  const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
  const lastActivityDate = lastActivity 
    ? new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate())
    : null;

  if (lastActivityDate && lastActivityDate.getTime() === today.getTime()) {
    return;
  }

  let newStreak = 1;
  let newStreakStart = today;
  
  if (lastActivityDate && lastActivityDate.getTime() === yesterday.getTime()) {
    newStreak = (streak.currentStreak || 0) + 1;
    newStreakStart = streak.streakStartDate || today;
  }

  const newLongestStreak = Math.max(streak.longestStreak || 0, newStreak);
  const newTotalActiveDays = (streak.totalActiveDays || 0) + 1;

  await db.update(studentStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: now,
      streakStartDate: newStreakStart,
      totalActiveDays: newTotalActiveDays,
      updatedAt: now,
    })
    .where(eq(studentStreaks.userId, userId));

  console.log(`[MotivationEngine] Updated streak for user ${userId}: ${newStreak} days`);
}

export async function getActiveRules(): Promise<MotivationRule[]> {
  return await db.select()
    .from(motivationRules)
    .where(eq(motivationRules.isActive, true))
    .orderBy(desc(motivationRules.priority));
}

export async function createRule(ruleData: {
  name: string;
  description?: string;
  ruleType: string;
  conditions: string;
  actions: string;
  priority?: number;
  cooldownHours?: number;
  maxTriggerCount?: number;
  isGlobal?: boolean;
  courseId?: number;
}): Promise<MotivationRule> {
  const result = await db.insert(motivationRules).values({
    name: ruleData.name,
    description: ruleData.description,
    ruleType: ruleData.ruleType,
    conditions: ruleData.conditions,
    actions: ruleData.actions,
    priority: ruleData.priority || 0,
    cooldownHours: ruleData.cooldownHours || 24,
    maxTriggerCount: ruleData.maxTriggerCount,
    isGlobal: ruleData.isGlobal ?? true,
    courseId: ruleData.courseId,
    isActive: true,
  }).returning();

  return result[0];
}
