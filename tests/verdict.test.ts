import test from "node:test";
import assert from "node:assert/strict";
import { verifyClaim } from "../lib/verdict.ts";
import type { CompiledClaim, RankingItem } from "../lib/types.ts";

const ranking: RankingItem[] = [
  { entityId: "S", name: "Sam Smith", rank: 1, affinity: null },
  { entityId: "L", name: "Lana Del Rey", rank: 2, affinity: null },
  { entityId: "H", name: "Harry Styles", rank: 3, affinity: null }
];

function claim(kind: CompiledClaim["kind"], claimed?: string, other?: string): CompiledClaim {
  return { id: "C01", text: "x", spanStart: 0, spanEnd: 1, kind, claimed, other, reason: "causal" };
}

test("strongest to last is a major reversal", () => {
  const result = verifyClaim(claim("strongest", "Harry Styles"), ranking);
  assert.equal(result.verdict, "CONTRADICTED");
  assert.equal(result.strongReversal, true);
  assert.equal(result.claimedRank, 1);
  assert.equal(result.observedRank, 3);
});

test("weakest to first is a major reversal", () => {
  const result = verifyClaim(claim("weakest", "Sam Smith"), ranking);
  assert.equal(result.verdict, "CONTRADICTED");
  assert.equal(result.strongReversal, true);
});

test("pairwise reversal is contradicted but not strong", () => {
  const result = verifyClaim(claim("pairwise", "Harry Styles", "Lana Del Rey"), ranking);
  assert.equal(result.verdict, "CONTRADICTED");
  assert.equal(result.strongReversal, false);
});

test("not testable stays not testable even when Qloo is off", () => {
  const result = verifyClaim(claim("not_testable"), [], { qlooOff: true });
  assert.equal(result.verdict, "NOT_TESTABLE");
});

test("testable claim becomes unavailable when Qloo is off", () => {
  const result = verifyClaim(claim("strongest", "Harry Styles"), [], { qlooOff: true });
  assert.equal(result.verdict, "VERIFICATION_UNAVAILABLE");
});
