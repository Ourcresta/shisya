import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, PhoneCall, PhoneOff } from "lucide-react";
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
  abort: () => void;
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

function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    "Google UK English Female",
    "Google US English",
    "Microsoft Zira Desktop",
    "Microsoft Aria Online",
    "Samantha",
    "Victoria",
    "Karen",
    "Moira",
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  const femaleEn = voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"));
  if (femaleEn) return femaleEn;
  const anyEn = voices.find((v) => v.lang.startsWith("en"));
  return anyEn || voices[0] || null;
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
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceModeRef = useRef(false);
  const isSpeakingRef = useRef(false);

  const hasSpeechRecognition = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  const firstName = user?.name?.split(" ")[0] || "";

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !voiceMode && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, voiceMode]);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setInterimText("");
    setIsListening(false);
    setVoiceMode(false);
  }, [lessonId]);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopListening();
      setVoiceMode(false);
    }
  }, [isOpen]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const stopSpeaking = useCallback(() => {
    if (hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, [hasSpeechSynthesis]);

  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (!hasSpeechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    const plainText = stripHtml(text).slice(0, 600);
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    const trySetVoice = () => {
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      trySetVoice();
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", trySetVoice, { once: true });
    }

    utterance.onstart = () => { setIsSpeaking(true); isSpeakingRef.current = true; };
    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onDone?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  }, [hasSpeechSynthesis]);

  const startListening = useCallback(() => {
    if (!hasSpeechRecognition || isListening) return;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      setInterimText(transcript);
      setInput(transcript);
      if (isFinal) {
        setIsListening(false);
        setInterimText("");
        if (voiceModeRef.current && transcript.trim()) {
          sendMessageInternal(transcript.trim());
        }
      }
    };

    recognition.onerror = () => { setIsListening(false); setInterimText(""); };
    recognition.onend = () => { setIsListening(false); setInterimText(""); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [hasSpeechRecognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const sendMessageInternal = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setInterimText("");
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/usha/ask", {
        courseId,
        pageType: "lesson",
        message: text.trim(),
        context: {
          lessonId,
          lessonTitle,
          courseTitle,
          objectives: objectives?.join(", "),
          studentName: user?.name || undefined,
        },
        language: "en",
      });

      const data = await res.json();
      const aiContent = data.answer || data.response || data.message || "I'm not sure how to answer that.";

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: aiContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (voiceModeRef.current) {
        speakText(aiContent, () => {
          if (voiceModeRef.current) {
            setTimeout(() => startListening(), 600);
          }
        });
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
      if (voiceModeRef.current) {
        setTimeout(() => startListening(), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, courseId, lessonId, lessonTitle, courseTitle, objectives, user, speakText, startListening]);

  const sendMessage = useCallback((text: string) => {
    sendMessageInternal(text);
  }, [sendMessageInternal]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const enterVoiceMode = useCallback(() => {
    setVoiceMode(true);
    voiceModeRef.current = true;
    stopSpeaking();
    setTimeout(() => startListening(), 300);
  }, [startListening, stopSpeaking]);

  const exitVoiceMode = useCallback(() => {
    setVoiceMode(false);
    voiceModeRef.current = false;
    stopListening();
    stopSpeaking();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [stopListening, stopSpeaking]);

  if (!isOpen) return null;

  return (
    <div className="vuc-panel" data-testid="video-usha-chat">
      {/* Header */}
      <div className="vuc-header">
        <div className="relative">
          <Avatar className="h-8 w-8 border border-cyan-500/30">
            <AvatarImage src={ushaAvatarImage} alt="Usha AI" />
            <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs font-bold">U</AvatarFallback>
          </Avatar>
          {isSpeaking && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-black animate-pulse" />
          )}
        </div>
        <div className="vuc-header-info">
          <div className="vuc-header-name">Usha AI Tutor</div>
          <div className="vuc-header-status" style={{ color: isSpeaking ? "#22d3ee" : isListening ? "#4ade80" : undefined }}>
            {isSpeaking ? "Speaking…" : isListening ? "Listening…" : voiceMode ? "Voice Mode" : "Online"}
          </div>
        </div>

        {/* Voice Mode toggle */}
        {hasSpeechRecognition && (
          <button
            className="vuc-tts-btn"
            onClick={voiceMode ? exitVoiceMode : enterVoiceMode}
            title={voiceMode ? "Exit voice conversation" : "Start voice conversation"}
            data-testid="button-voice-mode"
            style={{ color: voiceMode ? "#22d3ee" : undefined }}
          >
            {voiceMode ? <PhoneOff className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
          </button>
        )}

        <button
          className="vp-ctrl-btn"
          onClick={() => { stopSpeaking(); stopListening(); onClose(); }}
          style={{ color: "hsl(var(--muted-foreground))", width: 28, height: 28 }}
          data-testid="button-close-chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="vuc-messages hide-scrollbar" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <div className="relative mx-auto w-fit">
              <Avatar className="h-14 w-14 mx-auto border-2 border-cyan-500/40">
                <AvatarImage src={ushaAvatarImage} alt="Usha AI" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-black" />
            </div>
            <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {firstName ? `Hi ${firstName}! I'm Usha 👋` : "Hi! I'm Usha 👋"}
            </p>
            <p className="text-xs text-muted-foreground max-w-[230px] mx-auto leading-relaxed">
              Your AI tutor for "{lessonTitle}". Ask me anything — or tap the{" "}
              <PhoneCall className="inline w-3 h-3 text-cyan-400" /> button to talk to me!
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

      {/* Quick Suggestions */}
      {messages.length === 0 && !voiceMode && (
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

      {/* Voice Mode UI */}
      {voiceMode ? (
        <div className="flex flex-col items-center gap-3 px-4 py-5">
          {/* Big listen button */}
          <button
            className={`vuc-voice-orb ${isListening ? "vuc-voice-orb-listening" : isSpeaking ? "vuc-voice-orb-speaking" : ""}`}
            onClick={() => {
              if (isSpeaking) { stopSpeaking(); setTimeout(() => startListening(), 200); }
              else if (isListening) { stopListening(); }
              else { startListening(); }
            }}
            data-testid="button-voice-orb"
            title={isListening ? "Tap to stop" : isSpeaking ? "Tap to interrupt" : "Tap to speak"}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-cyan-300" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-cyan-300" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-cyan-400" />
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground min-h-[16px]">
            {isLoading ? "Usha is thinking…" : isSpeaking ? "Usha is speaking — tap to interrupt" : isListening ? (interimText || "Listening… speak now") : "Tap the mic to speak"}
          </p>

          {interimText && (
            <p className="text-xs text-center text-cyan-300/80 italic max-w-[220px] line-clamp-2">"{interimText}"</p>
          )}

          <button
            className="text-xs text-muted-foreground underline underline-offset-2 mt-1"
            onClick={exitVoiceMode}
            data-testid="button-exit-voice"
          >
            Switch to text
          </button>
        </div>
      ) : (
        /* Text Input */
        <div className="vuc-input-area">
          {hasSpeechRecognition && (
            <button
              className={`vuc-mic-btn ${isListening ? "vuc-mic-btn-active" : ""}`}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Speak your question"}
              data-testid="button-mic"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            className="vuc-input"
            placeholder={isListening ? `Listening${interimText ? `: ${interimText}` : "…"}` : "Ask Usha anything…"}
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
      )}
    </div>
  );
}
