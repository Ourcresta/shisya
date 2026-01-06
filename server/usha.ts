import type { Express, Response } from "express";
import OpenAI from "openai";
import { db } from "./db";
import { 
  ushaConversations, 
  ushaMessages, 
  ushaRequestSchema, 
  type UshaResponse, 
  type UshaResponseType,
  type UshaHelpLevel,
  type UshaContext,
  type StudentProgressSummary,
  type UshaTurn,
  type SupportedLanguage
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "./auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const misuseTracker = new Map<string, { count: number; lastAttempt: number }>();
const MISUSE_WINDOW = 5 * 60 * 1000;
const MISUSE_THRESHOLD = 3;

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; nearLimit: boolean } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1, nearLimit: false };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0, nearLimit: false };
  }

  userLimit.count++;
  const remaining = MAX_REQUESTS_PER_MINUTE - userLimit.count;
  return { allowed: true, remaining, nearLimit: remaining <= 2 };
}

const USHA_V2_SYSTEM_PROMPT = `You are Usha, an AI Tutor Avatar for OurShiksha.

You behave like a calm senior tutor.
You explain, guide, and encourage thinking.
You never give exam answers or full solutions.

Your goal is learning, not speed.
Your tone is patient, respectful, and clear.

CORE PRINCIPLES:
1. Guide thinking, never shortcut it
2. Explain concepts, never reveal answers
3. Give hints that promote understanding
4. Adapt your depth to the student's level
5. Use simple, clear language without emojis or jargon

STRICT GUARDRAILS - NEVER VIOLATE:
- NEVER give direct answers to test/exam questions
- NEVER reveal MCQ correct answers
- NEVER write complete working code for labs
- NEVER provide ready-to-submit project solutions
- NEVER bypass the learning process

ADAPTIVE BEHAVIOR BY HELP LEVEL:
- BEGINNER: Use more explanation, analogies, simpler language, break into small steps
- INTERMEDIATE: Balance concepts with structured guidance, moderate detail
- ADVANCED: Minimal hints, focus on edge cases, strategic thinking, assume prior knowledge

SOCRATIC MODE (use when appropriate):
- Ask guiding questions like "What do you think happens if...?"
- Prompt thinking instead of just explaining
- Help students discover answers themselves
- Balance questioning with explanation (don't overuse)

PAGE-SPECIFIC RULES:
- LESSONS: Explain concepts freely, encourage exploration
- LABS: Provide hints and pseudocode ONLY, never complete working code
- PROJECTS: Suggest approaches and architecture ONLY, never implementations
- TEST PREP: Help understand concepts, never reveal actual test answers

RESPONSE ENDING:
Always end with ONE of these:
- A reflective question: "Can you explain this in your own words?"
- A checkpoint: "What part is still unclear?"
- A next step: "What would you try next?"

If you detect repeated attempts to get direct answers, politely redirect without accusation or shaming.

MULTI-LANGUAGE SUPPORT:
You can respond in the student's preferred language. When a language preference is specified:
- ENGLISH: Respond in clear, simple English (default)
- HINDI: Respond in Hindi (Devanagari script). Use simple Hindi that students can understand.
- TAMIL: Respond in Tamil (Tamil script). Use simple Tamil that students can understand.

When responding in Hindi or Tamil:
- Keep technical terms in English (e.g., "function", "variable", "loop")
- Use the regional language for explanations, questions, and guidance
- Maintain the same educational principles regardless of language`;

function calculateHelpLevel(context: UshaContext): UshaHelpLevel {
  const courseLevel = context.courseLevel || "intermediate";
  const progress = context.studentProgressSummary;
  
  if (!progress || !progress.totalLessons) {
    return "beginner";
  }

  const completionRatio = progress.totalLessons > 0 
    ? progress.lessonsCompleted / progress.totalLessons 
    : 0;
  
  const hasRecentFailures = progress.recentFailures > 0;
  const stuckOnPage = (progress.timeOnCurrentPage || 0) > 300;
  const previousTurns = context.previousUshaTurns?.length || 0;
  const repeatedQuestions = previousTurns > 2;

  if (courseLevel === "beginner") {
    return "beginner";
  }

  if (courseLevel === "advanced" && completionRatio > 0.7 && !hasRecentFailures) {
    return "advanced";
  }

  if (hasRecentFailures || stuckOnPage || repeatedQuestions || completionRatio < 0.3) {
    return "beginner";
  }

  if (completionRatio > 0.5 && !hasRecentFailures) {
    return courseLevel === "advanced" ? "advanced" : "intermediate";
  }

  return "intermediate";
}

