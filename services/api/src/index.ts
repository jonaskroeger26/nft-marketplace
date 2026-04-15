import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { JsonDb } from "./db.js";

const db = new JsonDb();

const app = new Hono();
app.use("/*", cors({ origin: "*" }));

app.get("/health", (c) => c.json({ ok: true }));

app.get("/collections", (c) => {
  return c.json({ collections: db.submissionsApproved() });
});

app.get("/submissions", (c) => {
  return c.json({ submissions: db.submissionsAll() });
});

app.post("/submissions", async (c) => {
  const body = await c.req.json<{
    collection_mint: string;
    creator: string;
    title?: string;
    metadata_uri?: string;
  }>();
  const id = db.insertSubmission({
    collection_mint: body.collection_mint,
    creator: body.creator,
    title: body.title ?? "",
    metadata_uri: body.metadata_uri ?? "",
  });
  db.audit(body.creator, "submit", String(id), body.title ?? "");
  return c.json({ id });
});

app.post("/moderate/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    status: "approved" | "rejected" | "changes_requested";
    note?: string;
    actor?: string;
  }>();
  db.moderate(id, body.status, body.note ?? "");
  db.audit(body.actor ?? "admin", "moderate", id, body.status);
  return c.json({ ok: true });
});

app.get("/listings", (c) => {
  return c.json({ listings: db.listingsActive() });
});

app.post("/listings/sync", async (c) => {
  const body = await c.req.json<{
    mint: string;
    seller: string;
    price: string;
    currency: number;
    active: boolean;
  }>();
  db.upsertListing({
    mint: body.mint,
    seller: body.seller,
    price: body.price,
    currency: body.currency,
    active: body.active ? 1 : 0,
  });
  return c.json({ ok: true });
});

app.get("/activity", (c) => {
  return c.json({ activity: db.activity() });
});

app.post("/activity", async (c) => {
  const body = await c.req.json<{
    kind: string;
    mint?: string;
    from_addr?: string;
    to_addr?: string;
    amount?: string;
    sig?: string;
  }>();
  db.insertActivity({
    kind: body.kind,
    mint: body.mint ?? null,
    from_addr: body.from_addr ?? null,
    to_addr: body.to_addr ?? null,
    amount: body.amount ?? null,
    sig: body.sig ?? null,
  });
  return c.json({ ok: true });
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.log(`API listening on http://localhost:${port}`);
