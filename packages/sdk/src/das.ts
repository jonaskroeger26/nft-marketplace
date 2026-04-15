/**
 * Helius / DAS-style asset + compressed asset proof helpers for cNFT transfers.
 */

export type DasAsset = {
  id: string;
  interface?: string;
  content?: { metadata?: { name?: string } };
  ownership: { owner: string; frozen: boolean };
  compression?: { leaf_id: number; tree: string };
};

export async function getAsset(
  rpcUrl: string,
  assetId: string
): Promise<DasAsset> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "das",
      method: "getAsset",
      params: { id: assetId },
    }),
  });
  const j = (await res.json()) as { result?: DasAsset; error?: unknown };
  if (j.error || !j.result) throw new Error("getAsset failed");
  return j.result;
}

export async function getAssetProof(rpcUrl: string, assetId: string) {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "das",
      method: "getAssetProof",
      params: { id: assetId },
    }),
  });
  const j = (await res.json()) as { result?: unknown; error?: unknown };
  if (j.error || !j.result) throw new Error("getAssetProof failed");
  return j.result;
}
