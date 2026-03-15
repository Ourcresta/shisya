import type { Express } from "express";
import { createServer, type Server } from "http";
import { mockCourses, mockModules, mockLessons, mockAINotes, getAllLessons, mockProjects, getAllProjects, mockTests, getAllTests } from "./mockData";
import { mockLabs, getCourseLabs, getLab, getAllLabs } from "./mockLabs";
import { authRouter } from "./auth";
import { guruAuthRouter } from "./guruAuth";
import { oauthRouter } from "./oauth";
import { udyogRouter } from "./udyogRoutes";
import { seedGuruAdmin } from "./seedGuru";
import { registerUshaRoutes } from "./usha";
import { creditsRouter } from "./credits";
import { razorpayRouter } from "./razorpayPayments";
import { notificationsRouter } from "./notifications";
import { registerMotivationRoutes } from "./motivationRoutes";
import { guruRouter } from "./guruRoutes";
import { r2Router } from "./r2Upload";
import { exchangeCodeForTokens } from "./zohoService";
import { sendGenericEmail } from "./resend";
import { db } from "./db";
import { userProfiles, marksheets, marksheetVerifications, courses as coursesTable, modules as modulesTable, lessons as lessonsTable, pricingPlans, projects as projectsTable, creditPacks, sitePages, courseGroups, courseGroupItems } from "@shared/schema";
import { eq, like, or, and, desc as descOrder, sql, count, asc } from "drizzle-orm";
import type { ModuleWithLessons } from "@shared/schema";

// AISiksha Admin Course Factory configuration
const AISIKSHA_ADMIN_URL = process.env.AISIKSHA_ADMIN_URL || "";
const AISIKSHA_API_KEY = process.env.AISIKSHA_API_KEY || "";

// Check if we should use mock data (when admin backend is not available)
const USE_MOCK_DATA = !AISIKSHA_ADMIN_URL || !AISIKSHA_API_KEY;

