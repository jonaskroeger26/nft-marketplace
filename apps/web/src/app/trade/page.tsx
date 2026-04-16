"use client";

import { makeOfferSolIx } from "@nft/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { useState } from "react";
import {
  MeButton,
  MeInput,
  MeLabel,
  MePanel,
  PageShell,
} from "@/components/me/PageShell";

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
    <PageShell
      eyebrow="Trade"
      title="Offers"
      description="Collection / trait bids and floor sweeps use the same settlement stack; wire trait filters against your indexer."
    >
      <MePanel className="max-w-lg space-y-4">
        <MeLabel htmlFor="mint">NFT mint</MeLabel>
        <MeInput
          id="mint"
          className="font-mono text-xs"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          placeholder="Mint address"
        />
        <MeLabel htmlFor="offer">Offer (SOL)</MeLabel>
        <MeInput
          id="offer"
          type="number"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
        />
        <MeButton className="mt-6" onClick={sendOffer}>
          Make offer (SOL)
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
