import type { NudgeType, StudentSignals } from "@shared/schema";

interface NudgeTemplate {
  type: NudgeType;
  templates: string[];
}

const NUDGE_TEMPLATES: NudgeTemplate[] = [
  {
    type: "encouragement",
    templates: [
      "Keep going! You're making great progress!",
      "Every lesson brings you closer to mastery!",
      "Your dedication is inspiring. Keep it up!",
      "Small steps lead to big achievements. You're doing great!",
      "Learning is a journey, and you're on the right path!",
    ],
  },
  {
    type: "reminder",
    templates: [
      "Your course is waiting for you! Ready to continue?",
      "Don't lose your momentum. Jump back in!",
      "A quick lesson today keeps the knowledge fresh!",
      "Your learning streak is at risk! Time to study?",
      "Miss you! Let's get back to learning together.",
    ],
  },
  {
    type: "celebration",
    templates: [
      "Amazing work! You've completed another milestone!",
      "Congratulations! Your hard work is paying off!",
      "What an achievement! Keep celebrating your wins!",
      "You did it! This calls for celebration!",
      "Incredible progress! You should be proud!",
    ],
  },
  {
    type: "comeback",
    templates: [
      "Welcome back! We've missed you!",
      "Great to see you again! Ready to pick up where you left off?",
      "Comeback bonus waiting for you! Let's learn!",
      "It's never too late to continue. Welcome back!",
      "You're back! Let's make today count!",
    ],
  },
  {
    type: "streak",
    templates: [
      "You're on fire! {streakCount} day streak and counting!",
      "{streakCount} days strong! Keep the streak alive!",
      "Your consistency is amazing! {streakCount} days in a row!",
      "Streak champion! {streakCount} days of dedication!",
      "Unstoppable! {streakCount} day learning streak!",
    ],
  },
  {
    type: "progress",
    templates: [
      "You're ahead of {percentileRank}% of learners! Keep it up!",
      "Just {remaining} lessons to complete this course!",
      "{courseProgressPercent}% complete! You're almost there!",
      "Top performer alert! You're crushing it!",
      "You've completed {lessonsCompleted} lessons! Impressive!",
    ],
  },
  {
    type: "challenge",
    templates: [
      "Ready for a challenge? Complete 3 lessons today!",
      "Can you maintain your streak for 7 days? Challenge accepted?",
      "Speed challenge: Finish this module by tomorrow!",
      "Beat your best! Try to score higher on the next test!",
      "New goal: Complete 5 lessons this week. You've got this!",
    ],
  },
];

function interpolateMessage(template: string, signals: StudentSignals): string {
  let message = template;
  
  message = message.replace("{streakCount}", String(signals.streakCount || 0));
  message = message.replace("{percentileRank}", String(signals.percentileRank || 50));
  message = message.replace("{courseProgressPercent}", String(signals.courseProgressPercent || 0));
  message = message.replace("{lessonsCompleted}", String(signals.lessonsCompleted || 0));
  message = message.replace("{testsCompleted}", String(signals.testsCompleted || 0));
  message = message.replace("{certificatesEarned}", String(signals.certificatesEarned || 0));
  
  const totalLessons = signals.courseProgressPercent > 0 
    ? Math.round((signals.lessonsCompleted || 0) / (signals.courseProgressPercent / 100))
    : 10;
  const remaining = totalLessons - (signals.lessonsCompleted || 0);
  message = message.replace("{remaining}", String(Math.max(0, remaining)));
  
  return message;
}

export function generateNudge(
  type: NudgeType,
  signals: StudentSignals,
  customMessage?: string
): string {
  if (customMessage) {
    return interpolateMessage(customMessage, signals);
  }

  const templateGroup = NUDGE_TEMPLATES.find((t) => t.type === type);
  if (!templateGroup || templateGroup.templates.length === 0) {
    return "Keep learning! You're doing great!";
  }

  const randomIndex = Math.floor(Math.random() * templateGroup.templates.length);
  const template = templateGroup.templates[randomIndex];
  
  return interpolateMessage(template, signals);
}

export function selectNudgeType(signals: StudentSignals): NudgeType {
  if (signals.daysSinceLastActivity > 3) {
    return "comeback";
  }
  
  if (signals.streakCount >= 3) {
    return "streak";
  }
  
  if (signals.percentileRank && signals.percentileRank >= 80) {
    return "celebration";
  }
  
  if (signals.courseProgressPercent >= 80) {
    return "progress";
  }
  
  if (signals.daysSinceLastActivity >= 1) {
    return "reminder";
  }
  
  return "encouragement";
}
