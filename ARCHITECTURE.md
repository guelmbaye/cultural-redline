# CULTURAL REDLINE — Technical architecture

```text
Browser
  │
  ├─ POST /api/extract
  │      │
  │      ├─ deterministic sentence segmentation
  │      ├─ OpenAI Responses API
  │      │    └─ strict JSON Schema output
  │      └─ deterministic normalization / source-span anchoring
  │
  └─ POST /api/verify
         │
         ├─ exact Qloo /search resolution
         │
         ├─ fixed shortlist integrity gate
         │
         ├─ Qloo /v2/insights
         │    ├─ signal.interests.entities
         │    ├─ filter.results.entities
         │    └─ feature.explainability=true
         │
         ├─ response SHA-256 receipt
         └─ deterministic verdict engine
              ├─ SUPPORTED
              ├─ CONTRADICTED
              ├─ INSUFFICIENT_EVIDENCE
              ├─ NOT_TESTABLE
              ├─ REVIEW_REQUIRED
              └─ VERIFICATION_UNAVAILABLE
```

## Trust boundary

The claim compiler is not an oracle. It is allowed to map natural language into a restricted test DSL only. The verdict engine never receives an LLM judgment.

## Fixed-universe invariant

A claim about candidates `[A, B, C]` is tested only if exactly `[A, B, C]` can be resolved and returned by Qloo. The system never silently shrinks or expands the candidate universe.

## Strong reversal invariant

A major reversal is only:

- claimed strongest → actual last, or
- claimed weakest → actual first,

for a shortlist containing at least three candidates. Pairwise reversals remain ordinary contradictions.
