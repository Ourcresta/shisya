import { BookOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({ 
  title = "No courses available",
  message = "Please check back later for new learning opportunities." 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 
        className="text-xl font-semibold mb-2"
        style={{ fontFamily: "var(--font-display)" }}
        data-testid="text-empty-title"
      >
        {title}
      </h3>
      <p 
        className="text-muted-foreground max-w-md"
        data-testid="text-empty-message"
      >
        {message}
      </p>
    </div>
  );
}
