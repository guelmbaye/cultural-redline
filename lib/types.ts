export type ClaimKind =
  | "strongest"
  | "weakest"
  | "pairwise"
  | "not_testable"
  | "review_required";

export type EntitySpec = {
  name: string;
  type: string;
};

export type CompiledClaim = {
  id: string;
  text: string;
  spanStart: number;
  spanEnd: number;
  kind: ClaimKind;
  signal?: EntitySpec;
  candidateType?: string;
  candidateUniverse?: string[];
  claimed?: string;
  other?: string;
  contextId?: string;
  reason?: string;
};

export type SentenceSegment = {
  id: string;
  text: string;
  start: number;
  end: number;
};

export type ExtractionResult = {
  claims: CompiledClaim[];
  sentences: SentenceSegment[];
  provider: string;
};

export type RankingItem = {
  entityId: string;
  name: string;
  rank: number;
  affinity: number | null;
};

export type VerdictName =
  | "SUPPORTED"
  | "CONTRADICTED"
  | "INSUFFICIENT_EVIDENCE"
  | "NOT_TESTABLE"
  | "REVIEW_REQUIRED"
  | "VERIFICATION_UNAVAILABLE";

export type VerdictResult = {
  claimId: string;
  verdict: VerdictName;
  strongReversal: boolean;
  evidenceAvailable: boolean;
  reason: string;
  claimedRank?: number;
  observedRank?: number;
};

export type EvidenceGroup = {
  source: string;
  responseHash: string;
  request: { path: string; params: Record<string, string> };
  checkedAt: string;
  signal: { requested: string; canonicalName: string; entityId: string };
  ranking: RankingItem[];
};

export type VerifiedClaim = CompiledClaim & {
  result: VerdictResult;
  evidenceGroup: string | null;
};

export type VerificationMetrics = {
  totalClaims: number;
  supported: number;
  contradicted: number;
  notTestable: number;
  unavailable: number;
  insufficient: number;
  reviewRequired: number;
  strongReversals: number;
};

export type VerificationResult = {
  text: string;
  qlooOff: boolean;
  claims: VerifiedClaim[];
  evidenceGroups: Record<string, EvidenceGroup>;
  metrics: VerificationMetrics;
};
