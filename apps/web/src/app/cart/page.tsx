"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { buySolMany } from "@nft/sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";

/** Client-side cart; combine multiple buy ixs in one transaction. */
const CART = [
  {
    mint: "So11111111111111111111111111111111111111112",
    seller: "11111111111111111111111111111111",
  },
];

export default function CartPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [log, setLog] = useState("");

  async function checkout() {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    const treasury = new PublicKey(
      process.env.NEXT_PUBLIC_TREASURY ?? wallet.publicKey.toBase58()
    );
    const ixs = buySolMany(
      CART.map((c) => ({
        buyer: wallet.publicKey!,
        nftMint: new PublicKey(c.mint),
        seller: new PublicKey(c.seller),
        treasury,
      }))
    );
    const tx = new Transaction().add(...ixs);
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
      <h1 className="text-2xl font-semibold">Cart · multibuy</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {CART.length} line(s). Uses one transaction with multiple program
        instructions when tx size allows.
      </p>
      <button
        type="button"
        onClick={checkout}
        className="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white"
      >
        Checkout
      </button>
      {log && <p className="mt-4 font-mono text-xs break-all">{log}</p>}
    </div>
  );
}
