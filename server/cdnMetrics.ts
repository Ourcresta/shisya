import { db } from "./db";
import { videoMetrics, videoViewerDays, platformConfig } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// ── CDN Configuration ─────────────────────────────────────────────────────────
// Two-phase CDN delivery:
//   Phase 1 (default): B2 → Cloudflare CDN (free, zero-egress via Bandwidth Alliance)
//   Phase 2 (auto):    B2 → Bunny CDN (better video streaming performance at scale)
//
// Auto-switch triggers when either threshold is crossed:
//   - Unique video viewers today > 100
//   - Buffering rate today > 5% (buffering_events / play_sessions * 100)

const VIEWER_THRESHOLD = 100;
const BUFFERING_THRESHOLD_PCT = 5;

const B2_CLOUDFLARE_URL = (process.env.B2_CLOUDFLARE_URL || "").replace(/\/$/, "");
const BUNNY_CDN_URL = (process.env.BUNNY_CDN_URL || "").replace(/\/$/, "");

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function ensureTodayMetricsRow(): Promise<void> {
  const today = todayString();
  await db
    .insert(videoMetrics)
    .values({ date: today, uniqueViewers: 0, playSessions: 0, bufferingEvents: 0 })
    .onConflictDoNothing();
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function recordPlayStart(userId: string): Promise<void> {
  const today = todayString();
  await ensureTodayMetricsRow();

  let isNewViewer = false;
  try {
    await db.insert(videoViewerDays).values({ userId, viewDate: today });
    isNewViewer = true;
  } catch {
    // Unique constraint violation — user already counted today
  }

  await db
    .update(videoMetrics)
    .set({
      playSessions: sql`${videoMetrics.playSessions} + 1`,
      ...(isNewViewer ? { uniqueViewers: sql`${videoMetrics.uniqueViewers} + 1` } : {}),
    })
    .where(eq(videoMetrics.date, today));
}

export async function recordBufferingEvent(): Promise<void> {
  const today = todayString();
  await ensureTodayMetricsRow();
  await db
    .update(videoMetrics)
    .set({ bufferingEvents: sql`${videoMetrics.bufferingEvents} + 1` })
    .where(eq(videoMetrics.date, today));
}

export async function getTodayMetrics(): Promise<{
  date: string;
  uniqueViewers: number;
  playSessions: number;
  bufferingEvents: number;
  bufferingRate: number;
}> {
  const today = todayString();
  const rows = await db.select().from(videoMetrics).where(eq(videoMetrics.date, today));
  const row = rows[0] ?? { date: today, uniqueViewers: 0, playSessions: 0, bufferingEvents: 0 };
  const bufferingRate =
    row.playSessions > 0
      ? Math.round((row.bufferingEvents / row.playSessions) * 1000) / 10
      : 0;
  return { ...row, bufferingRate };
}

export async function getCdnMode(): Promise<"cloudflare" | "bunny"> {
  const rows = await db.select().from(platformConfig).where(eq(platformConfig.key, "cdn_mode"));
  const val = rows[0]?.value;
  return val === "bunny" ? "bunny" : "cloudflare";
}

export async function setCdnMode(mode: "cloudflare" | "bunny", reason?: string): Promise<void> {
  const now = new Date();
  await db
    .insert(platformConfig)
    .values({ key: "cdn_mode", value: mode })
    .onConflictDoUpdate({
      target: platformConfig.key,
      set: { value: mode, updatedAt: now },
    });
  if (reason) {
    const logEntry = `[${now.toISOString()}] Switched to ${mode.toUpperCase()}: ${reason}`;
    await db
      .insert(platformConfig)
      .values({ key: "cdn_switch_log", value: logEntry })
      .onConflictDoUpdate({
        target: platformConfig.key,
        set: {
          value: sql`CONCAT(${logEntry}, E'\n', LEFT(${platformConfig.value}, 2000))`,
          updatedAt: now,
        },
      });
  }
  console.log(`[CDN] Mode set to ${mode}${reason ? ` — ${reason}` : ""}`);
}

export async function getCdnSwitchLog(): Promise<string> {
  const rows = await db.select().from(platformConfig).where(eq(platformConfig.key, "cdn_switch_log"));
  return rows[0]?.value ?? "";
}

export function getActiveCdnBaseUrl(mode: "cloudflare" | "bunny"): string {
  if (mode === "bunny" && BUNNY_CDN_URL) return BUNNY_CDN_URL;
  if (B2_CLOUDFLARE_URL) return B2_CLOUDFLARE_URL;
  return BUNNY_CDN_URL;
}

// ── Hourly evaluator ──────────────────────────────────────────────────────────

export async function evaluateCdnThresholds(): Promise<void> {
  try {
    const metrics = await getTodayMetrics();
    const currentMode = await getCdnMode();

    const viewersBreached = metrics.uniqueViewers > VIEWER_THRESHOLD;
    const bufferingBreached = metrics.bufferingRate > BUFFERING_THRESHOLD_PCT;

    if ((viewersBreached || bufferingBreached) && currentMode !== "bunny") {
      const reasons: string[] = [];
      if (viewersBreached) reasons.push(`viewers=${metrics.uniqueViewers} > ${VIEWER_THRESHOLD}`);
      if (bufferingBreached) reasons.push(`buffering=${metrics.bufferingRate}% > ${BUFFERING_THRESHOLD_PCT}%`);
      await setCdnMode("bunny", reasons.join(", "));
    } else if (!viewersBreached && !bufferingBreached && currentMode !== "cloudflare") {
      await setCdnMode("cloudflare", `metrics normalised (viewers=${metrics.uniqueViewers}, buffering=${metrics.bufferingRate}%)`);
    } else {
      console.log(`[CDN] Evaluator: mode=${currentMode}, viewers=${metrics.uniqueViewers}, buffering=${metrics.bufferingRate}%`);
    }
  } catch (err) {
    console.error("[CDN] Evaluator error:", err);
  }
}

export function startCdnEvaluator(): void {
  evaluateCdnThresholds();
  setInterval(evaluateCdnThresholds, 60 * 60 * 1000);
  console.log("[CDN] Hourly threshold evaluator started (Cloudflare → Bunny auto-switch)");
}
