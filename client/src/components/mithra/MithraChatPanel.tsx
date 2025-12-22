import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, X, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { MithraAllowedPage, MithraResponse, MithraResponseType } from "@shared/schema";

interface MithraContext {
  courseId: number;
  moduleId?: number;
  lessonId?: number;
  labId?: number;
  projectId?: number;
  pageType: MithraAllowedPage;
  courseTitle?: string;
  lessonTitle?: string;
  labTitle?: string;
  projectTitle?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: MithraResponseType;
}

interface MithraChatPanelProps {
  context: MithraContext;
  onClose: () => void;
}

function getResponseTypeBadge(type: MithraResponseType): { label: string; variant: "default" | "secondary" | "outline" } {
  switch (type) {
    case "explanation":
      return { label: "Explanation", variant: "secondary" };
    case "hint":
      return { label: "Hint", variant: "outline" };
    case "guidance":
      return { label: "Guidance", variant: "secondary" };
    case "warning":
      return { label: "Notice", variant: "default" };
    default:
      return { label: "Response", variant: "secondary" };
  }
}

export function MithraChatPanel({ context, onClose }: MithraChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest<MithraResponse>("/api/mithra/ask", {
        method: "POST",
        body: JSON.stringify({
          context: {
            studentId: user?.id,
            ...context,
          },
          question,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, type: data.type },
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

  const getPageTypeLabel = (pageType: MithraAllowedPage): string => {
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
            <h3 className="font-semibold text-sm">Mithra</h3>
            <p className="text-xs text-muted-foreground">
              {getPageTypeLabel(context.pageType)} Assistant
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-8 w-8"
          data-testid="button-mithra-close"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-80 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">Hi, I am Mithra, your learning companion.</p>
              <p className="text-xs">
                Ask me to explain concepts, give hints, or guide your thinking.
                I am here to help you learn, not to solve for you.
              </p>
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
                      <div className="mb-1">
                        <Badge 
                          variant={getResponseTypeBadge(message.type).variant}
                          className="text-xs"
                        >
                          {getResponseTypeBadge(message.type).label}
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {askMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
            data-testid="input-mithra-question"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || askMutation.isPending}
            data-testid="button-mithra-send"
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
