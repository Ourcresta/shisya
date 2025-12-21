import type { Course, Module, Lesson, AINotes, ModuleWithLessons } from "@shared/schema";

const API_BASE = "/api";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Fetch only published courses
export async function getPublishedCourses(): Promise<Course[]> {
  return fetchApi<Course[]>("/courses");
}

// Fetch single course by ID
export async function getCourse(courseId: number): Promise<Course> {
  return fetchApi<Course>(`/courses/${courseId}`);
}

// Fetch modules for a course
export async function getCourseModules(courseId: number): Promise<Module[]> {
  return fetchApi<Module[]>(`/courses/${courseId}/modules`);
}

// Fetch lessons for a module
export async function getModuleLessons(moduleId: number): Promise<Lesson[]> {
  return fetchApi<Lesson[]>(`/modules/${moduleId}/lessons`);
}

// Fetch single lesson
export async function getLesson(lessonId: number): Promise<Lesson> {
  return fetchApi<Lesson>(`/lessons/${lessonId}`);
}

// Fetch AI notes for a lesson
export async function getLessonAINotes(lessonId: number): Promise<AINotes | null> {
  try {
    return await fetchApi<AINotes>(`/lessons/${lessonId}/notes`);
  } catch {
    return null;
  }
}

// Fetch course with all modules and lessons
export async function getCourseWithModules(courseId: number): Promise<{ course: Course; modules: ModuleWithLessons[] }> {
  const [course, modules] = await Promise.all([
    getCourse(courseId),
    getCourseModules(courseId),
  ]);

  const modulesWithLessons: ModuleWithLessons[] = await Promise.all(
    modules.map(async (module) => {
      const lessons = await getModuleLessons(module.id);
      return { ...module, lessons };
    })
  );

  return { course, modules: modulesWithLessons };
}
