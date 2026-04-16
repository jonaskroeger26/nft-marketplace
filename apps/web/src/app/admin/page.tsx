"use client";

import { useEffect, useState } from "react";
import { MePanel, PageShell } from "@/components/me/PageShell";

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
    <PageShell
      eyebrow="Admin"
      title="Review queue"
      description="Approve collections before they appear in discovery (API gate)."
    >
      <div className="space-y-3">
        {rows.map((r) => (
          <MePanel key={r.id} className="!p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-mono text-xs text-neutral-500">
                  {r.collection_mint}
                </div>
                <div className="mt-1 font-medium text-white">
                  {r.title || "(no title)"}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  status: {r.status}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                  onClick={() => moderate(r.id, "approved")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-600/70 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
                  onClick={() => moderate(r.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </div>
          </MePanel>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-neutral-500">No submissions yet.</p>
        )}
      </div>
    </PageShell>
  );
}
