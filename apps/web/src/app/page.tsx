import Link from "next/link";

const featured = [
  {
    name: "Sample collection",
    floor: "0.15",
    vol: "1.2K",
    change: "+12.4%",
    up: true,
  },
  {
    name: "SKR genesis",
    floor: "2.40",
    vol: "890",
    change: "-3.1%",
    up: false,
  },
  {
    name: "Community pass",
    floor: "0.08",
    vol: "3.4K",
    change: "+0.8%",
    up: true,
  },
  {
    name: "Metaverse land",
    floor: "12.0",
    vol: "560",
    change: "+4.2%",
    up: true,
  },
];

const movers = [
  { name: "Neon punks", change: "+42%", vol: "240 SOL", up: true },
  { name: "Pixel spirits", change: "+18%", vol: "88 SOL", up: true },
  { name: "Ocean DAO", change: "-6%", vol: "31 SOL", up: false },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#14051a]/80 to-[#0b0b0b]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(147,51,234,0.25),transparent)]" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e879f9]">
            Solana NFTs
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover &amp; trade{" "}
            <span className="bg-gradient-to-r from-[#e42575] to-[#a855f7] bg-clip-text text-transparent">
              the next wave
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-neutral-400">
            Fixed-price listings in SOL or SKR, Jupiter routing, cart multibuy,
            offers, and packs — in a marketplace UI inspired by Magic Eden.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/market"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#e42575] to-[#9333ea] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110"
            >
              Explore marketplace
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Create a collection
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Featured</h2>
            <p className="text-sm text-neutral-500">
              Curated collections — wire to your indexer
            </p>
          </div>
          <Link
            href="/market"
            className="text-sm font-medium text-[#c084fc] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (
            <Link
              key={c.name}
              href="/market"
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] transition hover:border-white/[0.14] hover:shadow-[0_0_0_1px_rgba(168,85,247,0.15)]"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-[#1f1225] via-[#111] to-[#0b0b0b]" />
              <div className="p-4">
                <div className="font-semibold text-white group-hover:text-[#e9d5ff]">
                  {c.name}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Floor</span>
                  <span className="font-mono text-white">{c.floor} SOL</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-neutral-500">24h vol</span>
                  <span className="text-neutral-300">{c.vol}</span>
                </div>
                <div
                  className={`mt-2 text-xs font-medium ${
                    c.up ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {c.change}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[#080808]">
        <div className="mx-auto max-w-[1400px] px-4 py-12">
          <h2 className="text-xl font-semibold text-white">Biggest movers</h2>
          <p className="text-sm text-neutral-500">24h · demo data</p>
          <div className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#111111]">
            {movers.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center justify-between gap-4 px-4 py-3.5 first:rounded-t-2xl last:rounded-b-2xl sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm text-neutral-600">{i + 1}</span>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#2a1a33] to-[#111]" />
                  <div>
                    <div className="font-medium text-white">{m.name}</div>
                    <div className="text-xs text-neutral-500">{m.vol}</div>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    m.up ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {m.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
