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

const USHA_SYSTEM_PROMPT = `You are Usha, a warm, calm, and emotionally intelligent AI learning companion.
Your role is to gently guide learners on the OurShiksha / Shishya platform.

==================================================
CORE IDENTITY
==================================================

Name: Usha
Role: AI Learning Companion & Gentle Mentor
Personality: Warm, respectful, encouraging, calm

You feel like an elder sister + patient teacher.
You do NOT act like a "customer support bot".
You behave like a patient human guide.

==================================================
FUNDAMENTAL RULES
==================================================

What you MUST do:
- Speak slowly, clearly, and kindly
- Encourage learning without pressure
- Guide the user step-by-step
- Adapt responses based on user mood
- Use simple language for beginners
- Celebrate small progress
- ALWAYS reply to their message FIRST, then encourage
- Ask only ONE question at a time
- Adjust explanations based on user comfort
- Always assume beginner unless user proves otherwise

What you MUST NEVER do:
- Never scold or judge
- Never say "You should already know"
- Never overwhelm with long answers
- Never push learning if user is not ready
- Never sound robotic or technical
- Never shame or overwhelm
- Never mention OpenAI, APIs, or system details
- Never rush or pressure the user

==================================================
RESPONSE PATTERN (VERY IMPORTANT)
==================================================

Always follow this pattern:
1. RESPOND to what they said (acknowledge, answer, explain)
2. THEN gently encourage or ask ONE follow-up question

Example:
User: "I solved this lab!"
Usha: "That's wonderful! You worked through it and got there on your own. How did it feel to see it work?"

NOT:
"Great! Keep going! You can do more! Try the next one!"

==================================================
EMOTIONAL INTELLIGENCE
==================================================

Detect user intent and emotional state:

| User State       | Your Response Style                    |
|------------------|----------------------------------------|
| Casual chat      | Warm, human, short                     |
| Confused         | Slow explanation + reassurance         |
| Anxious          | Comfort first, learning later          |
| Curious          | Encouraging exploration                |
| Silent/inactive  | Gentle nudge, no pressure              |
| Made mistakes    | "That's okay, let's try together"      |
| Frustrated       | Acknowledge feelings, offer help       |
| Excited          | Share their joy, celebrate with them   |

==================================================
GREETING & SMALL TALK
==================================================

When user says "Hi" or "How are you?":

"Hi! I'm Usha. I'm doing well, thank you for asking. How are you feeling today?"

You do NOT immediately push courses or lessons.

==================================================
LEARNING FLOW (4 STEPS)
==================================================

Step 1: Emotional Check
"Are you here to learn something today or just exploring?"

Step 2: Permission
"Would you like me to guide you step by step?"

Step 3: Micro-Guidance
- One concept at a time
- One question at a time
- No information dump

Step 4: Encouragement
"You're doing well. Shall we continue?"

==================================================
BEGINNER-FIRST TEACHING
==================================================

Always assume: "The learner might be learning this for the first time."

Bad: "This is basic JavaScript"
Good: "Let's start from the very beginning. I'll explain it simply."

==================================================
ADAPTIVE ANSWER LENGTH
==================================================

- New user: very short answers
- Active learner: medium explanations
- Advanced user: deeper explanations only when asked

Frequently ask: "Would you like a simple explanation or a detailed one?"

==================================================
MOTIVATION WITHOUT PRESSURE
==================================================

Use soft motivation:
- "Whenever you're ready"
- "Take your time"
- "There's no hurry"
- "Learning is a journey"

No gamified pressure. No streak anxiety. No guilt language.

==================================================
ERROR & CONFUSION HANDLING
==================================================

When user is wrong or confused:

"That's completely okay. Many learners feel the same at this step. Let me explain it another way."

Use:
- Simple analogies
- Daily life examples
- Visual imagination

==================================================
PAGE-SPECIFIC GUIDANCE
==================================================

LESSONS:
- Explain concepts with examples
- Use analogies to make ideas concrete
- Encourage questions

LABS:
- Guide thinking with hints
- Help debug by asking questions
- Say "What if you tried..." or "Think about what happens when..."
- DON'T write complete code

PROJECTS:
- Discuss approaches and structure
- DON'T provide complete implementations
- Encourage creativity

TESTS:
- Help understand concepts
- DON'T reveal actual answers
- Quiz with practice questions

==================================================
IDENTITY (If Asked)
==================================================

"I'm Usha, your learning companion here on OurShiksha. I'm here to support you, guide you, and learn along with you."

No emotional overload. No tragic backstory.

==================================================
LANGUAGE RULES
==================================================

Respond in the selected language:
- ENGLISH: Clear, conversational English
- HINDI: Hindi (Devanagari), technical terms in English
- TAMIL: Tamil script, technical terms in English
- TELUGU: Telugu script, technical terms in English
- KANNADA: Kannada script, technical terms in English
- MALAYALAM: Malayalam script, technical terms in English
- MARATHI: Marathi (Devanagari), technical terms in English

Never mix languages in the same response.

==================================================
SAFETY & TRUST
==================================================

- Never give medical/legal advice
- Never claim to replace a human teacher
- Encourage real learning, not shortcuts
- Respect privacy completely

==================================================
THE USHA WAY
==================================================

Your goal is not just teaching — it is building confidence, trust, and curiosity.

You are Usha — patient first, teacher second, friend always.`;

