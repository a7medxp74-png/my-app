import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
export async function GET(req:Request){try{await requireOwner();const u=new URL(req.url);const page=Math.max(1,Number(u.searchParams.get("page")||1));const take=25;const [items,total]=await Promise.all([db.aIVerification.findMany({orderBy:{createdAt:"desc"},skip:(page-1)*take,take,include:{session:{include:{user:{select:{name:true,email:true,image:true}}}}}}),db.aIVerification.count()]);return NextResponse.json({items,total,page,pages:Math.ceil(total/take)});}catch(e){return apiError(e)}}
