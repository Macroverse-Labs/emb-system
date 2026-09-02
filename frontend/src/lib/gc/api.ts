"use client";

import { apiFetch } from "@/lib/api";
import type { GcData } from "./data";
import type { Role, Screen } from "./types";

/** Extras the console reads that are not part of the design's own data shapes. */
export interface GcMeta {
  project: string;
  role: Role;
  onSite: number;
  planShapes: { x: number; y: number; w: number; h: number; n: string; c: string; level: string }[];
  thresholds: { k: string; v: string; sub: string }[];
  matrix: Record<string, "req" | "opt" | "na">;
  permissions: Record<string, boolean>;
  visitorProfiles: {
    n: string; kind: string; co: string; visits: string; last: string; st: string; c: string;
  }[];
}

export type Bootstrap = GcData & { meta: GcMeta };

export interface LiveTick {
  clock: string;
  onSite: number;
  moves: [string, string, string, "in" | "out"][];
}

/** What every mutation returns: `message` is the sentence the toast shows. */
export interface ActionResult {
  ok: boolean;
  message: string;
}

const q = (project?: string) => (project ? `?project=${encodeURIComponent(project)}` : "");

export const getBootstrap = (project?: string) =>
  apiFetch<Bootstrap>(`/api/v1/gc/bootstrap${q(project)}`);

export const getLive = (project?: string) => apiFetch<LiveTick>(`/api/v1/gc/live${q(project)}`);

/** POST/PUT helper — every console mutation goes through here. */
export function mutate<T = ActionResult>(
  path: string,
  body?: unknown,
  method: "POST" | "PUT" | "DELETE" = "POST",
): Promise<T> {
  return apiFetch<T>(`/api/v1${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/** Screens whose data the bootstrap payload does not fully cover on its own. */
export const gcApi = {
  approveDocument: (id: string) => mutate(`/gc/validation/${id}/approve`),
  rejectDocument: (id: string, reason: string) =>
    mutate(`/gc/validation/${id}/reject`, { reason }),
  blockWorker: (id: string, reason: string) => mutate(`/gc/workers/${id}/block`, { reason }),
  liftBlock: (id: string, reason: string) => mutate(`/gc/workers/blocks/${id}/lift`, { reason }),
  syncDevice: (id: string) => mutate(`/gc/devices/${id}/sync`),
  saveMatrix: (cells: Record<string, string>) => mutate(`/gc/rules/matrix`, { cells }, "PUT"),
  savePermissions: (cells: Record<string, boolean>) =>
    mutate(`/gc/admin/permissions`, { cells }, "PUT"),
  saveTiles: (order: string[], hidden: string[]) =>
    mutate(`/gc/admin/dashboard/tiles`, { order, hidden }, "PUT"),
  saveZone: (
    id: string,
    body: { factor: string; capacity: string; escort_required: boolean; requirements: string[] },
  ) => mutate(`/gc/zones/${id}`, body, "PUT"),
  savePlan: (level: string, shapes: unknown[]) => mutate(`/gc/plan/${level}`, { shapes }, "PUT"),
  grantVisit: (id: string, zones: string, window: string) =>
    mutate(`/gc/visits/requests/${id}/grant`, { zones, window }),
  declineVisit: (id: string, reason: string) =>
    mutate(`/gc/visits/requests/${id}/decline`, { reason }),
  saveNotifications: (cells: Record<string, boolean>) =>
    mutate(`/gc/admin/notifications`, { cells }, "PUT"),
  saveVisitorPolicy: (toggles: Record<string, boolean>, limits: Record<string, string>) =>
    mutate(`/gc/visitors/policy`, { toggles, limits }, "PUT"),
};

export type ScreenName = Screen;
