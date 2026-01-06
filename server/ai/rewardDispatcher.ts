import { db } from "../db";
import { 
  userCredits, 
  creditTransactions, 
  motivationCards, 
  userScholarships,
  scholarships,
  mysteryBoxes,
  aiNudgeLogs,
  notifications
} from "@shared/schema";
import type { RuleAction, StudentSignals, MotivationCardType, NudgeType } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateNudge } from "./nudgeGenerator";

function generateId(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = prefix;
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export interface ActionResult {
  success: boolean;
  actionType: string;
  details: Record<string, unknown>;
  error?: string;
}

export async function executeAction(
  action: RuleAction,
  signals: StudentSignals,
  ruleId: number
): Promise<ActionResult> {
  try {
    switch (action.type) {
      case "add_coins":
        return await addCoins(signals.userId, action.value as number, ruleId);
      
      case "generate_card":
        return await generateMotivationCard(
          signals,
          action.value as MotivationCardType || "milestone",
          action.message || "",
          ruleId
        );
      
      case "award_scholarship":
        return await awardScholarship(
          signals.userId,
          action.value as number,
          signals.courseId,
          ruleId
        );
      
      case "create_mystery_box":
        return await createMysteryBox(signals.userId, ruleId);
      
      case "send_nudge":
        return await sendNudge(
          signals,
          action.value as NudgeType || "encouragement",
          action.message,
          ruleId
        );
      
      case "send_notification":
        return await sendNotification(
          signals.userId,
          action.message || "You've earned a reward!",
          ruleId
        );
      
      default:
        return {
          success: false,
          actionType: action.type,
          details: {},
          error: `Unknown action type: ${action.type}`,
        };
    }
  } catch (error) {
    console.error(`[RewardDispatcher] Error executing action ${action.type}:`, error);
    return {
      success: false,
      actionType: action.type,
      details: {},
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function addCoins(
  userId: string,
  amount: number,
  ruleId: number
): Promise<ActionResult> {
  if (!amount || amount <= 0) {
    return { success: false, actionType: "add_coins", details: {}, error: "Invalid amount" };
  }

  const existingCredits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  
  if (existingCredits.length === 0) {
    await db.insert(userCredits).values({
      userId,
      balance: amount,
      totalEarned: amount,
      totalSpent: 0,
    });
  } else {
    await db.update(userCredits)
      .set({
        balance: sql`${userCredits.balance} + ${amount}`,
        totalEarned: sql`${userCredits.totalEarned} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));
  }

  const updatedCredits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  
  await db.insert(creditTransactions).values({
    userId,
    amount,
    type: "BONUS",
    reason: "REWARD",
    description: `Motivation reward from rule #${ruleId}`,
    referenceId: ruleId,
    balanceAfter: updatedCredits[0]?.balance || amount,
  });

  return {
    success: true,
    actionType: "add_coins",
    details: { amount, newBalance: updatedCredits[0]?.balance },
  };
}

async function generateMotivationCard(
  signals: StudentSignals,
  cardType: MotivationCardType,
  message: string,
  ruleId: number
): Promise<ActionResult> {
  const cardId = generateId("MC");
  
  const stats = JSON.stringify([
    { label: "Lessons Completed", value: signals.lessonsCompleted || 0 },
    { label: "Progress", value: `${signals.courseProgressPercent || 0}%` },
    { label: "Streak", value: `${signals.streakCount || 0} days` },
  ]);

  await db.insert(motivationCards).values({
    cardId,
    userId: signals.userId,
    courseId: signals.courseId,
    cardType,
    title: getTitleForCardType(cardType, signals),
    subtitle: message || getSubtitleForCardType(cardType),
    stats,
    percentileRank: signals.percentileRank,
    isShareable: true,
    shareUrl: `/cards/${cardId}`,
  });

  return {
    success: true,
    actionType: "generate_card",
    details: { cardId, cardType },
  };
}

function getTitleForCardType(cardType: MotivationCardType, signals: StudentSignals): string {
  switch (cardType) {
    case "streak": return `${signals.streakCount} Day Streak Champion`;
    case "milestone": return "Milestone Achieved!";
    case "completion": return "Course Completed!";
    case "performance": return "Top Performer";
    case "speedster": return "Speed Learner";
    case "comeback": return "Welcome Back Hero";
    case "top_performer": return `Top ${100 - (signals.percentileRank || 50)}% Learner`;
    case "dedication": return "Dedicated Learner";
    default: return "Achievement Unlocked!";
  }
}

function getSubtitleForCardType(cardType: MotivationCardType): string {
  switch (cardType) {
    case "streak": return "Consistency is the key to success!";
    case "milestone": return "Every step forward is progress!";
    case "completion": return "Your hard work has paid off!";
    case "performance": return "Excellence in action!";
    case "speedster": return "Fast learner, big achiever!";
    case "comeback": return "The comeback is always stronger!";
    case "top_performer": return "Leading the pack!";
    case "dedication": return "Dedication drives success!";
    default: return "Keep learning, keep growing!";
  }
}

async function awardScholarship(
  userId: string,
  scholarshipId: number,
  courseId: number | undefined,
  ruleId: number
): Promise<ActionResult> {
  const scholarship = await db.select().from(scholarships).where(eq(scholarships.id, scholarshipId)).limit(1);
  
  if (scholarship.length === 0) {
    return { success: false, actionType: "award_scholarship", details: {}, error: "Scholarship not found" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.insert(userScholarships).values({
    userId,
    scholarshipId,
    courseId,
    expiresAt,
  });

  return {
    success: true,
    actionType: "award_scholarship",
    details: { scholarshipId, discountPercent: scholarship[0].discountPercent },
  };
}

async function createMysteryBox(
  userId: string,
  ruleId: number
): Promise<ActionResult> {
  const boxId = generateId("MB");
  
  const rewardTypes = ["coins", "scholarship", "badge", "coupon"];
  const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
  
  let rewardValue: Record<string, unknown> = {};
  switch (randomType) {
    case "coins":
      rewardValue = { amount: Math.floor(Math.random() * 50) + 10 };
      break;
    case "scholarship":
      rewardValue = { discountPercent: [10, 15, 20, 25][Math.floor(Math.random() * 4)] };
      break;
    case "badge":
      rewardValue = { badgeName: "Mystery Badge" };
      break;
    case "coupon":
      rewardValue = { code: generateId("CP"), discountPercent: 10 };
      break;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(mysteryBoxes).values({
    boxId,
    userId,
    ruleId,
    rewardType: randomType,
    rewardValue: JSON.stringify(rewardValue),
    expiresAt,
  });

  return {
    success: true,
    actionType: "create_mystery_box",
    details: { boxId, rewardType: randomType },
  };
}

async function sendNudge(
  signals: StudentSignals,
  nudgeType: NudgeType,
  customMessage: string | undefined,
  ruleId: number
): Promise<ActionResult> {
  const message = generateNudge(nudgeType, signals, customMessage);

  await db.insert(aiNudgeLogs).values({
    userId: signals.userId,
    courseId: signals.courseId,
    nudgeType,
    message,
    channel: "app",
    ruleId,
  });

  await db.insert(notifications).values({
    userId: signals.userId,
    role: "shishya",
    title: "Learning Motivation",
    message,
    type: "motivation",
  });

  return {
    success: true,
    actionType: "send_nudge",
    details: { nudgeType, message },
  };
}

async function sendNotification(
  userId: string,
  message: string,
  ruleId: number
): Promise<ActionResult> {
  await db.insert(notifications).values({
    userId,
    role: "shishya",
    title: "Motivation Reward",
    message,
    type: "motivation",
  });

  return {
    success: true,
    actionType: "send_notification",
    details: { message },
  };
}

export async function executeAllActions(
  actions: RuleAction[],
  signals: StudentSignals,
  ruleId: number
): Promise<ActionResult[]> {
  const results: ActionResult[] = [];
  
  for (const action of actions) {
    const result = await executeAction(action, signals, ruleId);
    results.push(result);
  }
  
  return results;
}

export function parseActions(actionsJson: string): RuleAction[] {
  try {
    const parsed = JSON.parse(actionsJson);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    console.error("[RewardDispatcher] Failed to parse actions:", actionsJson);
    return [];
  }
}
