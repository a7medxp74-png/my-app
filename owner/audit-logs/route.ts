import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
export async function GET(){try{await requireOwner();return NextResponse.json(await db.auditLog.findMany({orderBy:{createdAt:"desc"},take:100,include:{actor:{select:{name:true,email:true}}}}))}catch(e){return apiError(e)}}
