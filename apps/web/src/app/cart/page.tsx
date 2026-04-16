"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { buySolMany } from "@nft/sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  MeButton,
  MePanel,
  PageShell,
} from "@/components/me/PageShell";

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
    <PageShell
      eyebrow="Cart"
      title="Checkout"
      description={`${CART.length} line(s). One transaction with multiple program instructions when tx size allows.`}
    >
      <MePanel className="max-w-lg">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <span className="text-sm text-neutral-400">Items</span>
          <span className="font-mono text-sm text-white">{CART.length}</span>
        </div>
        <MeButton className="mt-6 w-full sm:w-auto" onClick={checkout}>
          Confirm checkout
        </MeButton>
        {log && (
          <p className="mt-4 break-all font-mono text-xs text-neutral-400">
            {log}
          </p>
        )}
      </MePanel>
    </PageShell>
  );
}
