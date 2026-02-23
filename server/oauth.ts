import { Router, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { db } from "./db";
import { users, sessions, userCredits, creditTransactions, WELCOME_BONUS_CREDITS } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import * as zohoService from "./zohoService";

const SESSION_EXPIRY_DAYS = 7;
const COOKIE_NAME = "shishya_session";

export const oauthRouter = Router();

async function createSessionAndRespond(res: Response, user: { id: string; email: string; emailVerified: boolean }, redirectUrl: string) {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
  });

  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });

  res.redirect(redirectUrl);
}

async function findOrCreateOAuthUser(email: string, provider: string, providerId: string): Promise<{ id: string; email: string; emailVerified: boolean; isNew: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  
  if (existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    if (!existingUser.authProvider || existingUser.authProvider === "email") {
      await db.update(users).set({
        authProvider: provider,
        authProviderId: providerId,
        emailVerified: true,
      }).where(eq(users.id, existingUser.id));
    }
    return { id: existingUser.id, email: existingUser.email, emailVerified: true, isNew: false };
  }

  const userId = randomUUID();
  const dummyHash = await bcrypt.hash(randomUUID(), 10);
  
  await db.insert(users).values({
    id: userId,
    email: normalizedEmail,
    passwordHash: dummyHash,
    emailVerified: true,
    authProvider: provider,
    authProviderId: providerId,
  });

  try {
    await db.insert(userCredits).values({
      userId,
      balance: WELCOME_BONUS_CREDITS,
      totalEarned: WELCOME_BONUS_CREDITS,
      totalSpent: 0,
    });

    await db.insert(creditTransactions).values({
      userId,
      amount: WELCOME_BONUS_CREDITS,
      type: "BONUS",
      reason: "WELCOME_BONUS",
      description: "Welcome bonus for new users",
      balanceAfter: WELCOME_BONUS_CREDITS,
    });

    console.log(`[Credits] Welcome bonus of ${WELCOME_BONUS_CREDITS} credits granted to OAuth user ${userId}`);
  } catch (creditsError) {
    console.error("Error granting welcome bonus:", creditsError);
  }

  try {
    const isConnected = await zohoService.isConnected();
    if (isConnected) {
      const emailParts = normalizedEmail.split("@")[0];
      const firstName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
      zohoService.inviteLearnerToAcademy(normalizedEmail, firstName, "Student").catch((tcErr) => {
        console.error("[TC Sync] Failed to register student on TrainerCentral:", tcErr.message);
      });
    }
  } catch (tcError) {
    console.error("[TC Sync] TrainerCentral registration check failed:", tcError);
  }

  return { id: userId, email: normalizedEmail, emailVerified: true, isNew: true };
}

// ============ GOOGLE OAUTH ============

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  
  const redirectUri = `${getBaseUrl()}/api/oauth/google/callback`;
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

function getBaseUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.BASE_URL || "http://localhost:5000";
}

oauthRouter.get("/google", (req: Request, res: Response) => {
  const client = getGoogleClient();
  if (!client) {
    return res.redirect("/login?error=google_not_configured");
  }

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });

  res.redirect(authUrl);
});

oauthRouter.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect("/login?error=no_code");
    }

    const client = getGoogleClient();
    if (!client) {
      return res.redirect("/login?error=google_not_configured");
    }

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect("/login?error=no_email");
    }

    const user = await findOrCreateOAuthUser(payload.email, "google", payload.sub!);
    await createSessionAndRespond(res, user, "/shishya/dashboard");
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect("/login?error=google_failed");
  }
});

// ============ MICROSOFT OAUTH ============

function getMicrosoftConfig() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const redirectUri = `${getBaseUrl()}/api/oauth/microsoft/callback`;
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";

  return { clientId, clientSecret, redirectUri, tenantId };
}

oauthRouter.get("/microsoft", (req: Request, res: Response) => {
  const config = getMicrosoftConfig();
  if (!config) {
    return res.redirect("/login?error=microsoft_not_configured");
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: "openid email profile User.Read",
    response_mode: "query",
    prompt: "select_account",
  });

  res.redirect(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params}`);
});

oauthRouter.get("/microsoft/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect("/login?error=no_code");
    }

    const config = getMicrosoftConfig();
    if (!config) {
      return res.redirect("/login?error=microsoft_not_configured");
    }

    const tokenResponse = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
        scope: "openid email profile User.Read",
      }),
    });

    const tokenData = await tokenResponse.json() as any;
    if (!tokenData.access_token) {
      console.error("Microsoft token error:", tokenData);
      return res.redirect("/login?error=microsoft_token_failed");
    }

    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json() as any;
    if (!userData.mail && !userData.userPrincipalName) {
      return res.redirect("/login?error=no_email");
    }

    const email = userData.mail || userData.userPrincipalName;
    const user = await findOrCreateOAuthUser(email, "microsoft", userData.id);
    await createSessionAndRespond(res, user, "/shishya/dashboard");
  } catch (error) {
    console.error("Microsoft OAuth error:", error);
    res.redirect("/login?error=microsoft_failed");
  }
});

// ============ ENTERPRISE SSO (SAML/OIDC) ============

oauthRouter.get("/sso", (req: Request, res: Response) => {
  const ssoUrl = process.env.SSO_LOGIN_URL;
  const ssoClientId = process.env.SSO_CLIENT_ID;
  
  if (!ssoUrl || !ssoClientId) {
    return res.redirect("/login?error=sso_not_configured");
  }

  const redirectUri = `${getBaseUrl()}/api/oauth/sso/callback`;
  const state = randomUUID();

  const params = new URLSearchParams({
    client_id: ssoClientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "openid email profile",
    state,
  });

  res.redirect(`${ssoUrl}?${params}`);
});

oauthRouter.get("/sso/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect("/login?error=no_code");
    }

    const ssoTokenUrl = process.env.SSO_TOKEN_URL;
    const ssoClientId = process.env.SSO_CLIENT_ID;
    const ssoClientSecret = process.env.SSO_CLIENT_SECRET;
    const ssoUserInfoUrl = process.env.SSO_USERINFO_URL;

    if (!ssoTokenUrl || !ssoClientId || !ssoClientSecret || !ssoUserInfoUrl) {
      return res.redirect("/login?error=sso_not_configured");
    }

    const redirectUri = `${getBaseUrl()}/api/oauth/sso/callback`;

    const tokenResponse = await fetch(ssoTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: ssoClientId,
        client_secret: ssoClientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json() as any;
    if (!tokenData.access_token) {
      console.error("SSO token error:", tokenData);
      return res.redirect("/login?error=sso_token_failed");
    }

    const userResponse = await fetch(ssoUserInfoUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json() as any;
    const email = userData.email || userData.preferred_username;
    if (!email) {
      return res.redirect("/login?error=no_email");
    }

    const user = await findOrCreateOAuthUser(email, "sso", userData.sub || userData.id);
    await createSessionAndRespond(res, user, "/shishya/dashboard");
  } catch (error) {
    console.error("SSO OAuth error:", error);
    res.redirect("/login?error=sso_failed");
  }
});
