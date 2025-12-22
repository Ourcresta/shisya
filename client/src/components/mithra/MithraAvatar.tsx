import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { MithraChatPanel } from "./MithraChatPanel";
import type { MithraAllowedPage } from "@shared/schema";

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

interface MithraAvatarProps {
  context: MithraContext;
  disabled?: boolean;
  disabledMessage?: string;
}

export function MithraAvatar({ context, disabled = false, disabledMessage }: MithraAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div 
          className="relative"
          title={disabledMessage || "Mithra is unavailable"}
        >
          <Button
            size="icon"
            variant="secondary"
            disabled
            className="h-14 w-14 rounded-full shadow-lg opacity-50 cursor-not-allowed"
            data-testid="button-mithra-avatar-disabled"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          {disabledMessage && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover border rounded-md shadow-md text-sm text-muted-foreground whitespace-nowrap max-w-[200px]">
              {disabledMessage}
            </div>
          )}
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
