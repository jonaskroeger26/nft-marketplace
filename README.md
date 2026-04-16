# NFT Marketplace (Solana)

Tensor / Magic Eden–style surface: listings (SOL + SKR), Jupiter swap path, cart multibuy, offers, packs, creator submissions with a review API, indexer stub, and Anchor program.

## Structure

- `programs/marketplace` — Anchor program (list, delist, buy SOL/SKR, offers, open pack).
- `packages/sdk` — TypeScript helpers (PDAs, instructions, Jupiter quote, DAS helpers).
- `apps/web` — Next.js UI (wallet, market, cart, create, admin, packs).
- `services/api` — Hono + JSON file store under `.data/` (submissions, moderation, listing cache, activity).
- `services/indexer` — Polls program signatures and posts activity to the API.

## Prerequisites

- Node 20+, npm
- Rust + Anchor CLI (for on-chain builds). This repo pins Anchor `0.28.0` in `Anchor.toml` to match the program.

### Anchor / SBF build notes

Solana’s `cargo-build-sbf` may ship with a Cargo that cannot parse newer crates.io manifests (`edition2024`). If `anchor build` fails while downloading crates, either upgrade Solana platform tools or run the helper script once (local dev only):

```bash
./scripts/patch-cargo-edition-2024.sh
```

Then:

```bash
anchor build --no-idl --skip-lint
```

Pin `unicode-segmentation` in the workspace lockfile if needed:

```bash
cargo update -p unicode-segmentation --precise 1.12.0
```

## Quick start

**Run every command from the project root** (the folder that contains `package.json`), not from `~`.

If the project is on your Desktop:

```bash
cd "/Users/jonaskroeger/Desktop/NFT Marketplace"
```

If you only have the GitHub clone elsewhere:

```bash
git clone https://github.com/jonaskroeger26/nft-marketplace.git
cd nft-marketplace
```

Then:

```bash
npm install
npm run build -w @nft/sdk
npm run dev:api
npm run dev:web
```

Anchor program (optional; requires Rust + Anchor):

```bash
cd "/Users/jonaskroeger/Desktop/NFT Marketplace"   # same project root
npm run anchor:build
```

Set `NEXT_PUBLIC_API_URL` for the web app to reach the API. Use `NEXT_PUBLIC_SOLANA_RPC` (e.g. Helius devnet/mainnet).

## Environment

See `.env.example`.

## License

MIT
