"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8787";

type Row = {
  id: number;
  collection_mint: string;
  creator: string;
  title: string;
  status: string;
};

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const res = await fetch(`${API}/submissions`);
    const j = await res.json();
    setRows(j.submissions ?? []);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function moderate(id: number, status: Row["status"]) {
    await fetch(`${API}/moderate/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, actor: "admin-ui" }),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Review queue</h1>
      <p className="text-sm text-zinc-500">
        Approve collections before they appear in discovery (API gate).
      </p>
      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 p-3 text-sm"
          >
            <div>
              <div className="font-mono text-xs text-zinc-400">{r.collection_mint}</div>
              <div>{r.title || "(no title)"}</div>
              <div className="text-zinc-500">status: {r.status}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded bg-emerald-800 px-2 py-1 text-xs"
                onClick={() => moderate(r.id, "approved")}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded bg-red-900/60 px-2 py-1 text-xs"
                onClick={() => moderate(r.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-zinc-500">No submissions yet.</p>
        )}
      </div>
    </div>
  );
}
