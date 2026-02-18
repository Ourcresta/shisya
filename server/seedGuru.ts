import { db } from "./db";
import { guruAdminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function seedGuruAdmin() {
  try {
    const existing = await db
      .select()
      .from(guruAdminUsers)
      .where(eq(guruAdminUsers.email, "admin@ourshiksha.com"))
      .limit(1);

    if (existing.length > 0) {
      console.log("[Guru] Admin user already exists, skipping seed");
      return;
    }

    const passwordHash = await bcrypt.hash("guru@123", SALT_ROUNDS);

    await db.insert(guruAdminUsers).values({
      email: "admin@ourshiksha.com",
      passwordHash,
      name: "OurShiksha Admin",
      role: "admin",
      isActive: true,
    });

    console.log("[Guru] Seeded admin user: admin@ourshiksha.com");
  } catch (error) {
    console.error("[Guru] Failed to seed admin user:", error);
  }
}
