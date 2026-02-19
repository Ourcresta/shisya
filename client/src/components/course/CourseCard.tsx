import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Coins, Globe, Lock, Play, Star, Clock, FolderKanban, Award } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelBadge } from "@/components/ui/level-badge";
import { useCredits } from "@/contexts/CreditContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@shared/schema";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  ur: "Urdu",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
};

function getLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code.toLowerCase()] || code.toUpperCase();
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rounded)) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      );
    } else if (i - 0.5 === rounded) {
      stars.push(
        <span key={i} className="relative inline-flex w-3.5 h-3.5">
          <Star className="absolute w-3.5 h-3.5 text-muted-foreground/30" />
          <span className="absolute overflow-hidden w-[50%]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-muted-foreground/30" />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

interface CourseCardProps {
  course: Course;
  languageVariants?: Course[];
}

export function CourseCard({ course: initialCourse, languageVariants }: CourseCardProps) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const course = selectedLang && languageVariants
    ? languageVariants.find(v => v.language === selectedLang) || initialCourse
    : initialCourse;

  const { user } = useAuth();
  const { balance, enrollments } = useCredits();
  const [imgError, setImgError] = useState(false);

  const creditCost = course.creditCost || 0;
  const isFree = course.isFree || creditCost === 0;
  const isEnrolled = enrollments.some(e => e.courseId === course.id);
  const canAfford = balance >= creditCost;
  const hasThumbnail = course.thumbnailUrl && !imgError;
  const rating = course.rating ?? 0;
  const totalStudents = course.totalStudents ?? 0;
  const projectCount = course.projectCount ?? 0;

  const getPriceDisplay = () => {
    if (isFree) {
      return (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400" data-testid={`text-price-${course.id}`}>
          Free
        </span>
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
    return (
      <span className="flex items-center gap-1 text-sm font-semibold" data-testid={`text-price-${course.id}`}>
        <Coins className="w-3.5 h-3.5 text-amber-500" />
        {creditCost} Credits
      </span>
    );
  };

  const getButtonContent = () => {
    if (isEnrolled) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-continue-${course.id}`}>
            <Play className="w-4 h-4 mr-2" />
            Continue Learning
          </Button>
        </Link>
      );
    }
    if (isFree) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-start-learning-${course.id}`}>
            Start Learning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      );
    }
    if (!user) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-view-course-${course.id}`}>
            <Coins className="w-4 h-4 mr-2 text-amber-500" />
            Enroll for {creditCost} Credits
          </Button>
        </Link>
      );
    }
    if (canAfford) {
      return (
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-enroll-${course.id}`}>
            <Coins className="w-4 h-4 mr-2 text-amber-500" />
            Enroll for {creditCost} Credits
          </Button>
        </Link>
      );
    }
    return (
      <Button className="w-full" variant="secondary" disabled data-testid={`button-insufficient-${course.id}`}>
        <Lock className="w-4 h-4 mr-2" />
        Insufficient Credits
      </Button>
    );
  };

  return (
    <Card
      className="group flex flex-col h-full hover-elevate transition-all duration-200"
      data-testid={`card-course-${course.id}`}
    >
      <div className="relative aspect-video rounded-t-md overflow-hidden">
        {hasThumbnail ? (
          <img
            src={course.thumbnailUrl!}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
            data-testid={`img-course-thumbnail-${course.id}`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
        )}
        {course.category && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-xs"
              data-testid={`badge-category-${course.id}`}
            >
              {course.category}
            </Badge>
          </div>
        )}
        {languageVariants && languageVariants.length > 1 ? (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {languageVariants.map((v) => (
              <Badge
                key={v.id}
                variant="secondary"
                className={`cursor-pointer text-xs backdrop-blur-sm border-0 ${
                  v.id === course.id
                    ? "bg-primary/90 text-primary-foreground"
                    : "bg-background/80 text-foreground"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedLang(v.language || "en");
                }}
                data-testid={`badge-lang-variant-${v.language}-${v.id}`}
              >
                <Globe className="w-3 h-3 mr-1" />
                {getLanguageLabel(v.language || "en")}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <CardHeader className="pb-1 gap-1">
        <h3
          className="text-base font-semibold leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-display)" }}
          data-testid={`text-course-title-${course.id}`}
        >
          {course.groupTitle || course.title}
        </h3>
        {rating > 0 && (
          <div className="flex items-center gap-2" data-testid={`rating-${course.id}`}>
            <StarRating rating={rating} />
            <span className="text-xs font-medium text-muted-foreground">
              {rating.toFixed(1)}
            </span>
            {totalStudents > 0 && (
              <span className="text-xs text-muted-foreground">
                ({totalStudents.toLocaleString()} students)
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-0">
        {course.description && (
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            data-testid={`text-course-description-${course.id}`}
          >
            {course.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {course.duration && (
            <span className="flex items-center gap-1" data-testid={`text-duration-${course.id}`}>
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
          )}
          <LevelBadge level={course.level} />
          {projectCount > 0 && (
            <span className="flex items-center gap-1" data-testid={`text-projects-${course.id}`}>
              <FolderKanban className="w-3.5 h-3.5" />
              {projectCount} Project{projectCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {course.language && (
            <Badge
              variant="outline"
              className="text-xs"
              data-testid={`badge-language-${course.id}`}
            >
              <Globe className="w-3 h-3 mr-1" />
              {getLanguageLabel(course.language)}
            </Badge>
          )}
          {course.testRequired && (
            <Badge variant="outline" className="text-xs" data-testid={`badge-certificate-${course.id}`}>
              <Award className="w-3 h-3 mr-1" />
              Certificate
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex-col gap-2">
        <div className="flex items-center justify-between gap-2 w-full">
          {getPriceDisplay()}
        </div>
        {getButtonContent()}
      </CardFooter>
    </Card>
  );
}
