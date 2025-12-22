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
- You help students understand concepts, practice skills, and think independently
- You explain calmly, step by step, using simple language
- You guide — you do not solve

STRICT RULES - NEVER VIOLATE:
1. NEVER give direct answers to test/exam questions
2. NEVER reveal MCQ correct answers
3. NEVER write complete code solutions for labs
4. NEVER provide ready-to-submit project solutions
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
- No emojis
- No jargon unless necessary
- End with a reflective question OR a suggested next step

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
    /what should i (select|choose)/i,
    /copy.?paste solution/i,
  ];

  return disallowedPatterns.some(pattern => pattern.test(question));
}

function buildContextPrompt(context: any): string {
  let contextDesc = `The student is currently on a ${context.pageType} page`;
  
  if (context.courseTitle) {
    contextDesc += ` for the course "${context.courseTitle}"`;
  }
  
  if (context.lessonTitle) {
    contextDesc += `, specifically the lesson "${context.lessonTitle}"`;
  }
  
  if (context.labTitle) {
    contextDesc += `, specifically the lab "${context.labTitle}"`;
  }
  
  if (context.projectTitle) {
    contextDesc += `, specifically the project "${context.projectTitle}"`;
  }

  contextDesc += ".";

  if (context.pageType === "lab") {
    contextDesc += " Remember: For labs, only provide hints and pseudocode. Never give complete working code.";
  } else if (context.pageType === "project") {
    contextDesc += " Remember: For projects, only suggest approaches and architecture. Never write the implementation.";
  } else if (context.pageType === "test_prep") {
    contextDesc += " Remember: Help the student prepare by explaining concepts. Never reveal actual test answers.";
  }

  return contextDesc;
}

function determineResponseType(question: string, answer: string): MithraResponseType {
  const lowerQ = question.toLowerCase();
  const lowerA = answer.toLowerCase();

  if (lowerA.includes("i cannot") || lowerA.includes("i'm not able to") || lowerA.includes("not allowed")) {
    return "warning";
  }
  if (lowerQ.includes("hint") || lowerA.includes("hint") || lowerA.includes("try this")) {
    return "hint";
  }
  if (lowerQ.includes("how") || lowerQ.includes("approach") || lowerA.includes("approach") || lowerA.includes("consider")) {
    return "guidance";
  }
  return "explanation";
}

export function registerMithraRoutes(app: Express): void {
  app.post("/api/mithra/ask", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.session.userId;

      const rateCheck = checkRateLimit(userId);
      if (!rateCheck.allowed) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please wait a moment before asking another question.",
          remaining: 0
        });
      }

      const parseResult = mithraRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.issues });
      }

      const { context, question } = parseResult.data;

      if (context.studentId !== userId) {
        return res.status(403).json({ error: "Context mismatch" });
      }

      if (detectDisallowedRequest(question)) {
        const warningResponse: MithraResponse = {
          answer: "I understand you want help, but I cannot provide direct answers or complete solutions. My role is to help you learn and think independently. Could you tell me which specific concept you're finding challenging? I would be happy to explain it step by step.",
          type: "warning"
        };

        await saveConversation(userId, context.courseId, context.pageType, question, warningResponse);

        return res.json(warningResponse);
      }

      const contextPrompt = buildContextPrompt(context);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: MITHRA_SYSTEM_PROMPT },
          { role: "system", content: contextPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || "I apologize, but I could not generate a response. Please try rephrasing your question.";
      const responseType = determineResponseType(question, answer);

      const response: MithraResponse = {
        answer,
        type: responseType
      };

      await saveConversation(userId, context.courseId, context.pageType, question, response);

      res.json(response);

    } catch (error) {
      console.error("Mithra API error:", error);
      res.status(500).json({ error: "Failed to process your question. Please try again." });
    }
  });

  app.get("/api/mithra/history", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.session.userId;
      const courseId = parseInt(req.query.courseId as string, 10);
      const pageType = req.query.pageType as string;

      if (!courseId || !pageType) {
        return res.status(400).json({ error: "courseId and pageType required" });
      }

      const conversation = await db.query.mithraConversations.findFirst({
        where: and(
          eq(mithraConversations.userId, userId),
          eq(mithraConversations.courseId, courseId),
          eq(mithraConversations.pageType, pageType)
        ),
        orderBy: [desc(mithraConversations.createdAt)]
      });

      if (!conversation) {
        return res.json({ messages: [] });
      }

      const messages = await db.query.mithraMessages.findMany({
        where: eq(mithraMessages.conversationId, conversation.id),
        orderBy: [mithraMessages.createdAt]
      });

      res.json({ messages });

    } catch (error) {
      console.error("Mithra history error:", error);
      res.status(500).json({ error: "Failed to fetch conversation history" });
    }
  });
}

async function saveConversation(
  userId: string,
  courseId: number,
  pageType: string,
  question: string,
  response: MithraResponse
): Promise<void> {
  try {
    let conversation = await db.query.mithraConversations.findFirst({
      where: and(
        eq(mithraConversations.userId, userId),
        eq(mithraConversations.courseId, courseId),
        eq(mithraConversations.pageType, pageType)
      ),
      orderBy: [desc(mithraConversations.createdAt)]
    });

    if (!conversation) {
      const [newConversation] = await db.insert(mithraConversations).values({
        userId,
        courseId,
        pageType,
      }).returning();
      conversation = newConversation;
    }

    await db.insert(mithraMessages).values([
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
      }
    ]);
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
}
