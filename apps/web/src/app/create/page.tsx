"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8787";

export default function CreatePage() {
  const { publicKey } = useWallet();
  const [mint, setMint] = useState("");
  const [title, setTitle] = useState("");
  const [uri, setUri] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!publicKey) {
      setMsg("Connect wallet");
      return;
    }
    const res = await fetch(`${API}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_mint: mint,
        creator: publicKey.toBase58(),
        title,
        metadata_uri: uri,
      }),
    });
    const j = await res.json();
    setMsg(JSON.stringify(j));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Creator studio</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Mint NFTs / cNFTs with Metaplex (Bubblegum) from your wallet, then
        submit the collection mint for review. Wire your mint flow here; this
        form registers a submission with the moderation API.
      </p>
      <div className="mt-6 space-y-3">
        <label className="block text-sm">
          Collection mint
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            placeholder="Address"
          />
        </label>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Metadata URI
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
        >
          Submit for review
        </button>
      </div>
      {msg && (
        <pre className="mt-4 text-xs text-zinc-400">{msg}</pre>
      )}
    </div>
  );
}
