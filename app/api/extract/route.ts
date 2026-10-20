import { NextResponse } from "next/server";
import { extractClaims } from "@/lib/claims/extractor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = String(body?.text || "").trim();
    const provider = process.env.CLAIM_LLM_PROVIDER || "openai";
    const result = await extractClaims(text, { provider });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
