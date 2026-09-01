import { db } from "@/lib/db";

export async function canVerify(userId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await db.aIVerification.count({ where: { session: { userId }, createdAt: { gte: since } } });
  return count < 20;
}
