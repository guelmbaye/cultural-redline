export default function AboutPage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Product boundary</div>
        <h1>Grammarly for<br /><span className="heroAccent">cultural assumptions.</span></h1>
        <p className="lead">
          CULTURAL REDLINE audits the strategy you already have. It does not ask an LLM whether a claim “sounds right.” The model parses language, Qloo supplies fixed-shortlist cultural evidence, and deterministic code computes the verdict.
        </p>
      </section>
      <section className="card composer" style={{ marginBottom: 70 }}>
        <div className="eyebrow">Epistemic contract</div>
        <h2>What the system will not claim</h2>
        <p className="lead" style={{ fontSize: 15 }}>
          Qloo affinity is not causality, guaranteed consumer behavior, revenue lift, or universal truth. When a claim exceeds the available evidence, CULTURAL REDLINE marks it NOT TESTABLE or REVIEW REQUIRED instead of inventing certainty.
        </p>
        <div className="claimPreview">
          <div className="claimPreviewRow"><span>LLM</span><strong>What exactly is this sentence claiming?</strong></div>
          <div className="claimPreviewRow"><span>Qloo</span><strong>What does the fixed cultural universe rank?</strong></div>
          <div className="claimPreviewRow"><span>Code</span><strong>Does that ranking support the claim?</strong></div>
          <div className="claimPreviewRow"><span>UI</span><strong>Show the answer directly on the sentence.</strong></div>
        </div>
      </section>
    </main>
  );
}
