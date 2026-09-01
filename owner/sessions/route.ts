import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
export async function GET(req:Request){try{await requireOwner();const u=new URL(req.url);const page=Math.max(1,Number(u.searchParams.get("page")||1));const take=25;const [items,total]=await Promise.all([db.studySession.findMany({orderBy:{createdAt:"desc"},skip:(page-1)*take,take,include:{user:{select:{id:true,name:true,email:true,image:true}},verification:true}}),db.studySession.count()]);return NextResponse.json({items,total,page,pages:Math.ceil(total/take)});}catch(e){return apiError(e)}}
