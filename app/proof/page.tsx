export default function ProofPage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Pre-registered validation</div>
        <h1>Not one cherry-picked demo.<br /><span className="heroAccent">Two independent evidence corpora.</span></h1>
        <p className="lead">
          CULTURAL REDLINE was built only after the evidence mechanism reproduced on a blind holdout and the claim compiler passed a separate unseen extraction benchmark.
        </p>
      </section>

      <section className="proofGrid">
        <article className="card proofCard">
          <div className="eyebrow">Evidence V1</div>
          <div className="proofNumber">18</div>
          <div className="proofLabel">contradictions across 40 testable claims · 2 maximum ordinal reversals</div>
        </article>
        <article className="card proofCard">
          <div className="eyebrow">Blind holdout V2</div>
          <div className="proofNumber">23</div>
          <div className="proofLabel">contradictions across 40 testable claims · 6 maximum ordinal reversals · 38/40 evidence-backed</div>
        </article>
        <article className="card proofCard">
          <div className="eyebrow">Claim compiler V3</div>
          <div className="proofNumber">100%</div>
          <div className="proofLabel">quote recall · claim-kind accuracy · testable-structure accuracy on 43 unseen claims</div>
        </article>
      </section>

      <table className="table">
        <thead><tr><th>Gate</th><th>Result</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td>Combined cultural evidence</td><td>41 / 80 contradicted</td><td>Contradictions are common enough to be a repeatable product behavior.</td></tr>
          <tr><td>Maximum ordinal reversals</td><td>8</td><td>Validated #1→last or last→#1 moments across two corpora.</td></tr>
          <tr><td>Qloo OFF ablation</td><td>PASS</td><td>Cultural verdicts disappear rather than falling back to generic LLM judgment.</td></tr>
          <tr><td>Blind extraction V3</td><td>PASS</td><td>43/43 quotes and kinds recovered; 30/30 testable structures compiled correctly.</td></tr>
          <tr><td>Hallucinated testable claims</td><td>0</td><td>The compiler did not manufacture evidence-testable assertions.</td></tr>
          <tr><td>Unsafe ambiguous compilation</td><td>0</td><td>Ambiguity was not silently converted into a cultural verdict.</td></tr>
        </tbody>
      </table>
    </main>
  );
}
