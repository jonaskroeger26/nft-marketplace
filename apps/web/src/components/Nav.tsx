"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Nav() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          NFT Marketplace
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
          <Link href="/market" className="hover:text-white">
            Market
          </Link>
          <Link href="/create" className="hover:text-white">
            Create
          </Link>
          <Link href="/cart" className="hover:text-white">
            Cart
          </Link>
          <Link href="/trade" className="hover:text-white">
            Offers
          </Link>
          <Link href="/packs" className="hover:text-white">
            Packs
          </Link>
          <Link href="/admin" className="hover:text-white">
            Review
          </Link>
          <WalletMultiButton />
        </nav>
      </div>
    </header>
  );
}
