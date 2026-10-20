import "server-only";

import { fetchFixedShortlist } from "./qloo/client";
import { searchQlooEntity } from "./qloo/resolver";
import { verifyClaim, Verdict } from "./verdict";
import type {
  CompiledClaim,
  VerificationResult,
  VerdictResult
} from "./types";

function publicClaim(claim: CompiledClaim): CompiledClaim {
  return {
    id: claim.id,
    text: claim.text,
    spanStart: claim.spanStart,
    spanEnd: claim.spanEnd,
    kind: claim.kind,
    ...(claim.signal ? { signal: claim.signal } : {}),
    ...(claim.candidateType ? { candidateType: claim.candidateType } : {}),
    ...(claim.candidateUniverse ? { candidateUniverse: claim.candidateUniverse } : {}),
    ...(claim.claimed ? { claimed: claim.claimed } : {}),
    ...(claim.other ? { other: claim.other } : {}),
    ...(claim.contextId ? { contextId: claim.contextId } : {}),
    ...(claim.reason ? { reason: claim.reason } : {})
  };
}

function testable(claim: CompiledClaim) {
  return ["strongest", "weakest", "pairwise"].includes(claim.kind);
}

export function evidenceGroupKey(claim: CompiledClaim) {
  const universe = [...(claim.candidateUniverse || [])].map((x) => x.toLocaleLowerCase()).sort();
  return JSON.stringify([
    claim.signal?.name.toLocaleLowerCase(),
    claim.signal?.type,
    claim.candidateType,
    universe
  ]);
}

function metrics(results: VerdictResult[]) {
  const count = (v: VerdictResult["verdict"]) => results.filter((x) => x.verdict === v).length;
  return {
    totalClaims: results.length,
    supported: count("SUPPORTED"),
    contradicted: count("CONTRADICTED"),
    notTestable: count("NOT_TESTABLE"),
    unavailable: count("VERIFICATION_UNAVAILABLE"),
    insufficient: count("INSUFFICIENT_EVIDENCE"),
    reviewRequired: count("REVIEW_REQUIRED"),
    strongReversals: results.filter((x) => x.strongReversal).length
  };
}

export async function verifyExtractedDocument({
  text,
  claims,
  qlooOff = false
}: {
  text: string;
  claims: CompiledClaim[];
  qlooOff?: boolean;
}): Promise<VerificationResult> {
  const baseUrl = process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com";
  const apiKey = process.env.QLOO_API_KEY;
  const safeClaims = Array.isArray(claims) ? claims.map(publicClaim) : [];
  const resultsById = new Map<string, VerdictResult>();
  const evidenceByGroup = new Map<string, VerificationResult["evidenceGroups"][string]>();

  for (const claim of safeClaims) {
    if (claim.kind === "not_testable") {
      resultsById.set(claim.id, verifyClaim(claim, [], { qlooOff }));
    } else if (claim.kind === "review_required") {
      resultsById.set(claim.id, {
        claimId: claim.id,
        verdict: "REVIEW_REQUIRED",
        strongReversal: false,
        evidenceAvailable: false,
        reason: claim.reason || "The claim needs human review before cultural verification."
      });
    } else if (qlooOff && testable(claim)) {
      resultsById.set(claim.id, verifyClaim(claim, [], { qlooOff: true }));
    }
  }

  if (!qlooOff) {
    const groups = new Map<string, CompiledClaim[]>();
    for (const claim of safeClaims.filter(testable)) {
      const key = evidenceGroupKey(claim);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(claim);
    }

    for (const [key, groupedClaims] of groups) {
      const representative = groupedClaims[0];
      try {
        if (!representative.signal || !representative.candidateType || !representative.candidateUniverse) {
          throw new Error("INCOMPLETE_COMPILED_CLAIM");
        }

        const anchor = await searchQlooEntity({
          baseUrl,
          apiKey,
          name: representative.signal.name,
          entityType: representative.signal.type
        });

        const resolvedCandidates = [];
        for (const name of representative.candidateUniverse) {
          resolvedCandidates.push(
            await searchQlooEntity({
              baseUrl,
              apiKey,
              name,
              entityType: representative.candidateType
            })
          );
        }

        if (resolvedCandidates.length !== representative.candidateUniverse.length) {
          throw new Error("SHORTLIST_INCOMPLETE");
        }

        const evidence = await fetchFixedShortlist({
          baseUrl,
          apiKey,
          anchorId: anchor.entityId,
          candidateType: representative.candidateType,
          candidateIds: resolvedCandidates.map((x: { entityId: string }) => x.entityId)
        });

        const canonicalNames = new Map(
          resolvedCandidates.map((x: { entityId: string; name: string }) => [x.entityId.toUpperCase(), x.name])
        );
        const ranking = evidence.ranking.map((x: { entityId: string; name: string; rank: number; affinity: number | null }) => ({
          ...x,
          name: canonicalNames.get(x.entityId.toUpperCase()) || x.name
        }));

        evidenceByGroup.set(key, {
          source: "Qloo /v2/insights",
          responseHash: evidence.responseHash,
          request: evidence.request,
          checkedAt: new Date().toISOString(),
          signal: {
            requested: representative.signal.name,
            canonicalName: anchor.name,
            entityId: anchor.entityId
          },
          ranking
        });

        for (const claim of groupedClaims) {
          resultsById.set(claim.id, verifyClaim(claim, ranking));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        for (const claim of groupedClaims) {
          resultsById.set(claim.id, {
            claimId: claim.id,
            verdict: Verdict.INSUFFICIENT_EVIDENCE,
            strongReversal: false,
            evidenceAvailable: false,
            reason: `Evidence test could not be completed safely: ${message}`
          });
        }
      }
    }
  }

  const outputClaims = safeClaims.map((claim) => ({
    ...claim,
    result:
      resultsById.get(claim.id) ||
      ({
        claimId: claim.id,
        verdict: Verdict.INSUFFICIENT_EVIDENCE,
        strongReversal: false,
        evidenceAvailable: false,
        reason: "No deterministic verdict was produced."
      } as VerdictResult),
    evidenceGroup: testable(claim) ? evidenceGroupKey(claim) : null
  }));

  return {
    text,
    qlooOff,
    claims: outputClaims,
    evidenceGroups: Object.fromEntries(evidenceByGroup),
    metrics: metrics(outputClaims.map((x) => x.result))
  };
}
