import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm uppercase tracking-widest text-violet-400">
        Solana · SKR dual settlement
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        Tensor + Magic Eden–class trading
      </h1>
      <p className="mt-4 text-lg text-zinc-400">
        Fixed-price listings in SOL or SKR, Jupiter swap path, cart multibuy,
        offers, floor sweeps, packs, creator mints with moderation, and cNFT
        support via DAS proofs.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/market"
          className="rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-500"
        >
          Open market
        </Link>
        <Link
          href="/create"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 font-medium text-zinc-200 hover:border-zinc-500"
        >
          Creator studio
        </Link>
      </div>
    </div>
  );
}