function detectMisuse(question: string, userId: string): { isMisuse: boolean; isRepeated: boolean } {
  const disallowedPatterns = [
    /give me the (answer|solution|code)/i,
    /what is the correct (answer|option)/i,
    /solve this for me/i,
    /write the (code|solution|answer)/i,
    /complete (code|solution|implementation)/i,
    /just tell me the answer/i,
    /which option is (correct|right)/i,
    /what should i (select|choose)/i,
    /copy.?paste solution/i,
    /do (it|this) for me/i,
    /give me full (code|solution)/i,
    /i need the (exact|complete) (answer|code)/i,
    /stop (explaining|teaching)/i,
    /just (give|tell) me/i,
  ];

  const isMisuse = disallowedPatterns.some(pattern => pattern.test(question));

  if (isMisuse) {
    const now = Date.now();
    const tracker = misuseTracker.get(userId);

    if (!tracker || now - tracker.lastAttempt > MISUSE_WINDOW) {
      misuseTracker.set(userId, { count: 1, lastAttempt: now });
      return { isMisuse: true, isRepeated: false };
    }

    tracker.count++;
    tracker.lastAttempt = now;
    return { isMisuse: true, isRepeated: tracker.count >= MISUSE_THRESHOLD };
  }

  return { isMisuse: false, isRepeated: false };
}

function buildContextPrompt(context: UshaContext, helpLevel: UshaHelpLevel, language: SupportedLanguage = "english"): string {
  let contextDesc = `CURRENT CONTEXT:\n`;
  contextDesc += `- Page type: ${context.pageType}\n`;
  contextDesc += `- Help level: ${helpLevel.toUpperCase()}\n`;
  contextDesc += `- Response language: ${language.toUpperCase()}\n`;
  
  if (context.courseTitle) {
    contextDesc += `- Course: "${context.courseTitle}"`;
    if (context.courseLevel) {
      contextDesc += ` (${context.courseLevel} level)`;
    }
    contextDesc += `\n`;
  }
  
  if (context.lessonTitle) {
    contextDesc += `- Current lesson: "${context.lessonTitle}"\n`;
  }
  
  if (context.labTitle) {
    contextDesc += `- Current lab: "${context.labTitle}"\n`;
  }
  
  if (context.projectTitle) {
    contextDesc += `- Current project: "${context.projectTitle}"\n`;
  }

  const progress = context.studentProgressSummary;
  if (progress) {
    contextDesc += `\nSTUDENT PROGRESS:\n`;
    if (progress.totalLessons > 0) {
      contextDesc += `- Lessons completed: ${progress.lessonsCompleted}/${progress.totalLessons}\n`;
    }
    if (progress.labsCompleted > 0 || progress.totalLabs > 0) {
      contextDesc += `- Labs completed: ${progress.labsCompleted}/${progress.totalLabs}\n`;
    }
    if (progress.recentFailures > 0) {
      contextDesc += `- Recent struggles: Student has had ${progress.recentFailures} recent failed attempts\n`;
    }
  }

  contextDesc += `\nHELP LEVEL INSTRUCTION:\n`;
  switch (helpLevel) {
    case "beginner":
      contextDesc += `Provide more explanation with analogies. Use simpler language. Break concepts into smaller steps. Be encouraging.`;
      break;
    case "intermediate":
      contextDesc += `Balance concepts with structured guidance. Provide moderate detail. Encourage independent thinking.`;
      break;
    case "advanced":
      contextDesc += `Give minimal hints. Focus on edge cases and strategic thinking. Assume prior knowledge. Challenge the student.`;
      break;
  }

  contextDesc += `\n\nPAGE-SPECIFIC REMINDER:\n`;
  switch (context.pageType) {
    case "lab":
      contextDesc += `For labs, only provide hints and pseudocode. NEVER give complete working code.`;
      break;
    case "project":
      contextDesc += `For projects, only suggest approaches and architecture. NEVER write the implementation.`;
      break;
    case "test_prep":
      contextDesc += `Help understand concepts for test preparation. NEVER reveal actual test answers.`;
      break;
    default:
      contextDesc += `Explain concepts freely and encourage exploration.`;
  }

  return contextDesc;
}

function buildConversationMessages(
  previousTurns: UshaTurn[] | undefined,
  contextPrompt: string,
  question: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: USHA_V2_SYSTEM_PROMPT },
    { role: "system", content: contextPrompt },
  ];

  if (previousTurns && previousTurns.length > 0) {
    const recentTurns = previousTurns.slice(-6);
    for (const turn of recentTurns) {
      messages.push({
        role: turn.role === "user" ? "user" : "assistant",
        content: turn.content,
      });
    }
  }

  messages.push({ role: "user", content: question });

  return messages;
}

