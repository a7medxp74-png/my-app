import { NextResponse } from "next/server";
import { requireUser, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings, calculateLevel } from "@/lib/settings";

export async function GET() {
  try {
    const user = await requireUser();
    const settings = await getSettings();
    const me = await db.user.findUnique({ where: { id: user.id }, include: { _count: { select: { studySessions: true } } } });
    if (!me) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    const successful = await db.studySession.count({ where: { userId: me.id, status: "ACCEPTED" } });
    return NextResponse.json({ user: me, level: calculateLevel(me.xp, settings), stats: { sessions: me._count.studySessions, successful } });
  } catch (e) { return apiError(e); }
}
