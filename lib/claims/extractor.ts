// @ts-nocheck
const ALLOWED_KINDS = new Set(["strongest", "weakest", "pairwise", "not_testable", "review_required"]);

export function segmentSentences(text) {
  const source = String(text || "");
  const segments = [];
  const abbreviations = new Set(["st", "mr", "mrs", "ms", "dr", "prof", "jr", "sr", "vs", "etc", "e.g", "i.e"]);
  let start = 0;

  const push = (end) => {
    const raw = source.slice(start, end);
    const leftTrim = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();
    if (trimmed) {
      const spanStart = start + leftTrim;
      segments.push({
        id: `S${String(segments.length + 1).padStart(2, "0")}`,
        text: trimmed,
        start: spanStart,
        end: spanStart + trimmed.length
      });
    }
    start = end;
  };

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (![".", "!", "?"].includes(ch)) continue;

    let j = i + 1;
    while (j < source.length && /\s/.test(source[j])) j += 1;
    if (j >= source.length) {
      push(i + 1);
      continue;
    }
    // A sentence boundary must be followed by a capital/digit after whitespace.
    // This keeps P!nk intact and avoids most inline punctuation.
    if (j === i + 1 || !/[A-Z0-9]/.test(source[j])) continue;

    if (ch === ".") {
      const before = source.slice(0, i);
      const tokenMatch = before.match(/([^\s]+)$/);
      const token = (tokenMatch?.[1] || "").replace(/^[('\"]+|[)'\",;:]+$/g, "");
      const lower = token.toLocaleLowerCase();
      if (abbreviations.has(lower) || token.includes(".")) continue;
    }

    push(i + 1);
  }

  if (start < source.length) push(source.length);
  return segments;
}

export const SYSTEM_PROMPT = `You are the claim compiler for CULTURAL REDLINE.
Your job is linguistic parsing only. Never decide whether a cultural claim is true.

You receive a document as numbered source sentences (S01, S02, ...).
Do NOT copy quotes. Refer to source sentences by sentenceId. The application will recover exact quotes deterministically from those IDs.

First identify explicit comparison contexts. A context contains:
- the sentence that establishes a fixed shortlist or candidate set,
- the cultural signal/brand,
- the complete candidate universe.

Then identify EVERY sentence that is one of:
- strongest: X is the strongest/best cultural fit in an explicit candidate universe
- weakest: X is the weakest/worst cultural fit in an explicit candidate universe
- pairwise: X is a stronger/better cultural fit than Y
- not_testable: causal business outcome or another assertion Qloo cultural affinity cannot establish
- review_required: a cultural comparison/ranking assertion that is too ambiguous to compile safely

IMPORTANT:
- Be exhaustive. Do not omit a causal business-outcome sentence; mark it not_testable.
- Do not omit an ambiguous cultural assertion such as "They are clearly the best choice"; mark it review_required.
- For strongest/weakest/pairwise, reference a contextId that supplies the complete fixed candidate universe.
- Never invent a candidate, brand, sentence ID, or context.
- For a context, every candidate name must occur literally in its source sentence.
- Put each candidate in its own array item. Never combine two candidates into one string with commas or "and".
- Claims that say "this pool", "the finalists", or "this shortlist" must reuse the nearest explicit context rather than inventing a new one.
- For a testable claim, claimed/other must be members of that context's candidate universe.

Output JSON only using this shape:
{
  "contexts": [
    {
      "id": "CTX1",
      "sentenceId": "S01",
      "signal": {"name":"...","type":"urn:entity:brand"},
      "candidateType":"urn:entity:artist",
      "candidates":["...","...","..."]
    }
  ],
  "claims": [
    {
      "sentenceId":"S02",
      "kind":"strongest|weakest|pairwise|not_testable|review_required",
      "contextId":"CTX1",
      "claimed":"...",
      "other":"...",
      "reason":"..."
    }
  ]
}`;

export const OPENAI_EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["contexts", "claims"],
  properties: {
    contexts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "sentenceId", "signal", "candidateType", "candidates"],
        properties: {
          id: { type: "string" },
          sentenceId: { type: "string" },
          signal: {
            type: "object",
            additionalProperties: false,
            required: ["name", "type"],
            properties: {
              name: { type: "string" },
              type: { type: "string" }
            }
          },
          candidateType: { type: "string" },
          candidates: { type: "array", items: { type: "string" } }
        }
      }
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["sentenceId", "kind", "contextId", "claimed", "other", "reason"],
        properties: {
          sentenceId: { type: "string" },
          kind: { type: "string", enum: ["strongest", "weakest", "pairwise", "not_testable", "review_required"] },
          contextId: { type: ["string", "null"] },
          claimed: { type: ["string", "null"] },
          other: { type: ["string", "null"] },
          reason: { type: ["string", "null"] }
        }
      }
    }
  }
};