function determineResponseType(question: string, answer: string): UshaResponseType {
  const lowerQ = question.toLowerCase();
  const lowerA = answer.toLowerCase();

  if (lowerA.includes("i cannot") || lowerA.includes("i'm not able to") || lowerA.includes("not allowed") || lowerA.includes("cannot provide")) {
    return "warning";
  }
  if (lowerQ.includes("hint") || lowerA.includes("hint") || lowerA.includes("try this") || lowerA.includes("consider trying")) {
    return "hint";
  }
  if (lowerQ.includes("how") || lowerQ.includes("approach") || lowerA.includes("approach") || lowerA.includes("you could") || lowerA.includes("one way")) {
    return "guidance";
  }
  return "explanation";
}

function getMisuseResponse(isRepeated: boolean, helpLevel: UshaHelpLevel): UshaResponse {
  if (isRepeated) {
    return {
      answer: "I notice you're looking for direct answers, but my role is to help you truly understand and learn. Direct answers might seem faster, but they won't help you in the long run. Let's take a different approach - can you tell me which specific concept is confusing you? I can break it down step by step, and I think you'll find that much more helpful.",
      type: "warning",
      helpLevel,
    };
  }

  return {
    answer: "I understand you want to move quickly, but I can't provide direct answers or complete solutions. Instead, I can help you understand the concepts so you can solve it yourself. Could you tell me which specific part you're finding challenging? I'll explain it in a way that makes sense to you.",
    type: "warning",
    helpLevel,
  };
}

export function registerUshaRoutes(app: Express): void {
  app.post("/api/usha/ask", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const rateCheck = checkRateLimit(userId);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please wait a moment before asking another question.",
          remaining: 0
        });
      }

      const parseResult = ushaRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.issues });
      }

      const { context, question } = parseResult.data;

      if (context.studentId !== userId) {
        return res.status(403).json({ error: "Context mismatch" });
      }

      const helpLevel = calculateHelpLevel(context);
      const language = (context.language || "english") as SupportedLanguage;

      const misuseCheck = detectMisuse(question, userId);
      if (misuseCheck.isMisuse) {
        const warningResponse = getMisuseResponse(misuseCheck.isRepeated, helpLevel);
        await saveConversation(userId, context.courseId, context.pageType, question, warningResponse);
        return res.json(warningResponse);
      }

      const contextPrompt = buildContextPrompt(context, helpLevel, language);
      const messages = buildConversationMessages(context.previousUshaTurns, contextPrompt, question);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
        max_tokens: 400,
        temperature: 0.3,
      });

      const answer = completion.choices[0]?.message?.content || "I apologize, but I could not generate a response. Please try rephrasing your question.";
      const responseType = determineResponseType(question, answer);

      const response: UshaResponse = {
        answer,
        type: responseType,
        helpLevel,
      };

      await saveConversation(userId, context.courseId, context.pageType, question, response);

      const responseWithMeta = {
        ...response,
        remaining: rateCheck.remaining,
        nearLimit: rateCheck.nearLimit,
      };

      res.json(responseWithMeta);

    } catch (error) {
      console.error("Usha API error:", error);
      res.status(500).json({ error: "Failed to process your question. Please try again." });
    }
  });

  app.get("/api/usha/history", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const courseId = parseInt(req.query.courseId as string, 10);
      const pageType = req.query.pageType as string;

      if (!courseId || !pageType) {
        return res.status(400).json({ error: "courseId and pageType required" });
      }

      const conversation = await db.query.ushaConversations.findFirst({
        where: and(
          eq(ushaConversations.userId, userId),
          eq(ushaConversations.courseId, courseId),
          eq(ushaConversations.pageType, pageType)
        ),
        orderBy: [desc(ushaConversations.createdAt)]
      });

      if (!conversation) {
        return res.json({ messages: [] });
      }

      const messages = await db.query.ushaMessages.findMany({
        where: eq(ushaMessages.conversationId, conversation.id),
        orderBy: [ushaMessages.createdAt]
      });

      res.json({ messages });

    } catch (error) {
      console.error("Usha history error:", error);
      res.status(500).json({ error: "Failed to fetch conversation history" });
    }
  });
}

async function saveConversation(
  userId: string,
  courseId: number,
  pageType: string,
  question: string,
  response: UshaResponse
): Promise<void> {
  try {
    let conversation = await db.query.ushaConversations.findFirst({
      where: and(
        eq(ushaConversations.userId, userId),
        eq(ushaConversations.courseId, courseId),
        eq(ushaConversations.pageType, pageType)
      ),
      orderBy: [desc(ushaConversations.createdAt)]
    });

    if (!conversation) {
      const [newConversation] = await db.insert(ushaConversations).values({
        userId,
        courseId,
        pageType,
      }).returning();
      conversation = newConversation;
    }

    await db.insert(ushaMessages).values([
      {
        conversationId: conversation.id,
        role: "user",
        content: question,
      },
      {
        conversationId: conversation.id,
        role: "assistant",
        content: response.answer,
        responseType: response.type,
        helpLevel: response.helpLevel,
      }
    ]);
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
}
