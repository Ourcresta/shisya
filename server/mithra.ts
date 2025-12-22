import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { db } from "./db";
import { mithraConversations, mithraMessages, mithraRequestSchema, type MithraResponse, type MithraResponseType } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_MINUTE = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  userLimit.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - userLimit.count };
}

const MITHRA_SYSTEM_PROMPT = `You are Mithra, an AI Tutor Avatar for OurShiksha's Shishya student portal.

CORE IDENTITY:
- You are a calm, encouraging learning companion
- You explain concepts clearly and guide students to think independently
- You are mentor-like, patient, and supportive

STRICT RULES - NEVER VIOLATE:
1. NEVER give direct answers to test/exam questions
2. NEVER reveal MCQ correct answers
3. NEVER write complete code solutions for labs
4. NEVER provide ready-to-submit project code
5. NEVER bypass the learning process

WHAT YOU MUST DO:
1. Explain concepts in simple, clear language
2. Break problems into smaller, manageable steps
3. Give hints that guide thinking, not answers
4. For labs: provide pseudocode and explain logic, NOT working code
5. For projects: suggest approaches and architecture, NOT implementations
6. Ask clarifying questions when needed
7. Encourage students to try first

RESPONSE STYLE:
- Calm and friendly tone
- Simple, clear language
- No jargon unless necessary
- No emojis
- End with a reflective question OR a next-step suggestion

CONTEXT AWARENESS:
You will receive context about what the student is currently studying. Always tailor your response to their specific context (course, lesson, lab, or project they're working on).

If a student asks something outside the learning context or tries to get direct answers, politely redirect them to learning-focused questions.`;

function detectDisallowedRequest(question: string): boolean {
  const disallowedPatterns = [
    /give me the (answer|solution|code)/i,
    /what is the correct (answer|option)/i,
    /solve this for me/i,
    /write the (code|solution|answer)/i,
    /complete (code|solution|implementation)/i,
    /just tell me the answer/i,
    /which option is (correct|right)/i,
  ];

  return disallowedPatterns.some(pattern => pattern.test(question));
}

function determineResponseType(question: string, pageType: string): MithraResponseType {
  const questionLower = question.toLowerCase();
  
  if (detectDisallowedRequest(question)) {
    return "warning";
  }
  
  if (questionLower.includes("hint") || questionLower.includes("stuck") || questionLower.includes("help")) {
    return "hint";
  }
  
  if (pageType === "lab" || pageType === "project") {
    if (questionLower.includes("approach") || questionLower.includes("how to") || questionLower.includes("strategy")) {
      return "guidance";
    }
    return "hint";
  }
  
  return "explanation";
}

function buildContextPrompt(context: any): string {
  let prompt = `\n\nCURRENT CONTEXT:`;
  prompt += `\n- Page Type: ${context.pageType}`;
  prompt += `\n- Course: ${context.courseTitle || `Course #${context.courseId}`}`;
  
  if (context.lessonTitle) {
    prompt += `\n- Lesson: ${context.lessonTitle}`;
  }
  if (context.labTitle) {
    prompt += `\n- Lab: ${context.labTitle}`;
  }
  if (context.projectTitle) {
    prompt += `\n- Project: ${context.projectTitle}`;
  }
  
  if (context.pageType === "lab") {
    prompt += `\n\nIMPORTANT: For lab questions, provide hints and pseudocode only. Do NOT write complete working code.`;
  } else if (context.pageType === "project") {
    prompt += `\n\nIMPORTANT: For project questions, provide architectural guidance and approaches only. Do NOT write complete implementations.`;
  } else if (context.pageType === "test_prep") {
    prompt += `\n\nIMPORTANT: Help the student prepare for tests by explaining concepts. NEVER reveal actual test answers or discuss specific test questions.`;
  }
  
  return prompt;
}

export function registerMithraRoutes(app: Express): void {
  app.post("/api/mithra/ask", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = (req.user as any).id;
      
      const rateCheck = checkRateLimit(userId);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please wait a moment before asking another question.",
          type: "warning" as MithraResponseType
        });
      }

      const parseResult = mithraRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid request format",
          details: parseResult.error.errors 
        });
      }

      const { context, question } = parseResult.data;

      if (context.studentId !== userId) {
        return res.status(403).json({ error: "Context mismatch" });
      }

      const responseType = determineResponseType(question, context.pageType);

      if (responseType === "warning" && detectDisallowedRequest(question)) {
        const warningResponse: MithraResponse = {
          answer: "I understand you're looking for a quick answer, but my role is to help you learn and understand concepts deeply. Instead of giving you the answer directly, let me help you think through this:\n\n1. What do you already know about this topic?\n2. Which part specifically is confusing?\n3. Have you tried breaking it down into smaller steps?\n\nShare what you've tried so far, and I'll guide you from there. Learning happens when you work through challenges yourself!",
          type: "warning"
        };
        return res.json(warningResponse);
      }

      let [conversation] = await db.select()
        .from(mithraConversations)
        .where(and(
          eq(mithraConversations.userId, userId),
          eq(mithraConversations.courseId, context.courseId),
          eq(mithraConversations.pageType, context.pageType)
        ))
        .orderBy(desc(mithraConversations.createdAt))
        .limit(1);

      if (!conversation) {
        [conversation] = await db.insert(mithraConversations)
          .values({
            userId,
            courseId: context.courseId,
            pageType: context.pageType
          })
          .returning();
      }

      await db.insert(mithraMessages).values({
        conversationId: conversation.id,
        role: "user",
        content: question
      });

      const recentMessages = await db.select()
        .from(mithraMessages)
        .where(eq(mithraMessages.conversationId, conversation.id))
        .orderBy(desc(mithraMessages.createdAt))
        .limit(10);

      const chatHistory = recentMessages.reverse().map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const contextPrompt = buildContextPrompt(context);
      const systemPrompt = MITHRA_SYSTEM_PROMPT + contextPrompt;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const answer = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

      await db.insert(mithraMessages).values({
        conversationId: conversation.id,
        role: "assistant",
        content: answer,
        responseType
      });

      const response: MithraResponse = {
        answer,
        type: responseType
      };

      res.json(response);

    } catch (error) {
      console.error("Mithra API error:", error);
      res.status(500).json({ 
        error: "An error occurred while processing your question. Please try again.",
        type: "warning" as MithraResponseType
      });
    }
  });

  app.get("/api/mithra/history/:courseId/:pageType", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = (req.user as any).id;
      const courseId = parseInt(req.params.courseId);
      const pageType = req.params.pageType;

      const [conversation] = await db.select()
        .from(mithraConversations)
        .where(and(
          eq(mithraConversations.userId, userId),
          eq(mithraConversations.courseId, courseId),
          eq(mithraConversations.pageType, pageType)
        ))
        .orderBy(desc(mithraConversations.createdAt))
        .limit(1);

      if (!conversation) {
        return res.json({ messages: [] });
      }

      const messages = await db.select()
        .from(mithraMessages)
        .where(eq(mithraMessages.conversationId, conversation.id))
        .orderBy(mithraMessages.createdAt);

      res.json({ messages });

    } catch (error) {
      console.error("Mithra history error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });
}
