import type { CompiledClaim } from "@/lib/types";

export function ClaimPreview({ claims }: { claims: CompiledClaim[] }) {
  return (
    <div className="claimPreview">
      {claims.map((claim) => (
        <div className="claimPreviewRow" key={claim.id}>
          <span>{claim.text}</span>
          <strong>{claim.kind.replaceAll("_", " ").toUpperCase()}</strong>
        </div>
      ))}
    </div>
  );
}
