/**
 * Minimal indexer: polls recent signatures for marketplace program and POSTs activity to API.
 */
import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  process.env.MARKETPLACE_PROGRAM_ID ??
    "2zNCva3rSw2MeJqjVgih445iHtxvxyymS2vaUUJ3zpPj"
);
const RPC = process.env.RPC_URL ?? "http://127.0.0.1:8899";
const API = process.env.API_URL ?? "http://127.0.0.1:8787";

async function tick(conn: Connection) {
  const sigs = await conn.getSignaturesForAddress(PROGRAM_ID, { limit: 25 });
  for (const s of sigs) {
    await fetch(`${API}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "chain",
        sig: s.signature,
        from_addr: "",
        to_addr: "",
      }),
    }).catch(() => {});
  }
}

async function main() {
  const conn = new Connection(RPC, "confirmed");
  console.log("Indexer polling", PROGRAM_ID.toBase58(), RPC);
  setInterval(() => {
    tick(conn).catch(console.error);
  }, 12_000);
  await tick(conn);
}

main().catch(console.error);
