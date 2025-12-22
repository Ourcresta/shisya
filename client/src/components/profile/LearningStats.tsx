import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FolderKanban, ClipboardCheck, Award } from "lucide-react";

interface LearningStatsProps {
  coursesCompleted: number;
  projectsSubmitted: number;
  testsPassed: number;
  certificatesEarned: number;
}

export default function LearningStats({
  coursesCompleted,
  projectsSubmitted,
  testsPassed,
  certificatesEarned,
}: LearningStatsProps) {
  const stats = [
    {
      label: "Courses Completed",
      value: coursesCompleted,
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Projects Submitted",
      value: projectsSubmitted,
      icon: FolderKanban,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Tests Passed",
      value: testsPassed,
      icon: ClipboardCheck,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Certificates Earned",
      value: certificatesEarned,
      icon: Award,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" data-testid="learning-stats">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
