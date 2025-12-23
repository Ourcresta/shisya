import { Link } from "wouter";
import { ArrowRight, BookOpen, Coins } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { DurationBadge } from "@/components/ui/duration-badge";
import { SkillTag } from "@/components/ui/skill-tag";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const skills = course.skills?.slice(0, 3) || [];
  const hasMoreSkills = (course.skills?.length || 0) > 3;

  return (
    <Card 
      className="group flex flex-col h-full hover-elevate transition-all duration-200"
      data-testid={`card-course-${course.id}`}
    >
      {/* Course thumbnail placeholder */}
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
          {course.isFree ? (
            <Badge 
              variant="secondary" 
              className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0"
              data-testid={`badge-free-${course.id}`}
            >
              Free
            </Badge>
          ) : (
            <Badge 
              variant="secondary" 
              className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0"
              data-testid={`badge-credits-${course.id}`}
            >
              <Coins className="w-3 h-3 mr-1" />
              {course.creditCost || 0}
            </Badge>
          )}
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
                +{(course.skills?.length || 0) - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button 
            className="w-full group-hover:bg-primary/90"
            data-testid={`button-start-learning-${course.id}`}
          >
            Start Learning
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
