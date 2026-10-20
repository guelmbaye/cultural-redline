import { NextResponse } from "next/server";
import { verifyExtractedDocument } from "@/lib/evidence";
import type { CompiledClaim } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = String(body?.text || "");
    const claims = Array.isArray(body?.claims) ? (body.claims as CompiledClaim[]) : [];
    const qlooOff = Boolean(body?.qlooOff);
    const result = await verifyExtractedDocument({ text, claims, qlooOff });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
