"use client";

import { openPackIx } from "@nft/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";

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
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Packs</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Open-pack burns a pack token and mints a reward (configure mint
        authorities & env mints). Add VRF / commit-reveal for production
        fairness.
      </p>
      <button
        type="button"
        onClick={openPack}
        className="mt-6 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-black"
      >
        Open pack (dev)
      </button>
      {log && <p className="mt-4 font-mono text-xs break-all">{log}</p>}
    </div>
  );
}
