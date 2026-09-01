import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  if (session.user.status === "DISABLED") throw new Error("ACCOUNT_DISABLED");
  return session.user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (user.role !== "OWNER" && user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "SERVER_ERROR";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" || message === "ACCOUNT_DISABLED" ? 403 : 400;
  return NextResponse.json({ error: message }, { status });
}
