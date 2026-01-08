import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles, Volume2, VolumeX, Globe, Heart, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUsha, LANGUAGE_NAMES, type UshaLanguage, type UshaState } from "@/contexts/UshaContext";
import ushaAvatarImage from "@assets/image_1767697725032.png";

const STATE_MESSAGES: Record<UshaState, string> = {
  idle: "I'm here for you",
  explaining: "Sharing with you...",
  listening: "I'm listening...",
  responding: "Thinking...",
  completion: "You're doing great!",
};

const SUGGESTIONS = [
  { text: "Explain this simply", icon: "book" },
  { text: "I'm feeling stuck", icon: "heart" },
  { text: "Give me an example", icon: "lightbulb" },
  { text: "How are you, Usha?", icon: "smile" },
  { text: "I need motivation", icon: "star" },
  { text: "Just want to talk", icon: "chat" },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ 
  role, 
  content, 
  isLatest 
}: { 
  role: "user" | "usha"; 
  content: string; 
  isLatest: boolean;
}) {
  const isUser = role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <Avatar className="w-7 h-7 mr-2 shrink-0 mt-1">
          <AvatarImage src={ushaAvatarImage} alt="Usha" />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">U</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </motion.div>
  );
}

export function UshaTeacher() {
  const {
    state,
    language,
    setLanguage,
    currentMessage,
    isSpeaking,
    showChat,
    setShowChat,
    toggleChat,
    askQuestion,
    isLoading,
    response,
    lessonTitle,
    error,
  } = useUsha();

  const [inputValue, setInputValue] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "usha"; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (response) {
      setMessages(prev => [...prev, { role: "usha", content: response }]);
    }
  }, [response]);

  useEffect(() => {
    if (error) {
      setMessages(prev => [...prev, { 
        role: "usha", 
        content: "I'm having trouble connecting right now. Let me try again in a moment..." 
      }]);
    }
  }, [error]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (showChat && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showChat]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    
    await askQuestion(question);
  }, [inputValue, isLoading, askQuestion]);

  const handleSuggestionClick = useCallback((text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowChat(false);
    }
  }, [setShowChat]);

  const getStateColor = useMemo(() => {
    switch (state) {
      case "explaining": return "bg-green-500";
      case "listening": return "bg-blue-500";
      case "responding": return "bg-amber-500";
      case "completion": return "bg-purple-500";
      default: return "bg-green-400";
    }
  }, [state]);

  const hasMessages = messages.length > 0;

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          {!showChat && currentMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute bottom-full right-0 mb-3 w-64"
            >
              <Card className="p-3 bg-card/95 backdrop-blur-sm border shadow-lg">
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{currentMessage}</p>
                </div>
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b rotate-45 transform origin-center" />
              </Card>
            </motion.div>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleChat}
                size="icon"
                className={`relative w-16 h-16 rounded-full shadow-xl overflow-visible transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 ${
                  isSpeaking ? "ring-4 ring-primary/50 ring-offset-2 ring-offset-background" : ""
                }`}
                data-testid="button-usha-avatar"
              >
                <div className="relative w-full h-full">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={ushaAvatarImage} alt="Usha - Your Learning Companion" className="object-cover" />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">U</AvatarFallback>
                  </Avatar>
                  
                  {isSpeaking && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStateColor} border-2 border-background`} />

                {state === "explaining" && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-red-500 text-white animate-pulse"
                  >
                    LIVE
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-card border">
              <p className="text-sm">Chat with Usha</p>
            </TooltipContent>
          </Tooltip>

          <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
            {STATE_MESSAGES[state]}
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
            onKeyDown={handleKeyDown}
          >
            <Card className="flex flex-col h-[500px] max-h-[70vh] shadow-2xl border overflow-hidden">
              <div className="flex items-center justify-between gap-2 p-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-primary/30 shadow-sm">
                      <AvatarImage src={ushaAvatarImage} alt="Usha" />
                      <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStateColor} border-2 border-background`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      Usha
                      <Sparkles className="w-3 h-3 text-primary" />
                    </h3>
                    <p className="text-xs text-muted-foreground">Your Learning Companion</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5">
                  <Select value={language} onValueChange={(v) => setLanguage(v as UshaLanguage)}>
                    <SelectTrigger className="w-auto h-8 text-xs gap-1 border-none bg-transparent" data-testid="select-usha-language">
                      <Globe className="w-3 h-3" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsMuted(!isMuted)}
                        data-testid="button-usha-mute"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
                  </Tooltip>

                  {hasMessages && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleClearChat}
                          data-testid="button-usha-clear"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear chat</TooltipContent>
                    </Tooltip>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowChat(false)}
                    data-testid="button-usha-close"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {lessonTitle && (
                <div className="px-4 py-2 bg-muted/30 border-b">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3" />
                    Learning:
                  </p>
                  <p className="text-sm font-medium truncate">{lessonTitle}</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!hasMessages && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-lg mb-4">
                        <AvatarImage src={ushaAvatarImage} alt="Usha" />
                        <AvatarFallback className="bg-primary/20 text-primary text-2xl">U</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <h4 className="font-semibold text-foreground mb-1">Hi! I'm Usha</h4>
                    <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
                      I'm here to learn with you, talk, or just listen. Ask me anything!
                    </p>
                    
                    <div className="w-full space-y-2">
                      <p className="text-xs text-muted-foreground/70">Try saying:</p>
                      <div className="flex flex-wrap gap-2 justify-center px-2">
                        {SUGGESTIONS.slice(0, 4).map((suggestion) => (
                          <motion.button
                            key={suggestion.text}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-foreground transition-colors border border-primary/10"
                            data-testid={`button-suggestion-${suggestion.text.toLowerCase().replace(/\s+/g, '-').replace(/[?',]/g, '')}`}
                          >
                            {suggestion.text}
                          </motion.button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center px-2">
                        {SUGGESTIONS.slice(4).map((suggestion) => (
                          <motion.button
                            key={suggestion.text}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                            data-testid={`button-suggestion-${suggestion.text.toLowerCase().replace(/\s+/g, '-').replace(/[?',]/g, '')}`}
                          >
                            {suggestion.text}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {messages.map((msg, idx) => (
                  <MessageBubble 
                    key={idx} 
                    role={msg.role} 
                    content={msg.content}
                    isLatest={idx === messages.length - 1}
                  />
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <Avatar className="w-7 h-7 mr-2 shrink-0">
                      <AvatarImage src={ushaAvatarImage} alt="Usha" />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">U</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-3 border-t bg-background/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Say anything..."
                    className="flex-1 bg-muted/50 border-muted-foreground/20"
                    disabled={isLoading}
                    data-testid="input-usha-question"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!inputValue.trim() || isLoading}
                    className="shrink-0"
                    data-testid="button-usha-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                  <Heart className="w-2.5 h-2.5 text-primary/60" />
                  I'm always here for you
                </p>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
