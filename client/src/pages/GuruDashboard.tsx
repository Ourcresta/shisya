import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  CheckCircle,
  Users,
  UserCheck,
  Coins,
  ClipboardCheck,
  Plus,
  ArrowRight,
} from "lucide-react";

const metrics = [
  { title: "Total Courses", value: "12", icon: BookOpen, color: "text-blue-500" },
  { title: "Published Courses", value: "8", icon: CheckCircle, color: "text-green-500" },
  { title: "Total Students", value: "156", icon: Users, color: "text-violet-500" },
  { title: "Active Enrollments", value: "89", icon: UserCheck, color: "text-cyan-500" },
  { title: "Credits Distributed", value: "45,000", icon: Coins, color: "text-amber-500" },
  { title: "Tests Created", value: "24", icon: ClipboardCheck, color: "text-purple-500" },
];

export default function GuruDashboard() {
  const { toast } = useToast();

  const handleComingSoon = (action: string) => {
    toast({
      title: "Coming Soon",
      description: `${action} will be available soon.`,
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">
          Overview of your platform
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title} data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold" data-testid={`value-${metric.title.toLowerCase().replace(/\s+/g, "-")}`}>
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4" data-testid="text-quick-actions">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleComingSoon("Create Course")}
            data-testid="button-create-course"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
          <Button
            variant="outline"
            onClick={() => handleComingSoon("Manage Students")}
            data-testid="button-manage-students"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Students
          </Button>
          <Button
            variant="outline"
            onClick={() => handleComingSoon("View Analytics")}
            data-testid="button-view-analytics"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
