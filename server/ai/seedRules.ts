import { db } from "../db";
import { motivationRules } from "@shared/schema";
import { eq, count } from "drizzle-orm";

const DEFAULT_RULES = [
  {
    name: "First Lesson Completed",
    description: "Reward when student completes their first lesson",
    ruleType: "milestone",
    conditions: JSON.stringify([{ field: "lessonsCompleted", operator: "eq", value: 1 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 10 },
      { type: "send_nudge", value: "celebration", message: "Congratulations on completing your first lesson!" },
    ]),
    priority: 100,
    cooldownHours: 0,
    maxTriggerCount: 1,
    isGlobal: true,
  },
  {
    name: "5 Lessons Milestone",
    description: "Reward when student completes 5 lessons",
    ruleType: "milestone",
    conditions: JSON.stringify([{ field: "lessonsCompleted", operator: "eq", value: 5 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 25 },
      { type: "generate_card", value: "milestone", message: "You've completed 5 lessons!" },
    ]),
    priority: 90,
    cooldownHours: 0,
    maxTriggerCount: 1,
    isGlobal: true,
  },
  {
    name: "10 Lessons Champion",
    description: "Reward when student completes 10 lessons",
    ruleType: "milestone",
    conditions: JSON.stringify([{ field: "lessonsCompleted", operator: "gte", value: 10 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 50 },
      { type: "generate_card", value: "dedication", message: "10 lessons completed! Amazing dedication!" },
      { type: "create_mystery_box" },
    ]),
    priority: 85,
    cooldownHours: 0,
    maxTriggerCount: 1,
    isGlobal: true,
  },
  {
    name: "3-Day Streak",
    description: "Reward for maintaining a 3-day learning streak",
    ruleType: "streak",
    conditions: JSON.stringify([{ field: "streakCount", operator: "eq", value: 3 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 15 },
      { type: "send_nudge", value: "streak" },
    ]),
    priority: 80,
    cooldownHours: 72,
    maxTriggerCount: null,
    isGlobal: true,
  },
  {
    name: "7-Day Streak Champion",
    description: "Reward for maintaining a 7-day learning streak",
    ruleType: "streak",
    conditions: JSON.stringify([{ field: "streakCount", operator: "eq", value: 7 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 50 },
      { type: "generate_card", value: "streak", message: "One week of consistent learning!" },
      { type: "create_mystery_box" },
    ]),
    priority: 75,
    cooldownHours: 168,
    maxTriggerCount: null,
    isGlobal: true,
  },
  {
    name: "Comeback Hero",
    description: "Welcome back students after 3+ days of inactivity",
    ruleType: "comeback",
    conditions: JSON.stringify([{ field: "daysSinceLastActivity", operator: "gte", value: 3 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 20 },
      { type: "send_nudge", value: "comeback", message: "Welcome back! Here's a bonus to get you started again!" },
    ]),
    priority: 70,
    cooldownHours: 72,
    maxTriggerCount: 5,
    isGlobal: true,
  },
  {
    name: "Test Ace",
    description: "Reward for scoring 90%+ on a test",
    ruleType: "performance",
    conditions: JSON.stringify([{ field: "testScore", operator: "gte", value: 90 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 30 },
      { type: "generate_card", value: "performance", message: "Exceptional test performance!" },
    ]),
    priority: 65,
    cooldownHours: 24,
    maxTriggerCount: null,
    isGlobal: true,
  },
  {
    name: "First Certificate",
    description: "Celebrate earning the first certificate",
    ruleType: "milestone",
    conditions: JSON.stringify([{ field: "certificatesEarned", operator: "eq", value: 1 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 100 },
      { type: "generate_card", value: "completion", message: "Your first course certificate! Amazing achievement!" },
      { type: "create_mystery_box" },
    ]),
    priority: 100,
    cooldownHours: 0,
    maxTriggerCount: 1,
    isGlobal: true,
  },
  {
    name: "Project Submitter",
    description: "Reward for submitting a project",
    ruleType: "progress",
    conditions: JSON.stringify([{ field: "projectsSubmitted", operator: "gte", value: 1 }]),
    actions: JSON.stringify([
      { type: "add_coins", value: 20 },
      { type: "send_nudge", value: "celebration", message: "Great job on submitting your project!" },
    ]),
    priority: 60,
    cooldownHours: 24,
    maxTriggerCount: null,
    isGlobal: true,
  },
  {
    name: "Halfway There",
    description: "Encourage students at 50% course progress",
    ruleType: "progress",
    conditions: JSON.stringify([
      { field: "courseProgressPercent", operator: "gte", value: 50 },
      { field: "courseProgressPercent", operator: "lt", value: 60 },
    ]),
    actions: JSON.stringify([
      { type: "add_coins", value: 20 },
      { type: "send_nudge", value: "progress", message: "You're halfway there! Keep going!" },
    ]),
    priority: 55,
    cooldownHours: 0,
    maxTriggerCount: 1,
    isGlobal: true,
  },
];

export async function seedDefaultRules(): Promise<void> {
  const existingRules = await db.select({ count: count() }).from(motivationRules);
  
  if (Number(existingRules[0]?.count || 0) > 0) {
    console.log("[SeedRules] Rules already exist, skipping seeding");
    return;
  }

  console.log("[SeedRules] Seeding default motivation rules...");
  
  for (const rule of DEFAULT_RULES) {
    await db.insert(motivationRules).values({
      name: rule.name,
      description: rule.description,
      ruleType: rule.ruleType,
      conditions: rule.conditions,
      actions: rule.actions,
      priority: rule.priority,
      cooldownHours: rule.cooldownHours,
      maxTriggerCount: rule.maxTriggerCount,
      isGlobal: rule.isGlobal,
      isActive: true,
    });
  }

  console.log(`[SeedRules] Seeded ${DEFAULT_RULES.length} default rules`);
}
