# Validation evidence frozen before product build

## Cultural evidence V1
- 40 testable claims
- 40 evidence-backed
- 18 contradicted
- 2 strong reversals
- Qloo OFF ablation: PASS

## Blind cultural evidence holdout V2
- 40 testable claims
- 38 evidence-backed
- 23 contradicted
- 6 strong reversals
- Qloo OFF ablation: PASS

## Blind claim extraction holdout V3
- Corpus SHA-256: `f31f3557e5ff29db67e4585ef3e535f0f8600ad7eeb853ddf2f74df867a76591`
- 10 documents
- 43 gold claims
- quoteRecall: 1.0
- kindAccuracy: 1.0
- testableStructureAccuracy: 1.0
- hallucinatedTestable: 0
- unsafeAmbiguousCompilation: 0
- model used for the validated run: `gpt-4o-mini`

The V1/V2 cultural evidence experiments and V3 compiler benchmark were completed before this Next.js product shell was created. Do not silently alter these benchmark figures.
