import { db } from "./db";
import { zohoTokens, courses, modules, lessons } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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
  const scopes = "TrainerCentral.courseapi.READ,TrainerCentral.userapi.READ";
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

export async function fetchCourseLessons(courseId: string): Promise<any[]> {
  const config = getConfig();
  const orgId = config.orgId;

  try {
    const data = await zohoApiRequest(
      `/api/v4/${orgId}/course/${courseId}/lessons.json`
    );
    return data.lessons || data.data || [];
  } catch (error) {
    console.error(`[Zoho] Failed to fetch lessons for course ${courseId}:`, error);
    return [];
  }
}

export async function syncCoursesFromTrainerCentral(): Promise<{
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}> {
  const tcCourses = await fetchTrainerCentralCourses();
  const result = { synced: tcCourses.length, created: 0, updated: 0, errors: [] as string[] };

  for (const tcCourse of tcCourses) {
    try {
      const zohoId = String(tcCourse.id || tcCourse.courseId);
      const title = tcCourse.name || tcCourse.title || "Untitled Course";
      const description = tcCourse.description || tcCourse.summary || "";
      const thumbnailUrl = tcCourse.thumbnail || tcCourse.image || null;

      const [existing] = await db.select()
        .from(courses)
        .where(eq(courses.zohoId, zohoId))
        .limit(1);

      if (existing) {
        await db.update(courses).set({
          title,
          description,
          thumbnailUrl: thumbnailUrl || existing.thumbnailUrl,
          updatedAt: new Date(),
        }).where(eq(courses.id, existing.id));
        result.updated++;
      } else {
        await db.insert(courses).values({
          title,
          description,
          thumbnailUrl,
          status: "draft",
          zohoId,
          category: tcCourse.category || "General",
          level: "beginner",
          isFree: false,
          creditCost: 100,
          isActive: true,
        });
        result.created++;
      }
    } catch (error: any) {
      result.errors.push(`Failed to sync course "${tcCourse.name || tcCourse.id}": ${error.message}`);
    }
  }

  console.log(`[Zoho] Sync complete: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`);
  return result;
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
