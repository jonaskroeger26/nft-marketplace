"use client";

import { makeOfferSolIx } from "@nft/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";

export default function TradePage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [mint, setMint] = useState("");
  const [offer, setOffer] = useState("0.1");
  const [log, setLog] = useState("");

  async function sendOffer() {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    const ix = makeOfferSolIx({
      buyer: wallet.publicKey,
      nftMint: new PublicKey(mint),
      offerPrice: BigInt(Math.floor(Number(offer) * LAMPORTS_PER_SOL)),
      expiryTs: BigInt(0),
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
      <h1 className="text-2xl font-semibold">Offers</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Collection / trait bids and floor sweeps use the same settlement stack;
        wire trait filters against your indexer.
      </p>
      <label className="mt-4 block text-sm">
        NFT mint
        <input
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
        />
      </label>
      <label className="mt-3 block text-sm">
        Offer (SOL)
        <input
          type="number"
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={sendOffer}
        className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
      >
        Make offer (SOL)
      </button>
      {log && <p className="mt-4 font-mono text-xs break-all">{log}</p>}
    </div>
  );
}
