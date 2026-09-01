import { NextResponse } from "next/server";
import { requireUser, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { startSessionSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = startSessionSchema.parse(await req.json());
    const settings = await getSettings();
    if (body.durationMinutes < settings.minSessionMinutes || body.durationMinutes > settings.maxSessionMinutes) return NextResponse.json({ error: "INVALID_DURATION" }, { status: 400 });
    const active = await db.studySession.findFirst({ where: { userId: user.id, status: { in: ["ACTIVE", "AWAITING_PROOF", "VERIFYING"] } } });
    if (active) return NextResponse.json({ error: "ACTIVE_SESSION_EXISTS", session: active }, { status: 409 });
    const startedAt = new Date();
    const expectedEndAt = new Date(startedAt.getTime() + body.durationMinutes * 60_000);
    const session = await db.studySession.create({ data: { userId: user.id, durationMinutes: body.durationMinutes, startedAt, expectedEndAt } });
    return NextResponse.json(session, { status: 201 });
  } catch (e) { return apiError(e); }
}
