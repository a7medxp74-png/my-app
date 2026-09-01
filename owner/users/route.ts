import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET(req: Request) { try { await requireOwner(); const u = new URL(req.url); const q = u.searchParams.get("q")?.trim() || ""; const page = Math.max(1, Number(u.searchParams.get("page") || 1)); const take = 20; const where = q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}; const [items,total] = await Promise.all([db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*take, take, include: { _count: { select: { studySessions: true } } } }), db.user.count({ where })]); return NextResponse.json({ items, total, page, pages: Math.ceil(total/take) }); } catch(e){ return apiError(e); } }
