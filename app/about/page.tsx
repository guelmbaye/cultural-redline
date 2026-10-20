import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Product boundary</div>
        <h1>
          Grammarly for<br />
          <span className="heroAccent">cultural assumptions.</span>
        </h1>
        <p className="lead">
          CULTURAL REDLINE audits the strategy you already have. It does not ask an LLM whether a claim
          “sounds right.” The model interprets language, Qloo supplies fixed-shortlist cultural evidence,
          and deterministic code computes the verdict.
        </p>
        <div className="actions">
          <Link href="/" className="btn btnPrimary">Try the live workflow</Link>
          <Link href="/proof" className="btn btnSecondary">See validation proof</Link>
        </div>
      </section>

      <section className="proofGrid" style={{ marginTop: 0 }}>
        <article className="card proofCard">
          <div className="eyebrow">Starts with</div>
          <div className="proofNumber" style={{ fontSize: 28 }}>Your existing brief</div>
          <div className="proofLabel">The product audits a decision artifact that already exists instead of generating another strategy.</div>
        </article>
        <article className="card proofCard">
          <div className="eyebrow">Qloo&apos;s role</div>
          <div className="proofNumber" style={{ fontSize: 28 }}>Cultural evidence</div>
          <div className="proofLabel">Qloo evaluates the exact fixed candidate universe asserted by the document.</div>
        </article>
        <article className="card proofCard">
          <div className="eyebrow">Decision rule</div>
          <div className="proofNumber" style={{ fontSize: 28 }}>Deterministic</div>
          <div className="proofLabel">The LLM never gets authority to declare a cultural claim supported or contradicted.</div>
        </article>
      </section>

      <section className="card composer" style={{ marginBottom: 22 }}>
        <div className="eyebrow">Why Qloo is essential</div>
        <h2>Remove Qloo and the verdict disappears.</h2>
        <p className="lead" style={{ fontSize: 15 }}>
          CULTURAL REDLINE can still detect that a sentence contains a cultural claim when Qloo is disabled,
          but it cannot verify that claim. The Qloo OFF ablation returns VERIFICATION UNAVAILABLE and deliberately
          refuses to substitute generic LLM judgment.
        </p>
      </section>

      <section className="card composer" style={{ marginBottom: 22 }}>
        <div className="eyebrow">Epistemic contract</div>
        <h2>What the system will not claim</h2>
        <p className="lead" style={{ fontSize: 15 }}>
          Qloo affinity is not causality, guaranteed consumer behavior, revenue lift, or universal truth. When a
          claim exceeds the available evidence, CULTURAL REDLINE marks it NOT TESTABLE or REVIEW REQUIRED instead
          of inventing certainty.
        </p>
        <div className="claimPreview">
          <div className="claimPreviewRow"><span>LLM</span><strong>What exactly is this sentence claiming?</strong></div>
          <div className="claimPreviewRow"><span>Qloo</span><strong>What does the fixed cultural universe rank?</strong></div>
          <div className="claimPreviewRow"><span>Code</span><strong>Does that ranking support the claim?</strong></div>
          <div className="claimPreviewRow"><span>UI</span><strong>Show the answer directly on the sentence.</strong></div>
        </div>
      </section>

      <section className="card composer" style={{ marginBottom: 70 }}>
        <div className="eyebrow">Open source</div>
        <h2>Inspect the implementation.</h2>
        <p className="lead" style={{ fontSize: 15 }}>
          The source code, architecture notes, validation summary, and local setup instructions are public under the MIT License.
        </p>
        <div className="actions">
          <a className="btn btnPrimary" href="https://github.com/guelmbaye/cultural-redline" target="_blank" rel="noreferrer">
            View GitHub repository
          </a>
          <a className="btn btnSecondary" href="https://cultural-redline.vercel.app/" target="_blank" rel="noreferrer">
            Open live app
          </a>
        </div>
      </section>
    </main>
  );
}
