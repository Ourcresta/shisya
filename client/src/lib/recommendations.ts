import type { Course } from "@shared/schema";
import { getCourseProgress } from "@/lib/progress";
import { getAllCertificates } from "@/lib/certificates";
import { getTestAttempts } from "@/lib/testAttempts";

interface RecommendationScore {
  course: Course;
  score: number;
  reasons: string[];
}

const LEVEL_ORDER = ["beginner", "intermediate", "advanced", "masters"];

function parseSkills(skills: string | string[] | null | undefined): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s) => s.toLowerCase().trim());
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed.map((s: string) => s.toLowerCase().trim());
  } catch {}
  return skills
    .split(",")
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);
}

function getNextLevel(currentLevel: string): string {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  if (idx >= 0 && idx < LEVEL_ORDER.length - 1) return LEVEL_ORDER[idx + 1];
  return currentLevel;
}

export function getPersonalizedRecommendations(allCourses: Course[], maxResults = 6): RecommendationScore[] {
  if (allCourses.length === 0) return [];

  const allProgress: Record<number, { progress: number; completedCount: number }> = {};
  allCourses.forEach((c) => {
    const p = getCourseProgress(c.id);
    const completed = p.completedLessons.length;
    allProgress[c.id] = { progress: completed > 0 ? Math.min(Math.round((completed / 10) * 100), 100) : 0, completedCount: completed };
  });

  const certificates = getAllCertificates();
  const testAttempts = getTestAttempts();

  const enrolledCourseIds = new Set<number>();
  const completedCourseIds = new Set<number>();
  const enrolledCategories: Record<string, number> = {};
  const enrolledSkills: Record<string, number> = {};
  const enrolledLevels: string[] = [];

  allCourses.forEach((course) => {
    const prog = allProgress[course.id];
    if (prog && prog.completedCount > 0) {
      enrolledCourseIds.add(course.id);

      if (prog.progress >= 100) {
        completedCourseIds.add(course.id);
      }

      if (course.category) {
        enrolledCategories[course.category] = (enrolledCategories[course.category] || 0) + 1;
      }

      const skills = parseSkills(course.skills);
      skills.forEach((s) => {
        enrolledSkills[s] = (enrolledSkills[s] || 0) + 1;
      });

      if (course.level) {
        enrolledLevels.push(course.level);
      }
    }
  });

  certificates.forEach((cert: any) => {
    const skills = parseSkills(cert.skills);
    skills.forEach((s) => {
      enrolledSkills[s] = (enrolledSkills[s] || 0) + 2;
    });
  });

  const hasHistory = enrolledCourseIds.size > 0;

  if (!hasHistory) {
    return allCourses
      .filter((c) => c.status === "published")
      .sort((a, b) => {
        const scoreA = (a.isFree ? 2 : 0) + (a.level === "beginner" ? 3 : a.level === "intermediate" ? 1 : 0) + ((a.totalStudents || 0) > 0 ? 1 : 0);
        const scoreB = (b.isFree ? 2 : 0) + (b.level === "beginner" ? 3 : b.level === "intermediate" ? 1 : 0) + ((b.totalStudents || 0) > 0 ? 1 : 0);
        return scoreB - scoreA;
      })
      .slice(0, maxResults)
      .map((course) => ({
        course,
        score: 50,
        reasons: [course.isFree ? "Free to start" : "Popular course", course.level === "beginner" ? "Great for beginners" : "Build your skills"],
      }));
  }

  const dominantLevel = enrolledLevels.length > 0
    ? enrolledLevels.reduce((a, b, _, arr) => (arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b))
    : "beginner";
  const suggestedLevel = getNextLevel(dominantLevel);

  const scored: RecommendationScore[] = [];

  allCourses.forEach((course) => {
    if (enrolledCourseIds.has(course.id)) return;
    if (course.status !== "published") return;

    let score = 0;
    const reasons: string[] = [];

    if (course.category && enrolledCategories[course.category]) {
      const catWeight = Math.min(enrolledCategories[course.category] * 15, 40);
      score += catWeight;
      reasons.push(`Matches your interest in ${course.category}`);
    }

    const courseSkills = parseSkills(course.skills);
    let skillMatches = 0;
    courseSkills.forEach((s) => {
      if (enrolledSkills[s]) {
        skillMatches++;
        score += Math.min(enrolledSkills[s] * 5, 15);
      }
    });
    if (skillMatches > 0) {
      reasons.push(`${skillMatches} skill${skillMatches > 1 ? "s" : ""} you're building`);
    }

    const newSkills = courseSkills.filter((s) => !enrolledSkills[s]);
    if (newSkills.length > 0) {
      score += Math.min(newSkills.length * 3, 12);
      reasons.push(`Learn ${newSkills.length} new skill${newSkills.length > 1 ? "s" : ""}`);
    }

    if (course.level === suggestedLevel) {
      score += 20;
      reasons.push("Next level for you");
    } else if (course.level === dominantLevel) {
      score += 10;
      reasons.push("Matches your current level");
    }

    const levelIdx = LEVEL_ORDER.indexOf(course.level);
    const dominantIdx = LEVEL_ORDER.indexOf(dominantLevel);
    if (levelIdx >= 0 && dominantIdx >= 0 && levelIdx - dominantIdx > 1) {
      score -= 15;
    }

    if (course.isFree) {
      score += 5;
    }

    if ((course.rating || 0) >= 4) {
      score += 5;
    }

    if ((course.totalStudents || 0) > 10) {
      score += 3;
    }

    if (reasons.length === 0) {
      reasons.push("Explore something new");
    }

    scored.push({ course, score, reasons: reasons.slice(0, 2) });
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, maxResults);
}
