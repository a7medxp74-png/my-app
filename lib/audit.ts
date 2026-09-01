import { db } from "@/lib/db";
export async function audit(actorId: string, action: string, entity: string, entityId?: string, metadata?: unknown) {
  await db.auditLog.create({ data: { actorId, action, entity, entityId, metadata: metadata as any } });
}
