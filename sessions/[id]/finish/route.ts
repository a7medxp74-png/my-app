import { NextResponse } from "next/server";
import { requireUser, apiError } from "@/lib/authz";
import { db } from "@/lib/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const session = await db.studySession.findFirst({ where: { id, userId: user.id } });
    if (!session) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (session.status !== "ACTIVE") return NextResponse.json(session);
    const now = new Date();
    if (now.getTime() < new Date(session.expectedEndAt).getTime()) {
      const failed = await db.studySession.update({ where: { id }, data: { status: "FAILED", endedAt: now } });
      return NextResponse.json({ ...failed, early: true }, { status: 409 });
    }
    const updated = await db.studySession.update({ where: { id }, data: { status: "AWAITING_PROOF", endedAt: now } });
    return NextResponse.json(updated);
  } catch (e) { return apiError(e); }
}
