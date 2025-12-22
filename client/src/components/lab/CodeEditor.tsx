import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code2 } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  disabled?: boolean;
}

export default function CodeEditor({ 
  code, 
  onChange, 
  language = "javascript",
  disabled = false 
}: CodeEditorProps) {
  return (
    <div className="space-y-2" data-testid="code-editor">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="font-mono text-xs">
          <Code2 className="w-3 h-3 mr-1" />
          {language}
        </Badge>
      </div>
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="font-mono text-sm min-h-[300px] resize-y bg-muted/50 focus-visible:ring-1"
        placeholder="// Write your code here..."
        spellCheck={false}
        data-testid="input-code"
      />
    </div>
  );
}
