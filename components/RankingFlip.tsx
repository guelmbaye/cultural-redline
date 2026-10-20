import type { EvidenceGroup, VerifiedClaim } from "@/lib/types";

export function RankingFlip({ claims, evidence }: { claims: VerifiedClaim[]; evidence?: EvidenceGroup }) {
  if (!evidence?.ranking?.length) return null;

  const strongest = claims.find((c) => c.kind === "strongest" && c.candidateUniverse?.length);
  if (!strongest?.candidateUniverse?.length) return null;

  const expected = [...strongest.candidateUniverse];
  const strongestName = strongest.claimed;
  if (strongestName) {
    expected.sort((a, b) => (a === strongestName ? -1 : b === strongestName ? 1 : 0));
  }

  const weakest = claims.find((c) => c.kind === "weakest" && c.claimed);
  if (weakest?.claimed) {
    expected.sort((a, b) => (a === weakest.claimed ? 1 : b === weakest.claimed ? -1 : 0));
  }

  return (
    <section className="card winning">
      <div className="eyebrow">Winning moment</div>
      <h2>The ranking flipped end-to-end.</h2>
      <div className="flipGrid">
        <div className="flipBox">
          <div className="eyebrow">The brief expected</div>
          <ol>{expected.map((name) => <li key={name}><strong>{name}</strong></li>)}</ol>
        </div>
        <div className="flipArrow">⇄</div>
        <div className="flipBox">
          <div className="eyebrow">Qloo evidence</div>
          <ol>{evidence.ranking.map((item) => <li key={item.entityId}><strong>{item.name}</strong></li>)}</ol>
        </div>
      </div>
      <p style={{ marginBottom: 0, marginTop: 18 }}><strong>The brief didn’t change. Its credibility did.</strong></p>
    </section>
  );
}
