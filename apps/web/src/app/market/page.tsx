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
import { MeButton, MePanel, PageShell } from "@/components/me/PageShell";

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

const COLLECTIONS = [
  {
    id: "c1",
    name: "Sample collection",
    floor: 0.15,
    topOffer: 0.12,
    d1: 5.2,
    volume: "124",
    sales: 42,
    listed: 18,
  },
  {
    id: "c2",
    name: "SKR genesis",
    floor: 2.4,
    topOffer: 2.1,
    d1: -1.3,
    volume: "89",
    sales: 12,
    listed: 6,
  },
  {
    id: "c3",
    name: "Community pass",
    floor: 0.08,
    topOffer: 0.05,
    d1: 0.4,
    volume: "340",
    sales: 120,
    listed: 45,
  },
];

const TIMES = ["10m", "1h", "6h", "1d", "7d", "30d"] as const;

export default function MarketPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [sweepBudget, setSweepBudget] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [range, setRange] = useState<(typeof TIMES)[number]>("1d");
  const [tab, setTab] = useState<"popular" | "new">("popular");

  const buyOne = useCallback(
    async (mintStr: string, sellerStr: string) => {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      setStatus("Building…");
      const treasury =
        process.env.NEXT_PUBLIC_TREASURY ?? wallet.publicKey.toBase58();
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
    <PageShell
      eyebrow="Marketplace"
      title="Solana collections"
      description={`Program ${MARKETPLACE_PROGRAM_ID.toBase58().slice(0, 4)}…${MARKETPLACE_PROGRAM_ID.toBase58().slice(-4)} — configure treasury & real mints before mainnet.`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-[#111111] p-1">
          <button
            type="button"
            onClick={() => setTab("popular")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === "popular"
                ? "bg-white/[0.1] text-white"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            Popular
          </button>
          <button
            type="button"
            onClick={() => setTab("new")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === "new"
                ? "bg-white/[0.1] text-white"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            New
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-600">Time</span>
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRange(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                range === t
                  ? "bg-gradient-to-r from-[#e42575]/20 to-[#9333ea]/20 text-white ring-1 ring-white/[0.12]"
                  : "text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 sm:px-5">#</th>
                <th className="px-4 py-3 sm:px-5">Collection</th>
                <th className="px-4 py-3 sm:px-5">Floor</th>
                <th className="px-4 py-3 sm:px-5">Top offer</th>
                <th className="px-4 py-3 sm:px-5">Floor 1d</th>
                <th className="px-4 py-3 sm:px-5">Volume</th>
                <th className="px-4 py-3 sm:px-5">Sales</th>
                <th className="px-4 py-3 sm:px-5">Listed</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "new" ? [...COLLECTIONS].reverse() : COLLECTIONS).map(
                (row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3.5 text-neutral-600 sm:px-5">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[#2a1a33] to-[#0b0b0b] ring-1 ring-white/[0.08]" />
                      <span className="font-medium text-white">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white sm:px-5">
                    {row.floor.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-neutral-300 sm:px-5">
                    {row.topOffer.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-3.5 font-medium sm:px-5 ${
                      row.d1 >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {row.d1 >= 0 ? "+" : ""}
                    {row.d1}%
                  </td>
                  <td className="px-4 py-3.5 text-neutral-300 sm:px-5">
                    {row.volume}
                  </td>
                  <td className="px-4 py-3.5 text-neutral-300 sm:px-5">
                    {row.sales}
                  </td>
                  <td className="px-4 py-3.5 text-neutral-300 sm:px-5">
                    {row.listed}
                  </td>
                </tr>
              )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <MePanel>
          <h3 className="text-sm font-semibold text-white">Listings (dev)</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Demo rows — connect wallet to buy with SOL.
          </p>
          <ul className="mt-4 space-y-3">
            {DEMO.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0b0b0b] px-4 py-3"
              >
                <div>
                  <div className="font-medium text-white">{d.name}</div>
                  <div className="text-xs text-neutral-500">
                    {(d.priceLamports / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </div>
                </div>
                <MeButton
                  variant="primary"
                  onClick={() => buyOne(d.mint, d.seller)}
                >
                  Buy SOL
                </MeButton>
              </li>
            ))}
          </ul>
        </MePanel>

        <MePanel>
          <h3 className="text-sm font-semibold text-white">Tools</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Multibuy, sweep budget, Jupiter quote.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <MeButton variant="secondary" onClick={multibuy}>
              Multibuy cart (demo)
            </MeButton>
            <MeButton variant="secondary" onClick={() => {}}>
              Floor sweep ({sweepBudget} SOL)
            </MeButton>
            <input
              type="number"
              className="w-24 rounded-xl border border-white/[0.1] bg-[#0b0b0b] px-3 py-2.5 text-sm text-white"
              value={sweepBudget}
              onChange={(e) => setSweepBudget(Number(e.target.value))}
              aria-label="Sweep budget SOL"
            />
            <MeButton variant="secondary" onClick={jupiterSkr}>
              Jupiter SKR→SOL
            </MeButton>
          </div>
          {status && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-[#0b0b0b] p-3 font-mono text-xs text-neutral-400">
              {status}
            </pre>
          )}
        </MePanel>
      </div>
    </PageShell>
  );
}
