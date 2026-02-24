import { useState, type ReactNode } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, MessageSquarePlus } from "lucide-react";

interface CourseOption {
  id: number;
  title: string;
}

interface AiGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  courses: CourseOption[];
  onGenerate: (params: { courseId: number; level: string; extraInstructions: string }) => void;
  isGenerating: boolean;
  extraFields?: (params: { courseId: number | null; level: string }) => ReactNode;
  testIdPrefix?: string;
}

export function AiGenerateDialog({
  open,
  onOpenChange,
  title,
  description,
  courses,
  onGenerate,
  isGenerating,
  extraFields,
  testIdPrefix = "ai",
}: AiGenerateDialogProps) {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [level, setLevel] = useState("beginner");
  const [extraInstructions, setExtraInstructions] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCourseId(null);
      setLevel("beginner");
      setExtraInstructions("");
    }
    onOpenChange(nextOpen);
  };

  const handleGenerate = () => {
    if (!courseId) return;
    onGenerate({ courseId, level, extraInstructions: extraInstructions.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle data-testid={`text-${testIdPrefix}-dialog-title`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {title}
            </div>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Course *</Label>
            <Select
              value={courseId ? String(courseId) : ""}
              onValueChange={(v) => setCourseId(parseInt(v))}
            >
              <SelectTrigger data-testid={`select-${testIdPrefix}-course`}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Difficulty Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger data-testid={`select-${testIdPrefix}-level`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="masters">Masters</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {extraFields?.({ courseId, level })}
          <div>
            <Label className="flex items-center gap-1.5">
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Extra Instructions
            </Label>
            <Textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="Add any specific requirements, topics to focus on, or guidelines for the AI..."
              rows={3}
              className="mt-1 text-sm"
              data-testid={`textarea-${testIdPrefix}-extra-instructions`}
            />
            <p className="text-xs text-muted-foreground mt-1">Optional: Guide the AI with additional context or preferences</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} data-testid={`button-cancel-${testIdPrefix}`}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!courseId || isGenerating}
            data-testid={`button-submit-${testIdPrefix}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
