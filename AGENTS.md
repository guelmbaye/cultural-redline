# CULTURAL REDLINE agent instructions

Preserve these product invariants when modifying this repository.

1. **LLM interprets; Qloo evidences; deterministic code decides.** Never let an LLM directly emit `SUPPORTED` or `CONTRADICTED` as the final verdict.
2. **Fixed universe.** If a claim asserts a ranking over `[A, B, C]`, verify exactly `[A, B, C]`. Never silently remove, add, or substitute candidates.
3. **Abstain safely.** Use `REVIEW_REQUIRED`, `INSUFFICIENT_EVIDENCE`, `NOT_TESTABLE`, or `VERIFICATION_UNAVAILABLE` instead of guessing.
4. **No Qloo fallback.** When Qloo is off or unavailable, never replace cultural evidence with generic LLM/world knowledge.
5. **Strong reversal definition is frozen.** Only claimed strongest→actual last or claimed weakest→actual first counts as a strong reversal for a shortlist of at least three. Pairwise reversals are ordinary contradictions.
6. **Preserve source spans.** Redlines must map to exact document sentences recovered deterministically from sentence IDs.
7. **Do not rewrite frozen benchmark results.** `evaluation/VALIDATION.md` and `evaluation/proof.json` document completed pre-build experiments.
8. **Keep secrets server-side.** `QLOO_API_KEY` and `OPENAI_API_KEY` must never enter Client Components or browser-visible payloads.
9. **Hero artifact is the document.** Avoid turning the product into a generic analytics dashboard or creator recommender.
10. **Winning demo.** Preserve the Airbnb double reversal as the canonical 20-second demo until a stronger validated case replaces it.