function stripCodeFence(text) {
  return String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function parseJsonText(text) {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Claim extractor returned invalid JSON: ${error.message}`);
  }
}

function norm(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function uniqueStrings(items) {
  return [...new Set((items || []).map((x) => String(x).trim()).filter(Boolean))];
}

function literalInSentence(sentence, value) {
  return norm(sentence).includes(norm(value));
}

function splitExplicitCandidateList(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];

  // Conservative list parser for source-authored shortlists such as:
  // "Harry Styles, Lana Del Rey and Sam Smith". We only use this on
  // literal source text; no names are invented by the model or by code.
  const normalized = text.replace(/\s*,\s*and\s+/gi, ", ");
  const commaParts = normalized.split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    const last = commaParts.pop();
    const tail = String(last || "").split(/\s+and\s+/i).map((x) => x.trim()).filter(Boolean);
    return uniqueStrings([...commaParts, ...tail]);
  }
  return uniqueStrings(text.split(/\s+and\s+/i));
}

function deriveExplicitContexts(sentences) {
  const derived = [];

  for (const sentence of sentences) {
    // Canonical explicit comparison sentence:
    // "Among A, B and C, A is the strongest cultural fit for Brand."
    const among = sentence.text.match(
      /^Among\s+(.+?),\s*(.+?)\s+and\s+(.+?),\s*(.+?)\s+is\s+the\s+(?:strongest|weakest|best|worst)\s+cultural\s+(?:fit|match|option)(?:\s+within\s+this\s+(?:pool|shortlist|group|set))?\s+for\s+(.+?)\.$/i
    );
    if (among) {
      const candidates = uniqueStrings([among[1], among[2], among[3]]);
      const signalName = String(among[5] || "").trim();
      if (candidates.length >= 3 && signalName) {
        derived.push({
          id: `DERIVED_${sentence.id}`,
          sentenceId: sentence.id,
          signal: { name: signalName, type: "urn:entity:brand" },
          candidateType: "urn:entity:artist",
          candidates,
          valid: candidates.every((candidate) => literalInSentence(sentence.text, candidate))
            && literalInSentence(sentence.text, signalName),
          deterministic: true
        });
      }
      continue;
    }

    // Explicit shortlist setup used by some briefs:
    // "GoPro is considering Maggie Rogers, Khruangbin and Leon Bridges."
    const considering = sentence.text.match(/^(.+?)\s+is\s+considering\s+(.+?)\.$/i);
    if (considering) {
      const signalName = String(considering[1] || "").trim();
      const candidates = splitExplicitCandidateList(considering[2]);
      if (signalName && candidates.length >= 3 && candidates.every((candidate) => literalInSentence(sentence.text, candidate))) {
        derived.push({
          id: `DERIVED_${sentence.id}`,
          sentenceId: sentence.id,
          signal: { name: signalName, type: "urn:entity:brand" },
          candidateType: "urn:entity:artist",
          candidates,
          valid: literalInSentence(sentence.text, signalName),
          deterministic: true
        });
      }
    }
  }

  return derived;
}

function normalizeContexts(rawContexts, sentences) {
  const sentenceMap = new Map(sentences.map((s) => [s.id, s]));
  const contexts = new Map();
  for (const [index, raw] of (Array.isArray(rawContexts) ? rawContexts : []).entries()) {
    const id = String(raw?.id || `CTX${index + 1}`).trim();
    const sentenceId = String(raw?.sentenceId || "").trim();
    const sentence = sentenceMap.get(sentenceId);
    const signal = raw?.signal && typeof raw.signal === "object" ? {
      name: String(raw.signal.name || "").trim(),
      type: String(raw.signal.type || "urn:entity:brand").trim()
    } : null;
    const candidateType = String(raw?.candidateType || "urn:entity:artist").trim();
    const candidates = uniqueStrings(raw?.candidates);

    // A context can be provisionally valid with one composite candidate string.
    // Some small models emit ["A", "B and C"] even when the source sentence
    // explicitly lists A, B and C. normalizeOne() may safely split such a
    // composite only when the asserted claim names prove the split is needed.
    const valid = Boolean(
      id && sentence && signal?.name && candidates.length >= 1
      && literalInSentence(sentence.text, signal.name)
      && candidates.every((candidate) => literalInSentence(sentence.text, candidate))
    );

    contexts.set(id, {
      id,
      sentenceId,
      signal,
      candidateType,
      candidates,
      valid,
      reason: valid ? undefined : "The comparison context could not be anchored safely to an explicit source sentence."
    });
  }
  return contexts;
}

function reviewFromSentence(sentence, index, reason) {
  return {
    id: `C${String(index + 1).padStart(2, "0")}`,
    text: sentence?.text || "Unanchored extracted claim",
    spanStart: sentence?.start ?? -1,
    spanEnd: sentence?.end ?? -1,
    kind: "review_required",
    reason
  };
}

function repairCompositeCandidates(candidates, sentenceText, claimed, other) {
  const current = uniqueStrings(candidates);
  const requiredNames = [claimed, other].filter(Boolean).map(norm);
  const alreadyBinds = requiredNames.every((name) => current.some((candidate) => norm(candidate) === name));
  if (alreadyBinds) return current;

  const expanded = [];
  for (const candidate of current) {
    const pieces = String(candidate)
      .split(/\s*,\s*|\s+and\s+/i)
      .map((x) => x.trim())
      .filter(Boolean);

    // Only split a model-produced composite when every piece is literally
    // anchored in the explicit shortlist sentence. This never invents names.
    if (pieces.length > 1 && pieces.every((piece) => literalInSentence(sentenceText, piece))) {
      expanded.push(...pieces);
    } else {
      expanded.push(candidate);
    }
  }

  const repaired = uniqueStrings(expanded);
  const repairedBinds = requiredNames.every((name) => repaired.some((candidate) => norm(candidate) === name));
  return repairedBinds ? repaired : current;
}


function deriveClaimBindingFromSentence(sentenceText, kind) {
  const text = String(sentenceText || "").trim();

  if (kind === "strongest" || kind === "weakest") {
    // Fully explicit ranking claim, e.g.:
    // "Among A, B and C, A is the strongest cultural fit for Brand."
    const among = text.match(
      /^Among\s+(.+?),\s*(.+?)\s+and\s+(.+?),\s*(.+?)\s+is\s+the\s+(strongest|weakest|best|worst)\s+cultural\s+(?:fit|match|option)(?:\s+within\s+this\s+(?:pool|shortlist|group|set))?\s+for\s+(.+?)\.$/i
    );
    if (among) {
      const relation = String(among[5] || "").toLowerCase();
      const sentenceKind = ["strongest", "best"].includes(relation) ? "strongest" : "weakest";
      if (sentenceKind === kind) return { claimed: String(among[4] || "").trim() };
    }

    // Follow-on weakest/strongest claims that refer back to an explicit context.
    const rank = text.match(
      /^(.+?)\s+(?:should\s+(?:remain|be)|is)\s+the\s+(strongest|weakest|best|worst)\s+cultural\s+(?:fit|match|option|fallback)(?:\s+in|\s+among|\s+within)?(?:\s+this|\s+the)?(?:\s+shortlist|\s+pool|\s+finalists|\s+group|\s+set)?\.?$/i
    );
    if (rank) {
      const relation = String(rank[2] || "").toLowerCase();
      const sentenceKind = ["strongest", "best"].includes(relation) ? "strongest" : "weakest";
      if (sentenceKind === kind) return { claimed: String(rank[1] || "").trim() };
    }
  }

  if (kind === "pairwise") {
    const pair = text.match(
      /^(.+?)\s+is\s+(?:a\s+)?(?:stronger|better)\s+cultural\s+(?:fit|match|option)\s+for\s+(.+?)\s+than\s+(.+?)\.$/i
    );
    if (pair) {
      return {
        claimed: String(pair[1] || "").trim(),
        other: String(pair[3] || "").trim()
      };
    }
  }

  return null;
}

function contextSupportsClaim(context, raw, kind) {
  if (!context?.valid) return false;
  const claimed = String(raw?.claimed || "").trim();
  const other = raw?.other == null ? undefined : String(raw.other).trim();
  const universe = uniqueStrings(context.candidates);

  if (!claimed) return false;
  if (!universe.some((candidate) => norm(candidate) === norm(claimed))) return false;
  if (kind === "pairwise") {
    if (!other) return false;
    if (!universe.some((candidate) => norm(candidate) === norm(other))) return false;
    return universe.length >= 2;
  }
  if (kind === "strongest" || kind === "weakest") return universe.length >= 3;
  return true;
}

function chooseDeterministicFallbackContext({ raw, kind, sentence, sentences, contexts, derivedContexts }) {
  const claimed = String(raw?.claimed || "").trim();
  const other = raw?.other == null ? undefined : String(raw.other).trim();
  if (!claimed) return null;

  const sourceIndex = sentences.findIndex((item) => item.id === sentence?.id);
  const candidates = derivedContexts.filter((context) => {
    if (!context?.valid) return false;
    const universe = context.candidates || [];
    const hasClaimed = universe.some((candidate) => norm(candidate) === norm(claimed));
    const hasOther = other ? universe.some((candidate) => norm(candidate) === norm(other)) : true;
    if (!hasClaimed || !hasOther) return false;

    // If the claim sentence names a signal explicitly (e.g. "for Airbnb"),
    // require the fallback signal to occur literally in that sentence.
    const explicitSignalMention = context.signal?.name && literalInSentence(sentence?.text || "", context.signal.name);
    if (/\bfor\b/i.test(sentence?.text || "") && !explicitSignalMention) return false;

    const contextIndex = sentences.findIndex((item) => item.id === context.sentenceId);
    return contextIndex >= 0 && sourceIndex >= 0 && contextIndex <= sourceIndex;
  });

  if (!candidates.length) return null;

  // Prefer the nearest preceding explicit context. If two contexts are equally
  // near, refuse to guess rather than silently binding to the wrong shortlist.
  const ranked = candidates
    .map((context) => ({
      context,
      distance: sourceIndex - sentences.findIndex((item) => item.id === context.sentenceId)
    }))
    .sort((a, b) => a.distance - b.distance);

  if (ranked.length > 1 && ranked[0].distance === ranked[1].distance) return null;
  return ranked[0].context;
}

function normalizeOne(raw, sentences, contexts, derivedContexts, index) {
  const sentenceId = String(raw?.sentenceId || "").trim();
  const sentence = sentences.find((s) => s.id === sentenceId);
  const kind = String(raw?.kind ?? "review_required").toLowerCase();

  if (!ALLOWED_KINDS.has(kind)) {
    return reviewFromSentence(sentence, index, `Unsupported claim kind: ${kind || "missing"}.`);
  }
  if (!sentence) {
    return reviewFromSentence(null, index, "The extractor referenced an unknown source sentence; the claim was not anchored.");
  }

  const base = {
    id: `C${String(index + 1).padStart(2, "0")}`,
    text: sentence.text,
    spanStart: sentence.start,
    spanEnd: sentence.end,
    kind
  };

  if (kind === "not_testable" || kind === "review_required") {
    return {
      ...base,
      reason: String(raw?.reason || (kind === "not_testable"
        ? "This assertion is outside Qloo cultural affinity evidence."
        : "The cultural assertion is ambiguous and requires review."))
    };
  }

  const contextId = String(raw?.contextId || "").trim();
  const referencedContext = contexts.get(contextId);

  // When the source sentence itself contains an explicit comparison grammar,
  // recover the compared entities from the exact source rather than trusting
  // the model to copy entity names perfectly. The LLM still identifies the
  // claim kind/context; source text owns the binding.
  const sourceBinding = deriveClaimBindingFromSentence(sentence.text, kind);
  const boundRaw = {
    ...raw,
    ...(sourceBinding?.claimed ? { claimed: sourceBinding.claimed } : {}),
    ...(sourceBinding && Object.prototype.hasOwnProperty.call(sourceBinding, "other")
      ? { other: sourceBinding.other }
      : {})
  };

  // If the claim sentence itself fully spells out its shortlist and signal,
  // that source-authored context is stronger evidence than a model-produced
  // context, even when the model context is syntactically valid. This prevents
  // a plausible-but-wrong three-item context from shadowing the exact source.
  const exactSourceContext = derivedContexts.find((candidate) =>
    candidate.sentenceId === sentence.id && contextSupportsClaim(candidate, boundRaw, kind)
  );

  // Otherwise a context may be syntactically anchored yet still be unusable for
  // the specific claim (for example a strongest/weakest context with only one
  // or two candidates). Recover only from a uniquely anchored explicit source
  // context rather than accepting an underspecified universe.
  const referencedSupportsClaim = contextSupportsClaim(referencedContext, boundRaw, kind);
  const fallbackContext = !exactSourceContext && !referencedSupportsClaim
    ? chooseDeterministicFallbackContext({ raw: boundRaw, kind, sentence, sentences, contexts, derivedContexts })
    : null;
  const context = exactSourceContext || (referencedSupportsClaim ? referencedContext : fallbackContext);
  if (!context?.valid) {
    return reviewFromSentence(
      sentence,
      index,
      referencedContext?.reason || "The claim did not reference a valid explicit comparison context."
    );
  }

  const claimed = String(boundRaw?.claimed || "").trim();
  const other = boundRaw?.other == null ? undefined : String(boundRaw.other).trim();
  const contextSentence = sentences.find((s) => s.id === context.sentenceId);
  const candidates = repairCompositeCandidates(
    context.candidates,
    contextSentence?.text || "",
    claimed,
    kind === "pairwise" ? other : undefined
  );
  const hasClaimed = candidates.some((candidate) => norm(candidate) === norm(claimed));
  const hasOther = other ? candidates.some((candidate) => norm(candidate) === norm(other)) : false;

  if (candidates.length < 2 || !claimed || !hasClaimed || (kind === "pairwise" && (!other || !hasOther))) {
    return reviewFromSentence(sentence, index, "The claim's asserted candidates could not be bound safely to the explicit shortlist.");
  }
  if ((kind === "strongest" || kind === "weakest") && candidates.length < 3) {
    return reviewFromSentence(sentence, index, "Strongest/weakest claims require an explicit shortlist of at least three candidates.");
  }

  return {
    ...base,
    signal: context.signal,
    candidateType: context.candidateType,
    candidateUniverse: candidates,
    claimed: candidates.find((candidate) => norm(candidate) === norm(claimed)) || claimed,
    ...(other ? { other: candidates.find((candidate) => norm(candidate) === norm(other)) || other } : {}),
    contextId: context.id
  };
}

export function normalizeExtraction(raw, text) {
  if (!raw || !Array.isArray(raw.claims)) throw new Error("Claim extractor output must contain a claims array.");
  const sentences = segmentSentences(text);
  const contexts = normalizeContexts(raw.contexts, sentences);
  const derivedContexts = deriveExplicitContexts(sentences);
  const claims = raw.claims.map((claim, index) => normalizeOne(claim, sentences, contexts, derivedContexts, index));

  // One normalized claim per source sentence. If a model duplicates a sentence,
  // retain the safer one deterministically: review/not-testable wins over a
  // testable claim only if the testable version is not fully compiled.
  const bySpan = new Map();
  for (const claim of claims) {
    const key = `${claim.spanStart}:${claim.spanEnd}`;
    if (!bySpan.has(key)) {
      bySpan.set(key, claim);
      continue;
    }
    const prior = bySpan.get(key);
    const priorTestable = ["strongest", "weakest", "pairwise"].includes(prior.kind);
    const currentTestable = ["strongest", "weakest", "pairwise"].includes(claim.kind);
    if (!priorTestable && currentTestable) bySpan.set(key, claim);
  }

  const deduped = [...bySpan.values()]
    .sort((a, b) => (a.spanStart < 0 ? Number.MAX_SAFE_INTEGER : a.spanStart) - (b.spanStart < 0 ? Number.MAX_SAFE_INTEGER : b.spanStart));
  deduped.forEach((claim, index) => { claim.id = `C${String(index + 1).padStart(2, "0")}`; });
  return { claims: deduped, sentences };
}

function sentenceInput(text) {
  return segmentSentences(text).map((s) => `${s.id}: ${s.text}`).join("\n");
}

// Heuristic mode is kept only as a zero-cost UI smoke test for the original Airbnb demo.
// It intentionally remains narrow; production extraction should use an LLM provider.
export function heuristicExtract(text) {
  const sentences = segmentSentences(text);
  const findSentence = (pattern) => sentences.find((s) => pattern.test(s.text));
  const shortlistSentence = findSentence(/Among\s+.+?,\s*.+?\s+and\s+.+?,\s*.+?\s+is\s+the\s+strongest\s+cultural\s+fit\s+for\s+.+?\.$/i);
  if (!shortlistSentence) return { claims: [], sentences };

  const match = shortlistSentence.text.match(/Among\s+(.+?),\s*(.+?)\s+and\s+(.+?),\s*(.+?)\s+is\s+the\s+strongest\s+cultural\s+fit\s+for\s+(.+?)\.$/i);
  if (!match) return { claims: [], sentences };
  const context = {
    id: "CTX1",
    sentenceId: shortlistSentence.id,
    signal: { name: match[5].trim(), type: "urn:entity:brand" },
    candidateType: "urn:entity:artist",
    candidates: [match[1].trim(), match[2].trim(), match[3].trim()]
  };
  const rawClaims = [{ sentenceId: shortlistSentence.id, kind: "strongest", contextId: "CTX1", claimed: match[4].trim() }];

  for (const sentence of sentences) {
    const pair = sentence.text.match(/^(.+?)\s+is\s+a\s+stronger\s+cultural\s+fit\s+for\s+(.+?)\s+than\s+(.+?)\.$/i);
    if (pair) rawClaims.push({ sentenceId: sentence.id, kind: "pairwise", contextId: "CTX1", claimed: pair[1].trim(), other: pair[3].trim() });
    const weak = sentence.text.match(/^(.+?)\s+should\s+remain\s+the\s+weakest\s+cultural\s+fallback\s+in\s+this\s+shortlist\.$/i);
    if (weak) rawClaims.push({ sentenceId: sentence.id, kind: "weakest", contextId: "CTX1", claimed: weak[1].trim() });
    if (/\b(?:increase|lift|improve)\b.*\b(?:sales|revenue|bookings|conversion)\b.*\d+%/i.test(sentence.text)) {
      rawClaims.push({ sentenceId: sentence.id, kind: "not_testable", reason: "Qloo cultural affinity does not establish causal business lift." });
    }
  }
  return normalizeExtraction({ contexts: [context], claims: rawClaims }, text);
}

async function anthropicExtract(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.CLAIM_LLM_MODEL;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing.");
  if (!model) throw new Error("CLAIM_LLM_MODEL is missing.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 2600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `DOCUMENT SENTENCES:\n${sentenceInput(text)}` }]
    }),
    signal: AbortSignal.timeout(45000)
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${body.slice(0, 800)}`);
  const payload = JSON.parse(body);
  const output = (payload.content || []).filter((x) => x?.type === "text").map((x) => x.text).join("\n");
  return normalizeExtraction(parseJsonText(output), text);
}

function openAIOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const chunks = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") chunks.push(content.text);
      if (typeof content?.output_text === "string") chunks.push(content.output_text);
    }
  }
  return chunks.join("\n");
}

async function openAIExtract(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.CLAIM_LLM_MODEL;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  if (!model) throw new Error("CLAIM_LLM_MODEL is missing.");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions: SYSTEM_PROMPT,
      input: `DOCUMENT SENTENCES:\n${sentenceInput(text)}`,
      max_output_tokens: 2600,
      text: {
        format: {
          type: "json_schema",
          name: "cultural_redline_claim_compiler",
          strict: true,
          schema: OPENAI_EXTRACTION_SCHEMA
        }
      }
    }),
    signal: AbortSignal.timeout(45000)
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${body.slice(0, 800)}`);
  const payload = JSON.parse(body);
  return normalizeExtraction(parseJsonText(openAIOutputText(payload)), text);
}

export async function extractClaims(text, { provider = process.env.CLAIM_LLM_PROVIDER || "heuristic" } = {}) {
  const clean = String(text || "").trim();
  if (clean.length < 20) throw new Error("Paste a longer strategy brief before extracting claims.");

  if (provider === "heuristic") return { ...(heuristicExtract(clean)), provider: "heuristic" };
  if (provider === "anthropic") return { ...(await anthropicExtract(clean)), provider: "anthropic" };
  if (provider === "openai") return { ...(await openAIExtract(clean)), provider: "openai" };
  throw new Error(`Unsupported CLAIM_LLM_PROVIDER: ${provider}`);
}
