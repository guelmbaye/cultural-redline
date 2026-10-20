# CULTURAL REDLINE — Judge demo path

Live app: https://cultural-redline.vercel.app/

## 20-second product proof

1. Open the home page with the validated Airbnb brief.
2. Click **Analyze cultural claims**.
3. Point out the compiler output: `STRONGEST`, `PAIRWISE`, `PAIRWISE`, `WEAKEST`, `NOT TESTABLE`.
4. Click **Verify with Qloo**.
5. Show the fixed Qloo shortlist:
   - Sam Smith — #1
   - Lana Del Rey — #2
   - Harry Styles — #3
6. Open the Harry Styles claim: **claimed #1 → observed #3**.
7. Open the Sam Smith weakest claim: **claimed #3 → observed #1**.
8. End on: **The brief didn’t change. Its credibility did.**

## Sponsor Necessity proof

Enable **Qloo OFF ablation**.

Expected behavior:

- cultural claims remain detected;
- cultural verdicts become `VERIFICATION_UNAVAILABLE`;
- no Qloo ranking remains visible;
- no generic LLM fallback is used;
- business-outcome claims remain `NOT_TESTABLE`.

## Anti-cherry-picking proof

Open `/proof` and show:

- V1: 18 contradictions / 40 testable, 2 maximum reversals;
- blind V2: 23 contradictions / 40 testable, 6 maximum reversals;
- combined: 41 / 80 contradicted, 8 maximum reversals;
- Claim Compiler V3: 100% recall/kind/structure on 43 unseen claims;
- 0 hallucinated testable claims;
- 0 unsafe ambiguous compilations.

## One-sentence technical explanation

> The LLM only compiles what the sentence claims; Qloo ranks the exact fixed candidate universe; deterministic code decides whether the evidence supports the claim.

## One-sentence differentiation

> Recommendation starts with a blank page; CULTURAL REDLINE starts with the decision document your team already believes.
