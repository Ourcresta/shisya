import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TestTimerProps {
  timeLimitMinutes: number;
  onTimeUp: () => void;
  startTime: number;
}

export default function TestTimer({ timeLimitMinutes, onTimeUp, startTime }: TestTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const total = timeLimitMinutes * 60;
    return Math.max(0, total - elapsed);
  });

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          onTimeUp();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, onTimeUp]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const isLowTime = remainingSeconds < 60;
  const isCriticalTime = remainingSeconds < 30;

  return (
    <Badge
      variant="outline"
      className={`text-base px-3 py-1 ${
        isCriticalTime
          ? "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400 animate-pulse"
          : isLowTime
          ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400"
          : ""
      }`}
      data-testid="test-timer"
    >
      <Clock className="w-4 h-4 mr-2" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </Badge>
  );
}
