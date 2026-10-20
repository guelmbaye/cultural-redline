# CULTURAL REDLINE — Validation record

The benchmark figures below are frozen product-development evidence. They should not be silently altered to make the demo look stronger.

## Methodological boundary

The evaluation was split into separate stages so that product claims were not based on one cherry-picked example:

1. **Cultural Evidence V1** — development/calibration corpus.
2. **Blind Cultural Evidence V2** — independent holdout using new brands/artists and the same frozen verdict rules.
3. **Blind Claim Compiler V3** — separate unseen extraction holdout for the natural-language compiler.
4. **Qloo OFF ablation** — verifies that cultural verdicts disappear when Qloo evidence is removed.

The product UI was built after these mechanisms had passed their respective gates.

## Cultural Evidence V1 — calibration corpus

- 40 testable claims
- 40 evidence-backed
- 18 contradicted
- 2 maximum ordinal reversals
- Qloo OFF ablation: PASS

V1 was used to calibrate the evidence workflow. It is not presented as a blind holdout.

## Blind Cultural Evidence V2 — independent holdout

- 40 testable claims
- 38 evidence-backed
- 23 contradicted
- 6 maximum ordinal reversals
- Qloo OFF ablation: PASS

The holdout used a separate frozen corpus. The definition of a maximum ordinal reversal remained unchanged:

- claimed strongest → actual last, or
- claimed weakest → actual first,

for a shortlist of at least three candidates.

Pairwise reversals count as contradictions but not as maximum ordinal reversals.

## Combined cultural-evidence result

- 80 testable claims
- 78 evidence-backed
- 41 contradicted
- 8 maximum ordinal reversals

These figures support the product claim that visible contradictions are repeatable behavior rather than a one-off Airbnb example.

## Blind Claim Compiler V3 — unseen extraction holdout

- Corpus SHA-256: `f31f3557e5ff29db67e4585ef3e535f0f8600ad7eeb853ddf2f74df867a76591`
- 10 documents
- 43 gold claims
- `quoteRecall`: 1.0
- `kindAccuracy`: 1.0
- `testableStructureAccuracy`: 1.0
- `hallucinatedTestable`: 0
- `unsafeAmbiguousCompilation`: 0
- model used for the validated run: `gpt-4o-mini`

The V3 result applies to the model and compiler configuration used for that frozen run. Changing the model does not inherit the same benchmark result automatically.

## Qloo OFF ablation

When Qloo is disabled:

- the Claim Compiler may still identify a cultural claim;
- the system does **not** emit `SUPPORTED` or `CONTRADICTED` for that claim;
- the UI returns `VERIFICATION_UNAVAILABLE`;
- no generic LLM fallback is permitted.

This is the product's Sponsor Necessity proof.

## Epistemic boundary

Qloo affinity/ranking is used as cultural evidence within a defined test. CULTURAL REDLINE does not claim that this evidence proves causality, guaranteed behavior, revenue lift, or universal truth.

Claims outside the supported evidence boundary are marked `NOT_TESTABLE` or `REVIEW_REQUIRED` rather than being forced into a verdict.
