"use client";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { TcData } from "./data";
import type { TcMeta } from "./types";

export type TcBootstrap = TcData & { meta: TcMeta };

/** What every mutation returns: `message` is the sentence the toast shows. */
export interface ActionResult {
  ok: boolean;
  message: string;
}

/* ---- request bodies, one per Pydantic model in `app/schemas/tc` and the routers ----
 *
 * Field names are the server's, snake_case and all, so a payload here can be read
 * straight against the model that receives it. Several of those models are
 * `extra="forbid"`, so an extra key is a 422 rather than something quietly dropped.
 */

/** `WorkerIn` — the wizard's final submit. Only `name` is required. */
export interface WorkerIn {
  name: string;
  draft_id?: string | null;
  job_role?: string;
  date_of_birth?: string;
  sex?: string;
  nationality?: string;
  telephone?: string;
  address_local?: string;
  address_home?: string;
  next_of_kin?: string;
  direct_employer?: string;
}

/** `DraftIn` — one save of the wizard; a draft is by definition incomplete. */
export interface DraftIn {
  step: number;
  fields: Record<string, string>;
}

/** `DraftOut` — the saved draft, whose `id` the next save is addressed to. */
export interface DraftOut {
  id: string;
  step: number;
  fields: Record<string, string>;
}

/** `MarkPayload` — a last day and why. `extra="forbid"`. */
export interface LeaverIn {
  worker_id: string;
  last_day: string;
  reason: string;
}

/** `ConfirmPayload` — four named booleans, not a dict. `extra="forbid"`. */
export interface LeaverChecks {
  final_hours_confirmed: boolean;
  card_returned: boolean;
  ppe_returned: boolean;
  accommodation_vacated: boolean;
}

/** `RequestPayload` — the ask, never a grant. `extra="forbid"`. */
export interface VisitIn {
  visitor_name: string;
  visitor_company?: string;
  purpose?: string;
  zones?: string;
  window?: string;
  host_name?: string;
}

const q = (project?: string) => (project ? `?project=${encodeURIComponent(project)}` : "");

export const getBootstrap = (project?: string) =>
  apiFetch<TcBootstrap>(`/api/v1/tc/bootstrap${q(project)}`);

/** Request helper — every JSON console mutation goes through here. */
export function mutate<T = ActionResult>(
  path: string,
  body?: unknown,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
): Promise<T> {
  return apiFetch<T>(`/api/v1${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/* ---- the two calls `apiFetch` cannot make -----------------------------------------
 *
 * `@/lib/api` hardcodes `Content-Type: application/json` on the way out and
 * `response.json()` on the way back. Document uploads are multipart and the register
 * export is CSV, so both live here rather than bending the shared helper the GC
 * console also runs on.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function raw(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    // Deliberately no Content-Type: on a FormData body the browser writes the header
    // itself, boundary and all, and setting it by hand makes the body unparseable.
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: unknown };
    // FastAPI answers a validation failure with a list of errors, not a sentence.
    const detail = typeof body.detail === "string" ? body.detail : "";
    throw new Error(detail || `Request failed with ${response.status}`);
  }
  return response;
}

/** POST a `Form(...)` + `File(...)` endpoint. Undefined fields are simply not sent. */
async function postForm(
  path: string,
  fields: Record<string, string | undefined>,
  file: File,
): Promise<ActionResult> {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) form.append(key, value);
  }
  form.append("file", file);
  return (await raw(path, { method: "POST", body: form })).json() as Promise<ActionResult>;
}

/**
 * The contractor's own actions. The server owns every toast's wording, so these
 * return `ActionResult` and the view-models never write the sentence themselves —
 * except the two endpoints that answer with something other than a sentence
 * (`DraftOut`, and the export's CSV), where the caller supplies it.
 */
export const tcApi = {
  addWorker: (body: WorkerIn) => mutate(`/tc/workers`, body),
  createDraft: (body: DraftIn) => mutate<DraftOut>(`/tc/workers/drafts`, body),
  saveDraft: (draftId: string, body: DraftIn) =>
    mutate<DraftOut>(`/tc/workers/drafts/${draftId}`, body, "PUT"),
  withdrawWorker: (workerId: string, reason: string) =>
    mutate(`/tc/workers/${workerId}/withdraw`, { reason }),
  uploadDocument: (
    file: File,
    fields: { worker_id: string; doc_type: string; doc_number?: string; expiry?: string },
  ) => postForm(`/tc/documents`, fields, file),
  resubmitDocument: (
    submissionId: string,
    file: File,
    fields: { doc_number?: string; expiry?: string },
  ) => postForm(`/tc/documents/${submissionId}/resubmit`, fields, file),
  bookInductions: (sessionId: string, workerIds: string[]) =>
    mutate(`/tc/inductions/book`, { session_id: sessionId, worker_ids: workerIds }),
  setRestDays: (workerIds: string[], restDay: string) =>
    mutate(`/tc/hours/rest-days`, { worker_ids: workerIds, rest_day: restDay }),
  recordLeaver: (body: LeaverIn) => mutate(`/tc/leavers`, body),
  confirmLeaver: (leaverId: string, checks: LeaverChecks) =>
    mutate(`/tc/leavers/${leaverId}/confirm`, checks),
  requestVisit: (body: VisitIn) => mutate(`/tc/visits/requests`, body),
  /** CSV, not JSON — the caller decides what to do with the bytes. */
  exportWorkers: async () => (await raw(`/tc/workers/export`)).blob(),
};
