import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Mic, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import ushaAvatarImage from "@assets/image_1767697725032.png";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

interface VideoUshaChatProps {
  courseId: number;
  lessonId: number;
  lessonTitle: string;
  courseTitle?: string;
  objectives?: string[];
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_SUGGESTIONS = [
  "Explain this topic simply",
  "Give me an example",
  "Quiz me on this",
  "Summarize the lesson",
];

interface SpeechRecognitionEvent {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function simpleMarkdown(text: string): string {
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>');
  return `<p>${html}</p>`;
}

export function VideoUshaChat({
  courseId,
  lessonId,
  lessonTitle,
  courseTitle,
  objectives,
  isOpen,
  onClose,
}: VideoUshaChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSpeechRecognition = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [lessonId]);

  const speakText = useCallback((text: string) => {
    if (!hasSpeechSynthesis) return;
    window.speechSynthesis.cancel();
    const plainText = stripHtml(text);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [hasSpeechSynthesis]);

  const stopSpeaking = useCallback(() => {
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [hasSpeechSynthesis]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/usha/ask", {
        courseId,
        pageType: "lesson",
        message: text.trim(),
        context: {
          lessonId,
          lessonTitle,
          objectives: objectives?.join(", "),
        },
        language: "en",
      });

      const data = await res.json();
      const aiContent = data.response || data.message || "I'm not sure how to answer that.";

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: aiContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled) {
        speakText(aiContent);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "ai",
        content: err?.message?.includes("429")
          ? "I need a moment to catch my breath. Please try again shortly."
          : "Sorry, I couldn't process that. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, courseId, lessonId, lessonTitle, objectives, ttsEnabled, speakText]);

  const toggleListening = useCallback(() => {
    if (!hasSpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      if (event.results[0].isFinal) {
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, hasSpeechRecognition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vuc-panel" data-testid="video-usha-chat">
      <div className="vuc-header">
        <Avatar className="h-8 w-8 border border-cyan-500/30">
          <AvatarImage src={ushaAvatarImage} alt="Usha AI" />
          <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs font-bold">U</AvatarFallback>
        </Avatar>
        <div className="vuc-header-info">
          <div className="vuc-header-name">Usha AI Tutor</div>
          <div className="vuc-header-status">Online</div>
        </div>
        {hasSpeechSynthesis && (
          <button
            className="vuc-tts-btn"
            onClick={() => {
              if (ttsEnabled) stopSpeaking();
              setTtsEnabled(!ttsEnabled);
            }}
            title={ttsEnabled ? "Disable auto-read" : "Enable auto-read"}
            data-testid="button-tts-toggle"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-cyan-500" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}
        <button
          className="vp-ctrl-btn"
          onClick={onClose}
          style={{ color: "hsl(var(--muted-foreground))", width: 28, height: 28 }}
          data-testid="button-close-chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="vuc-messages hide-scrollbar" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <Avatar className="h-12 w-12 mx-auto border border-cyan-500/30">
              <AvatarImage src={ushaAvatarImage} alt="Usha AI" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>
              Hi! I'm Usha, your AI tutor
            </p>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
              Ask me anything about "{lessonTitle}" — I'm here to help you learn!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`vuc-msg ${msg.role === "user" ? "vuc-msg-user" : "vuc-msg-ai"}`}>
            {msg.role === "ai" ? (
              <div className="flex items-start gap-1">
                <div
                  className="prose prose-sm dark:prose-invert flex-1"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(msg.content) }}
                />
                {hasSpeechSynthesis && (
                  <button
                    className="vuc-tts-btn flex-shrink-0 mt-0.5"
                    onClick={() => speakText(msg.content)}
                    title="Read aloud"
                    data-testid={`button-speak-${msg.id}`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              msg.content
            )}
          </div>
        ))}

        {isLoading && (
          <div className="vuc-typing">
            <div className="vuc-typing-dot" />
            <div className="vuc-typing-dot" />
            <div className="vuc-typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="vuc-suggestions">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              className="vuc-suggestion-btn"
              onClick={() => sendMessage(suggestion)}
              data-testid={`button-suggestion-${suggestion.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="vuc-input-area">
        {hasSpeechRecognition && (
          <button
            className={`vuc-mic-btn ${isListening ? "vuc-mic-btn-active" : ""}`}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Speak your question"}
            data-testid="button-mic"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          className="vuc-input"
          placeholder={isListening ? "Listening..." : "Ask Usha a question..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          data-testid="input-chat"
        />
        <button
          className="vuc-send-btn"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          data-testid="button-send"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}