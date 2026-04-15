import path from "node:path";
import fs from "node:fs";

type Submission = {
  id: number;
  collection_mint: string;
  creator: string;
  title: string;
  metadata_uri: string;
  status: string;
  moderator_note: string;
  created_at: string;
  updated_at: string;
};

type ListingRow = {
  mint: string;
  seller: string;
  price: string;
  currency: number;
  active: number;
  updated_at: string;
};

type ActivityRow = {
  id: number;
  kind: string;
  mint: string | null;
  from_addr: string | null;
  to_addr: string | null;
  amount: string | null;
  sig: string | null;
  created_at: string;
};

type AuditRow = {
  id: number;
  actor: string | null;
  action: string;
  target_id: string | null;
  detail: string | null;
  created_at: string;
};

type Store = {
  submissions: Submission[];
  listings_cache: ListingRow[];
  activity: ActivityRow[];
  audit_log: AuditRow[];
  _nextId: { submission: number; activity: number; audit: number };
};

function emptyStore(): Store {
  return {
    submissions: [],
    listings_cache: [],
    activity: [],
    audit_log: [],
    _nextId: { submission: 1, activity: 1, audit: 1 },
  };
}

export class JsonDb {
  private path: string;
  private data: Store;

  constructor(dir = process.env.DATA_DIR ?? ".data") {
    fs.mkdirSync(dir, { recursive: true });
    this.path = path.join(dir, "marketplace.json");
    if (fs.existsSync(this.path)) {
      this.data = JSON.parse(
        fs.readFileSync(this.path, "utf8")
      ) as Store;
      if (!this.data._nextId) {
        this.data._nextId = {
          submission:
            1 +
            Math.max(0, ...this.data.submissions.map((s) => s.id)),
          activity:
            1 + Math.max(0, ...this.data.activity.map((a) => a.id)),
          audit:
            1 + Math.max(0, ...this.data.audit_log.map((a) => a.id)),
        };
      }
    } else {
      this.data = emptyStore();
      this.flush();
    }
  }

  flush() {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  submissionsApproved() {
    return this.data.submissions.filter((s) => s.status === "approved");
  }

  submissionsAll() {
    return [...this.data.submissions].sort((a, b) => b.id - a.id);
  }

  insertSubmission(
    row: Pick<
      Submission,
      "collection_mint" | "creator" | "title" | "metadata_uri"
    >
  ) {
    const id = this.data._nextId.submission++;
    const now = new Date().toISOString();
    const s: Submission = {
      id,
      ...row,
      status: "pending",
      moderator_note: "",
      created_at: now,
      updated_at: now,
    };
    this.data.submissions.push(s);
    this.flush();
    return id;
  }

  moderate(id: string, status: string, note: string) {
    const row = this.data.submissions.find((s) => String(s.id) === id);
    if (!row) return false;
    row.status = status;
    row.moderator_note = note;
    row.updated_at = new Date().toISOString();
    this.flush();
    return true;
  }

  listingsActive() {
    return this.data.listings_cache.filter((l) => l.active === 1);
  }

  upsertListing(row: Omit<ListingRow, "updated_at">) {
    const i = this.data.listings_cache.findIndex((l) => l.mint === row.mint);
    const u = new Date().toISOString();
    if (i >= 0) {
      this.data.listings_cache[i] = { ...row, updated_at: u };
    } else {
      this.data.listings_cache.push({ ...row, updated_at: u });
    }
    this.flush();
  }

  activity(limit = 200) {
    return [...this.data.activity]
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }

  insertActivity(
    row: Omit<ActivityRow, "id" | "created_at">
  ) {
    const id = this.data._nextId.activity++;
    const r: ActivityRow = {
      id,
      ...row,
      created_at: new Date().toISOString(),
    };
    this.data.activity.push(r);
    this.flush();
  }

  audit(actor: string | undefined, action: string, target: string | undefined, detail: string | undefined) {
    const id = this.data._nextId.audit++;
    this.data.audit_log.push({
      id,
      actor: actor ?? null,
      action,
      target_id: target ?? null,
      detail: detail ?? null,
      created_at: new Date().toISOString(),
    });
    this.flush();
  }
}
