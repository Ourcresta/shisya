import type { StudentProfile, InsertProfile } from "@shared/schema";

const STORAGE_KEY = "shishya_profile";

function generateProfileId(): string {
  return `prof_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getProfile(): StudentProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveProfile(data: InsertProfile): StudentProfile {
  const existing = getProfile();
  const now = new Date().toISOString();
  
  const profile: StudentProfile = {
    id: existing?.id || generateProfileId(),
    ...data,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function updateProfile(updates: Partial<InsertProfile>): StudentProfile | null {
  const existing = getProfile();
  if (!existing) return null;
  
  const profile: StudentProfile = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function isUsernameValid(username: string): boolean {
  return /^[a-z0-9_-]+$/.test(username) && username.length >= 3 && username.length <= 30;
}

export function getProfileByUsername(username: string): StudentProfile | null {
  const profile = getProfile();
  if (profile && profile.username === username) {
    return profile;
  }
  return null;
}

export function isProfilePublic(username: string): boolean {
  const profile = getProfileByUsername(username);
  return profile?.portfolioVisible === true;
}

export function canMakeProfilePublic(
  completedCoursesCount: number,
  submittedProjectsCount: number
): boolean {
  return completedCoursesCount >= 1 || submittedProjectsCount >= 1;
}

export function initializeDefaultProfile(fullName: string = "Demo Student"): StudentProfile {
  const existing = getProfile();
  if (existing) return existing;
  
  const now = new Date().toISOString();
  const username = fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  
  const profile: StudentProfile = {
    id: generateProfileId(),
    fullName,
    username: username || "student",
    bio: "",
    profilePhoto: "",
    headline: "",
    location: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    portfolioVisible: false,
    createdAt: now,
    updatedAt: now,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function deleteProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}
