"use client";

import type { EvidenceGroup, VerifiedClaim } from "@/lib/types";

function badgeClass(verdict: string) {
  return `badge badge-${verdict.toLowerCase()}`;
}

export function EvidenceDrawer({ claim, evidence }: { claim?: VerifiedClaim; evidence?: EvidenceGroup }) {
  if (!claim) {
    return (
      <aside className="card drawer">
        <div className="eyebrow">Evidence</div>
        <h2>Select a highlighted claim</h2>
        <p>The evidence receipt will appear here. The language model never decides the verdict.</p>
      </aside>
    );
  }

  return (
    <aside className="card drawer">
      <div className="eyebrow">{claim.id} · {claim.kind}</div>
      <div style={{ marginTop: 10 }}>
        <span className={badgeClass(claim.result.verdict)}>{claim.result.verdict.replaceAll("_", " ")}</span>
      </div>
      <h2>{claim.text}</h2>
      {claim.result.strongReversal ? (
        <div className="major">
          MAJOR REVERSAL · {claim.result.claimedRank} → {claim.result.observedRank}
        </div>
      ) : null}
      <p>{claim.result.reason}</p>

      {evidence?.ranking?.length ? (
        <>
          <div className="eyebrow" style={{ marginTop: 18 }}>Qloo fixed shortlist</div>
          <ol className="rankList">
            {evidence.ranking.map((item) => (
              <li key={item.entityId}><strong>{item.name}</strong> — #{item.rank}</li>
            ))}
          </ol>
          <div className="receipt">
            Evidence receipt · {evidence.source}<br />
            SHA-256 {evidence.responseHash}<br />
            Checked {new Date(evidence.checkedAt).toLocaleString()}
          </div>
        </>
      ) : null}
    </aside>
  );
}
