"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  buySolIx,
  buySolMany,
  getQuote,
  MARKETPLACE_PROGRAM_ID,
  SKR_MINT_MAINNET,
} from "@nft/sdk";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { useCallback, useState } from "react";

/** Demo listing rows — replace with API `/listings` + on-chain state. */
const DEMO = [
  {
    id: "1",
    name: "Sample NFT #1",
    mint: "So11111111111111111111111111111111111111112",
    seller: "11111111111111111111111111111111",
    priceLamports: 0.15 * LAMPORTS_PER_SOL,
  },
];

export default function MarketPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [sweepBudget, setSweepBudget] = useState(1);
  const [status, setStatus] = useState<string | null>(null);

  const buyOne = useCallback(
    async (mintStr: string, sellerStr: string) => {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      setStatus("Building…");
      const treasury =
        process.env.NEXT_PUBLIC_TREASURY ??
        wallet.publicKey.toBase58();
      const ix = buySolIx({
        buyer: wallet.publicKey,
        nftMint: new PublicKey(mintStr),
        seller: new PublicKey(sellerStr),
        treasury: new PublicKey(treasury),
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
      setStatus(`Done: ${sig}`);
    },
    [connection, wallet]
  );

  const multibuy = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    setStatus("Cart checkout…");
    const treasury = new PublicKey(
      process.env.NEXT_PUBLIC_TREASURY ?? wallet.publicKey.toBase58()
    );
    const ixs = buySolMany(
      DEMO.map((d) => ({
        buyer: wallet.publicKey!,
        nftMint: new PublicKey(d.mint),
        seller: new PublicKey(d.seller),
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
    setStatus(`Multibuy ok: ${sig}`);
  }, [connection, wallet]);

  const jupiterSkr = useCallback(async () => {
    setStatus("Fetching Jupiter quote SKR→SOL…");
    try {
      const q = await getQuote({
        inputMint: SKR_MINT_MAINNET.toBase58(),
        outputMint: "So11111111111111111111111111111111111111112",
        amount: String(1_000_000),
        slippageBps: 100,
      });
      setStatus(`Quote out: ${q.outAmount} lamports (demo)`);
    } catch (e) {
      setStatus(String(e));
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Market</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Program: {MARKETPLACE_PROGRAM_ID.toBase58()} · Configure treasury &
        real mints before mainnet.
      </p>
      <div className="mt-6 space-y-4">
        {DEMO.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-zinc-500">
                {d.priceLamports / LAMPORTS_PER_SOL} SOL
              </div>
            </div>
            <button
              type="button"
              onClick={() => buyOne(d.mint, d.seller)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Buy SOL
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={multibuy}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Multibuy cart (demo)
        </button>
        <button
          type="button"
          onClick={() => {}}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Floor sweep (budget {sweepBudget} SOL)
        </button>
        <input
          type="number"
          className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
          value={sweepBudget}
          onChange={(e) => setSweepBudget(Number(e.target.value))}
        />
        <button
          type="button"
          onClick={jupiterSkr}
          className="rounded-lg border border-amber-700/50 px-4 py-2 text-sm text-amber-200 hover:bg-amber-950/40"
        >
          Jupiter SKR→SOL quote
        </button>
      </div>
      {status && (
        <pre className="mt-6 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-300">
          {status}
        </pre>
      )}
    </div>
  );
}
