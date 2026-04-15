import { PublicKey } from "@solana/web3.js";

/** Default local program id (from declare_id!) */
export const MARKETPLACE_PROGRAM_ID = new PublicKey(
  "2zNCva3rSw2MeJqjVgih445iHtxvxyymS2vaUUJ3zpPj"
);

/** Official Seeker SKR mint (verify before mainnet) */
export const SKR_MINT_MAINNET = new PublicKey(
  "SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3"
);

export const CONFIG_SEED = Buffer.from("config");
export const LISTING_SEED = Buffer.from("listing");
export const ESCROW_SEED = Buffer.from("escrow");
export const OFFER_SEED = Buffer.from("offer");
export const PACK_VAULT_SEED = Buffer.from("pack_vault");
