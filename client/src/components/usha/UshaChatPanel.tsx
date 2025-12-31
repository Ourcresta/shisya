import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, X, Sparkles, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { UshaAllowedPage, UshaResponseType, UshaHelpLevel, StudentProgressSummary, UshaTurn } from "@shared/schema";

interface UshaContext {
  courseId: number;
  moduleId?: number;
  lessonId?: number;
  labId?: number;
  projectId?: number;
  pageType: UshaAllowedPage;
  courseTitle?: string;
  courseLevel?: "beginner" | "intermediate" | "advanced";
  lessonTitle?: string;
  labTitle?: string;
  projectTitle?: string;
  studentProgressSummary?: StudentProgressSummary;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: UshaResponseType;
  helpLevel?: UshaHelpLevel;
}

interface UshaApiResponse {
  answer: string;
  type: UshaResponseType;
  helpLevel: UshaHelpLevel;
  remaining?: number;
  nearLimit?: boolean;
  error?: string;
}

interface UshaChatPanelProps {
  context: UshaContext;
  onClose: () => void;
}

function getResponseTypeBadge(type: UshaResponseType): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  switch (type) {
    case "explanation":
      return { label: "Explanation", variant: "secondary" };
    case "hint":
      return { label: "Hint", variant: "outline" };
    case "guidance":
      return { label: "Guidance", variant: "secondary" };
    case "warning":
      return { label: "Notice", variant: "destructive" };
    default:
      return { label: "Response", variant: "secondary" };
  }
}

function getHelpLevelLabel(level: UshaHelpLevel): string {
  switch (level) {
    case "beginner":
      return "Detailed";
    case "intermediate":
      return "Balanced";
    case "advanced":
      return "Concise";
    default:
      return "";
  }
}

export function UshaChatPanel({ context, onClose }: UshaChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [nearLimit, setNearLimit] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getPreviousTurns = (): UshaTurn[] => {
    return messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  };

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/usha/ask", {
        context: {
          studentId: user?.id,
          ...context,
          previousUshaTurns: getPreviousTurns(),
        },
        question,
      });
      return await response.json() as UshaApiResponse;
    },
    onSuccess: (data) => {
      if (data.remaining !== undefined) {
        setRemainingRequests(data.remaining);
      }
      if (data.nearLimit !== undefined) {
        setNearLimit(data.nearLimit);
      }
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: data.answer, 
          type: data.type,
          helpLevel: data.helpLevel,
        },
      ]);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Sorry, I could not process your question. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage, type: "warning" },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || askMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    askMutation.mutate(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPageTypeLabel = (pageType: UshaAllowedPage): string => {
    switch (pageType) {
      case "lesson": return "Lesson";
      case "lab": return "Lab";
      case "project": return "Project";
      case "test_prep": return "Test Prep";
      default: return "Learning";
    }
  };

  return (
    <Card className="fixed bottom-24 right-6 w-96 max-h-[70vh] z-50 flex flex-col shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">Usha</h3>
            <p className="text-xs text-muted-foreground">
              {getPageTypeLabel(context.pageType)} Assistant
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-usha-close"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      {nearLimit && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-xs">
            {remainingRequests} questions remaining this minute
          </p>
        </div>
      )}

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-80 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">Hi, I am Usha, your learning companion.</p>
              <p className="text-xs mb-4">
                I explain concepts, give hints, and guide your thinking.
                I am here to help you learn, not to solve for you.
              </p>
              <div className="text-xs space-y-1">
                <p className="font-medium">Try asking:</p>
                <p className="italic">"Can you explain this concept?"</p>
                <p className="italic">"I am stuck on this step. Any hints?"</p>
                <p className="italic">"What approach should I take?"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    data-testid={`message-${message.role}-${index}`}
                  >
                    {message.role === "assistant" && message.type && (
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={getResponseTypeBadge(message.type).variant}
                          className="text-xs"
                          data-testid={`badge-response-type-${index}`}
                        >
                          {getResponseTypeBadge(message.type).label}
                        </Badge>
                        {message.helpLevel && (
                          <span className="text-xs text-muted-foreground" data-testid={`text-help-level-${index}`}>
                            {getHelpLevelLabel(message.helpLevel)}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {askMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-10 max-h-24 resize-none text-sm"
            disabled={askMutation.isPending}
            data-testid="input-usha-question"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || askMutation.isPending}
            data-testid="button-usha-send"
          >
            {askMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
