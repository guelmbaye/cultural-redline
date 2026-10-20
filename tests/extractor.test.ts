import test from "node:test";
import assert from "node:assert/strict";
import { normalizeExtraction, segmentSentences } from "../lib/claims/extractor.ts";

const text = "GoPro is considering Maggie Rogers, Khruangbin and Leon Bridges. Khruangbin is the strongest cultural fit within this pool. Maggie Rogers is a stronger cultural fit for GoPro than Leon Bridges. Leon Bridges is the weakest cultural option among the finalists.";

test("sentence segmentation preserves exact source spans", () => {
  const sentences = segmentSentences(text);
  assert.equal(sentences.length, 4);
  for (const sentence of sentences) {
    assert.equal(text.slice(sentence.start, sentence.end), sentence.text);
  }
});

test("composite shortlist candidates can be repaired deterministically", () => {
  const result = normalizeExtraction({
    contexts: [{
      id: "CTX1",
      sentenceId: "S01",
      signal: { name: "GoPro", type: "urn:entity:brand" },
      candidateType: "urn:entity:artist",
      candidates: ["Maggie Rogers", "Khruangbin and Leon Bridges"]
    }],
    claims: [
      { sentenceId: "S02", kind: "strongest", contextId: "CTX1", claimed: "Khruangbin", other: null, reason: null },
      { sentenceId: "S03", kind: "pairwise", contextId: "CTX1", claimed: "Maggie Rogers", other: "Leon Bridges", reason: null },
      { sentenceId: "S04", kind: "weakest", contextId: "CTX1", claimed: "Leon Bridges", other: null, reason: null }
    ]
  }, text);

  assert.deepEqual(result.claims.map((x: any) => x.kind), ["strongest", "pairwise", "weakest"]);
  assert.deepEqual(result.claims[0].candidateUniverse, ["Maggie Rogers", "Khruangbin", "Leon Bridges"]);
});

test("invalid LLM context can fall back to a uniquely anchored explicit shortlist", () => {
  const airbnb = `Airbnb should prioritize Harry Styles for the campaign.\n\nAmong Harry Styles, Lana Del Rey and Sam Smith, Harry Styles is the strongest cultural fit for Airbnb.\n\nHarry Styles is a stronger cultural fit for Airbnb than Lana Del Rey.\n\nLana Del Rey is a stronger cultural fit for Airbnb than Sam Smith.\n\nSam Smith should remain the weakest cultural fallback in this shortlist.\n\nWe expect this partnership strategy to increase Airbnb campaign sales by at least 15%.`;

  const result = normalizeExtraction({
    contexts: [{
      id: "CTX1",
      // Simulate a plausible model mistake: it binds the comparison context
      // to the setup sentence instead of the explicit shortlist sentence.
      sentenceId: "S01",
      signal: { name: "Airbnb", type: "urn:entity:brand" },
      candidateType: "urn:entity:artist",
      candidates: ["Harry Styles", "Lana Del Rey", "Sam Smith"]
    }],
    claims: [
      { sentenceId: "S02", kind: "strongest", contextId: "CTX1", claimed: "Harry Styles", other: null, reason: null },
      { sentenceId: "S03", kind: "pairwise", contextId: "CTX1", claimed: "Harry Styles", other: "Lana Del Rey", reason: null },
      { sentenceId: "S04", kind: "pairwise", contextId: "CTX1", claimed: "Lana Del Rey", other: "Sam Smith", reason: null },
      { sentenceId: "S05", kind: "weakest", contextId: "CTX1", claimed: "Sam Smith", other: null, reason: null },
      { sentenceId: "S06", kind: "not_testable", contextId: null, claimed: null, other: null, reason: "Causal lift is outside Qloo evidence." }
    ]
  }, airbnb);

  assert.deepEqual(result.claims.map((x: any) => x.kind), ["strongest", "pairwise", "pairwise", "weakest", "not_testable"]);
  for (const claim of result.claims.slice(0, 4) as any[]) {
    assert.equal(claim.signal.name, "Airbnb");
    assert.deepEqual(claim.candidateUniverse, ["Harry Styles", "Lana Del Rey", "Sam Smith"]);
  }
});


