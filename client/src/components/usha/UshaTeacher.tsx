import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, Sparkles, Volume2, VolumeX, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsha, LANGUAGE_NAMES, type UshaLanguage, type UshaState } from "@/contexts/UshaContext";
import ushaAvatarImage from "@assets/image_1767697725032.png";

const STATE_MESSAGES: Record<UshaState, string> = {
  idle: "Ask me to explain",
  explaining: "Explaining...",
  listening: "Listening...",
  responding: "Thinking...",
  completion: "Well done!",
};


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
  } = useUsha();

  const [inputValue, setInputValue] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "usha"; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (response) {
      setMessages(prev => [...prev, { role: "usha", content: response }]);
    }
  }, [response]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const question = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    
    await askQuestion(question);
  };

  const getStateColor = () => {
    switch (state) {
      case "explaining": return "bg-green-500";
      case "listening": return "bg-blue-500";
      case "responding": return "bg-amber-500";
      case "completion": return "bg-purple-500";
      default: return "bg-muted";
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <div className="relative">
          {!showChat && currentMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="absolute bottom-full right-0 mb-3 w-64"
            >
              <Card className="p-3 bg-card/95 backdrop-blur-sm border shadow-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{currentMessage}</p>
                </div>
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b rotate-45 transform origin-center" />
              </Card>
            </motion.div>
          )}
          
          <Button
            onClick={toggleChat}
            size="icon"
            className={`relative w-16 h-16 rounded-full shadow-xl overflow-visible transition-all duration-300 ${
              isSpeaking ? "ring-4 ring-primary/50 ring-offset-2 ring-offset-background" : ""
            }`}
            data-testid="button-usha-avatar"
          >
            <div className="relative w-full h-full">
              <Avatar className="w-full h-full">
                <AvatarImage src={ushaAvatarImage} alt="Usha - AI Teacher" className="object-cover" />
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

            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStateColor()} border-2 border-background`} />

            {state === "explaining" && (
              <Badge 
                variant="default" 
                className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-0 bg-red-500 text-white animate-pulse"
              >
                LIVE
              </Badge>
            )}
          </Button>

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
          >
            <Card className="flex flex-col h-[500px] max-h-[70vh] shadow-2xl border overflow-hidden">
              <div className="flex items-center justify-between gap-2 p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarImage src={ushaAvatarImage} alt="Usha" />
                      <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStateColor()} border-2 border-background`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Usha</h3>
                    <p className="text-xs text-muted-foreground">Your AI Teacher</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Select value={language} onValueChange={(v) => setLanguage(v as UshaLanguage)}>
                    <SelectTrigger className="w-auto h-8 text-xs gap-1" data-testid="select-usha-language">
                      <Globe className="w-3 h-3" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMuted(!isMuted)}
                    data-testid="button-usha-mute"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
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
                <div className="px-4 py-2 bg-primary/5 border-b">
                  <p className="text-xs text-muted-foreground">Currently learning:</p>
                  <p className="text-sm font-medium truncate">{lessonTitle}</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="w-12 h-12 mb-4 text-primary/40" />
                    <p className="text-sm font-medium">Hi! I'm Usha.</p>
                    <p className="text-xs mt-1">I'm here to learn with you, talk, or just listen.</p>
                    <p className="text-xs mt-4 italic">No rush. Whenever you're ready.</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Say anything..."
                    className="flex-1"
                    disabled={isLoading}
                    data-testid="input-usha-question"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!inputValue.trim() || isLoading}
                    data-testid="button-usha-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  I'm here with you.
                </p>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
