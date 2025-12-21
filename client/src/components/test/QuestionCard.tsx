import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { TestQuestionUI } from "@shared/schema";

interface QuestionCardProps {
  question: TestQuestionUI;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

function DifficultyBadge({ difficulty }: { difficulty: "easy" | "medium" | "hard" }) {
  const colors = {
    easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <Badge className={colors[difficulty]}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Badge>
  );
}

function TypeBadge({ type }: { type: "mcq" | "scenario" }) {
  return (
    <Badge variant="outline">
      {type === "mcq" ? "Multiple Choice" : "Scenario"}
    </Badge>
  );
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <Card data-testid={`card-question-${question.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <span className="text-sm text-muted-foreground" data-testid="text-question-counter">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-2">
            <TypeBadge type={question.type} />
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
        </div>
        <CardTitle className="text-lg leading-relaxed" data-testid="text-question">
          {question.questionText}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOptionId || ""}
          onValueChange={onSelectOption}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div
              key={option.id}
              className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                selectedOptionId === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
              data-testid={`option-${option.id}`}
            >
              <RadioGroupItem
                value={option.id}
                id={option.id}
                data-testid={`radio-${option.id}`}
              />
              <Label
                htmlFor={option.id}
                className="flex-1 cursor-pointer font-normal"
              >
                <span className="font-medium mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
