import { NextResponse } from "next/server";
import { requireUser, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
import { verifySessionSchema } from "@/lib/validation";
import { verifyStudyProof } from "@/lib/ai";
import { canVerify } from "@/lib/rate-limit";
import { getSettings, rewards } from "@/lib/settings";

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = verifySessionSchema.parse(await req.json());
    const session = await db.studySession.findFirst({ where: { id, userId: user.id }, include: { verification: true } });
    if (!session) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (session.status !== "AWAITING_PROOF") return NextResponse.json({ error: "SESSION_NOT_READY" }, { status: 409 });
    if (!(await canVerify(user.id))) return NextResponse.json({ error: "VERIFICATION_RATE_LIMIT" }, { status: 429 });

    const verification = await db.aIVerification.create({ data: { sessionId: id, status: "PENDING" } });
    await db.studySession.update({ where: { id }, data: { proofUrl: body.proofUrl, status: "VERIFYING" } });
    try {
      const result = await verifyStudyProof(body.proofUrl);
      if (!result.accepted) {
        await db.$transaction([
          db.aIVerification.update({ where: { id: verification.id }, data: { status: "REJECTED", reason: result.reason, model: result.model, completedAt: new Date() } }),
          db.studySession.update({ where: { id }, data: { status: "REJECTED" } })
        ]);
        return NextResponse.json({ status: "REJECTED", reason: result.reason });
      }
      const settings = await getSettings();
      const reward = rewards(session.durationMinutes, settings);
      await db.$transaction([
        db.aIVerification.update({ where: { id: verification.id }, data: { status: "ACCEPTED", reason: result.reason, model: result.model, completedAt: new Date() } }),
        db.studySession.update({ where: { id }, data: { status: "ACCEPTED", pointsAwarded: reward.points, xpAwarded: reward.xp } }),
        db.user.update({ where: { id: user.id }, data: { points: { increment: reward.points }, xp: { increment: reward.xp } } })
      ]);
      return NextResponse.json({ status: "ACCEPTED", reason: result.reason, reward });
    } catch (error) {
      await db.$transaction([
        db.aIVerification.update({ where: { id: verification.id }, data: { status: "ERROR", error: error instanceof Error ? error.message.slice(0, 300) : "UNKNOWN", completedAt: new Date() } }),
        db.studySession.update({ where: { id }, data: { status: "AWAITING_PROOF" } })
      ]);
      return NextResponse.json({ error: "AI_VERIFICATION_ERROR" }, { status: 502 });
    }
  } catch (e) { return apiError(e); }
}
