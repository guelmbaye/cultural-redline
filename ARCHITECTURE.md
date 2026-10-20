# CULTURAL REDLINE — Technical architecture

Live product: https://cultural-redline.vercel.app/  
Public repository: https://github.com/guelmbaye/cultural-redline

## System flow

```text
Browser
  │
  ├─ POST /api/extract
  │      │
  │      ├─ deterministic sentence segmentation
  │      ├─ OpenAI Responses API
  │      │    └─ strict JSON Schema Structured Output
  │      └─ deterministic normalization
  │           ├─ source-span anchoring
  │           ├─ explicit-shortlist recovery
  │           └─ ambiguity → REVIEW_REQUIRED
  │
  └─ POST /api/verify
         │
         ├─ exact Qloo /search resolution
         ├─ fixed shortlist integrity gate
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

The Claim Compiler is not an oracle. It is allowed to map natural language into a restricted test DSL only.

The verdict engine never receives an LLM judgment about whether the claim is culturally correct.

> **LLM interprets → Qloo evidences → deterministic code decides → UI reveals.**

## Fixed-universe invariant

A claim about candidates `[A, B, C]` is tested only if exactly that candidate universe can be safely established and returned by Qloo.

The system never silently shrinks or expands the shortlist to make a test easier.

If one candidate cannot be resolved or the returned universe is incomplete, the product abstains with `INSUFFICIENT_EVIDENCE` or `REVIEW_REQUIRED`.

## Deterministic context recovery

Real LLM outputs can contain valid-looking but underspecified comparison contexts. The normalizer may recover a context only when the document itself contains an explicit, uniquely identifiable shortlist and signal.

Recovery rules are intentionally conservative:

- `pairwise` requires at least two bound candidates;
- `strongest` / `weakest` require at least three candidates;
- recovered candidate names must be anchored in source text;
- ambiguous competing contexts are not guessed;
- no Airbnb-specific candidate or verdict is hardcoded.

## Strong reversal invariant

A major reversal is only:

- claimed strongest → actual last, or
- claimed weakest → actual first,

for a shortlist containing at least three candidates.

Pairwise reversals remain ordinary contradictions.

## Qloo OFF invariant

When Qloo evidence is unavailable or deliberately disabled, testable cultural claims become `VERIFICATION_UNAVAILABLE`.

The application never asks the LLM to replace the missing cultural evidence.

## Client / server boundary

Browser responsibilities:

- edit the brief;
- render claim states and redlines;
- store the current hackathon draft in `localStorage`;
- call same-origin Next.js API routes.

Server responsibilities:

- hold OpenAI and Qloo credentials;
- call OpenAI for structured claim compilation;
- resolve Qloo entities;
- call Qloo Insights;
- generate evidence receipts;
- compute deterministic verdicts.

No API key is exposed through `NEXT_PUBLIC_*` variables.

## Persistence

The hackathon MVP intentionally has no database. The active draft is stored in browser `localStorage`; external evidence is requested server-side when the user verifies a document.
