# CULTURAL REDLINE

> **Paste the strategy. Make every cultural assumption prove itself.**

**CULTURAL REDLINE is an evidence redliner for cultural strategy.**

It does **not** start from a blank page and recommend what a team should write. It starts from the strategy the team has already written and asks:

> **Which cultural assumptions actually survive evidence?**

CULTURAL REDLINE extracts culturally testable claims from an existing marketing, sponsorship, or partnership brief, compiles them into explicit fixed-universe tests, asks Qloo for evidence, and puts the verdict back on the original sentence.

**Live app:** https://cultural-redline.vercel.app/  
**Public repository:** https://github.com/guelmbaye/cultural-redline  
**Validation evidence:** https://cultural-redline.vercel.app/proof

The core contract is deliberately strict:

> **The LLM interprets. Qloo evidences. Deterministic code decides. The document reveals.**

The language model never decides whether a cultural claim is true.

---

## Winning Moment

The validated Airbnb brief expects:

| Brief expected | Qloo evidence |
|---|---|
| 1. Harry Styles | 1. Sam Smith |
| 2. Lana Del Rey | 2. Lana Del Rey |
| 3. Sam Smith | 3. Harry Styles |

That produces two maximum ordinal reversals in the same document:

- **Harry Styles: claimed #1 → Qloo #3**
- **Sam Smith: claimed #3 → Qloo #1**

> **The strategy said #1. Qloo said #3.**

CULTURAL REDLINE marks the affected claims directly in the original brief as **CONTRADICTED — MAJOR REVERSAL**.

> **The brief didn't change. Its credibility did.**

---

## Judge Quick Start — Try the Winning Moment in under 30 seconds

1. Open **https://cultural-redline.vercel.app/**
2. Click **Load validated demo**.
3. Click **Analyze cultural claims**.
4. Review the compiled claim types:  
   **STRONGEST → PAIRWISE → PAIRWISE → WEAKEST → NOT TESTABLE**
5. Click **Verify with Qloo**.
6. Open the first **CONTRADICTED** claim.
7. Observe the **MAJOR REVERSAL — claimed #1 → Qloo #3**.
8. Scroll to the **Winning Moment** and inspect the full ranking flip.
9. Toggle **Qloo OFF ablation**.
10. Confirm that cultural verdicts become **VERIFICATION UNAVAILABLE** instead of falling back to generic LLM judgment.

For the validation evidence behind the demo, open:

**https://cultural-redline.vercel.app/proof**

---

## Why CULTURAL REDLINE is different

CULTURAL REDLINE is not primarily a copy-writing tool, a cultural reference replacement tool, or another recommendation engine.

Its starting point is an **external strategy or decision document that already exists**.

The product flow is:

```text
existing strategy
→ explicit cultural claims
→ falsifiable evidence tests
→ Qloo fixed-universe evidence
→ deterministic verdict
→ visible redline on the original sentence
```

The output is not:

> “Here is better copy.”

The output is:

- this claim is supported;
- this claim is contradicted;
- this claim exceeds the available evidence;
- this claim requires review.

The hero artifact remains the original decision document.

---

## Why Qloo is essential

CULTURAL REDLINE can identify that a sentence contains a cultural claim without Qloo, but it cannot verify that claim.

The app includes a **Qloo OFF ablation**. When enabled, testable cultural claims become:

```text
VERIFICATION_UNAVAILABLE
```

The system deliberately refuses to replace Qloo evidence with generic LLM judgment.

Without Qloo, the product loses its core verification capability.

Qloo is therefore part of the product's evidence boundary, not a decorative data source.

---

## How it works

```text
Existing strategy brief
        │
        ▼
Sentence-anchored Claim Compiler
        │
        ├─ strongest
        ├─ weakest
        ├─ pairwise
        ├─ not_testable
        └─ review_required
        │
        ▼
Exact Qloo entity resolution
        │
        ▼
Fixed candidate universe
        │
        ▼
Qloo /v2/insights
        │
        ▼
Deterministic verdict engine
        │
        ▼
SUPPORTED / CONTRADICTED / ABSTAIN
        │
        ▼
Verdict rendered on the original sentence
```

### Responsibility split

- **OpenAI Structured Outputs** interpret language and compile the claim into a restricted representation.
- **Qloo Search** resolves the entities named by the document.
- **Qloo Insights** evaluates the exact fixed shortlist asserted by the document.
- **Deterministic TypeScript** computes the verdict from the returned ranking.
- **The UI** redlines the source sentence and exposes an inspectable evidence receipt.

The LLM is never given authority to turn Qloo data into a cultural verdict.

---

## Claim types in the MVP

- `strongest` — X is strongest among an explicit fixed shortlist.
- `weakest` — X is weakest among an explicit fixed shortlist.
- `pairwise` — X is a stronger cultural fit than Y.
- `not_testable` — the claim exceeds what Qloo cultural affinity can establish.
- `review_required` — the claim is ambiguous or cannot be compiled safely.

A **major reversal** keeps the frozen benchmark definition:

