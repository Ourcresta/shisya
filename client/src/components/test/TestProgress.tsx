import { CheckCircle, Circle } from "lucide-react";

interface TestProgressProps {
  totalQuestions: number;
  answeredQuestions: number[];
  currentQuestion: number;
  onNavigate: (index: number) => void;
}

export default function TestProgress({
  totalQuestions,
  answeredQuestions,
  currentQuestion,
  onNavigate,
}: TestProgressProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="test-progress">
      {Array.from({ length: totalQuestions }, (_, index) => {
        const isAnswered = answeredQuestions.includes(index);
        const isCurrent = currentQuestion === index;

        return (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              isCurrent
                ? "bg-primary text-primary-foreground"
                : isAnswered
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-testid={`progress-dot-${index}`}
            aria-label={`Question ${index + 1}${isAnswered ? " (answered)" : ""}`}
          >
            {isAnswered ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <span>{index + 1}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
