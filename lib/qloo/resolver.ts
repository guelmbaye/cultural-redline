// @ts-nocheck
import "server-only";
export class ResolveError extends Error {}

function walk(value) {
  const out = [];
  const visit = (node) => {
    out.push(node);
    if (Array.isArray(node)) for (const item of node) visit(item);
    else if (node && typeof node === "object") for (const item of Object.values(node)) visit(item);
  };
  visit(value);
  return out;
}

function typesOf(node) {
  const out = [];
  for (const key of ["subtype", "type", "entity_type"]) if (typeof node?.[key] === "string") out.push(node[key]);
  if (typeof node?.types === "string") out.push(node.types);
  if (Array.isArray(node?.types)) out.push(...node.types.filter((x) => typeof x === "string"));
  return out;
}

export function resolveExactFromSearch(payload, requestedName, entityType) {
  const candidates = [];
  for (const node of walk(payload)) {
    if (!node || typeof node !== "object" || Array.isArray(node)) continue;
    const entityId = node.entity_id ?? node.id;
    const name = node.name;
    if (typeof entityId === "string" && typeof name === "string" && typesOf(node).includes(entityType)) {
      candidates.push({ entityId, name, types: typesOf(node) });
    }
  }
  const exact = candidates.filter((x) => x.name.localeCompare(requestedName, undefined, { sensitivity: "base" }) === 0);
  if (exact.length !== 1) {
    throw new ResolveError(exact.length > 1
      ? `Ambiguous exact Qloo resolution for ${requestedName}.`
      : `Could not exactly resolve ${requestedName} as ${entityType}.`);
  }
  return exact[0];
}

export async function searchQlooEntity({ baseUrl, apiKey, name, entityType }) {
  if (!apiKey) throw new ResolveError("QLOO_API_KEY is missing.");
  const params = new URLSearchParams({ query: name, types: entityType, take: "5" });
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/search?${params}`, {
    headers: { "X-Api-Key": apiKey, accept: "application/json" },
    signal: AbortSignal.timeout(30000)
  });
  const body = await response.text();
  if (!response.ok) throw new ResolveError(`Qloo ${response.status} resolving ${name}: ${body.slice(0, 800)}`);
  return resolveExactFromSearch(JSON.parse(body), name, entityType);
}