test("underspecified but valid LLM contexts recover to the unique explicit shortlist", () => {
  const airbnb = `Airbnb should prioritize Harry Styles for the campaign.

Among Harry Styles, Lana Del Rey and Sam Smith, Harry Styles is the strongest cultural fit for Airbnb.

Harry Styles is a stronger cultural fit for Airbnb than Lana Del Rey.

Lana Del Rey is a stronger cultural fit for Airbnb than Sam Smith.

Sam Smith should remain the weakest cultural fallback in this shortlist.

We expect this partnership strategy to increase Airbnb campaign sales by at least 15%.`;

  const result = normalizeExtraction({
    contexts: [
      { id: "CTX_STRONG", sentenceId: "S02", signal: { name: "Airbnb", type: "urn:entity:brand" }, candidateType: "urn:entity:artist", candidates: ["Harry Styles"] },
      { id: "CTX_PAIR_1", sentenceId: "S03", signal: { name: "Airbnb", type: "urn:entity:brand" }, candidateType: "urn:entity:artist", candidates: ["Harry Styles", "Lana Del Rey"] },
      { id: "CTX_PAIR_2", sentenceId: "S04", signal: { name: "Airbnb", type: "urn:entity:brand" }, candidateType: "urn:entity:artist", candidates: ["Lana Del Rey", "Sam Smith"] },
      { id: "CTX_WEAK", sentenceId: "S05", signal: { name: "Airbnb", type: "urn:entity:brand" }, candidateType: "urn:entity:artist", candidates: ["Sam Smith"] }
    ],
    claims: [
      { sentenceId: "S02", kind: "strongest", contextId: "CTX_STRONG", claimed: "Harry Styles", other: null, reason: null },
      { sentenceId: "S03", kind: "pairwise", contextId: "CTX_PAIR_1", claimed: "Harry Styles", other: "Lana Del Rey", reason: null },
      { sentenceId: "S04", kind: "pairwise", contextId: "CTX_PAIR_2", claimed: "Lana Del Rey", other: "Sam Smith", reason: null },
      { sentenceId: "S05", kind: "weakest", contextId: "CTX_WEAK", claimed: "Sam Smith", other: null, reason: null },
      { sentenceId: "S06", kind: "not_testable", contextId: null, claimed: null, other: null, reason: "Causal lift is outside Qloo evidence." }
    ]
  }, airbnb);

  assert.deepEqual(result.claims.map((x: any) => x.kind), ["strongest", "pairwise", "pairwise", "weakest", "not_testable"]);
  assert.deepEqual((result.claims[0] as any).candidateUniverse, ["Harry Styles", "Lana Del Rey", "Sam Smith"]);
  assert.deepEqual((result.claims[3] as any).candidateUniverse, ["Harry Styles", "Lana Del Rey", "Sam Smith"]);
});


test("explicit strongest sentence repairs a malformed model claimed field from source text", () => {
  const airbnb = `Airbnb should prioritize Harry Styles for the campaign.

Among Harry Styles, Lana Del Rey and Sam Smith, Harry Styles is the strongest cultural fit for Airbnb.

Harry Styles is a stronger cultural fit for Airbnb than Lana Del Rey.

Lana Del Rey is a stronger cultural fit for Airbnb than Sam Smith.

Sam Smith should remain the weakest cultural fallback in this shortlist.

We expect this partnership strategy to increase Airbnb campaign sales by at least 15%.`;

  const result = normalizeExtraction({
    contexts: [
      { id: "CTX1", sentenceId: "S02", signal: { name: "Airbnb", type: "urn:entity:brand" }, candidateType: "urn:entity:artist", candidates: ["Harry Styles", "Lana Del Rey", "Sam Smith"] }
    ],
    claims: [
      {
        sentenceId: "S02",
        kind: "strongest",
        contextId: "CTX1",
        // Simulate a real small-model failure: the field contains the predicate
        // rather than only the compared entity name.
        claimed: "Harry Styles is the strongest cultural fit for Airbnb",
        other: null,
        reason: null
      }
    ]
  }, airbnb);

  assert.equal(result.claims[0].kind, "strongest");
  assert.equal((result.claims[0] as any).claimed, "Harry Styles");
  assert.deepEqual((result.claims[0] as any).candidateUniverse, ["Harry Styles", "Lana Del Rey", "Sam Smith"]);
});


test("source-authored strongest context wins over a syntactically valid but wrong LLM context", () => {
  const airbnb = `Airbnb should prioritize Harry Styles for the campaign.

Among Harry Styles, Lana Del Rey and Sam Smith, Harry Styles is the strongest cultural fit for Airbnb.

Harry Styles is a stronger cultural fit for Airbnb than Lana Del Rey.`;

  const result = normalizeExtraction({
    contexts: [
      {
        id: "CTX_WRONG_BUT_ANCHORED",
        sentenceId: "S02",
        signal: { name: "Airbnb", type: "urn:entity:brand" },
        candidateType: "urn:entity:artist",
        // All three strings are literally present in S02, so this context is
        // syntactically anchored but semantically not the source shortlist.
        candidates: ["Harry Styles", "Lana Del Rey", "Airbnb"]
      }
    ],
    claims: [
      {
        sentenceId: "S02",
        kind: "strongest",
        contextId: "CTX_WRONG_BUT_ANCHORED",
        claimed: "Harry Styles",
        other: null,
        reason: null
      }
    ]
  }, airbnb);

  assert.equal(result.claims[0].kind, "strongest");
  assert.deepEqual((result.claims[0] as any).candidateUniverse, ["Harry Styles", "Lana Del Rey", "Sam Smith"]);
  assert.equal((result.claims[0] as any).signal.name, "Airbnb");
  assert.equal((result.claims[0] as any).contextId, "DERIVED_S02");
});
