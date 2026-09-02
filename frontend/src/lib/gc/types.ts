/**
 * Shapes for the GC console.
 *
 * The tuple types mirror the positional arrays in `GC Console HiFi M3.dc.html`
 * exactly, so the design's data can be transcribed without reshaping it. The
 * view-models (`src/components/gc/vm/*`) are what turn tuples into named fields.
 */

export type Screen =
  | "dashboard"
  | "alerts"
  | "tvboard"
  | "workers"
  | "worker"
  | "validation"
  | "inductions"
  | "violations"
  | "blocks"
  | "companies"
  | "zones"
  | "plan"
  | "gates"
  | "rules"
  | "devices"
  | "vrequests"
  | "vtoday"
  | "vrecord"
  | "vblocked"
  | "vpolicy"
  | "log"
  | "reports"
  | "reportout"
  | "audit"
  | "users"
  | "tcaccounts"
  | "refdata"
  | "notifications"
  | "tiles"
  | "signin";

export type Role = "GC administrator" | "GC user" | "Security" | "Trade contractor";

export type WorkerStatus =
  | "cleared"
  | "expiring"
  | "expired"
  | "blocked"
  | "pending"
  | "draft"
  | "review";

export type DocStatus = "valid" | "expiring" | "expired" | "na" | "none";
export type DeviceStatus = "online" | "4g" | "battery" | "offline";
export type VisitorState = "expected" | "onsite" | "overstay" | "left";
export type AlertKind =
  | "expiry"
  | "hours"
  | "device"
  | "validation"
  | "block"
  | "inactive"
  | "visitor";

/** A label + colour pair, the design's universal way of rendering a status. */
export interface StatusStyle {
  l: string;
  c: string;
}

/** name, worker id, contractor, trade, status, zones, on site, last event, nationality, row id */
export type WorkerRow = [
  string,
  string,
  string,
  string,
  WorkerStatus,
  string,
  0 | 1,
  string,
  string,
  string?,
];
/**
 * The trailing `id` is present only when the rows came from the API; the design's
 * own fixtures have none, and the offline console never calls a mutation.
 */


/** contractor, on register, on site, flag */
export type ContractorLoad = [string, number, number, string];

/** kind, title, subtitle, count badge, colour, screen it resolves on */
export type AlertRow = [AlertKind, string, string, string, string, Screen];

/** time, worker, gate, direction */
export type MoveRow = [string, string, string, "in" | "out"];

/** hour label, entry count */
export type HourBucket = [string, number];

/** screen, label, badge, Material Symbols icon name */
export type NavItem = [Screen, string, string, string];
/** label, items, group icon, static (renders as a plain heading rather than a toggle) */
export type NavGroup = [string, NavItem[], string, boolean?];

/** code, name, badge, meta line */
export type ProjectRow = [string, string, string, string];

/** id, name, kind, depth, population, factor requirement */
export type ZoneRow = [string, string, string, number, number, string, string?];
/**
 * The trailing `id` is present only when the rows came from the API; the design's
 * own fixtures have none, and the offline console never calls a mutation.
 */


/** id, kind, location, zone, status, link, buffered events, last sync, factor */
export type DeviceRow = [
  string,
  string,
  string,
  string,
  DeviceStatus,
  string,
  string,
  string,
  string,
  string?,
];
/**
 * The trailing `id` is present only when the rows came from the API; the design's
 * own fixtures have none, and the offline console never calls a mutation.
 */


/** name, trade, on register, on site, kind, contact, insurance expiry, flag */
export type CompanyRow = [string, string, number, number, string, string, string, string];

/** id, when, where, by, capacity, booked, state */
export type SessionRow = [string, string, string, string, number, number, string];

/** date, worker, contractor, what, recorded by, level, colour */
export type ViolationRow = [string, string, string, string, string, string, string];

/** worker, contractor, kind, reason, when, route back, colour */
export type BlockRow = [string, string, string, string, string, string, string, string?];
/**
 * The trailing `id` is present only when the rows came from the API; the design's
 * own fixtures have none, and the offline console never calls a mutation.
 */


/** visitor, kind, requested by, purpose, zones, window, age, whose host */
export type VisitRequestRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  "me" | "other",
  string?,
];
/**
 * The trailing `id` is present only when the rows came from the API; the design's
 * own fixtures have none, and the offline console never calls a mutation.
 */


/** visitor, kind, host, zones, window, state, last event */
export type VisitorTodayRow = [string, string, string, string, string, VisitorState, string];

/** time, person, company, device, direction, verdict, note */
export type LogRow = [string, string, string, string, "in" | "out", "pass" | "deny", string];

/** when, who, role, what changed, object, from, to */
export type AuditRow = [string, string, string, string, string, string, string];

/** name, role, company, last seen, rights scope */
export type UserRow = [string, Role, string, string, string];

/** company, contact, email, status, last seen, user count */
export type TcAccountRow = [string, string, string, string, string, number];

/** list name, comma-joined values, count */
export type RefDataRow = [string, string, number];

/** event, when it fires, who hears it */
export type NotifRow = [string, string, string];

/** One document awaiting validation, with the fields read off the scan. */
export interface SubmissionRow {
  id: string;
  w: string;
  co: string;
  doc: string;
  no: string;
  exp: string;
  iss: string;
  sub: string;
  fields: [string, string][];
  flags: string[];
}

/** A worker document as shown on the profile and in the validation queue. */
export interface WorkerDoc {
  t: string;
  no: string;
  exp: string;
  st: DocStatus;
  prov: string;
}

/** A training course held (or not held) by a worker. */
export interface TrainingRecord {
  t: string;
  st: DocStatus;
  exp: string;
}

/** A worker after the tuple has been given names. */
export interface Worker {
  i: number;
  n: string;
  id: string;
  co: string;
  role: string;
  st: WorkerStatus;
  zones: string;
  on: 0 | 1;
  seen: string;
  nat: string;
  /** Present only when the row came from the API. */
  rowId?: string;
}

/** A rectangle drawn on a level's plan and bound to a zone. */
export interface PlanShape {
  x: number;
  y: number;
  w: number;
  h: number;
  n: string;
  c: string;
}

/** Whether a requirement is required, advisory, or not applicable in a zone. */
export type RuleValue = "req" | "opt" | "na";
