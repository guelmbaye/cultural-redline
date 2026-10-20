"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AIRBNB_DEMO } from "@/lib/demo";
import type { ExtractionResult } from "@/lib/types";

const STORAGE_KEY = "cultural-redline:draft:v1";

export default function HomePage() {
  const router = useRouter();
  const [text, setText] = useState(AIRBNB_DEMO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Claim extraction failed.");
      const extraction = payload as ExtractionResult;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, extraction, savedAt: new Date().toISOString() }));
      router.push("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function loadValidatedDemo() {
    setText(AIRBNB_DEMO);
    setError(null);
    setDemoLoaded(true);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Evidence layer for cultural strategy</div>
        <h1>
          Paste the strategy.<br />
          <span className="heroAccent">Make every cultural assumption prove itself.</span>
        </h1>
        <p className="lead">
          CULTURAL REDLINE extracts cultural claims from an existing brief, compiles them into explicit Qloo tests,
          and marks each sentence as supported, contradicted, untestable, or requiring review.
        </p>
      </section>

      <section className="card composer">
        <div className="eyebrow">Strategy brief</div>
        <textarea
          aria-label="Strategy brief"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setDemoLoaded(false);
          }}
          placeholder="Paste a marketing, sponsorship, or partnership brief…"
        />
        <div className="actions">
          <button className="btn btnPrimary" onClick={analyze} disabled={loading || text.trim().length < 20}>
            {loading ? "Analyzing…" : "Analyze cultural claims"}
          </button>
          <button className="btn btnSecondary" onClick={loadValidatedDemo} disabled={loading}>
            {demoLoaded ? "Demo loaded ✓" : "Load validated demo"}
          </button>
          <span className="mini">LLM interprets language. Qloo supplies evidence. Code decides.</span>
        </div>
        {demoLoaded ? <div className="mini" style={{ marginTop: 10 }}>Validated Airbnb brief loaded locally — no network call is required.</div> : null}
        {error ? <div className="error">{error}</div> : null}
      </section>
    </main>
  );
}
