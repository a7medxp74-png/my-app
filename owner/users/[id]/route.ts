import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";

export async function GET(_: Request,{params}:{params:Promise<{id:string}>}){try{await requireOwner();const {id}=await params;const user=await db.user.findUnique({where:{id},include:{_count:{select:{studySessions:true}},studySessions:{orderBy:{createdAt:"desc"},take:20,include:{verification:true}}}});if(!user)return NextResponse.json({error:"NOT_FOUND"},{status:404});return NextResponse.json(user);}catch(e){return apiError(e)}}
