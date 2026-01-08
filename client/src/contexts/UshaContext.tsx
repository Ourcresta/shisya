import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

export type UshaState = "idle" | "explaining" | "listening" | "responding" | "completion";
export type UshaLanguage = "en" | "hi" | "ta" | "te" | "kn" | "ml" | "mr";

interface UshaContextType {
  state: UshaState;
  setState: (state: UshaState) => void;
  language: UshaLanguage;
  setLanguage: (lang: UshaLanguage) => void;
  currentMessage: string;
  setCurrentMessage: (msg: string) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  isVideoPlaying: boolean;
  setIsVideoPlaying: (playing: boolean) => void;
  lessonId: number | null;
  setLessonId: (id: number | null) => void;
  courseId: number | null;
  setCourseId: (id: number | null) => void;
  lessonTitle: string;
  setLessonTitle: (title: string) => void;
  courseTitle: string;
  setCourseTitle: (title: string) => void;
  courseLevel: string;
  setCourseLevel: (level: string) => void;
  labId: number | null;
  setLabId: (id: number | null) => void;
  labTitle: string;
  setLabTitle: (title: string) => void;
  hasInteractedWithContent: boolean;
  setHasInteractedWithContent: (interacted: boolean) => void;
  lessonCompleted: boolean;
  setLessonCompleted: (completed: boolean) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  toggleChat: () => void;
  askQuestion: (question: string) => Promise<void>;
  isLoading: boolean;
  response: string | null;
  startExplaining: () => void;
  stopExplaining: () => void;
  markComplete: () => void;
}

const UshaContext = createContext<UshaContextType | undefined>(undefined);

const LANGUAGE_NAMES: Record<UshaLanguage, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
};

export function UshaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UshaState>("idle");
  const [language, setLanguage] = useState<UshaLanguage>("en");
  const [currentMessage, setCurrentMessage] = useState("Click to ask me anything about this lesson");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [labId, setLabId] = useState<number | null>(null);
  const [labTitle, setLabTitle] = useState("");
  const [hasInteractedWithContent, setHasInteractedWithContent] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const toggleChat = useCallback(() => {
    setShowChat(prev => !prev);
    if (!showChat) {
      setState("listening");
      setCurrentMessage("I'm listening... Ask me anything about this lesson.");
    }
  }, [showChat]);

  const startExplaining = useCallback(() => {
    setState("explaining");
    setIsSpeaking(true);
    setCurrentMessage("I'm walking you through this lesson...");
  }, []);

  const stopExplaining = useCallback(() => {
    setIsSpeaking(false);
    if (state === "explaining") {
      setState("idle");
      setCurrentMessage("Paused. Click play to continue, or ask me a question.");
    }
  }, [state]);

  const markComplete = useCallback(() => {
    setState("completion");
    setCurrentMessage("Great job completing this lesson! Ready for the next one?");
    setTimeout(() => {
      setState("idle");
      setCurrentMessage("Click to ask me anything about this lesson");
    }, 5000);
  }, []);

  const askQuestion = useCallback(async (question: string) => {
    // Allow questions for labs even without lessonId
    if (!courseId || (!lessonId && !labId)) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState("responding");
    setIsLoading(true);
    setCurrentMessage("Let me think about that...");
    setHasInteractedWithContent(true);

    // Determine page type based on context
    const pageType = labId ? "lab" : "lesson";

    try {
      const res = await fetch("/api/usha/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          courseId,
          pageType,
          message: question,
          language,
          context: {
            lessonId,
            lessonTitle,
            courseTitle,
            courseLevel,
            labId,
            labTitle,
            isVideoPlaying,
            hasInteractedWithContent: true,
            lessonCompleted,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      setResponse(data.answer);
      setCurrentMessage(data.answer.substring(0, 100) + (data.answer.length > 100 ? "..." : ""));
      setIsSpeaking(true);
      
      setTimeout(() => {
        setIsSpeaking(false);
        setState("idle");
      }, 3000);

    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Usha ask error:", error);
      setCurrentMessage("I had trouble understanding. Could you rephrase that?");
      setState("idle");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, labId, language, lessonTitle, courseTitle, courseLevel, labTitle, isVideoPlaying, lessonCompleted]);

  useEffect(() => {
    if (isVideoPlaying && state === "idle") {
      startExplaining();
    } else if (!isVideoPlaying && state === "explaining") {
      stopExplaining();
    }
  }, [isVideoPlaying, state, startExplaining, stopExplaining]);

  useEffect(() => {
    if (lessonId) {
      setState("idle");
      setResponse(null);
      setCurrentMessage(`Ready to help you learn. Ask me anything!`);
    }
  }, [lessonId]);

  const value: UshaContextType = {
    state,
    setState,
    language,
    setLanguage,
    currentMessage,
    setCurrentMessage,
    isSpeaking,
    setIsSpeaking,
    isVideoPlaying,
    setIsVideoPlaying,
    lessonId,
    setLessonId,
    courseId,
    setCourseId,
    lessonTitle,
    setLessonTitle,
    courseTitle,
    setCourseTitle,
    courseLevel,
    setCourseLevel,
    labId,
    setLabId,
    labTitle,
    setLabTitle,
    hasInteractedWithContent,
    setHasInteractedWithContent,
    lessonCompleted,
    setLessonCompleted,
    showChat,
    setShowChat,
    toggleChat,
    askQuestion,
    isLoading,
    response,
    startExplaining,
    stopExplaining,
    markComplete,
  };

  return (
    <UshaContext.Provider value={value}>
      {children}
    </UshaContext.Provider>
  );
}

export function useUsha() {
  const context = useContext(UshaContext);
  if (!context) {
    throw new Error("useUsha must be used within UshaProvider");
  }
  return context;
}

export { LANGUAGE_NAMES };
