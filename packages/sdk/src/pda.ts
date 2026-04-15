import { PublicKey } from "@solana/web3.js";
import {
  CONFIG_SEED,
  ESCROW_SEED,
  LISTING_SEED,
  MARKETPLACE_PROGRAM_ID,
  OFFER_SEED,
  PACK_VAULT_SEED,
} from "./constants.js";

export function configPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([CONFIG_SEED], MARKETPLACE_PROGRAM_ID);
}

export function listingPda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [LISTING_SEED, mint.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
}

export function escrowAuthPda(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [ESCROW_SEED, mint.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
}

export function offerPda(mint: PublicKey, buyer: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [OFFER_SEED, mint.toBuffer(), buyer.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
}

export function packVaultPda(packMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [PACK_VAULT_SEED, packMint.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  );
}
