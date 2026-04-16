"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  MeButton,
  MeInput,
  MeLabel,
  MePanel,
  PageShell,
} from "@/components/me/PageShell";

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
    <PageShell
      eyebrow="Create"
      title="Launchpad"
      description="Mint NFTs / cNFTs with Metaplex (Bubblegum), then submit the collection mint for review via the moderation API."
    >
      <MePanel className="max-w-lg space-y-4">
        <MeLabel htmlFor="col-mint">Collection mint</MeLabel>
        <MeInput
          id="col-mint"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          placeholder="Address"
        />
        <MeLabel htmlFor="title">Title</MeLabel>
        <MeInput
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <MeLabel htmlFor="uri">Metadata URI</MeLabel>
        <MeInput
          id="uri"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
        />
        <MeButton className="mt-6" onClick={submit}>
          Submit for review
        </MeButton>
        {msg && (
          <pre className="mt-4 text-xs text-neutral-500">{msg}</pre>
        )}
      </MePanel>
    </PageShell>
  );
}
