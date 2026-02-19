import { Link } from "wouter";
import { ArrowRight, BookOpen, Coins, Lock, Play } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { DurationBadge } from "@/components/ui/duration-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const rawSkills = course.skills;
  const skillsList: string[] = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
      ? rawSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const skills = skillsList.slice(0, 3);
  const hasMoreSkills = skillsList.length > 3;
  const { user } = useAuth();
  const { balance, enrollments } = useCredits();

  const creditCost = course.creditCost || 0;
  const isFree = course.isFree || creditCost === 0;
  const isEnrolled = enrollments.some(e => e.courseId === course.id);
  const canAfford = balance >= creditCost;

  const getPriceBadge = () => {
    if (isFree) {
      return (
        <Badge 
          variant="secondary" 
          className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0"
          data-testid={`badge-free-${course.id}`}
        >
          Free
        </Badge>
      );
    }

    if (isEnrolled) {
      return (
        <Badge 
          variant="secondary" 
          className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0"
          data-testid={`badge-enrolled-${course.id}`}
        >
          Enrolled
        </Badge>
      );
    }

    if (!user) {
      return (
        <Badge 
          variant="secondary" 
          className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0"
          data-testid={`badge-credits-${course.id}`}
        >
          <Coins className="w-3 h-3 mr-1 text-amber-500" />
          {creditCost}
        </Badge>
      );
    }

    if (canAfford) {
      return (
        <Badge 
          variant="secondary" 
          className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0"
          data-testid={`badge-credits-${course.id}`}
        >
          <Coins className="w-3 h-3 mr-1 text-amber-500" />
          {creditCost}
        </Badge>
      );
    }

    return (
      <Badge 
        variant="secondary" 
        className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0"
        data-testid={`badge-insufficient-${course.id}`}
      >
        <Coins className="w-3 h-3 mr-1 text-amber-500" />
        {creditCost}
      </Badge>
    );
  };

  const getButtonContent = () => {
    if (isEnrolled) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button 
            className="w-full group-hover:bg-primary/90"
            data-testid={`button-continue-${course.id}`}
          >
            <Play className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
        </Link>
      );
    }

    if (isFree) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button 
            className="w-full group-hover:bg-primary/90"
            data-testid={`button-start-learning-${course.id}`}
          >
            Start Learning
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      );
    }

    if (!user) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button 
            className="w-full"
            data-testid={`button-view-course-${course.id}`}
          >
            <Coins className="w-4 h-4 mr-2 text-amber-500" />
            Enroll for {creditCost} Points
          </Button>
        </Link>
      );
    }

    if (canAfford) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button 
            className="w-full group-hover:bg-primary/90"
            data-testid={`button-enroll-${course.id}`}
          >
            <Coins className="w-4 h-4 mr-2 text-amber-500" />
            Enroll for {creditCost} Points
          </Button>
        </Link>
      );
    }

    return (
      <Button 
        className="w-full"
        variant="secondary"
        disabled
        data-testid={`button-insufficient-${course.id}`}
      >
        <Lock className="w-4 h-4 mr-2" />
        Insufficient Points
      </Button>
    );
  };

  return (
    <Card 
      className="group flex flex-col h-full hover-elevate transition-all duration-200"
      data-testid={`card-course-${course.id}`}
    >
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <LevelBadge level={course.level} />
        </div>
        <div className="absolute top-3 right-3">
          {getPriceBadge()}
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 
          className="text-lg font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid={`text-course-title-${course.id}`}
        >
          {course.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <DurationBadge duration={course.duration} />
        
        {course.description && (
          <p 
            className="text-sm text-muted-foreground line-clamp-2"
            data-testid={`text-course-description-${course.id}`}
          >
            {course.description}
          </p>
        )}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
            {hasMoreSkills && (
              <span className="text-xs text-muted-foreground self-center">
                +{skillsList.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {getButtonContent()}
      </CardFooter>
    </Card>
  );
}
