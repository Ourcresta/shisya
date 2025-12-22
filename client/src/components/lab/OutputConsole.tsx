import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, CheckCircle2, XCircle, Clock } from "lucide-react";

interface OutputConsoleProps {
  output: string;
  error: string | null;
  isRunning: boolean;
  isMatch: boolean | null;
  executionTime?: number;
}

export default function OutputConsole({ 
  output, 
  error, 
  isRunning, 
  isMatch,
  executionTime 
}: OutputConsoleProps) {
  return (
    <Card data-testid="output-console">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Console Output
          </CardTitle>
          <div className="flex items-center gap-2">
            {executionTime !== undefined && (
              <Badge variant="outline" className="text-xs font-mono">
                <Clock className="w-3 h-3 mr-1" />
                {executionTime.toFixed(0)}ms
              </Badge>
            )}
            {isMatch !== null && (
              isMatch ? (
                <Badge variant="default" className="bg-emerald-600 text-white" data-testid="badge-match-success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Output Matched
                </Badge>
              ) : (
                <Badge variant="destructive" data-testid="badge-match-fail">
                  <XCircle className="w-3 h-3 mr-1" />
                  Try Again
                </Badge>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="font-mono text-sm bg-zinc-900 text-zinc-100 dark:bg-zinc-950 rounded-md p-4 min-h-[120px] overflow-auto"
          data-testid="text-console-output"
        >
          {isRunning ? (
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="animate-spin w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full" />
              Running...
            </div>
          ) : error ? (
            <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
          ) : output ? (
            <pre className="whitespace-pre-wrap text-emerald-300">{output}</pre>
          ) : (
            <span className="text-zinc-500">
              Click "Run Code" to see output here...
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
