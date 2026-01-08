import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Send, X, AlertCircle, Globe, Trash2, Lightbulb, Code, HelpCircle, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import type { UshaPageType, UshaResponseType, UshaHelpLevel, StudentProgressSummary, UshaTurn, SupportedLanguage } from "@shared/schema";
import ushaAvatarImage from "@assets/image_1767697725032.png";

const LAB_SUGGESTIONS = [
  { text: "Explain this concept with an example", icon: Lightbulb },
  { text: "Why is my code not working?", icon: Code },
  { text: "What should I try next?", icon: HelpCircle },
  { text: "Give me a hint for this step", icon: Sparkles },
  { text: "Help me understand the logic", icon: Lightbulb },
  { text: "What's the best approach here?", icon: Code },
];

interface UshaContext {
  courseId: number;
  moduleId?: number;
  lessonId?: number;
  labId?: number;
  projectId?: number;
  pageType: UshaPageType;
  courseTitle?: string;
  courseLevel?: "beginner" | "intermediate" | "advanced";
  lessonTitle?: string;
  labTitle?: string;
  labObjective?: string;
  labInstructions?: string[];
  labLanguage?: string;
  labDifficulty?: string;
  labExpectedOutput?: string;
  currentCode?: string;
  projectTitle?: string;
  studentProgressSummary?: StudentProgressSummary;
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
};

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
    case "detailed":
      return "Detailed";
    case "moderate":
      return "Balanced";
    case "minimal":
      return "Concise";
    default:
      return "";
  }
}

export function UshaChatPanel({ context, onClose }: UshaChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("en");
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
      // Build context object, only including non-null values
      const contextObj: Record<string, any> = {};
      if (context.lessonId != null) contextObj.lessonId = context.lessonId;
      if (context.labId != null) contextObj.labId = context.labId;
      if (context.projectId != null) contextObj.projectId = context.projectId;
      if (context.lessonTitle) contextObj.lessonTitle = context.lessonTitle;
      if (context.labTitle) contextObj.labTitle = context.labTitle;
      if (context.labObjective) contextObj.labObjective = context.labObjective;
      if (context.labInstructions?.length) contextObj.labInstructions = context.labInstructions;
      if (context.labLanguage) contextObj.labLanguage = context.labLanguage;
      if (context.labDifficulty) contextObj.labDifficulty = context.labDifficulty;
      if (context.labExpectedOutput) contextObj.labExpectedOutput = context.labExpectedOutput;
      if (context.currentCode) contextObj.currentCode = context.currentCode;
      if (context.projectTitle) contextObj.projectTitle = context.projectTitle;
      if (context.courseTitle) contextObj.courseTitle = context.courseTitle;
      if (context.courseLevel) contextObj.courseLevel = context.courseLevel;
      
      const response = await apiRequest("POST", "/api/usha/ask", {
        courseId: context.courseId,
        pageType: context.pageType,
        message: question,
        language,
        context: contextObj,
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || askMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    askMutation.mutate(question);
  }, [input, askMutation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onClose();
    }
  }, [handleSubmit, onClose]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const pageTypeLabel = useMemo(() => {
    switch (context.pageType) {
      case "lesson": return "Lesson";
      case "lab": return "Lab Assistant";
      case "project": return "Project";
      case "test": return "Test";
      default: return "Learning";
    }
  }, [context.pageType]);

  const hasMessages = messages.length > 0;

  return (
    <Card className="fixed bottom-24 right-6 w-96 max-h-[70vh] z-50 flex flex-col shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-sm">
              <AvatarImage src={ushaAvatarImage} alt="Usha" />
              <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
            </Avatar>
          </motion.div>
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-1">
              Usha
              <Sparkles className="w-3 h-3 text-primary/70" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {pageTypeLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Select value={language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
            <SelectTrigger className="w-[90px] h-8 text-xs" data-testid="select-usha-language">
              <Globe className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en" data-testid="option-english">English</SelectItem>
              <SelectItem value="hi" data-testid="option-hindi">Hindi</SelectItem>
              <SelectItem value="ta" data-testid="option-tamil">Tamil</SelectItem>
              <SelectItem value="te" data-testid="option-telugu">Telugu</SelectItem>
              <SelectItem value="kn" data-testid="option-kannada">Kannada</SelectItem>
              <SelectItem value="ml" data-testid="option-malayalam">Malayalam</SelectItem>
            </SelectContent>
          </Select>
          {hasMessages && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClearChat}
                  data-testid="button-usha-clear"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear chat</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                data-testid="button-usha-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close (Esc)</TooltipContent>
          </Tooltip>
        </div>
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
          {!hasMessages ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-4"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-lg mb-3">
                  <AvatarImage src={ushaAvatarImage} alt="Usha" />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">U</AvatarFallback>
                </Avatar>
              </motion.div>
              
              <h4 className="font-semibold text-foreground mb-1">Hi! I'm Usha</h4>
              <p className="text-sm text-muted-foreground mb-3 max-w-[280px]">
                Your Lab Assistant - I explain concepts deeply with examples, give hints, and guide your thinking.
              </p>
              
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground/70 font-medium">Try asking:</p>
                <div className="grid grid-cols-2 gap-2 px-2">
                  {LAB_SUGGESTIONS.slice(0, 4).map((suggestion) => {
                    const Icon = suggestion.icon;
                    return (
                      <motion.button
                        key={suggestion.text}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors border border-primary/10 text-left"
                        data-testid={`button-suggestion-${suggestion.text.toLowerCase().replace(/\s+/g, '-').replace(/[?',]/g, '')}`}
                      >
                        <Icon className="w-3 h-3 text-primary shrink-0" />
                        <span className="line-clamp-2">{suggestion.text}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 px-2">
                  {LAB_SUGGESTIONS.slice(4).map((suggestion) => {
                    const Icon = suggestion.icon;
                    return (
                      <motion.button
                        key={suggestion.text}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors text-left"
                        data-testid={`button-suggestion-${suggestion.text.toLowerCase().replace(/\s+/g, '-').replace(/[?',]/g, '')}`}
                      >
                        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="line-clamp-2">{suggestion.text}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
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
