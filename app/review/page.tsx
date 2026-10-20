"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClaimPreview } from "@/components/ClaimPreview";
import { EvidenceDrawer } from "@/components/EvidenceDrawer";
import { RankingFlip } from "@/components/RankingFlip";
import { RedlinedDocument } from "@/components/RedlinedDocument";
import type { ExtractionResult, VerificationResult, VerifiedClaim } from "@/lib/types";

const STORAGE_KEY = "cultural-redline:draft:v1";

type Draft = { text: string; extraction: ExtractionResult; savedAt: string };

export default function ReviewPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [qlooOff, setQlooOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try { setDraft(JSON.parse(raw)); } catch { /* ignore corrupt browser state */ }
  }, []);

  async function verify() {
    if (!draft) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: draft.text, claims: draft.extraction.claims, qlooOff })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Verification failed.");
      const result = payload as VerificationResult;
      setVerification(result);
      const firstStrong = result.claims.find((claim) => claim.result.strongReversal);
      const firstContradiction = result.claims.find((claim) => claim.result.verdict === "CONTRADICTED");
      setSelectedId((firstStrong || firstContradiction || result.claims[0])?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (verification) void verify();
    // Intentionally re-run when ablation toggles after a completed verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qlooOff]);

  const selectedClaim: VerifiedClaim | undefined = useMemo(
    () => verification?.claims.find((claim) => claim.id === selectedId),
    [verification, selectedId]
  );
  const selectedEvidence = selectedClaim?.evidenceGroup
    ? verification?.evidenceGroups[selectedClaim.evidenceGroup]
    : undefined;
  const firstEvidence = verification ? Object.values(verification.evidenceGroups)[0] : undefined;

  if (!draft) {
    return (
      <main className="shell">
        <section className="hero">
          <div className="eyebrow">No active brief</div>
          <h1>Start with the strategy.</h1>
          <p className="lead">This review page keeps demo state in your browser. Analyze a brief first.</p>
          <Link className="btn btnPrimary" href="/">Paste a brief</Link>
        </section>
      </main>
    );
  }

  const metrics = verification?.metrics;

  return (
    <main className="shell">
      <section className="reviewHeader">
        <div className="eyebrow">Claim compiler → Qloo evidence → deterministic verdict</div>
        <h1>The brief didn’t change.<br /><span className="heroAccent">Its credibility did.</span></h1>
        <div className="toolbar">
          <button className="btn btnPrimary" onClick={verify} disabled={loading}>
            {loading ? "Verifying…" : "Verify with Qloo"}
          </button>
          <Link href="/" className="btn btnSecondary">Edit brief</Link>
          <label className="toggle">
            <input type="checkbox" checked={qlooOff} onChange={(event) => setQlooOff(event.target.checked)} />
            Qloo OFF ablation
          </label>
          {metrics ? (
            <span className="statusLine">
              {metrics.contradicted} contradicted · {metrics.strongReversals} major reversals · {metrics.notTestable} not testable · {metrics.reviewRequired} review required
            </span>
          ) : null}
        </div>
        {error ? <div className="error">{error}</div> : null}
      </section>

      {!verification ? (
        <section className="card composer" style={{ marginBottom: 70 }}>
          <div className="eyebrow">Compiled claims · {draft.extraction.provider}</div>
          <h2>{draft.extraction.claims.length} claims detected before evidence</h2>
          <ClaimPreview claims={draft.extraction.claims} />
        </section>
      ) : (
        <>
          <div className="reviewGrid">
            <section className="card documentCard">
              <div className="documentHead">
                <div>
                  <div className="eyebrow">Redlined document</div>
                  <div className="documentTitle">Strategy Brief</div>
                </div>
                <span className={`badge ${qlooOff ? "badge-verification_unavailable" : "badge-supported"}`}>
                  {qlooOff ? "Qloo off" : "Verified"}
                </span>
              </div>
              <RedlinedDocument
                text={verification.text}
                claims={verification.claims}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </section>
            <EvidenceDrawer claim={selectedClaim} evidence={selectedEvidence} />
          </div>
          {!qlooOff ? <RankingFlip claims={verification.claims} evidence={firstEvidence} /> : null}
        </>
      )}
    </main>
  );
}
