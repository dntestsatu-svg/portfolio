import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import type { AdminSession } from "@/lib/auth/session";
import type { LoginInput } from "@/lib/validators";

export async function authenticateAdmin(input: LoginInput): Promise<AdminSession | null> {
  const db = getDb();

  if (db) {
    const user = await db.adminUser.findUnique({
      where: { email: input.email },
    });

    if (user && (await bcrypt.compare(input.password, user.passwordHash))) {
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    }
  }

  return null;
}
