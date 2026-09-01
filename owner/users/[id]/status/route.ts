import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){try{const actor=await requireOwner();const {id}=await params;const body=await req.json() as {status?:"ACTIVE"|"DISABLED"};if(body.status!=="ACTIVE"&&body.status!=="DISABLED")return NextResponse.json({error:"INVALID_STATUS"},{status:400});const user=await db.user.update({where:{id},data:{status:body.status}});await audit(actor.id,"UPDATE_USER_STATUS","USER",id,{status:body.status});return NextResponse.json(user);}catch(e){return apiError(e)}}
