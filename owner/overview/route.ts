import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET() { try { await requireOwner(); const [users, active, sessions, successful, failed, pending, accepted, rejected, xp, points] = await Promise.all([
  db.user.count(), db.user.count({ where: { status: "ACTIVE" } }), db.studySession.count(), db.studySession.count({ where: { status: "ACCEPTED" } }), db.studySession.count({ where: { status: { in: ["FAILED", "REJECTED", "CANCELLED"] } } }), db.aIVerification.count({ where: { status: "PENDING" } }), db.aIVerification.count({ where: { status: "ACCEPTED" } }), db.aIVerification.count({ where: { status: "REJECTED" } }), db.user.aggregate({ _sum: { xp: true } }), db.user.aggregate({ _sum: { points: true } })
]); return NextResponse.json({ users, active, sessions, successful, failed, pending, accepted, rejected, xp: xp._sum.xp ?? 0, points: points._sum.points ?? 0 }); } catch(e){ return apiError(e); } }