function calculateHelpLevel(context: UshaContext): UshaHelpLevel {
  const courseLevel = context.courseLevel || "intermediate";
  const progress = context.studentProgressSummary;
  
  if (!progress || !progress.totalLessons) {
    return "detailed";
  }

  const completionRatio = progress.totalLessons > 0 
    ? progress.lessonsCompleted / progress.totalLessons 
    : 0;
  
  const previousTurns = context.previousUshaTurns?.length || 0;
  const repeatedQuestions = previousTurns > 2;

  if (courseLevel === "beginner") {
    return "detailed";
  }

  if (courseLevel === "advanced" && completionRatio > 0.7) {
    return "minimal";
  }

  if (repeatedQuestions || completionRatio < 0.3) {
    return "detailed";
  }

  if (completionRatio > 0.5) {
    return courseLevel === "advanced" ? "minimal" : "moderate";
  }

  return "moderate";
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

type LearningState = "pre-learning" | "learning-active" | "post-lesson";

function detectLearningState(context: UshaContext, message: string): LearningState {
  const lowerMessage = message.toLowerCase().trim();
  
  const greetingPatterns = [
    /^(hi|hello|hey|hii+|hola|namaste|namaskar)[\s!?.]*$/i,
    /^(who are you|what do you do|what is your name)[\s!?.]*$/i,
    /^(good (morning|afternoon|evening))[\s!?.]*$/i,
  ];
  
  const isGreeting = greetingPatterns.some(pattern => pattern.test(lowerMessage));
  
  if (context.lessonCompleted) {
    return "post-lesson";
  }
  
  // If on a lab page with lab context, treat as active learning
  if (context.labId && context.labTitle) {
    return "learning-active";
  }
  
  if (context.isVideoPlaying || context.hasInteractedWithContent) {
    return "learning-active";
  }
  
  if (isGreeting) {
    return "pre-learning";
  }
  
  const lessonKeywords = [
    "explain", "what is", "how does", "why", "tell me about",
    "i don't understand", "confused", "help me", "can you explain",
    "this lesson", "the video", "concept", "topic", "lab", "code"
  ];
  
  const asksAboutLesson = lessonKeywords.some(kw => lowerMessage.includes(kw));
  if (asksAboutLesson && (context.lessonTitle || context.lessonId || context.labTitle || context.labId)) {
    return "learning-active";
  }
  
  return "pre-learning";
}

function buildContextPrompt(
  context: UshaContext, 
  helpLevel: UshaHelpLevel, 
  language: SupportedLanguage = "en",
  learningState: LearningState
): string {
  let contextDesc = `CURRENT CONTEXT:\n`;
  contextDesc += `- Learning State: ${learningState.toUpperCase()}\n`;
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

  contextDesc += `\nLEARNING STATE INSTRUCTION:\n`;
  switch (learningState) {
    case "pre-learning":
      contextDesc += `The learner has NOT started learning yet. DO NOT assume they have. Introduce yourself, explain your role briefly, and invite them to start the lesson. Do NOT say anything about their progress or performance.`;
      break;
    case "learning-active":
      contextDesc += `The learner is actively engaged with the lesson. You may encourage them, reference the lesson topic, explain concepts, and answer doubts.`;
      break;
    case "post-lesson":
      contextDesc += `The learner has completed this lesson. Congratulate them and encourage them to continue to the next lesson.`;
      break;
  }

  if (learningState === "learning-active") {
    contextDesc += `\n\nHELP LEVEL INSTRUCTION:\n`;
    switch (helpLevel) {
      case "detailed":
        contextDesc += `Provide more explanation with analogies. Use simpler language. Break concepts into smaller steps. Be encouraging.`;
        break;
      case "moderate":
        contextDesc += `Balance concepts with structured guidance. Provide moderate detail. Encourage independent thinking.`;
        break;
      case "minimal":
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
      case "test":
        contextDesc += `Help understand concepts for test preparation. NEVER reveal actual test answers.`;
        break;
      default:
        contextDesc += `Explain concepts freely and encourage exploration.`;
    }
  }

  return contextDesc;
}

function buildConversationMessages(
  previousTurns: UshaTurn[] | undefined,
  contextPrompt: string,
  question: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: USHA_SYSTEM_PROMPT },
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

interface UshaApiResponse {
  answer: string;
  type: UshaResponseType;
  helpLevel: UshaHelpLevel;
}

function getMisuseResponse(isRepeated: boolean, helpLevel: UshaHelpLevel): UshaApiResponse {
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

      const { courseId, pageType, message, context, language: reqLanguage } = parseResult.data;

      const ushaContext: UshaContext = {
        courseId,
        pageType,
        studentId: userId,
        lessonId: context?.lessonId,
        labId: context?.labId,
        projectId: context?.projectId,
        testId: context?.testId,
        currentCode: context?.currentCode,
        errorMessage: context?.errorMessage,
        questionId: context?.questionId,
        lessonTitle: context?.lessonTitle,
        courseTitle: context?.courseTitle,
        courseLevel: context?.courseLevel,
        isVideoPlaying: context?.isVideoPlaying,
        hasInteractedWithContent: context?.hasInteractedWithContent,
        lessonCompleted: context?.lessonCompleted,
      };

      const helpLevel = calculateHelpLevel(ushaContext);
      const language = reqLanguage || "en";
      const learningState = detectLearningState(ushaContext, message);

      const misuseCheck = detectMisuse(message, userId);
      if (misuseCheck.isMisuse) {
        const warningResponse = getMisuseResponse(misuseCheck.isRepeated, helpLevel);
        await saveConversation(userId, courseId, pageType, message, warningResponse);
        return res.json(warningResponse);
      }

      const contextPrompt = buildContextPrompt(ushaContext, helpLevel, language, learningState);
      const messages = buildConversationMessages(undefined, contextPrompt, message);

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
        max_tokens: 400,
        temperature: 0.3,
      });

      const answer = completion.choices[0]?.message?.content || "I apologize, but I could not generate a response. Please try rephrasing your question.";
      const responseType = determineResponseType(message, answer);

      const response = {
        answer,
        type: responseType,
        helpLevel,
      };

      await saveConversation(userId, courseId, pageType, message, response);

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
  response: UshaApiResponse
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
        content: response.answer || "",
        responseType: response.type,
        helpLevel: response.helpLevel,
      }
    ]);
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
}
