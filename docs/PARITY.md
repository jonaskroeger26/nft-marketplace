# Feature parity checklist (Tensor / Magic Eden–class)

Use this as a living backlog. Implemented in-repo items are marked.

## Core

- [x] Anchor marketplace: list, delist, buy SOL, buy SKR, offers (SOL), open pack
- [x] TS SDK: PDAs, ix builders, Jupiter quote, DAS helpers
- [x] API: submissions, moderation, listing cache, activity
- [x] Indexer: signature poll → activity
- [x] Web: wallet, market demo, cart multibuy, create submission, admin review, packs UI

## Trading

- [x] Multibuy / cart (multiple `buy_sol` ixs in one tx)
- [ ] Floor sweep (needs live listing feed + selection algorithm)
- [x] Offers (on-chain `make_offer_sol` / `accept_offer_sol` — wire UI)

## Settlement

- [x] SKR path (`buy_skr`)
- [x] Jupiter quote helper (swap path composed in client before buy)

## Creator / moderation

- [x] Submit collection for review (API)
- [x] Approve / reject (admin UI + API)

## cNFT / Metaplex

- [x] DAS `getAsset` / `getAssetProof` helpers (wire Bubblegum transfer + list flow)

## Charts / pro table

- [ ] Collection volume / floor charts (needs historical indexer)
- [ ] Pro table view (sortable columns)
