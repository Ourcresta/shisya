import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Lock } from "lucide-react";
import { MithraChatPanel } from "./MithraChatPanel";
import type { MithraAllowedPage, StudentProgressSummary } from "@shared/schema";

interface MithraContext {
  courseId: number;
  moduleId?: number;
  lessonId?: number;
  labId?: number;
  projectId?: number;
  pageType: MithraAllowedPage;
  courseTitle?: string;
  courseLevel?: "beginner" | "intermediate" | "advanced";
  lessonTitle?: string;
  labTitle?: string;
  projectTitle?: string;
  studentProgressSummary?: StudentProgressSummary;
}

interface MithraAvatarProps {
  context: MithraContext;
  disabled?: boolean;
  disabledMessage?: string;
}

export function MithraAvatar({ context, disabled = false, disabledMessage }: MithraAvatarProps) {
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
          <Button
            size="icon"
            variant="secondary"
            disabled
            className="h-14 w-14 rounded-full shadow-lg opacity-50 cursor-not-allowed"
            data-testid="button-mithra-avatar-disabled"
          >
            <Lock className="h-5 w-5" />
          </Button>
          <div 
            className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover border rounded-md shadow-md text-sm text-muted-foreground whitespace-nowrap max-w-[200px] transition-opacity ${
              showTooltip ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {disabledMessage || "Mithra is unavailable"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          variant="default"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg"
          data-testid="button-mithra-avatar"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {isOpen && (
        <MithraChatPanel 
          context={context} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
