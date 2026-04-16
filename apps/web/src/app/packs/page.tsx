"use client";

import { openPackIx } from "@nft/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { MePanel, PageShell } from "@/components/me/PageShell";

export default function PacksPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [log, setLog] = useState("");

  async function openPack() {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    const ph = "11111111111111111111111111111111";
    const packMint = new PublicKey(process.env.NEXT_PUBLIC_PACK_MINT ?? ph);
    const rewardMint = new PublicKey(process.env.NEXT_PUBLIC_REWARD_MINT ?? ph);
    const ix = openPackIx({
      holder: wallet.publicKey,
      packMint,
      rewardMint,
    });
    const tx = new Transaction().add(ix);
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;
    const signed = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction({
      signature: sig,
      blockhash,
      lastValidBlockHeight,
    });
    setLog(sig);
  }

  return (
    <PageShell
      eyebrow="Packs"
      title="Open packs"
      description="Burn-pack flow and reward mint (configure authorities & env). Add VRF / commit-reveal for production fairness."
    >
      <MePanel className="max-w-lg">
        <p className="text-sm text-neutral-400">
          Demo open-pack uses env mints or placeholder addresses.
        </p>
        <button
          type="button"
          onClick={openPack}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-900/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          Open pack (dev)
        </button>
        {log && (
          <p className="mt-4 break-all font-mono text-xs text-neutral-400">
            {log}
          </p>
        )}
      </MePanel>
    </PageShell>
  );
}
