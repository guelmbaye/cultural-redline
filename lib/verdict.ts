import type { CompiledClaim, RankingItem, VerdictResult } from "./types";

export const Verdict = Object.freeze({
  SUPPORTED: "SUPPORTED",
  CONTRADICTED: "CONTRADICTED",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  NOT_TESTABLE: "NOT_TESTABLE",
  VERIFICATION_UNAVAILABLE: "VERIFICATION_UNAVAILABLE"
} as const);

export function verifyClaim(
  claim: CompiledClaim,
  ranking: RankingItem[],
  { qlooOff = false }: { qlooOff?: boolean } = {}
): VerdictResult {
  if (claim.kind === "not_testable") {
    return {
      claimId: claim.id,
      verdict: Verdict.NOT_TESTABLE,
      strongReversal: false,
      evidenceAvailable: false,
      reason: claim.reason || "This assertion is outside Qloo cultural affinity evidence."
    };
  }

  if (qlooOff) {
    return {
      claimId: claim.id,
      verdict: Verdict.VERIFICATION_UNAVAILABLE,
      strongReversal: false,
      evidenceAvailable: false,
      reason: "Qloo cultural evidence is unavailable; no LLM fallback is allowed."
    };
  }

  if (!Array.isArray(ranking) || ranking.length < 2) return insufficient(claim.id);

  const positions = new Map(ranking.map((x) => [x.name.toLocaleLowerCase(), x.rank]));
  const pos = (name?: string) => (name ? positions.get(name.toLocaleLowerCase()) : undefined);
  const p = pos(claim.claimed);

  if (claim.kind === "strongest") {
    if (p == null) return insufficient(claim.id);
    if (p === 1) return supported(claim.id, `${claim.claimed} ranks #1 in the fixed Qloo shortlist.`);
    return contradicted(
      claim.id,
      `${claim.claimed} ranks #${p}, not #1, in the fixed Qloo shortlist.`,
      p === ranking.length,
      1,
      p
    );
  }

  if (claim.kind === "weakest") {
    if (p == null) return insufficient(claim.id);
    if (p === ranking.length) {
      return supported(claim.id, `${claim.claimed} ranks last (#${p}) in the fixed Qloo shortlist.`);
    }
    return contradicted(
      claim.id,
      `${claim.claimed} ranks #${p}, not last, in the fixed Qloo shortlist.`,
      p === 1,
      ranking.length,
      p
    );
  }

  if (claim.kind === "pairwise") {
    const other = pos(claim.other);
    if (p == null || other == null) return insufficient(claim.id);
    if (p < other) {
      return supported(claim.id, `${claim.claimed} ranks ahead of ${claim.other} (#${p} vs #${other}).`);
    }
    return contradicted(
      claim.id,
      `${claim.other} ranks ahead of ${claim.claimed} (#${other} vs #${p}).`,
      false,
      p,
      other
    );
  }

  return insufficient(claim.id);
}

function supported(claimId: string, reason: string): VerdictResult {
  return {
    claimId,
    verdict: Verdict.SUPPORTED,
    strongReversal: false,
    evidenceAvailable: true,
    reason
  };
}

function contradicted(
  claimId: string,
  reason: string,
  strongReversal: boolean,
  claimedRank: number,
  observedRank: number
): VerdictResult {
  return {
    claimId,
    verdict: Verdict.CONTRADICTED,
    strongReversal,
    evidenceAvailable: true,
    reason,
    claimedRank,
    observedRank
  };
}

function insufficient(claimId: string): VerdictResult {
  return {
    claimId,
    verdict: Verdict.INSUFFICIENT_EVIDENCE,
    strongReversal: false,
    evidenceAvailable: false,
    reason: "Claim could not be mapped to the returned fixed shortlist."
  };
}
