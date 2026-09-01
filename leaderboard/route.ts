import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings, calculateLevel } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  const users = await db.user.findMany({ where: { status: "ACTIVE" }, orderBy: [{ xp: "desc" }, { points: "desc" }, { createdAt: "asc" }], take: 100, select: { id: true, name: true, image: true, xp: true, points: true } });
  return NextResponse.json(users.map((u, i) => ({ ...u, rank: i + 1, level: calculateLevel(u.xp, settings).level })));
}
