import { Badge } from "@/components/ui/badge";
import { Lock, CircleDot, CheckCircle2 } from "lucide-react";

interface LabStatusBadgeProps {
  status: "locked" | "available" | "completed";
}

export default function LabStatusBadge({ status }: LabStatusBadgeProps) {
  if (status === "locked") {
    return (
      <Badge variant="secondary" className="text-muted-foreground" data-testid="badge-lab-locked">
        <Lock className="w-3 h-3 mr-1" />
        Locked
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge variant="default" className="bg-emerald-600 text-white" data-testid="badge-lab-completed">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-blue-600 border-blue-300" data-testid="badge-lab-available">
      <CircleDot className="w-3 h-3 mr-1" />
      Available
    </Badge>
  );
}