// Helper function to fetch from AISiksha Admin API
async function fetchFromAdmin(endpoint: string): Promise<Response> {
  if (!AISIKSHA_ADMIN_URL || !AISIKSHA_API_KEY) {
    throw new Error("AISiksha Admin API not configured");
  }
  const url = `${AISIKSHA_ADMIN_URL}/api/public${endpoint}`;
  console.log(`[AISiksha] Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "X-API-Key": AISIKSHA_API_KEY,
    },
  });
  return response;
}

// Log configuration status on startup
console.log(`[AISiksha] Admin URL configured: ${!!AISIKSHA_ADMIN_URL}`);
console.log(`[AISiksha] API Key configured: ${!!AISIKSHA_API_KEY}`);
console.log(`[AISiksha] Using mock data: ${USE_MOCK_DATA}`);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed Guru admin user
  seedGuruAdmin();

  // Run DB migrations for udyog_internships extended fields
  (async () => {
    try {
      const { pool } = await import("./db");
      await pool.query(`
        ALTER TABLE udyog_internships
          ADD COLUMN IF NOT EXISTS introduction TEXT,
          ADD COLUMN IF NOT EXISTS goal TEXT,
          ADD COLUMN IF NOT EXISTS project_structure TEXT,
          ADD COLUMN IF NOT EXISTS final_integration TEXT,
          ADD COLUMN IF NOT EXISTS testing TEXT,
          ADD COLUMN IF NOT EXISTS deployment TEXT,
          ADD COLUMN IF NOT EXISTS live_project_output TEXT;
        ALTER TABLE udyog_internships
          ALTER COLUMN skill_level TYPE VARCHAR(30);
      `);
      console.log("[Migration] udyog_internships columns ensured");
    } catch (err: any) {
      console.error("[Migration] udyog_internships migration error:", err.message);
    }
  })();

  // Seed default credit packs if table is empty
  (async () => {
    try {
      const existing = await db.select().from(creditPacks).limit(1);
      if (existing.length === 0) {
        await db.insert(creditPacks).values([
          { name: "Starter Pack", price: 500, points: 500, bonusPercent: 0, description: "Best for beginners", popular: false, isActive: true, orderIndex: 0 },
          { name: "Pro Pack", price: 1000, points: 1100, bonusPercent: 10, description: "+10% bonus points", popular: false, isActive: true, orderIndex: 1 },
          { name: "Power Pack", price: 2000, points: 2300, bonusPercent: 15, description: "+15% bonus (Recommended)", popular: true, isActive: true, orderIndex: 2 },
        ]);
        console.log("[CreditPacks] Seeded 3 default credit packs");
      }
    } catch (e) {
      console.error("[CreditPacks] Seed error:", e);
    }
  })();

  // Seed default site_pages if table is empty
  (async () => {
    try {
      const defaultPages = [
        {
          slug: "ai-usha-mentor",
          title: "AI Usha Mentor",
          content: {
            heroHeading: "Meet Usha — Your AI Learning Companion",
            heroSubtext: "Usha uses Socratic questioning to guide your understanding, never giving direct answers but always helping you discover the solution yourself.",
            features: [
              { title: "Socratic Method", description: "Usha asks the right questions to help you think critically and arrive at answers on your own." },
              { title: "24/7 Availability", description: "Get guidance anytime, anywhere. Usha is always ready to help you learn." },
              { title: "Personalized Guidance", description: "Usha adapts to your learning pace and style for a truly customized experience." },
              { title: "Context-Aware", description: "Usha understands your current lesson, lab, or test and provides relevant guidance." }
            ],
            ctaText: "Start Learning with Usha"
          },
        },
        {
          slug: "become-guru",
          title: "Become a Guru",
          content: {
            heroHeading: "Become a Guru on OurShiksha",
            heroSubtext: "Share your expertise, build courses, and impact thousands of learners across India. Join our growing community of educators.",
            benefits: [
              { title: "Reach Thousands", description: "Access our growing community of motivated learners eager to upskill." },
              { title: "Earn Revenue", description: "Set your own pricing and earn from every enrollment in your courses." },
              { title: "AI-Powered Tools", description: "Use our AI-assisted course builder to create engaging content faster." },
              { title: "Full Analytics", description: "Track student progress, completion rates, and feedback in real-time." }
            ],
            ctaText: "Apply to Become a Guru"
          },
        },
        {
          slug: "help-center",
          title: "Help Center",
          content: {
            heroHeading: "How Can We Help You?",
            heroSubtext: "Find answers to common questions and get the support you need to succeed on OurShiksha.",
            faq: [
              { question: "How do I enroll in a course?", answer: "Browse our course catalog, select a course, and click 'Enroll'. You'll need sufficient learning credits in your wallet." },
              { question: "What are learning credits?", answer: "Credits are our in-app currency. You can purchase credit packs from the Pricing page and use them to access courses, tests, and certificates." },
              { question: "How do certificates work?", answer: "Complete all course modules, pass the final test, and submit your project to earn a verified certificate with QR code validation." },
              { question: "Can I get a refund?", answer: "Credits are non-refundable once used. Unused credit packs can be refunded within 7 days of purchase." },
              { question: "How do I contact support?", answer: "Use the Contact Us page or email us directly. We typically respond within 24 hours." }
            ],
            ctaText: "Contact Support"
          },
        },
        {
          slug: "become-a-partner",
          title: "Become a Partner",
          content: {
            heroHeading: "Partner with OurShiksha",
            heroSubtext: "Join hands with us to transform education. Whether you're an institution, corporation, or edtech company, there's a partnership model for you.",
            partnerTypes: [
              { title: "Academic Institutions", description: "Integrate OurShiksha into your curriculum and give students access to industry-ready skills and verified certifications." },
              { title: "Corporate Training", description: "Upskill your workforce with customized learning paths, labs, and assessments tailored to your industry." },
              { title: "Content Partners", description: "Contribute courses and content to our platform and reach thousands of learners across India." },
              { title: "Technology Partners", description: "Integrate your tools and platforms with OurShiksha to enhance the learning experience." }
            ],
            ctaText: "Get in Touch"
          },
        },
      ];
      let seeded = 0;
      for (const page of defaultPages) {
        const [inserted] = await db.insert(sitePages).values(page).onConflictDoNothing().returning();
        if (inserted) seeded++;
      }
      if (seeded > 0) console.log(`[SitePages] Seeded ${seeded} default pages`);
    } catch (e) {
      console.error("[SitePages] Seed error:", e);
    }
  })();

  // Auth routes
  app.use("/api/auth", authRouter);

  // Guru Admin auth routes
  app.use("/api/guru/auth", guruAuthRouter);

  // OAuth routes (Google, Microsoft, SSO)
  app.use("/api/oauth", oauthRouter);

  // Udyog Virtual Internship routes
  app.use("/api/udyog", udyogRouter);

  // Zoho OAuth callback (no auth required - Zoho redirects here)
  app.get("/api/guru/zoho/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2 style="color:#e11d48;">Connection Failed</h2><p>No authorization code received from Zoho.</p><p>You can close this tab and try again.</p></body></html>`);
      }
      await exchangeCodeForTokens(code);
      res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2 style="color:#16a34a;">Connected Successfully!</h2><p>Zoho TrainerCentral is now connected.</p><p>You can close this tab and return to the Settings page.</p><script>setTimeout(function(){window.close()},3000);</script></body></html>`);
    } catch (error: any) {
      console.error("[Zoho] OAuth callback error:", error);
      res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;"><h2 style="color:#e11d48;">Connection Failed</h2><p>${error.message}</p><p>You can close this tab and try again.</p></body></html>`);
    }
  });
  
  // Cloudflare R2 video upload (must be before broad /api/guru mount)
  app.use("/api/guru/r2", r2Router);

  // Video proxy — streams R2 (or any allowed) video through the server to avoid
  // browser CORS restrictions. Supports HTTP Range requests for scrubbing.
  const R2_PUBLIC_HOST = (process.env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");
  app.get("/api/video-proxy", async (req: any, res: any) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) return res.status(400).json({ error: "url query param is required" });

    let targetUrl: URL;
    try {
      targetUrl = new URL(rawUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Only proxy from the configured R2 public domain for security
    const allowedHosts = ["r2.dev", "cloudflarestorage.com"];
    const isAllowed = allowedHosts.some((h) => targetUrl.hostname.endsWith(h));
    if (!isAllowed) {
      return res.status(403).json({ error: "URL not allowed" });
    }

    try {
      const headers: Record<string, string> = { "User-Agent": "OurShiksha/1.0" };
      const range = req.headers["range"];
      if (range) headers["Range"] = range;

      const upstream = await fetch(rawUrl, { headers });

      res.status(upstream.status);
      const passHeaders = [
        "content-type", "content-length", "content-range",
        "accept-ranges", "last-modified", "etag",
      ];
      passHeaders.forEach((h) => {
        const v = upstream.headers.get(h);
        if (v) res.setHeader(h, v);
      });
      res.setHeader("Cache-Control", "public, max-age=3600");

      if (!upstream.body) return res.end();
      const reader = upstream.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        res.write(Buffer.from(value));
        pump();
      };
      pump();
    } catch (err) {
      console.error("[VideoProxy] Error:", err);
      res.status(502).json({ error: "Failed to proxy video" });
    }
  });

  // HLS manifest proxy — fetches a .m3u8 from R2 and rewrites segment paths
  // so every .ts segment URL points through /api/video-proxy, avoiding CORS.
  app.get("/api/hls-proxy", async (req: any, res: any) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl) return res.status(400).json({ error: "url query param is required" });

    let targetUrl: URL;
    try {
      targetUrl = new URL(rawUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const allowedHosts = ["r2.dev", "cloudflarestorage.com"];
    const isAllowed = allowedHosts.some((h) => targetUrl.hostname.endsWith(h));
    if (!isAllowed) {
      return res.status(403).json({ error: "URL not allowed" });
    }

    try {
      const upstream = await fetch(rawUrl, {
        headers: { "User-Agent": "OurShiksha/1.0" },
      });
      if (!upstream.ok) {
        return res.status(upstream.status).json({ error: "Failed to fetch manifest" });
      }

      const manifestText = await upstream.text();

      const resolveRef = (ref: string): string => {
        if (ref.startsWith("http")) return ref;
        return new URL(ref, rawUrl).toString();
      };

      const isPlaylistRef = (ref: string): boolean => {
        try {
          const pathname = new URL(ref, rawUrl).pathname;
          return pathname.endsWith(".m3u8") || pathname.endsWith(".m3u");
        } catch {
          return ref.endsWith(".m3u8") || ref.endsWith(".m3u");
        }
      };

      let nextLineIsVariant = false;

      const rewritten = manifestText
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();

          if (!trimmed) return line;

          if (trimmed.startsWith("#")) {
            nextLineIsVariant = trimmed.startsWith("#EXT-X-STREAM-INF");

            if (trimmed.includes('URI="')) {
              return trimmed.replace(/URI="([^"]+)"/g, (_match, uri) => {
                const abs = resolveRef(uri);
                const proxy = isPlaylistRef(uri) ? "/api/hls-proxy" : "/api/video-proxy";
                return `URI="${proxy}?url=${encodeURIComponent(abs)}"`;
              });
            }
            return line;
          }

          const abs = resolveRef(trimmed);

          if (nextLineIsVariant || isPlaylistRef(trimmed)) {
            nextLineIsVariant = false;
            return `/api/hls-proxy?url=${encodeURIComponent(abs)}`;
          }

          nextLineIsVariant = false;
          return `/api/video-proxy?url=${encodeURIComponent(abs)}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(rewritten);
    } catch (err) {
      console.error("[HlsProxy] Error:", err);
      res.status(502).json({ error: "Failed to proxy HLS manifest" });
    }
  });

  // Guru Admin dashboard routes
  app.use("/api/guru", guruRouter);
  
  // Credits and enrollments routes
  app.use("/api/user/credits", creditsRouter);
  app.use("/api", creditsRouter);
  
  // Razorpay payment routes
  app.use("/api/payments", razorpayRouter);
  
  // Notifications routes
  app.use("/api/notifications", notificationsRouter);

  // ============ CREDIT PACKS PUBLIC ROUTE ============

  // GET /api/credit-packs - Public route to fetch active credit packs
  app.get("/api/credit-packs", async (req, res) => {
    try {
      const packs = await db.select().from(creditPacks)
        .where(eq(creditPacks.isActive, true))
        .orderBy(asc(creditPacks.orderIndex));
      res.json(packs);
    } catch (error) {
      console.error("[CreditPacks] Error fetching packs:", error);
      res.status(500).json({ error: "Failed to fetch credit packs" });
    }
  });

  // ============ PUBLIC SITE PAGES ROUTE ============
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const [page] = await db.select().from(sitePages).where(eq(sitePages.slug, req.params.slug));
      if (!page) return res.status(404).json({ error: "Page not found" });
      res.json(page);
    } catch (error) {
      console.error("[SitePages] Error fetching page:", error);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  // ============ PUBLIC CONFIG ROUTES ============

  // GET /api/config/public - Serve public configuration values
  app.get("/api/config/public", (req, res) => {
    res.json({
      supportEmail: process.env.SUPPORT_EMAIL || "support@ourshiksha.com",
      privacyEmail: process.env.PRIVACY_EMAIL || "privacy@ourshiksha.com",
      legalEmail: process.env.LEGAL_EMAIL || "legal@ourshiksha.com",
      companyLocation: process.env.COMPANY_LOCATION || "Chennai, Tamil Nadu, India",
      companyName: "OurShiksha",
    });
  });

  // POST /api/contact - Send contact form email
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const supportEmail = process.env.SUPPORT_EMAIL || "support@ourshiksha.com";
      
      // Create email HTML
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the OurShiksha contact form.
          </p>
        </div>
      `;

      const emailSent = await sendGenericEmail(
        supportEmail,
        `[Contact Form] ${subject}`,
        html
      );

      if (emailSent) {
        res.json({ success: true, message: "Your message has been sent successfully!" });
      } else {
        res.status(500).json({ error: "Failed to send message. Please try again later." });
      }
    } catch (error) {
      console.error("Error sending contact form:", error);
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
  });

  // ============ USERNAME CHECK ROUTE ============

  // GET /api/username/check/:username - Check username availability and get suggestions
  app.get("/api/username/check/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const currentUserId = req.query.currentUserId as string | undefined;

      // Validate username format
      const usernameRegex = /^[a-z0-9_-]+$/;
      if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
        return res.json({
          available: false,
          valid: false,
          message: "Username must be 3-30 characters, lowercase letters, numbers, hyphens, and underscores only",
          suggestions: []
        });
      }

      // Check if username exists in database
      const existing = await db.select({ id: userProfiles.id, userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.username, username))
        .limit(1);

      // If current user owns this username, it's available for them
      if (existing.length > 0 && currentUserId && existing[0].userId === currentUserId) {
        return res.json({
          available: true,
          valid: true,
          message: "This is your current username",
          suggestions: []
        });
      }

      const isAvailable = existing.length === 0;

      if (isAvailable) {
        return res.json({
          available: true,
          valid: true,
          message: "Username is available",
          suggestions: []
        });
      }

      // Generate suggestions when username is taken
      const baseName = username.replace(/[0-9_-]+$/, ""); // Remove trailing numbers/special chars
      const suggestions: string[] = [];
      const candidateSuffixes = [
        Math.floor(Math.random() * 900) + 100,
        new Date().getFullYear() % 100,
        Math.floor(Math.random() * 90) + 10,
        "_dev",
        "_pro",
        Math.floor(Math.random() * 9000) + 1000,
      ];

      for (const suffix of candidateSuffixes) {
        const candidate = `${baseName}${suffix}`;
        if (candidate.length <= 30) {
          // Check if candidate is available
          const candidateExists = await db.select({ id: userProfiles.id })
            .from(userProfiles)
            .where(eq(userProfiles.username, candidate))
            .limit(1);
          
          if (candidateExists.length === 0) {
            suggestions.push(candidate);
            if (suggestions.length >= 4) break;
          }
        }
      }

      return res.json({
        available: false,
        valid: true,
        message: "Username is already taken",
        suggestions
      });
    } catch (error) {
      console.error("Error checking username:", error);
      res.status(500).json({ error: "Failed to check username availability" });
    }
  });
  
  // GET /api/courses - Fetch only published and active courses
  // SHISHYA RULE: WHERE status = 'published' AND is_active = true
  app.get("/api/courses", async (req, res) => {
    try {
      let externalCourses: any[] = [];

      if (USE_MOCK_DATA) {
        externalCourses = mockCourses.filter(c => c.status === "published");
      } else {
        try {
          const response = await fetchFromAdmin("/courses");
          if (response.ok) {
            const data = await response.json();
            const courses = data.courses || data;
            externalCourses = Array.isArray(courses) 
              ? courses.filter((c: any) => c.status === "published" && c.isActive !== false)
              : [];
          }
        } catch (e) {
          console.error("[AISiksha] External API failed, using mock fallback:", e);
          externalCourses = mockCourses.filter(c => c.status === "published");
        }
      }

      let dbCourses: any[] = [];
      try {
        dbCourses = await db.select().from(coursesTable)
          .where(eq(coursesTable.status, "published"))
          .orderBy(descOrder(coursesTable.createdAt));
      } catch (e) {
        console.error("[DB] Failed to fetch courses from database:", e);
      }

      const externalIds = new Set(externalCourses.map((c: any) => c.id));
      const mergedCourses = [...externalCourses];
      for (const dbCourse of dbCourses) {
        if (!externalIds.has(dbCourse.id)) {
          mergedCourses.push(dbCourse);
        }
      }

      let projectCounts: Record<number, number> = {};
      try {
        const counts = await db.select({
          courseId: projectsTable.courseId,
          count: count(),
        }).from(projectsTable).groupBy(projectsTable.courseId);
        counts.forEach((c) => { projectCounts[c.courseId] = c.count; });
      } catch (e) {
        console.error("[DB] Failed to fetch project counts:", e);
      }

      const enrichedCourses = mergedCourses.map((c: any) => ({
        ...c,
        projectCount: projectCounts[c.id] || 0,
      }));

      console.log(`[Courses] Serving ${enrichedCourses.length} courses (${externalCourses.length} external + ${dbCourses.length} from DB)`);
      res.json(enrichedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      const publishedCourses = mockCourses.filter(c => c.status === "published");
      return res.json(publishedCourses);
    }
  });

  // GET /api/course-groups - Public listing of all course groups with member courses
  app.get("/api/course-groups", async (req, res) => {
    try {
      const groups = await db.select().from(courseGroups).orderBy(descOrder(courseGroups.createdAt));
      const items = await db.select().from(courseGroupItems);
      const allCourses = await db.select().from(coursesTable);
      const courseMap = new Map(allCourses.map(c => [c.id, c]));
      const result = groups.map(g => {
        const groupItems = items.filter(i => i.groupId === g.id).sort((a, b) => a.orderIndex - b.orderIndex);
        const memberCourses = groupItems.map(i => courseMap.get(i.courseId)).filter(Boolean) as typeof allCourses;
        const allSkills = memberCourses.flatMap(c => (c.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean));
        const uniqueSkills = Array.from(new Set(allSkills));
        const totalMinutes = memberCourses.reduce((sum, c) => {
          if (!c.duration) return sum;
          const match = c.duration.match(/(\d+)/);
          return sum + (match ? parseInt(match[1]) : 0);
        }, 0);
        return {
          ...g,
          courseCount: memberCourses.length,
          courses: memberCourses,
          aggregatedSkills: uniqueSkills.join(","),
          totalDuration: totalMinutes > 0 ? `${totalMinutes} hours` : null,
        };
      });
      res.json(result);
    } catch (error) {
      console.error("[Public] Get course groups error:", error);
      res.status(500).json({ error: "Failed to fetch course groups" });
    }
  });

  // GET /api/courses/:courseId - Fetch single course with full content
  // SHISHYA RULE: WHERE status = 'published' AND is_active = true
  app.get("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      const [dbCourse] = await db.select().from(coursesTable)
        .where(and(eq(coursesTable.id, courseIdNum), eq(coursesTable.status, "published")))
        .limit(1);
      if (dbCourse) {
        return res.json(dbCourse);
      }

      if (USE_MOCK_DATA) {
        const course = mockCourses.find(c => c.id === courseIdNum);
        if (!course || course.status !== "published") {
          return res.status(404).json({ error: "Course not found" });
        }
        return res.json(course);
      }

      const response = await fetchFromAdmin(`/courses/${courseId}`);
      if (!response.ok) {
        const course = mockCourses.find(c => c.id === courseIdNum);
        if (!course || course.status !== "published") {
          return res.status(404).json({ error: "Course not found" });
        }
        return res.json(course);
      }
      const data = await response.json();
      const course = data.course || data;
      if (course.status !== "published" || course.isActive === false) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const course = mockCourses.find(c => c.id === courseIdNum);
      if (course && course.status === "published") {
        return res.json(course);
      }
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  // GET /api/courses/:courseId/modules - Fetch modules for a course
  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      const dbModules = await db.select().from(modulesTable)
        .where(eq(modulesTable.courseId, courseIdNum))
        .orderBy(modulesTable.orderIndex);
      if (dbModules.length > 0) {
        return res.json(dbModules);
      }

      if (USE_MOCK_DATA) {
        return res.json(mockModules[courseIdNum] || []);
      }

      const response = await fetchFromAdmin(`/courses/${courseId}/modules`);
      if (!response.ok) {
        return res.json(mockModules[courseIdNum] || []);
      }
      const data = await response.json();
      res.json(data.modules || data);
    } catch (error) {
      console.error("Error fetching modules:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      return res.json(mockModules[courseIdNum] || []);
    }
  });

  app.get("/api/courses/:courseId/modules-with-lessons", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      const dbModules = await db.select().from(modulesTable)
        .where(eq(modulesTable.courseId, courseIdNum))
        .orderBy(modulesTable.orderIndex);

      if (dbModules.length > 0) {
        const modulesWithLessons = await Promise.all(
          dbModules.map(async (mod) => {
            const dbLessons = await db.select().from(lessonsTable)
              .where(eq(lessonsTable.moduleId, mod.id))
              .orderBy(lessonsTable.orderIndex);
            return { ...mod, lessons: dbLessons };
          })
        );
        return res.json(modulesWithLessons);
      }

      const getMockModulesWithLessons = () => {
        const modules = mockModules[courseIdNum] || [];
        return modules.map(module => ({
          ...module,
          lessons: mockLessons[module.id] || [],
        }));
      };

      if (USE_MOCK_DATA) {
        return res.json(getMockModulesWithLessons());
      }
      
      const modulesResponse = await fetchFromAdmin(`/courses/${courseId}/modules`);
      if (!modulesResponse.ok) {
        return res.json(getMockModulesWithLessons());
      }
      const modulesData = await modulesResponse.json();
      const modules = modulesData.modules || modulesData;
      
      const modulesWithLessons = await Promise.all(
        (modules || []).map(async (module: any) => {
          try {
            const lessonsResponse = await fetchFromAdmin(`/modules/${module.id}/lessons`);
            if (!lessonsResponse.ok) {
              return { ...module, lessons: mockLessons[module.id] || [] };
            }
            const lessonsData = await lessonsResponse.json();
            return { ...module, lessons: lessonsData.lessons || lessonsData || [] };
          } catch {
            return { ...module, lessons: mockLessons[module.id] || [] };
          }
        })
      );
      
      res.json(modulesWithLessons);
    } catch (error) {
      console.error("Error fetching modules with lessons:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const modules = mockModules[courseIdNum] || [];
      return res.json(modules.map(module => ({
        ...module,
        lessons: mockLessons[module.id] || [],
      })));
    }
  });

  app.get("/api/modules/:moduleId/lessons", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const moduleIdNum = parseInt(moduleId, 10);

      const dbLessons = await db.select().from(lessonsTable)
        .where(eq(lessonsTable.moduleId, moduleIdNum))
        .orderBy(lessonsTable.orderIndex);
      if (dbLessons.length > 0) {
        return res.json(dbLessons);
      }

      if (USE_MOCK_DATA) {
        return res.json(mockLessons[moduleIdNum] || []);
      }

      const response = await fetchFromAdmin(`/modules/${moduleId}/lessons`);
      if (!response.ok) {
        return res.json(mockLessons[moduleIdNum] || []);
      }
      const data = await response.json();
      res.json(data.lessons || data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      const moduleIdNum = parseInt(req.params.moduleId, 10);
      return res.json(mockLessons[moduleIdNum] || []);
    }
  });

  // GET /api/lessons/all - Fetch all lessons as a map by ID (must be before :lessonId route)
  app.get("/api/lessons/all", async (req, res) => {
    try {
      const allLessons = getAllLessons();
      res.json(allLessons);
    } catch (error) {
      console.error("Error fetching all lessons:", error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  // GET /api/lessons/:lessonId - Fetch single lesson
  app.get("/api/lessons/:lessonId", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const lessonIdNum = parseInt(lessonId, 10);

      const [dbLesson] = await db.select().from(lessonsTable)
        .where(eq(lessonsTable.id, lessonIdNum))
        .limit(1);
      if (dbLesson) {
        const safeJson = (v: any) => { try { return v ? JSON.parse(v) : null; } catch { return null; } };
        return res.json({
          ...dbLesson,
          audioTracks: safeJson(dbLesson.audioTracks),
          subtitleTracks: safeJson(dbLesson.subtitleTracks),
          attachments: safeJson(dbLesson.attachments),
          codeSnippets: safeJson(dbLesson.codeSnippets),
        });
      }

      if (USE_MOCK_DATA) {
        const allLessons = getAllLessons();
        const lesson = allLessons[lessonIdNum];
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found" });
        }
        return res.json(lesson);
      }

      const response = await fetchFromAdmin(`/lessons/${lessonId}`);
      if (!response.ok) {
        const allLessons = getAllLessons();
        const lesson = allLessons[lessonIdNum];
        if (!lesson) {
          return res.status(404).json({ error: "Lesson not found" });
        }
        return res.json(lesson);
      }
      const data = await response.json();
      res.json(data.lesson || data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      const lessonIdNum = parseInt(req.params.lessonId, 10);
      const allLessons = getAllLessons();
      const lesson = allLessons[lessonIdNum];
      if (lesson) {
        return res.json(lesson);
      }
      res.status(500).json({ error: "Failed to fetch lesson" });
    }
  });

  // GET /api/lessons/:lessonId/notes - Fetch AI notes for a lesson
  app.get("/api/lessons/:lessonId/notes", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const lessonIdNum = parseInt(lessonId, 10);

      if (USE_MOCK_DATA) {
        const notes = mockAINotes[lessonIdNum] || null;
        return res.json(notes);
      }

      const response = await fetchFromAdmin(`/lessons/${lessonId}/notes`);
      if (!response.ok) {
        // Notes might not exist, return null
        return res.json(null);
      }
      const notes = await response.json();
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.json(null);
    }
  });

  // ============================================
  // PROJECT ROUTES
  // ============================================

  // GET /api/courses/:courseId/projects - Fetch projects for a course
  app.get("/api/courses/:courseId/projects", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      // Always fetch locally-created projects from DB
      const localProjects = await db.select().from(projectsTable).where(eq(projectsTable.courseId, courseIdNum));

      if (USE_MOCK_DATA) {
        const mockP = mockProjects[courseIdNum] || [];
        return res.json([...mockP, ...localProjects]);
      }

      let externalProjects: any[] = [];
      try {
        const response = await fetchFromAdmin(`/courses/${courseId}/projects`);
        if (response.ok) {
          const data = await response.json();
          externalProjects = data.projects || data || [];
        }
      } catch {
        // External API failed, fallback to mock for this course
        externalProjects = mockProjects[courseIdNum] || [];
      }

      // Merge: external first, then local DB (local DB uses negative-range IDs won't clash)
      const merged = [...externalProjects, ...localProjects];
      res.json(merged);
    } catch (error) {
      console.error("Error fetching projects:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const projects = mockProjects[courseIdNum] || [];
      return res.json(projects);
    }
  });

  // GET /api/projects/:projectId - Fetch single project
  app.get("/api/projects/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const projectIdNum = parseInt(projectId, 10);

      // Check local DB first
      const [localProject] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectIdNum));
      if (localProject) {
        return res.json(localProject);
      }

      if (USE_MOCK_DATA) {
        const allProjects = getAllProjects();
        const project = allProjects[projectIdNum];
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        return res.json(project);
      }

      const response = await fetchFromAdmin(`/projects/${projectId}`);
      if (!response.ok) {
        console.log(`[AISiksha] Project API failed, using mock data for project ${projectId}`);
        const allProjects = getAllProjects();
        const project = allProjects[projectIdNum];
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        return res.json(project);
      }
      const data = await response.json();
      const project = data.project || data;
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      const projectIdNum = parseInt(req.params.projectId, 10);
      const allProjects = getAllProjects();
      const project = allProjects[projectIdNum];
      if (project) {
        return res.json(project);
      }
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // POST /api/projects/:projectId/submissions - Submit a project
  // Note: In production, this would save to admin backend
  // For now, we just acknowledge the submission (actual storage is in localStorage on client)
  app.post("/api/projects/:projectId/submissions", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { githubUrl, liveUrl, notes } = req.body;

      // Validate required fields
      if (!githubUrl) {
        return res.status(400).json({ error: "GitHub URL is required" });
      }

      // In a real implementation, this would save to the database
      // For now, we acknowledge the submission
      const submission = {
        projectId: parseInt(projectId, 10),
        githubUrl,
        liveUrl: liveUrl || null,
        notes: notes || null,
        submitted: true,
        submittedAt: new Date().toISOString(),
      };

      res.json({ success: true, submission });
    } catch (error) {
      console.error("Error submitting project:", error);
      res.status(500).json({ error: "Failed to submit project" });
    }
  });

  // ============================================
  // TEST ROUTES
  // ============================================

  // GET /api/courses/:courseId/tests - Fetch tests for a course
  app.get("/api/courses/:courseId/tests", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      // Helper to get mock tests summary
      const getMockTestsSummary = () => {
        const tests = mockTests[courseIdNum] || [];
        return tests.map(({ questions, ...rest }) => rest);
      };

      if (USE_MOCK_DATA) {
        return res.json(getMockTestsSummary());
      }

      const response = await fetchFromAdmin(`/courses/${courseId}/tests`);
      if (!response.ok) {
        console.log(`[AISiksha] Tests API failed, using mock data for course ${courseId}`);
        return res.json(getMockTestsSummary());
      }
      const data = await response.json();
      const tests = data.tests || data;
      res.json(tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      const courseIdNum = parseInt(req.params.courseId, 10);
      const tests = mockTests[courseIdNum] || [];
      const testsSummary = tests.map(({ questions, ...rest }) => rest);
      return res.json(testsSummary);
    }
  });

  // GET /api/tests/:testId - Fetch single test (without correct answers exposed)
  app.get("/api/tests/:testId", async (req, res) => {
    try {
      const { testId } = req.params;
      const testIdNum = parseInt(testId, 10);

      // Helper to get safe mock test
      const getSafeMockTest = () => {
        const allTests = getAllTests();
        const test = allTests[testIdNum];
        if (!test) return null;
        return {
          ...test,
          questions: test.questions.map(q => ({
            ...q,
            options: q.options.map(({ isCorrect, ...opt }) => opt)
          }))
        };
      };

      if (USE_MOCK_DATA) {
        const safeTest = getSafeMockTest();
        if (!safeTest) {
          return res.status(404).json({ error: "Test not found" });
        }
        return res.json(safeTest);
      }

      const response = await fetchFromAdmin(`/tests/${testId}`);
      if (!response.ok) {
        console.log(`[AISiksha] Test API failed, using mock data for test ${testId}`);
        const safeTest = getSafeMockTest();
        if (!safeTest) {
          return res.status(404).json({ error: "Test not found" });
        }
        return res.json(safeTest);
      }
      const data = await response.json();
      const test = data.test || data;
      res.json(test);
    } catch (error) {
      console.error("Error fetching test:", error);
      const testIdNum = parseInt(req.params.testId, 10);
      const allTests = getAllTests();
      const test = allTests[testIdNum];
      if (test) {
        const safeTest = {
          ...test,
          questions: test.questions.map(q => ({
            ...q,
            options: q.options.map(({ isCorrect, ...opt }) => opt)
          }))
        };
        return res.json(safeTest);
      }
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // POST /api/tests/:testId/submit - Submit test answers and calculate score
  app.post("/api/tests/:testId/submit", async (req, res) => {
    try {
      const { testId } = req.params;
      const testIdNum = parseInt(testId, 10);
      const { answers, courseId } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers are required" });
      }

      // Helper function to score test locally
      const scoreTestLocally = () => {
        const allTests = getAllTests();
        const test = allTests[testIdNum];
        if (!test) {
          return null;
        }

        // Calculate score
        let correctCount = 0;
        const totalQuestions = test.questions.length;

        for (const answer of answers) {
          const question = test.questions.find(q => q.id === answer.questionId);
          if (question) {
            const correctOption = question.options.find(o => o.isCorrect);
            if (correctOption && correctOption.id === answer.selectedOptionId) {
              correctCount++;
            }
          }
        }

        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
        const passed = scorePercentage >= test.passingPercentage;

        return {
          success: true,
          result: {
            testId: testIdNum,
            courseId: courseId || test.courseId,
            totalQuestions,
            correctAnswers: correctCount,
            scorePercentage,
            passingPercentage: test.passingPercentage,
            passed,
            attemptedAt: new Date().toISOString()
          }
        };
      };

      // Always score locally since we have the correct answers
      // Admin API doesn't have a submit endpoint
      const localResult = scoreTestLocally();
      if (localResult) {
        return res.json(localResult);
      }

      return res.status(404).json({ error: "Test not found" });
    } catch (error) {
      console.error("Error submitting test:", error);
      res.status(500).json({ error: "Failed to submit test" });
    }
  });

  // ============ LAB ROUTES ============

  // GET /api/courses/:courseId/labs - Fetch labs for a course
  app.get("/api/courses/:courseId/labs", async (req, res) => {
    try {
      const { courseId } = req.params;
      const courseIdNum = parseInt(courseId, 10);

      // Labs are currently only in mock data
      const labs = getCourseLabs(courseIdNum);
      res.json(labs);
    } catch (error) {
      console.error("Error fetching labs:", error);
      res.status(500).json({ error: "Failed to fetch labs" });
    }
  });

  // GET /api/labs/:labId - Fetch single lab
  app.get("/api/labs/:labId", async (req, res) => {
    try {
      const { labId } = req.params;
      const labIdNum = parseInt(labId, 10);

      const lab = getLab(labIdNum);
      if (!lab) {
        return res.status(404).json({ error: "Lab not found" });
      }
      res.json(lab);
    } catch (error) {
      console.error("Error fetching lab:", error);
      res.status(500).json({ error: "Failed to fetch lab" });
    }
  });

  // ============ USHA AI TUTOR ROUTES ============
  registerUshaRoutes(app);

  // ============ AI MOTIVATION ENGINE ROUTES ============
  registerMotivationRoutes(app);

  // ============ MARKSHEET ROUTES ============
  
  // Import marksheet schema
  const { marksheets, marksheetVerifications } = await import("@shared/schema");
  const crypto = await import("crypto");

  // Helper functions for marksheet
  function generateMarksheetId(userId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const hash = userId.substring(0, 8).toUpperCase();
    return `MS-${year}-${hash}`;
  }

  function generateVerificationCode(): string {
    const crypto = require("crypto");
    return crypto.randomBytes(8).toString("hex").toUpperCase();
  }

  function calculateGrade(score: number): string {
    if (score >= 90) return "O";
    if (score >= 80) return "A+";
    if (score >= 70) return "A";
    if (score >= 60) return "B+";
    if (score >= 50) return "B";
    if (score >= 40) return "C";
    return "F";
  }

  function calculateGradePoints(grade: string): number {
    const gradePointMap: Record<string, number> = {
      "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0
    };
    return gradePointMap[grade] || 0;
  }

  function getClassification(percentage: number): string {
    if (percentage >= 75) return "Distinction";
    if (percentage >= 60) return "First Class";
    if (percentage >= 50) return "Second Class";
    if (percentage >= 40) return "Pass";
    return "Below Pass";
  }

  function calculateRewardCoins(classification: string, cgpa: number): number {
    const baseCoins: Record<string, number> = {
      "Distinction": 500,
      "First Class": 300,
      "Second Class": 150,
      "Pass": 50,
      "Below Pass": 0
    };
    return Math.floor((baseCoins[classification] || 0) * (cgpa / 10));
  }

  // Import auth middleware
  const { requireAuth } = await import("./auth");

  // ============ TRAINERCENTRAL VERIFICATION ROUTES ============

  app.get("/api/tc/verify/course-progress/:courseId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const email = req.user?.email;
      if (!userId || !email) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const courseId = parseInt(req.params.courseId);
      const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (!course.zohoId) {
        return res.json({
          verified: true,
          hasZohoId: false,
          message: "This course is not linked to TrainerCentral. No verification needed.",
          progress: { completed: true, progressPercent: 100 }
        });
      }

      const { getLearnerCourseProgress } = await import("./zohoService");
      const progress = await getLearnerCourseProgress(email, course.zohoId);

      res.json({
        verified: progress.completed,
        hasZohoId: true,
        message: progress.completed
          ? "Course completed on TrainerCentral."
          : `Course not yet completed on TrainerCentral (${progress.progressPercent}% done). Complete all lessons on TrainerCentral first.`,
        progress,
      });
    } catch (error: any) {
      console.error("[TC Verify] Course progress error:", error.message);
      res.json({
        verified: true,
        hasZohoId: false,
        message: "Unable to verify TrainerCentral status. Proceeding without verification.",
        progress: { completed: true, progressPercent: 100 }
      });
    }
  });

  app.get("/api/tc/verify/certificate-eligibility/:courseId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const email = req.user?.email;
      if (!userId || !email) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const courseId = parseInt(req.params.courseId);
      const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      if (!course.zohoId) {
        return res.json({
          eligible: true,
          hasZohoId: false,
          message: "This course is not linked to TrainerCentral. Certificate can be generated.",
        });
      }

      const { checkLearnerCertificateEligibility } = await import("./zohoService");
      const result = await checkLearnerCertificateEligibility(email, course.zohoId);

      res.json({
        eligible: result.eligible,
        hasZohoId: true,
        courseCompleted: result.courseCompleted,
        message: result.message,
      });
    } catch (error: any) {
      console.error("[TC Verify] Certificate eligibility error:", error.message);
      res.json({
        eligible: true,
        hasZohoId: false,
        message: "Unable to verify TrainerCentral status. Proceeding without verification.",
      });
    }
  });

  // POST /api/marksheet/generate - Generate a marksheet for authenticated user
  app.post("/api/marksheet/generate", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { courseData, studentName, studentEmail } = req.body;
      
      if (!courseData || !Array.isArray(courseData)) {
        return res.status(400).json({ error: "Invalid course data" });
      }

      // Check if marksheet already exists for this user
      const existingMarksheet = await db.select().from(marksheets).where(eq(marksheets.userId, userId)).limit(1);
      
      if (existingMarksheet.length > 0) {
        // Return existing marksheet
        return res.json({
          success: true,
          marksheet: existingMarksheet[0],
          message: "Marksheet already exists"
        });
      }

      // Calculate statistics
      const completedCourses = courseData.filter((c: any) => c.status === "Pass");
      const totalCredits = completedCourses.reduce((sum: number, c: any) => sum + (c.credits || 0), 0);
      const totalMarks = courseData.length * 100;
      const obtainedMarks = courseData.reduce((sum: number, c: any) => sum + (c.testScore || 0), 0);
      const validScores = courseData.filter((c: any) => c.testScore !== null);
      const percentage = validScores.length > 0 
        ? Math.round(obtainedMarks / validScores.length)
        : 0;
      
      const totalGradePoints = completedCourses.reduce((sum: number, c: any) => 
        sum + calculateGradePoints(c.grade), 0);
      const cgpa = completedCourses.length > 0 
        ? (totalGradePoints / completedCourses.length).toFixed(2) 
        : "0.00";

      const overallGrade = calculateGrade(percentage);
      const classification = getClassification(percentage);
      const result = percentage >= 40 ? "Pass" : percentage > 0 ? "Fail" : "Pending";
      const rewardCoins = calculateRewardCoins(classification, parseFloat(cgpa));
      const scholarshipEligible = classification === "Distinction" || parseFloat(cgpa) >= 8.5;

      const marksheetId = generateMarksheetId(userId);
      const verificationCode = generateVerificationCode();

      // Get current academic year
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const academicYear = month >= 6 ? `${year}-${(year + 1) % 100}` : `${year - 1}-${year % 100}`;

      // Insert marksheet
      const [newMarksheet] = await db.insert(marksheets).values({
        marksheetId,
        userId,
        studentName: studentName || "Student",
        studentEmail: studentEmail || "",
        programName: "Full Stack Development",
        academicYear,
        courseData: JSON.stringify(courseData),
        totalMarks,
        obtainedMarks,
        percentage,
        grade: overallGrade,
        cgpa,
        result,
        classification,
        totalCredits,
        coursesCompleted: completedCourses.length,
        rewardCoins,
        scholarshipEligible,
        verificationCode,
        signedBy: "Controller of Examinations",
        aiVerifierName: "Acharya Usha",
        status: "active"
      }).returning();

      res.json({
        success: true,
        marksheet: newMarksheet,
        message: "Marksheet generated successfully"
      });

    } catch (error) {
      console.error("Error generating marksheet:", error);
      res.status(500).json({ error: "Failed to generate marksheet" });
    }
  });

  // GET /api/marksheet - Get current user's marksheet
  app.get("/api/marksheet", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const [marksheet] = await db.select().from(marksheets).where(eq(marksheets.userId, userId)).limit(1);
      
      if (!marksheet) {
        return res.status(404).json({ error: "Marksheet not found" });
      }

      res.json(marksheet);
    } catch (error) {
      console.error("Error fetching marksheet:", error);
      res.status(500).json({ error: "Failed to fetch marksheet" });
    }
  });

  // GET /api/marksheet/verify/:code - Public verification endpoint
  app.get("/api/marksheet/verify/:code", async (req, res) => {
    try {
      const { code } = req.params;
      
      const [marksheet] = await db.select().from(marksheets)
        .where(eq(marksheets.verificationCode, code))
        .limit(1);
      
      if (!marksheet) {
        return res.status(404).json({ 
          valid: false, 
          error: "Marksheet not found or invalid verification code" 
        });
      }

      // Check if marksheet is still valid
      if (marksheet.status === "revoked") {
        return res.status(400).json({ 
          valid: false, 
          error: "This marksheet has been revoked" 
        });
      }

      if (marksheet.expiresAt && new Date(marksheet.expiresAt) < new Date()) {
        return res.status(400).json({ 
          valid: false, 
          error: "This marksheet has expired" 
        });
      }

      // Log verification
      try {
        await db.insert(marksheetVerifications).values({
          marksheetId: marksheet.id,
          verifierIp: req.ip || null,
          verifierUserAgent: req.headers["user-agent"] || null,
        });
      } catch (logError) {
        console.error("Error logging verification:", logError);
      }

      // Return public marksheet data (excluding sensitive info)
      res.json({
        valid: true,
        marksheet: {
          marksheetId: marksheet.marksheetId,
          studentName: marksheet.studentName,
          programName: marksheet.programName,
          academicYear: marksheet.academicYear,
          totalCredits: marksheet.totalCredits,
          coursesCompleted: marksheet.coursesCompleted,
          percentage: marksheet.percentage,
          grade: marksheet.grade,
          cgpa: marksheet.cgpa,
          result: marksheet.result,
          classification: marksheet.classification,
          signedBy: marksheet.signedBy,
          aiVerifierName: marksheet.aiVerifierName,
          issuedAt: marksheet.issuedAt,
          status: marksheet.status
        }
      });
    } catch (error) {
      console.error("Error verifying marksheet:", error);
      res.status(500).json({ error: "Failed to verify marksheet" });
    }
  });

  // GET /api/marksheet/by-id/:marksheetId - Get marksheet by marksheet ID (public)
  app.get("/api/marksheet/by-id/:marksheetId", async (req, res) => {
    try {
      const { marksheetId: msId } = req.params;
      
      const [marksheet] = await db.select().from(marksheets)
        .where(eq(marksheets.marksheetId, msId))
        .limit(1);
      
      if (!marksheet) {
        return res.status(404).json({ error: "Marksheet not found" });
      }

      // Return public data only
      res.json({
        marksheetId: marksheet.marksheetId,
        studentName: marksheet.studentName,
        programName: marksheet.programName,
        academicYear: marksheet.academicYear,
        totalCredits: marksheet.totalCredits,
        coursesCompleted: marksheet.coursesCompleted,
        percentage: marksheet.percentage,
        grade: marksheet.grade,
        cgpa: marksheet.cgpa,
        result: marksheet.result,
        classification: marksheet.classification,
        courseData: JSON.parse(marksheet.courseData || "[]"),
        signedBy: marksheet.signedBy,
        aiVerifierName: marksheet.aiVerifierName,
        issuedAt: marksheet.issuedAt,
        status: marksheet.status,
        verificationCode: marksheet.verificationCode
      });
    } catch (error) {
      console.error("Error fetching marksheet by ID:", error);
      res.status(500).json({ error: "Failed to fetch marksheet" });
    }
  });

  app.get("/api/pricing-plans", async (req, res) => {
    try {
      const plans = await db.select().from(pricingPlans)
        .where(eq(pricingPlans.isActive, true))
        .orderBy(pricingPlans.orderIndex);
      const parsed = plans.map(p => ({
        ...p,
        features: JSON.parse(p.features),
        notIncluded: JSON.parse(p.notIncluded),
      }));
      res.json(parsed);
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      res.status(500).json({ error: "Failed to fetch pricing plans" });
    }
  });

  return httpServer;
}
