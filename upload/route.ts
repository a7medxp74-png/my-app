import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireUser, apiError } from "@/lib/authz";

const MAX = 5 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    if (!allowed.has(file.type)) return NextResponse.json({ error: "UNSUPPORTED_IMAGE" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "IMAGE_TOO_LARGE" }, { status: 400 });
    const ext = file.type.split("/")[1] || "jpg";
    const blob = await put(`proofs/${user.id}/${crypto.randomUUID()}.${ext}`, file, { access: "public", addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch (e) { return apiError(e); }
}
