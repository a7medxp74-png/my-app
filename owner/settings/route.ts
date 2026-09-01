import { NextResponse } from "next/server";
import { requireOwner, apiError } from "@/lib/authz";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ownerSettingsSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
export async function GET(){try{await requireOwner();return NextResponse.json(await getSettings())}catch(e){return apiError(e)}}
export async function PUT(req:Request){try{const actor=await requireOwner();const data=ownerSettingsSchema.parse(await req.json());if(data.minSessionMinutes>data.maxSessionMinutes)return NextResponse.json({error:"MIN_GREATER_THAN_MAX"},{status:400});await db.$transaction(Object.entries(data).map(([key,value])=>db.appSetting.upsert({where:{key},update:{value},create:{key,value}})));await audit(actor.id,"UPDATE_SETTINGS","APP_SETTINGS",undefined,data);return NextResponse.json(data)}catch(e){return apiError(e)}}