- claimed strongest → actual last, or
- claimed weakest → actual first,

with a shortlist of at least three candidates.

---

## Evidence contract

Every Qloo-backed verdict can be traced to:

- the exact source sentence and character span;
- the signal entity and fixed candidate universe;
- exact Qloo entity resolutions;
- `/v2/insights` request parameters;
- the returned shortlist ranking;
- a SHA-256 hash of the raw Qloo response;
- the deterministic verdict rule;
- the verification timestamp.

If the fixed candidate universe cannot be resolved or returned completely, CULTURAL REDLINE abstains instead of silently changing the question.

---

## Validation

CULTURAL REDLINE was not built around a single attractive example.

The evidence mechanism and Claim Compiler were validated before the final product shell was locked.

### Cultural Evidence V1 — development / calibration corpus

- 40 testable claims
- 40 evidence-backed
- **18 contradictions**
- **2 maximum ordinal reversals**
- Qloo OFF ablation: **PASS**

### Blind Cultural Evidence V2 — independent holdout

- 40 testable claims
- 38 evidence-backed
- **23 contradictions**
- **6 maximum ordinal reversals**
- Qloo OFF ablation: **PASS**

### Blind Claim Compiler V3 — unseen extraction holdout

- 10 documents
- 43 gold claims
- **100% exact-source claim recall**
- **100% claim-kind accuracy**
- **100% testable-structure accuracy**
- **0 hallucinated testable claims**
- **0 unsafe ambiguous compilations**
- validated model: `gpt-4o-mini`

Combined cultural evidence:

- **41 / 80 testable claims contradicted**
- **8 maximum ordinal reversals** across V1 and V2

See [`evaluation/VALIDATION.md`](evaluation/VALIDATION.md) and the live [`/proof`](https://cultural-redline.vercel.app/proof) page.

---

## Product boundary

CULTURAL REDLINE is **not** a generic fact checker and does not claim that Qloo establishes:

- causality;
- guaranteed consumer behavior;
- revenue lift;
- universal truth.

A claim such as:

> “This partnership will increase sales by 15%.”

is therefore marked:

```text
NOT_TESTABLE
```

rather than converted into invented certainty.

This abstention behavior is part of the product, not an error state.

---

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- OpenAI Responses API + strict JSON Schema Structured Outputs
- Qloo `/search`
- Qloo `/v2/insights`
- SHA-256 evidence receipts
- Vercel deployment
- browser `localStorage` for the active hackathon review draft

No database is required for the current MVP.

---

## Run locally

Requires **Node.js 22+**.

```bash
npm install
cp .env.example .env.local
```

PowerShell equivalent:

```powershell
npm install
Copy-Item .env.example .env.local
```

Configure `.env.local`:

```dotenv
QLOO_BASE_URL=https://hackathon.api.qloo.com
QLOO_API_KEY=YOUR_QLOO_KEY

OPENAI_API_KEY=YOUR_OPENAI_KEY
CLAIM_LLM_PROVIDER=openai
CLAIM_LLM_MODEL=gpt-4o-mini
```

Then:

```bash
npm run check
npm run dev
```

Open:

```text
http://localhost:3000
```

> `gpt-4o-mini` remains the default because it is the exact model used for the frozen Blind Claim Compiler V3 result. If the model is changed, the V3 benchmark result should not be attributed to that new model without a new unseen holdout.

---

## Demo path

1. Open the live app.
2. Click **Load validated demo**.
3. Click **Analyze cultural claims**.
4. Confirm the compiler produces:
   `STRONGEST`, `PAIRWISE`, `PAIRWISE`, `WEAKEST`, `NOT TESTABLE`.
5. Click **Verify with Qloo**.
6. Inspect the two **MAJOR REVERSAL** claims and the fixed Qloo shortlist.
7. Enable **Qloo OFF ablation** and confirm cultural verification becomes unavailable rather than falling back to the LLM.
8. Open `/proof` for the V1/V2/V3 validation summary.

See [`docs/DEMO.md`](docs/DEMO.md) for the compact demo script.

---

## Routes

- `/` — paste a strategy brief and compile claims.
- `/review` — verify compiled claims with Qloo and inspect redlines/evidence receipts.
- `/proof` — frozen V1/V2/V3 validation summary.
- `/about` — product boundary and epistemic contract.
- `POST /api/extract` — sentence-anchored strict Claim Compiler.
- `POST /api/verify` — Qloo evidence orchestration + deterministic verdict engine.

---

## Security and secrets

API keys are server-side only.

Never expose them with `NEXT_PUBLIC_*` variables and never commit `.env.local`.

Before pushing a public commit, a useful sanity check is:

```bash
git grep -n -I -E "sk-proj-|OPENAI_API_KEY=sk-|QLOO_API_KEY=.+"
```

See [`SECURITY.md`](SECURITY.md).

---

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the trust boundary, fixed-universe invariant, context recovery rules, and deterministic verdict flow.

---

## License

MIT — see [`LICENSE`](LICENSE).
