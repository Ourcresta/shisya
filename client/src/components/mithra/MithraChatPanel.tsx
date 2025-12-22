import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Send, Sparkles, AlertTriangle, Lightbulb, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { MithraContext, MithraResponse, MithraResponseType } from "@shared/schema";

interface MithraChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: MithraContext;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  responseType?: MithraResponseType;
  createdAt: string;
}

const RESPONSE_ICONS: Record<MithraResponseType, typeof Sparkles> = {
  explanation: BookOpen,
  hint: Lightbulb,
  guidance: Compass,
  warning: AlertTriangle,
};

const RESPONSE_COLORS: Record<MithraResponseType, string> = {
  explanation: "text-blue-500",
  hint: "text-amber-500",
  guidance: "text-green-500",
  warning: "text-orange-500",
};

export function MithraChatPanel({ isOpen, onClose, context }: MithraChatPanelProps) {
  const [question, setQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: historyData, isLoading: historyLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["/api/mithra/history", context.courseId, context.pageType],
    enabled: isOpen,
  });

  const messages = historyData?.messages || [];

  const askMutation = useMutation({
    mutationFn: async (q: string) => {
      const response = await apiRequest("POST", "/api/mithra/ask", {
        context,
        question: q,
      });
      return response.json() as Promise<MithraResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/mithra/history", context.courseId, context.pageType] 
      });
      setQuestion("");
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, askMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !askMutation.isPending) {
      askMutation.mutate(question.trim());
    }
  };

  if (!isOpen) return null;

  const getContextTitle = () => {
    if (context.lessonTitle) return context.lessonTitle;
    if (context.labTitle) return context.labTitle;
    if (context.projectTitle) return context.projectTitle;
    return context.courseTitle || "Learning";
  };

  return (
    <div 
      className="fixed bottom-20 right-4 w-96 h-[500px] bg-background border rounded-lg shadow-lg flex flex-col z-50"
      data-testid="mithra-chat-panel"
    >
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Mithra</h3>
            <p className="text-xs text-muted-foreground truncate max-w-48">{getContextTitle()}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          data-testid="button-close-mithra"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : messages.length === 0 && !askMutation.isPending ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium mb-2">Hi, I'm Mithra</h4>
            <p className="text-sm text-muted-foreground">
              I'm here to help you understand concepts and guide your learning. Ask me about anything related to your current {context.pageType}!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const Icon = msg.responseType ? RESPONSE_ICONS[msg.responseType] : null;
              const iconColor = msg.responseType ? RESPONSE_COLORS[msg.responseType] : "";
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" && Icon && (
                      <div className={`flex items-center gap-1 mb-1 ${iconColor}`}>
                        <Icon className="w-3 h-3" />
                        <span className="text-xs capitalize">{msg.responseType}</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            {askMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg p-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        {askMutation.isError && (
          <div className="text-xs text-destructive mb-2">
            {(askMutation.error as any)?.message || "Something went wrong. Please try again."}
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Mithra a question..."
            className="min-h-[40px] max-h-[100px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            data-testid="input-mithra-question"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!question.trim() || askMutation.isPending}
            data-testid="button-send-mithra"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Mithra helps you learn - not cheat!
        </p>
      </form>
    </div>
  );
}
