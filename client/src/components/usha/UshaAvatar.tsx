import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UshaChatPanel } from "./UshaChatPanel";
import type { UshaPageType, StudentProgressSummary } from "@shared/schema";
import ushaAvatarImage from "@assets/image_1767697725032.png";

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
  projectTitle?: string;
  studentProgressSummary?: StudentProgressSummary;
}

interface UshaAvatarProps {
  context: UshaContext;
  disabled?: boolean;
  disabledMessage?: string;
}

export function UshaAvatar({ context, disabled = false, disabledMessage }: UshaAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (disabled) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div 
            className="h-14 w-14 rounded-full shadow-lg opacity-50 cursor-not-allowed relative"
            data-testid="button-usha-avatar-disabled"
          >
            <Avatar className="h-14 w-14 border-2 border-muted">
              <AvatarImage src={ushaAvatarImage} alt="Usha" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div 
            className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover border rounded-md shadow-md text-sm text-muted-foreground whitespace-nowrap max-w-[200px] transition-opacity ${
              showTooltip ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {disabledMessage || "Usha is unavailable"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg relative transition-transform hover:scale-105 active:scale-95"
          data-testid="button-usha-avatar"
        >
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarImage src={ushaAvatarImage} alt="Usha" />
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/80 rounded-full">
              <X className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <UshaChatPanel 
          context={context} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
