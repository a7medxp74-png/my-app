import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_VISION_MODEL || "gpt-5.6-luna";

export async function verifyStudyProof(imageUrl: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY_MISSING");
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("PROOF_FETCH_FAILED");
  const contentType = response.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error("PROOF_NOT_IMAGE");
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > 8 * 1024 * 1024) throw new Error("PROOF_TOO_LARGE");
  const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;

  const result = await client.responses.create({
    model,
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: "You are Commit's study-proof verifier. Decide whether this photo is credible evidence that a person is actively studying. Accept only if the image clearly shows a study context such as a desk with study materials, textbook, notebook, laptop with educational content, or similar. Reject selfies, unrelated scenes, blank/ambiguous images, or obvious non-study content. Do not infer identity or private traits. Return ONLY JSON with keys accepted (boolean) and reason (string, max 160 chars)." },
        { type: "input_image", image_url: dataUrl, detail: "high" }
      ]
    }],
    text: { format: { type: "json_object" } }
  });
  const text = result.output_text?.trim() || "{}";
  const parsed = JSON.parse(text) as { accepted?: boolean; reason?: string };
  return { accepted: parsed.accepted === true, reason: (parsed.reason || (parsed.accepted ? "Study context verified." : "The image did not provide clear study evidence.")).slice(0, 160), model };
}
