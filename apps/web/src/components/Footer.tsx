import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Marketplace",
    links: [
      { href: "/market", label: "Browse" },
      { href: "/trade", label: "Offers" },
      { href: "/cart", label: "Cart" },
      { href: "/packs", label: "Packs" },
    ],
  },
  {
    title: "Create",
    links: [
      { href: "/create", label: "Launchpad" },
      { href: "/admin", label: "Review" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "https://solana.com", label: "Solana", external: true },
      {
        href: "https://docs.solana.com",
        label: "Documentation",
        external: true,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#0b0b0b]">
      <div className="mx-auto max-w-[1400px] px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-[#e42575] to-[#9333ea] bg-clip-text text-xl font-bold text-transparent">
              NFT Marketplace
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Trade Solana NFTs with SOL &amp; SKR settlement, Jupiter routing,
              and pro trading tools.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {c.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    {l.external === true ? (
                      <a
                        href={l.href}
                        className="text-sm text-neutral-400 transition hover:text-white"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-neutral-400 transition hover:text-white"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Network
            </h3>
            <p className="mt-4 text-sm text-neutral-500">Solana</p>
            <p className="mt-1 text-xs text-neutral-600">
              Switch RPC in env for devnet / mainnet.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-neutral-600 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} NFT Marketplace · Not affiliated with Magic Eden</span>
          <div className="flex gap-6">
            <span className="text-neutral-500">Privacy</span>
            <span className="text-neutral-500">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
