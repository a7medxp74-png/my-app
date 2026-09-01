import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
export async function GET(){try{await requireOwner();return NextResponse.json(await db.user.findMany({where:{status:"ACTIVE"},orderBy:[{xp:"desc"},{points:"desc"}],take:100,select:{id:true,name:true,email:true,image:true,xp:true,points:true,role:true}}))}catch(e){return apiError(e)}}
