import { NextResponse } from "next/server";
import { requireUser, apiError } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const session = await db.studySession.findFirst({ where: { id, userId: user.id }, include: { verification: true } });
    if (!session) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.ceil((new Date(session.expectedEndAt).getTime() - now) / 1000));
    return NextResponse.json({ ...session, remainingSeconds });
  } catch (e) { return apiError(e); }
}
