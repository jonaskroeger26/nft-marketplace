import { Buffer } from "buffer";
import {
  AccountMeta,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { MARKETPLACE_PROGRAM_ID } from "./constants.js";
import {
  configPda,
  escrowAuthPda,
  listingPda,
  offerPda,
  packVaultPda,
} from "./pda.js";

function disc(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

const IX = {
  init_config: disc("17eb73e8a86001e7"),
  list: disc("36aec14311298426"),
  delist: disc("3788cd6b6bad041f"),
  buy_sol: disc("ce3b7d1ecaf86f31"),
  buy_skr: disc("ac5429b409838680"),
  make_offer_sol: disc("948309f14fa92087"),
  accept_offer_sol: disc("13753f5bdaaefd06"),
  open_pack: disc("4bcb90413ffd6755"),
};

function u16le(n: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}

function u64le(n: bigint | number): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(n), 0);
  return b;
}

export function initConfigIx(params: {
  authority: PublicKey;
  treasury: PublicKey;
  feeBps: number;
  skrMint: PublicKey;
}): TransactionInstruction {
  const [config] = configPda();
  const data = Buffer.concat([
    IX.init_config,
    u16le(params.feeBps),
    params.skrMint.toBuffer(),
  ]);
  return new TransactionInstruction({
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: params.authority, isSigner: true, isWritable: true },
      { pubkey: params.treasury, isSigner: false, isWritable: false },
      { pubkey: config, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function listNftIx(params: {
  seller: PublicKey;
  nftMint: PublicKey;
  price: bigint;
  currency: 0 | 1;
}): TransactionInstruction {
  const [listing] = listingPda(params.nftMint);
  const [escrowAuth] = escrowAuthPda(params.nftMint);
  const sellerAta = getAssociatedTokenAddressSync(
    params.nftMint,
    params.seller,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const escrowAta = getAssociatedTokenAddressSync(
    params.nftMint,
    escrowAuth,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const data = Buffer.concat([
    IX.list,
    u64le(params.price),
    Buffer.from([params.currency]),
  ]);
  const keys: AccountMeta[] = [
    { pubkey: params.seller, isSigner: true, isWritable: true },
    { pubkey: params.nftMint, isSigner: false, isWritable: false },
    { pubkey: sellerAta, isSigner: false, isWritable: true },
    { pubkey: escrowAuth, isSigner: false, isWritable: false },
    { pubkey: escrowAta, isSigner: false, isWritable: true },
    { pubkey: listing, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];
  return new TransactionInstruction({
    programId: MARKETPLACE_PROGRAM_ID,
    keys,
    data,
  });
}

export function buySolIx(params: {
  buyer: PublicKey;
  nftMint: PublicKey;
  seller: PublicKey;
  treasury: PublicKey;
}): TransactionInstruction {
  const [config] = configPda();
  const [listing] = listingPda(params.nftMint);
  const [escrowAuth] = escrowAuthPda(params.nftMint);
  const escrowAta = getAssociatedTokenAddressSync(
    params.nftMint,
    escrowAuth,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const buyerAta = getAssociatedTokenAddressSync(
    params.nftMint,
    params.buyer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return new TransactionInstruction({
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: params.buyer, isSigner: true, isWritable: true },
      { pubkey: params.nftMint, isSigner: false, isWritable: false },
      { pubkey: listing, isSigner: false, isWritable: true },
      { pubkey: params.seller, isSigner: false, isWritable: true },
      { pubkey: params.treasury, isSigner: false, isWritable: true },
      { pubkey: escrowAuth, isSigner: false, isWritable: false },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: buyerAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: IX.buy_sol,
  });
}

export function buySkrIx(params: {
  buyer: PublicKey;
  nftMint: PublicKey;
  seller: PublicKey;
  treasury: PublicKey;
  skrMint: PublicKey;
}): TransactionInstruction {
  const [config] = configPda();
  const [listing] = listingPda(params.nftMint);
  const [escrowAuth] = escrowAuthPda(params.nftMint);
  const escrowAta = getAssociatedTokenAddressSync(
    params.nftMint,
    escrowAuth,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const buyerAta = getAssociatedTokenAddressSync(
    params.nftMint,
    params.buyer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const sellerSkr = getAssociatedTokenAddressSync(
    params.skrMint,
    params.seller,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const buyerSkr = getAssociatedTokenAddressSync(
    params.skrMint,
    params.buyer,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const treasurySkr = getAssociatedTokenAddressSync(
    params.skrMint,
    params.treasury,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return new TransactionInstruction({
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: config, isSigner: false, isWritable: false },
      { pubkey: params.buyer, isSigner: true, isWritable: true },
      { pubkey: params.nftMint, isSigner: false, isWritable: false },
      { pubkey: listing, isSigner: false, isWritable: true },
      { pubkey: params.seller, isSigner: false, isWritable: true },
      { pubkey: params.treasury, isSigner: false, isWritable: true },
      { pubkey: params.skrMint, isSigner: false, isWritable: false },
      { pubkey: buyerSkr, isSigner: false, isWritable: true },
      { pubkey: sellerSkr, isSigner: false, isWritable: true },
      { pubkey: treasurySkr, isSigner: false, isWritable: true },
      { pubkey: escrowAuth, isSigner: false, isWritable: false },
      { pubkey: escrowAta, isSigner: false, isWritable: true },
      { pubkey: buyerAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: IX.buy_skr,
  });
}

export function makeOfferSolIx(params: {
  buyer: PublicKey;
  nftMint: PublicKey;
  offerPrice: bigint;
  expiryTs: bigint;
}): TransactionInstruction {
  const [offer] = offerPda(params.nftMint, params.buyer);
  const data = Buffer.concat([
    IX.make_offer_sol,
    u64le(params.offerPrice),
    u64le(params.expiryTs),
  ]);
  return new TransactionInstruction({
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: params.buyer, isSigner: true, isWritable: true },
      { pubkey: params.nftMint, isSigner: false, isWritable: false },
      { pubkey: offer, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export function openPackIx(params: {
  holder: PublicKey;
  packMint: PublicKey;
  rewardMint: PublicKey;
}): TransactionInstruction {
  const [packVault] = packVaultPda(params.packMint);
  const holderPackAta = getAssociatedTokenAddressSync(
    params.packMint,
    params.holder,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const rewardAta = getAssociatedTokenAddressSync(
    params.rewardMint,
    params.holder,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return new TransactionInstruction({
    programId: MARKETPLACE_PROGRAM_ID,
    keys: [
      { pubkey: params.holder, isSigner: true, isWritable: true },
      { pubkey: params.packMint, isSigner: false, isWritable: true },
      { pubkey: holderPackAta, isSigner: false, isWritable: true },
      { pubkey: packVault, isSigner: false, isWritable: false },
      { pubkey: params.rewardMint, isSigner: false, isWritable: true },
      { pubkey: rewardAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: IX.open_pack,
  });
}

/** Compose multiple buy SOL ixs for cart / multibuy (one tx if size allows). */
export function buySolMany(
  items: Array<{
    buyer: PublicKey;
    nftMint: PublicKey;
    seller: PublicKey;
    treasury: PublicKey;
  }>
): TransactionInstruction[] {
  return items.map((p) => buySolIx(p));
}
