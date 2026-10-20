"use client";

import type { ReactNode } from "react";
import type { VerifiedClaim } from "@/lib/types";

export function RedlinedDocument({
  text,
  claims,
  selectedId,
  onSelect
}: {
  text: string;
  claims: VerifiedClaim[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const anchored = [...claims]
    .filter((c) => c.spanStart >= 0 && c.spanEnd > c.spanStart)
    .sort((a, b) => a.spanStart - b.spanStart);

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const claim of anchored) {
    if (claim.spanStart < cursor) continue;
    if (claim.spanStart > cursor) parts.push(text.slice(cursor, claim.spanStart));
    const verdict = claim.result.verdict;
    parts.push(
      <button
        type="button"
        key={claim.id}
        className={`redline redline-${verdict}`}
        onClick={() => onSelect(claim.id)}
        aria-pressed={selectedId === claim.id}
        title={`${verdict}: ${claim.result.reason}`}
        style={{ border: selectedId === claim.id ? "1px solid currentColor" : "1px solid transparent" }}
      >
        {text.slice(claim.spanStart, claim.spanEnd)}
      </button>
    );
    cursor = claim.spanEnd;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));

  return <div className="docBody">{parts}</div>;
}
