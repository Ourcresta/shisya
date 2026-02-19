import { db } from "./db";
import { zohoTokens, courses, modules, lessons, tests, labs, projects } from "@shared/schema";
import { eq, desc, isNotNull, notInArray } from "drizzle-orm";

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.in";
const ZOHO_API_DOMAIN = "https://www.zohoapis.in";
const TRAINERCENTRAL_BASE_URL = "https://our-shiksha.trainercentral.in";

interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  scope: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
  error?: string;
}

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  orgId: string;
  redirectUri: string;
}

function getConfig(): ZohoConfig {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const orgId = process.env.ZOHO_ORG_ID;

  if (!clientId || !clientSecret || !orgId) {
    throw new Error("Zoho credentials not configured");
  }

  const host = process.env.REPLIT_DEV_DOMAIN || process.env.REPL_SLUG
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:5000";

  return {
    clientId,
    clientSecret,
    orgId,
    redirectUri: `${host}/api/guru/zoho/callback`,
  };
}

export function getAuthorizationUrl(): string {
  const config = getConfig();
  const scopes = "TrainerCentral.courseapi.ALL,TrainerCentral.userapi.ALL,TrainerCentral.sectionapi.ALL,TrainerCentral.sessionapi.ALL,TrainerCentral.presenterapi.ALL";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    scope: scopes,
    redirect_uri: config.redirectUri,
    access_type: "offline",
    prompt: "consent",
  });
  return `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const config = getConfig();

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data: ZohoTokenResponse = await response.json();

  if (data.error || !data.access_token || !data.refresh_token) {
    console.error("[Zoho] Token exchange error:", data);
    throw new Error(`Zoho token exchange failed: ${data.error || "No tokens received"}`);
  }

  await db.delete(zohoTokens);

  await db.insert(zohoTokens).values({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
    apiDomain: data.api_domain || ZOHO_API_DOMAIN,
  });

  console.log("[Zoho] Tokens stored successfully");
}

async function getStoredTokens() {
  const [token] = await db.select().from(zohoTokens).orderBy(desc(zohoTokens.id)).limit(1);
  return token || null;
}

async function refreshAccessToken(): Promise<string> {
  const stored = await getStoredTokens();
  if (!stored) {
    throw new Error("No Zoho tokens found. Please connect to Zoho first.");
  }

  const config = getConfig();
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: stored.refreshToken,
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data: ZohoTokenResponse = await response.json();

  if (data.error || !data.access_token) {
    console.error("[Zoho] Token refresh error:", data);
    throw new Error(`Zoho token refresh failed: ${data.error || "Unknown error"}`);
  }

  await db.update(zohoTokens).set({
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    updatedAt: new Date(),
  }).where(eq(zohoTokens.id, stored.id));

  return data.access_token;
}

export async function getValidAccessToken(): Promise<string> {
  const stored = await getStoredTokens();
  if (!stored) {
    throw new Error("No Zoho tokens found. Please connect to Zoho first.");
  }

  if (stored.expiresAt > new Date(Date.now() + 60000)) {
    return stored.accessToken;
  }

  return refreshAccessToken();
}

export async function isConnected(): Promise<boolean> {
  const stored = await getStoredTokens();
  return !!stored;
}

export async function disconnect(): Promise<void> {
  await db.delete(zohoTokens);
  console.log("[Zoho] Disconnected - tokens removed");
}

async function zohoApiRequest(endpoint: string, useTrainerCentral = true): Promise<any> {
  const accessToken = await getValidAccessToken();
  const baseUrl = useTrainerCentral ? TRAINERCENTRAL_BASE_URL : ZOHO_API_DOMAIN;
  const url = `${baseUrl}${endpoint}`;

  console.log(`[Zoho] API request: ${url}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    const retryResponse = await fetch(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${newToken}`,
      },
    });
    if (!retryResponse.ok) {
      const errorText = await retryResponse.text();
      console.error("[Zoho] API retry error:", retryResponse.status, errorText.substring(0, 500));
      throw new Error(`Zoho API error: ${retryResponse.status} ${retryResponse.statusText}`);
    }
    return retryResponse.json();
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Zoho] API error:", response.status, errorText.substring(0, 500));
    throw new Error(`Zoho API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchTrainerCentralCourses(): Promise<any[]> {
  const config = getConfig();
  const orgId = config.orgId;

  let allCourses: any[] = [];
  let startIndex = 0;
  const limit = 50;

  while (true) {
    const data = await zohoApiRequest(
      `/api/v4/${orgId}/courses.json?limit=${limit}&si=${startIndex}`
    );

    const fetchedCourses = data.courses || data.data || [];
    if (!Array.isArray(fetchedCourses) || fetchedCourses.length === 0) break;

    allCourses = allCourses.concat(fetchedCourses);
    if (fetchedCourses.length < limit) break;
    startIndex += limit;
  }

  console.log(`[Zoho] Fetched ${allCourses.length} courses from TrainerCentral`);
  return allCourses;
}

export async function fetchCourseSections(courseId: string): Promise<any[]> {
  const config = getConfig();
  const orgId = config.orgId;

  try {
    const data = await zohoApiRequest(
      `/api/v4/${orgId}/course/${courseId}/sections.json`
    );
    console.log(`[Zoho] Sections response keys:`, Object.keys(data));
    const jsonStr = JSON.stringify(data);
    console.log(`[Zoho] Sections full response (${jsonStr.length} chars):`, jsonStr.substring(0, 3000));
    const sections = data.sections || data.data || [];
    return Array.isArray(sections) ? sections : [];
  } catch (error: any) {
    console.error(`[Zoho] Failed to fetch sections for course ${courseId}:`, error.message);
    return [];
  }
}

export async function fetchCourseSessions(courseId: string): Promise<any[]> {
  const config = getConfig();
  const orgId = config.orgId;

  try {
    const data = await zohoApiRequest(
      `/api/v4/${orgId}/course/${courseId}/sessions.json`
    );
    console.log(`[Zoho] Sessions response keys:`, Object.keys(data));
    const jsonStr = JSON.stringify(data);
    console.log(`[Zoho] Sessions full response (${jsonStr.length} chars):`, jsonStr.substring(0, 3000));
    const sessions = data.sessions || data.data || [];
    return Array.isArray(sessions) ? sessions : [];
  } catch (error: any) {
    console.error(`[Zoho] Failed to fetch sessions for course ${courseId}:`, error.message);
    return [];
  }
}

export async function syncCoursesFromTrainerCentral(): Promise<{
  synced: number;
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
}> {
  const tcCourses = await fetchTrainerCentralCourses();
  const result = { synced: tcCourses.length, created: 0, updated: 0, deleted: 0, errors: [] as string[] };

  const syncedZohoIds: string[] = [];

  for (const tcCourse of tcCourses) {
    try {
      const zohoId = String(tcCourse.courseId || tcCourse.id);
      syncedZohoIds.push(zohoId);

      if (result.created === 0 && result.updated === 0) {
        console.log(`[Zoho] TC Course keys:`, Object.keys(tcCourse).join(', '));
        console.log(`[Zoho] TC Course raw (2000 chars):`, JSON.stringify(tcCourse).substring(0, 2000));
      }

      const title = tcCourse.courseName || tcCourse.name || tcCourse.title || "Untitled Course";
      const rawDescription = tcCourse.description || tcCourse.summary || "";
      const description = rawDescription.replace(/<[^>]*>/g, '').trim() || tcCourse.subTitle || "";
      const thumbnailUrl = tcCourse.thumbnail || tcCourse.image || tcCourse.courseImageURL 
        || tcCourse.courseImage || tcCourse.imageUrl || tcCourse.imageURL || tcCourse.coverImage || null;
      const isPublished = tcCourse.publishStatus === "1" || tcCourse.publishStatus === 1;

      const [existing] = await db.select()
        .from(courses)
        .where(eq(courses.zohoId, zohoId))
        .limit(1);

      console.log(`[Zoho] Syncing course: "${title}" (zohoId: ${zohoId}, published: ${isPublished})`);

      const trainerCentralCourseUrl = `https://shishya.trainercentralsite.in/clientapp/app/course/${zohoId}/course-details`;

      let courseId: number;

      if (existing) {
        await db.update(courses).set({
          title,
          description,
          thumbnailUrl: thumbnailUrl || existing.thumbnailUrl,
          trainerCentralCourseUrl: existing.trainerCentralCourseUrl || trainerCentralCourseUrl,
          status: isPublished ? "published" : existing.status,
          updatedAt: new Date(),
        }).where(eq(courses.id, existing.id));
        courseId = existing.id;
        result.updated++;
      } else {
        const [newCourse] = await db.insert(courses).values({
          title,
          description,
          thumbnailUrl,
          trainerCentralCourseUrl,
          status: isPublished ? "published" : "draft",
          zohoId,
          category: tcCourse.category || "General",
          level: "beginner",
          isFree: false,
          creditCost: 100,
          isActive: true,
        }).returning();
        courseId = newCourse.id;
        result.created++;
      }

      try {
        await syncCourseCurriculum(zohoId, courseId);
      } catch (currError: any) {
        console.error(`[Zoho] Failed to sync curriculum for "${title}":`, currError.message);
        result.errors.push(`Curriculum sync failed for "${title}": ${currError.message}`);
      }
    } catch (error: any) {
      result.errors.push(`Failed to sync course "${tcCourse.courseName || tcCourse.id}": ${error.message}`);
    }
  }

  try {
    const deletedCount = await deleteRemovedCourses(syncedZohoIds);
    result.deleted = deletedCount;
  } catch (delError: any) {
    console.error(`[Zoho] Failed to delete removed courses:`, delError.message);
    result.errors.push(`Delete sync failed: ${delError.message}`);
  }

  console.log(`[Zoho] Sync complete: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted, ${result.errors.length} errors`);
  return result;
}

async function deleteRemovedCourses(activeZohoIds: string[]): Promise<number> {
  const zohoSyncedCourses = await db.select({ id: courses.id, zohoId: courses.zohoId })
    .from(courses)
    .where(isNotNull(courses.zohoId));

  let deletedCount = 0;

  for (const course of zohoSyncedCourses) {
    if (course.zohoId && !activeZohoIds.includes(course.zohoId)) {
      console.log(`[Zoho] Deleting course ID ${course.id} (zohoId: ${course.zohoId}) - no longer in TrainerCentral`);

      const courseModules = await db.select().from(modules).where(eq(modules.courseId, course.id));
      for (const mod of courseModules) {
        await db.delete(lessons).where(eq(lessons.moduleId, mod.id));
      }
      await db.delete(modules).where(eq(modules.courseId, course.id));
      await db.delete(labs).where(eq(labs.courseId, course.id));
      await db.delete(tests).where(eq(tests.courseId, course.id));
      await db.delete(projects).where(eq(projects.courseId, course.id));
      await db.delete(courses).where(eq(courses.id, course.id));
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`[Zoho] Deleted ${deletedCount} courses no longer in TrainerCentral`);
  }
  return deletedCount;
}

async function fetchSessionMaterials(sessionId: string, zohoCourseId?: string): Promise<{ videoUrl: string | null; contentHtml: string | null; materialType: string; hasUploadedVideo: boolean }> {
  const config = getConfig();
  const orgId = config.orgId;

  try {
    const data = await zohoApiRequest(
      `/api/v4/${orgId}/session/${sessionId}/sessionMaterials.json`
    );

    const sessionMaterials = data.sessionMaterials || [];
    const materials = data.materials || [];

    let videoUrl: string | null = null;
    let contentHtml: string | null = null;
    let materialType = "TEXT";
    let hasUploadedVideo = false;

    for (const mat of sessionMaterials) {
      const resType = String(mat.resourceType || "");

      if (resType === "7" && mat.linkAddress) {
        videoUrl = mat.linkAddress;
        materialType = "VIDEO";
        console.log(`[Zoho] Found embedded video: ${videoUrl}`);
      }

      if (resType === "6") {
        materialType = "VIDEO";
        hasUploadedVideo = true;
        console.log(`[Zoho] Found uploaded video (resourceType 6) in session ${sessionId}`);
      }
    }

    for (const mat of materials) {
      if (mat.materialText) {
        contentHtml = mat.materialText;
        break;
      }
    }

    if (!contentHtml) {
      for (const mat of sessionMaterials) {
        if (String(mat.resourceType || "") === "10") {
          const matchedMat = materials.find((m: any) => 
            String(m.materialId) === String(mat.materialId || mat.material)
          );
          if (matchedMat?.materialText) {
            contentHtml = matchedMat.materialText;
            break;
          }
        }
      }
    }

    return { videoUrl, contentHtml, materialType, hasUploadedVideo };
  } catch (error: any) {
    console.error(`[Zoho] Failed to fetch materials for session ${sessionId}:`, error.message);
    return { videoUrl: null, contentHtml: null, materialType: "TEXT", hasUploadedVideo: false };
  }
}

async function syncCourseCurriculum(zohoCoureId: string, localCourseId: number): Promise<void> {
  const tcSections = await fetchCourseSections(zohoCoureId);
  const tcSessions = await fetchCourseSessions(zohoCoureId);

  console.log(`[Zoho] Curriculum data for course ${localCourseId}: ${tcSections.length} sections, ${tcSessions.length} sessions`);

  if (tcSections.length === 0 && tcSessions.length === 0) {
    console.log(`[Zoho] No curriculum data found for course ${localCourseId}, skipping`);
    return;
  }

  console.log(`[Zoho] Fetching session materials for video URLs and content...`);
  const sessionMaterialsMap = new Map<string, { videoUrl: string | null; contentHtml: string | null; materialType: string; hasUploadedVideo: boolean }>();
  for (const session of tcSessions) {
    const sessionId = String(session.sessionId || session.id);
    const matData = await fetchSessionMaterials(sessionId, zohoCoureId);
    sessionMaterialsMap.set(sessionId, matData);
  }
  console.log(`[Zoho] Fetched materials for ${sessionMaterialsMap.size} sessions`);

  const existingModules = await db.select().from(modules).where(eq(modules.courseId, localCourseId));
  for (const mod of existingModules) {
    await db.delete(lessons).where(eq(lessons.moduleId, mod.id));
  }
  await db.delete(modules).where(eq(modules.courseId, localCourseId));

  if (tcSections.length > 0) {
    console.log(`[Zoho] Syncing ${tcSections.length} sections for course ${localCourseId}`);

    for (let sIdx = 0; sIdx < tcSections.length; sIdx++) {
      const section = tcSections[sIdx];
      const sectionTitle = section.sectionName || section.name || section.title || `Section ${sIdx + 1}`;
      const sectionDesc = section.description || "";

      const [newModule] = await db.insert(modules).values({
        courseId: localCourseId,
        title: sectionTitle,
        description: sectionDesc.replace(/<[^>]*>/g, '').trim(),
        orderIndex: sIdx + 1,
      }).returning();

      const sectionId = String(section.sectionId || section.id);

      const sectionLessons = section.lessons || section.sessions || section.materials || section.sessionMaterials || [];

      if (Array.isArray(sectionLessons) && sectionLessons.length > 0) {
        for (let lIdx = 0; lIdx < sectionLessons.length; lIdx++) {
          await insertLesson(sectionLessons[lIdx], newModule.id, localCourseId, lIdx, sessionMaterialsMap, zohoCoureId);
        }
      } else {
        const matchedLessons = tcSessions.filter((l: any) => {
          const lSectionId = String(l.sectionId || l.section_id || l.sectionID || l.section || "");
          return lSectionId === sectionId;
        });

        console.log(`[Zoho] Section "${sectionTitle}" matched ${matchedLessons.length} lessons`);

        for (let lIdx = 0; lIdx < matchedLessons.length; lIdx++) {
          await insertLesson(matchedLessons[lIdx], newModule.id, localCourseId, lIdx, sessionMaterialsMap, zohoCoureId);
        }
      }
    }

    const assignedSectionIds = tcSections.map((s: any) => String(s.sectionId || s.id));
    const unassignedSessions = tcSessions.filter((l: any) => {
      const lSectionId = String(l.sectionId || l.section_id || l.sectionID || l.section || "");
      return !assignedSectionIds.includes(lSectionId);
    });

    if (unassignedSessions.length > 0) {
      console.log(`[Zoho] ${unassignedSessions.length} sessions unmatched, creating "Other Lessons" module`);
      const [extraModule] = await db.insert(modules).values({
        courseId: localCourseId,
        title: "Other Lessons",
        description: "Additional lessons from TrainerCentral",
        orderIndex: tcSections.length + 1,
      }).returning();
      for (let lIdx = 0; lIdx < unassignedSessions.length; lIdx++) {
        await insertLesson(unassignedSessions[lIdx], extraModule.id, localCourseId, lIdx, sessionMaterialsMap, zohoCoureId);
      }
    }
  } else if (tcSessions.length > 0) {
    console.log(`[Zoho] No sections found, creating default module with ${tcSessions.length} lessons`);

    const [defaultModule] = await db.insert(modules).values({
      courseId: localCourseId,
      title: "Course Content",
      description: "Lessons from TrainerCentral",
      orderIndex: 1,
    }).returning();

    for (let lIdx = 0; lIdx < tcSessions.length; lIdx++) {
      await insertLesson(tcSessions[lIdx], defaultModule.id, localCourseId, lIdx, sessionMaterialsMap, zohoCoureId);
    }
  }
}

async function insertLesson(
  lesson: any,
  moduleId: number,
  courseId: number,
  index: number,
  sessionMaterialsMap?: Map<string, { videoUrl: string | null; contentHtml: string | null; materialType: string; hasUploadedVideo: boolean }>,
  zohoCourseId?: string
): Promise<void> {
  const lessonTitle = lesson.sessionName || lesson.lessonName || lesson.name || lesson.title || `Lesson ${index + 1}`;
  const sessionId = String(lesson.sessionId || lesson.id || "");

  const matData = sessionMaterialsMap?.get(sessionId);

  let lessonContent = "";
  if (matData?.contentHtml) {
    lessonContent = matData.contentHtml;
  } else {
    const rawContent = lesson.description || lesson.content || lesson.summary || "";
    lessonContent = rawContent.replace(/<[^>]*>/g, '').trim();
  }

  let videoUrl = matData?.videoUrl || null;

  if (!videoUrl) {
    videoUrl = lesson.videoUrl || lesson.video_url || lesson.videoURL
      || lesson.mediaUrl || lesson.media_url || lesson.streamUrl || lesson.stream_url
      || lesson.contentUrl || lesson.content_url || lesson.url || null;
  }

  const durationMinutes = lesson.durationMinutes || lesson.duration_minutes
    || lesson.duration || lesson.sessionDuration || null;

  const validVideoUrl = typeof videoUrl === 'string' && videoUrl.startsWith('http') ? videoUrl : null;

  let trainerCentralUrl: string | null = null;
  if (matData?.hasUploadedVideo && zohoCourseId && sessionId) {
    trainerCentralUrl = `https://our-shiksha.trainercentral.in/course/attend?previouspage=clientapp#/course/${zohoCourseId}/attend/section/${sessionId}`;
    console.log(`[Zoho] Lesson "${lessonTitle}": uploaded video, TC link=${trainerCentralUrl}`);
  }

  console.log(`[Zoho] Lesson "${lessonTitle}": video=${validVideoUrl ? 'YES' : 'no'}, uploadedVideo=${matData?.hasUploadedVideo ? 'YES' : 'no'}, content=${lessonContent ? `${lessonContent.length} chars` : 'none'}`);

  await db.insert(lessons).values({
    moduleId,
    courseId,
    title: lessonTitle,
    content: lessonContent || `Lesson from TrainerCentral`,
    videoUrl: validVideoUrl,
    trainerCentralUrl,
    durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : null,
    orderIndex: index + 1,
    isPreview: index === 0,
  });
}

export async function debugCourseCurriculum(courseZohoId: string): Promise<any> {
  const config = getConfig();
  const orgId = config.orgId;
  const accessToken = await getValidAccessToken();

  const results: any = { courseZohoId, sections: null, sessions: null, sessionDetails: [], courseInfo: null };

  const endpoints = [
    { key: 'courseInfo', url: `/api/v4/${orgId}/course/${courseZohoId}.json` },
    { key: 'sections', url: `/api/v4/${orgId}/course/${courseZohoId}/sections.json` },
    { key: 'sessions', url: `/api/v4/${orgId}/course/${courseZohoId}/sessions.json` },
  ];

  for (const ep of endpoints) {
    try {
      const url = `${TRAINERCENTRAL_BASE_URL}${ep.url}`;
      console.log(`[Zoho Debug] Fetching: ${url}`);
      const response = await fetch(url, {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      });
      if (response.ok) {
        results[ep.key] = await response.json();
      } else {
        results[ep.key] = { error: response.status, statusText: response.statusText, body: (await response.text()).substring(0, 1000) };
      }
    } catch (e: any) {
      results[ep.key] = { error: e.message };
    }
  }

  const sessions = results.sessions?.sessions || results.sessions?.data || [];
  if (Array.isArray(sessions) && sessions.length > 0) {
    const maxDetails = Math.min(sessions.length, 3);
    for (let i = 0; i < maxDetails; i++) {
      const session = sessions[i];
      const sessionId = session.sessionId || session.id;
      if (!sessionId) continue;

      const sessionDetail: any = { sessionId, sessionName: session.name, materials: null, site: null, presentationData: null, materialSettings: null };

      const materialEndpoints = [
        { key: 'materials', url: session.links?.sessionMaterials || `/api/v4/${orgId}/session/${sessionId}/sessionMaterials.json` },
        { key: 'site', url: session.links?.site || `/api/v4/${orgId}/session/${sessionId}/site.json` },
        { key: 'presentationData', url: session.links?.presentationData || `/api/v4/${orgId}/session/${sessionId}/presentationData.json` },
        { key: 'materialSettings', url: session.links?.sessionMaterialSettings || `/api/v4/${orgId}/session/${sessionId}/sessionMaterialSettings.json` },
      ];

      for (const ep of materialEndpoints) {
        try {
          const url = `${TRAINERCENTRAL_BASE_URL}${ep.url}`;
          console.log(`[Zoho Debug] Fetching ${ep.key}: ${url}`);
          const res = await fetch(url, {
            headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
          });
          if (res.ok) {
            sessionDetail[ep.key] = await res.json();
          } else {
            sessionDetail[ep.key] = { error: res.status, body: (await res.text()).substring(0, 300) };
          }
        } catch (e: any) {
          sessionDetail[ep.key] = { error: e.message };
        }
      }

      results.sessionDetails.push(sessionDetail);
    }
  }

  return results;
}

export async function testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const connected = await isConnected();
    if (!connected) {
      return { success: false, message: "Not connected to Zoho. Click 'Connect to Zoho' to authorize." };
    }

    const accessToken = await getValidAccessToken();
    const config = getConfig();

    const url = `${TRAINERCENTRAL_BASE_URL}/api/v4/${config.orgId}/courses.json?limit=1`;
    console.log(`[Zoho] Test connection: ${url}`);
    const response = await fetch(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: "Successfully connected to Zoho TrainerCentral!",
        details: { status: response.status },
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        message: `API returned ${response.status}: ${errorText.substring(0, 200)}`,
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// === Learner Management APIs ===

export async function getAcademyLearners(limit = 20, startIndex = 0): Promise<any> {
  const config = getConfig();
  return zohoApiRequest(`/api/v4/${config.orgId}/portalMembers.json?type=5&limit=${limit}&si=${startIndex}`);
}

export async function getLearnerInfo(email: string): Promise<any> {
  const config = getConfig();
  return zohoApiRequest(`/api/v4/${config.orgId}/fetchuserdetails.json?email=${encodeURIComponent(email)}&fetchSignupData=true`);
}

export async function inviteLearnerToAcademy(email: string, firstName: string, lastName: string, password?: string): Promise<any> {
  const config = getConfig();
  const accessToken = await getValidAccessToken();
  const url = `${TRAINERCENTRAL_BASE_URL}/api/v4/${config.orgId}/addCourseAttendee.json`;

  const body: any = {
    courseAttendee: {
      email,
      firstName,
      lastName,
    },
  };
  if (password) {
    body.courseAttendee.password = password;
  }

  console.log(`[Zoho] Inviting learner to academy: ${email}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(`[Zoho] Invite academy response (${response.status}):`, JSON.stringify(data).substring(0, 500));
  return { status: response.status, data };
}

export async function inviteLearnerToCourse(email: string, firstName: string, lastName: string, courseId: string, password?: string): Promise<any> {
  const config = getConfig();
  const accessToken = await getValidAccessToken();
  const url = `${TRAINERCENTRAL_BASE_URL}/api/v4/${config.orgId}/addCourseAttendee.json`;

  const body: any = {
    courseAttendee: {
      email,
      firstName,
      lastName,
      courseId,
    },
  };
  if (password) {
    body.courseAttendee.password = password;
  }

  console.log(`[Zoho] Inviting learner to course ${courseId}: ${email}`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(`[Zoho] Invite course response (${response.status}):`, JSON.stringify(data).substring(0, 500));
  return { status: response.status, data };
}

export async function getCourseLearners(courseId: string, limit = 20, startIndex = 0): Promise<any> {
  const config = getConfig();
  return zohoApiRequest(`/api/v4/${config.orgId}/course/${courseId}/courseMembers.json?filter=3&limit=${limit}&si=${startIndex}`);
}
