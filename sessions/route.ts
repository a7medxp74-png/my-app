import { NextResponse } from "next/server";
import { requireUser, apiError } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const sessions = await db.studySession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50, include: { verification: true } });
    return NextResponse.json(sessions);
  } catch (e) { return apiError(e); }
}
