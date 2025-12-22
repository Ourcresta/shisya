import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MithraChatPanel } from "./MithraChatPanel";
import type { MithraContext, MithraAllowedPage } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

interface MithraAvatarProps {
  context: Omit<MithraContext, "studentId">;
  disabled?: boolean;
  disabledReason?: string;
}

const ALLOWED_PAGE_TYPES: MithraAllowedPage[] = ["lesson", "lab", "project", "test_prep"];

export function MithraAvatar({ context, disabled = false, disabledReason }: MithraAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (!ALLOWED_PAGE_TYPES.includes(context.pageType as MithraAllowedPage)) {
    return null;
  }

  const fullContext: MithraContext = {
    ...context,
    studentId: user.id,
  };

  const isDisabled = disabled || !user;
  const tooltipText = isDisabled 
    ? (disabledReason || "Mithra is currently unavailable")
    : "Ask Mithra for help";

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={`w-14 h-14 rounded-full shadow-lg ${
                isDisabled 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              }`}
              onClick={() => !isDisabled && setIsOpen(!isOpen)}
              disabled={isDisabled}
              data-testid="button-mithra-avatar"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <MithraChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={fullContext}
      />
    </>
  );
}
