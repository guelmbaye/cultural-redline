# CULTURAL REDLINE — Final Next.js MVP

> **Paste the strategy. Make every cultural assumption prove itself.**

CULTURAL REDLINE is an external-document cultural redliner for the Qloo Agentic Hackathon. It extracts claims from an existing marketing or partnership brief, compiles those claims into explicit fixed-shortlist tests, asks Qloo for cultural evidence, and computes the final verdict with deterministic code.

The core contract is intentionally strict:

- **LLM:** interprets language and compiles the claim.
- **Qloo:** supplies cultural evidence.
- **Code:** decides `SUPPORTED`, `CONTRADICTED`, or abstains.
- **UI:** shows the verdict directly on the original sentence.

The language model never decides whether a cultural claim is true.

## Why this build exists

Three pre-build validation stages were completed before this Next.js product shell:

- Cultural Evidence V1: 18 contradictions / 40 testable claims, 2 strong reversals.
- Blind Cultural Evidence V2: 23 contradictions / 40 testable claims, 6 strong reversals, 38/40 evidence-backed.
- Blind Claim Compiler V3: 100% exact quote recall, 100% kind accuracy, 100% testable-structure accuracy, 0 hallucinated testable claims, 0 unsafe ambiguous compilations across 43 unseen gold claims.

See `evaluation/VALIDATION.md` and the `/proof` route.

## Stack

- Next.js 16.4 App Router
- React 19.3
- TypeScript
- OpenAI Responses API + strict JSON Schema Structured Outputs for claim compilation
- Qloo `/search` for exact entity resolution
- Qloo `/v2/insights` for fixed-shortlist evidence
- No database for the hackathon MVP: the active review draft is kept in browser `localStorage`

## Quick start

Requires Node.js 22+.

```powershell
npm install
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```dotenv
QLOO_BASE_URL=https://hackathon.api.qloo.com
QLOO_API_KEY=YOUR_QLOO_KEY

OPENAI_API_KEY=YOUR_OPENAI_KEY
CLAIM_LLM_PROVIDER=openai
CLAIM_LLM_MODEL=gpt-4o-mini
```

`gpt-4o-mini` is intentionally the default because it is the exact model that passed the frozen Blind Claim Compiler V3 benchmark. You can change the model later, but re-run an unseen compiler holdout before claiming the same validation result.

Then:

```powershell
npm run check
npm run dev
```

Open `http://localhost:3000`.

## Winning demo

The home page is preloaded with the validated Airbnb brief. The intended demo path is:

1. Click **Analyze cultural claims**.
2. Review the compiled claims.
3. Click **Verify with Qloo**.
4. The document redlines itself.
5. Click the Harry Styles claim and show the `#1 → #3` major reversal.
6. Click the Sam Smith weakest claim and show the opposite `#3 → #1` reversal.
7. Enable **Qloo OFF ablation** and show that cultural verdicts become `VERIFICATION_UNAVAILABLE` rather than falling back to LLM opinion.
8. Open `/proof` to show the blind evidence and extraction benchmarks.

The canonical line is:

> **The brief didn’t change. Its credibility did.**

## Routes

- `/` — paste a strategy brief and compile claims.
- `/review` — inspect compiled claims, verify them with Qloo, and view redlines/evidence receipts.
- `/proof` — frozen V1/V2/V3 validation summary.
- `/about` — epistemic boundary and product positioning.
- `POST /api/extract` — sentence-anchored strict claim compiler.
- `POST /api/verify` — Qloo evidence orchestration + deterministic verdict engine.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `QLOO_BASE_URL` | yes | Hackathon Qloo origin; default is `https://hackathon.api.qloo.com` |
| `QLOO_API_KEY` | yes | Server-side Qloo API key |
| `OPENAI_API_KEY` | yes for OpenAI compiler | Server-side OpenAI API key |
| `CLAIM_LLM_PROVIDER` | yes | `openai` for the validated production path; `heuristic` is only a zero-cost Airbnb smoke test |
| `CLAIM_LLM_MODEL` | yes for OpenAI | Validated run used `gpt-4o-mini` |

Never expose API keys to browser code. Both external APIs are called only from Next.js route handlers/server libraries.

## Evidence contract

Every Qloo-backed verdict can be traced to:

- the exact source sentence and character span;
- signal and fixed candidate universe;
- exact entity resolutions;
- `/v2/insights` request parameters;
- returned shortlist ranking;
- SHA-256 of the raw Qloo response;
- deterministic verdict rule;
- timestamp.

If a fixed candidate universe cannot be resolved or returned completely, the product abstains with `INSUFFICIENT_EVIDENCE`.

## Claim types in MVP

- `strongest` — X is strongest among an explicit fixed shortlist.
- `weakest` — X is weakest among an explicit fixed shortlist.
- `pairwise` — X is a better cultural fit than Y.
- `not_testable` — causal/business assertion Qloo affinity cannot establish.
- `review_required` — cultural claim is ambiguous or cannot be compiled safely.

A strong reversal remains the pre-registered benchmark definition:

- claimed strongest → actual last, or
- claimed weakest → actual first,

with a shortlist of at least three candidates.

## Product boundary

CULTURAL REDLINE is not a generic fact checker and does not claim that Qloo establishes universal truth, causality, revenue lift, or guaranteed behavior. The UI should be understood as “contradicted by this Qloo evidence test,” not “objectively false.”

## Deployment

The app is a standard Next.js App Router project and can be deployed to Vercel or another Node-compatible Next.js host. Add the same environment variables in the deployment environment. Because the current hackathon MVP stores the active document in browser `localStorage`, no database is required for the demo.

## Next implementation steps after the vertical product passes

Do not broaden the product before the core demo is stable. The sensible order is:

1. run the Airbnb end-to-end flow on this Next.js build;
2. test 5–10 arbitrary briefs manually;
3. polish the 12-second and 20-second demo transitions;
4. add lightweight `.txt`/Markdown upload only if useful;
5. prepare Devpost submission, architecture diagram, demo script, and judge Q&A.
