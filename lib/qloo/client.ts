// @ts-nocheck
import "server-only";
import crypto from "node:crypto";

export class QlooError extends Error {}

function walk(value) {
  const out = [];
  const visit = (node) => {
    out.push(node);
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
    } else if (node && typeof node === "object") {
      for (const item of Object.values(node)) visit(item);
    }
  };
  visit(value);
  return out;
}

function entityId(node) {
  if (!node || typeof node !== "object") return "";
  return String(node.entity_id ?? node.id ?? "");
}

export function extractFixedRanking(payload, expectedIds) {
  const expected = new Set(expectedIds.map((x) => x.toUpperCase()));
  let best = [];

  for (const node of walk(payload)) {
    if (!Array.isArray(node) || node.length === 0) continue;
    const dicts = node.filter((x) => x && typeof x === "object" && !Array.isArray(x));
    if (dicts.length !== node.length) continue;
    const matched = dicts.filter((x) => expected.has(entityId(x).toUpperCase()));
    if (matched.length > best.length) best = matched;
  }

  if (!best.length) throw new QlooError("No fixed-shortlist entities found in Insights response.");

  const ranking = best.map((node, index) => ({
    entityId: entityId(node),
    name: String(node.name ?? entityId(node)),
    rank: index + 1,
    affinity:
      typeof node.affinity === "number"
        ? node.affinity
        : typeof node.score === "number"
          ? node.score
          : null
  }));

  const returned = new Set(ranking.map((x) => x.entityId.toUpperCase()));
  const missing = [...expected].filter((id) => !returned.has(id));
  if (ranking.length !== expected.size || missing.length) {
    throw new QlooError(`Qloo shortlist mismatch: returned ${ranking.length}/${expected.size}; missing=${missing.join(",")}`);
  }

  return ranking;
}

export function canonicalHash(value) {
  const stable = (v) => {
    if (Array.isArray(v)) return v.map(stable);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])]));
    }
    return v;
  };
  return crypto.createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

type FetchFixedShortlistInput = {
  baseUrl: string;
  apiKey?: string;
  anchorId: string;
  candidateType: string;
  candidateIds: string[];
  signal?: AbortSignal;
};

export async function fetchFixedShortlist({
  baseUrl,
  apiKey,
  anchorId,
  candidateType,
  candidateIds,
  signal
}: FetchFixedShortlistInput) {
  if (!apiKey) throw new QlooError("QLOO_API_KEY is missing.");

  const params = new URLSearchParams({
    "filter.type": candidateType,
    "signal.interests.entities": anchorId,
    "filter.results.entities": candidateIds.join(","),
    "feature.explainability": "true",
    "take": String(Math.max(3, candidateIds.length))
  });

  const url = `${baseUrl.replace(/\/$/, "")}/v2/insights?${params}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Api-Key": apiKey,
      accept: "application/json"
    },
    signal: signal ?? AbortSignal.timeout(30000)
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new QlooError(`Qloo returned non-JSON (${response.status}).`);
  }

  if (!response.ok) {
    throw new QlooError(`Qloo ${response.status}: ${text.slice(0, 800)}`);
  }

  return {
    request: {
      path: "/v2/insights",
      params: Object.fromEntries(params.entries())
    },
    payload,
    ranking: extractFixedRanking(payload, candidateIds),
    responseHash: canonicalHash(payload)
  };
}
