/**
 * Shapes for the TC (trade contractor) console.
 *
 * The tuple types mirror the positional arrays in `TC Console HiFi M3.dc.html`
 * exactly, so the design's data can be transcribed without reshaping it. The
 * view-models (`src/components/tc/vm/*`) are what turn tuples into named fields.
 *
 * Sibling of `src/lib/gc/types.ts`; the two consoles are separate ports of separate
 * canvases and deliberately do not share row shapes.
 */

/** The design's `startScreen` enum, plus the sign-in door the canvas does not draw. */
export type TcScreen =
  | "home"
  | "workers"
  | "worker"
  | "add"
  | "docs"
  | "training"
  | "hours"
  | "inductions"
  | "inactive"
  | "leavers"
  | "visitors"
  | "signin";

/**
 * Rows whose screen fires a mutation carry their database id as TRAILING elements,
 * appended by `/tc/bootstrap` — the view-models index these tuples from the front, so
 * an append is free and a reorder is not.
 *
 * Every appended id is optional, because `fixtures.ts` feeds these same types when the
 * console runs offline and the design's data has no database behind it. A call site
 * with no id degrades to the offline message instead of firing a doomed request; this
 * is the convention `src/lib/gc/types.ts` uses for its own trailing ids.
 */

/** `W` — one row of the worker register. */
export type TcWorkerRow = [
  name: string,
  ref: string,
  role: string,
  employer: string,
  access: AccessState,
  doc: DocState,
  lastSeen: string,
  workerId?: string,
];

/** Keys of the design's `ACC` map — the only two things that stop a worker at the gate. */
export type AccessState = "onsite" | "allowed" | "blocked" | "pending" | "inactive" | "left";

/** Keys of the design's `DOC` map. */
export type DocState = "valid" | "rejected" | "expiring" | "awaiting" | "archived";

/** `ACC` values — label plus the chip's foreground and background. */
export interface AccessStyle {
  l: string;
  fg: string;
  bg: string;
}

/** `DOC` values — label plus its colour. */
export interface DocStyle {
  l: string;
  c: string;
}

/** `PROJECTS` — the sidebar's project switcher. */
export type TcProjectRow = [code: string, name: string, badge: string, meta: string];

/** `NAV` items: the screen, its label, a badge count (may be `""`), a Material icon. */
export type TcNavItem = [screen: TcScreen, label: string, badge: string, icon: string];
export type TcNavGroup = [label: string, items: TcNavItem[]];

/** `DOCQ` — one card in the Documents queue. Named fields in the design, not a tuple. */
export interface TcDocRow {
  /**
   * React key only. It is a `DocumentSubmission.id` on `grp:"rej"` rows but a
   * `WorkerDocument.id` on the others, so it is not addressable on its own.
   */
  id: string;
  /** The worker the card is about — the route for a fresh upload. */
  workerId?: string;
  /**
   * Set only when the card really is a submission, i.e. `grp:"rej"`. `null` on
   * `grp:"exp"` / `"gone"`: there is nothing to resubmit, so those take a fresh
   * upload instead — `POST /tc/documents/{id}/resubmit` would 404 on them.
   */
  submissionId?: string | null;
  /** Worker name. */
  n: string;
  /** Document type, title case. */
  doc: string;
  /** The upper-case strapline under the name. */
  d: string;
  /** Age of the item ("2 d"), or "—" when the clock has already run out. */
  when: string;
  /** Which of the three consequence groups it sits in. */
  grp: "rej" | "exp" | "gone";
  no: string;
  exp: string;
  file: string;
  reason: string;
  head: string;
  st: string;
  days: string;
  /** Progress-bar width, e.g. `"64%"`. */
  pct: string;
}

/** `TRROWS` — a training-matrix row; the cells line up with `TRCOLS`. */
export type TcTrainingRow = [name: string, role: string, cells: string[], workerId?: string];

/** One of this contractor's seats on a session. A camelCase object, not a tuple. */
export interface TcInductionAttendee {
  id: string;
  worker: string;
  status: string;
  /** Hex, straight from the design's palette. */
  colour: string;
}

/**
 * A bookable induction sitting.
 *
 * The design draws a fictional Mon–Fri slot grid; this is the real thing behind it.
 * `id` is what `POST /tc/inductions/book` takes — the console has no other way to
 * name a session, which is why the booking screen was inert before this existed.
 *
 * Sessions are project-wide because the GC runs them; `attendance` is only ever this
 * contractor's own seats.
 */
export interface TcInductionSession {
  id: string;
  ref: string;
  when: string;
  where: string;
  runBy: string;
  capacity: number;
  booked: number;
  /** Clamped to >= 0 by the API. Zero, or a state other than `open`, means unbookable. */
  remaining: number;
  state: string;
  attendance: TcInductionAttendee[];
}

/** `HR` — one row of Hours & days. */
export type TcHoursRow = [
  name: string,
  role: string,
  pct: number,
  hours: string,
  days: string,
  warned: 0 | 1,
  flag: string,
  workerId?: string,
];

/** `IA` — one row of Inactive workers, and the 31-day clock. */
export type TcInactiveRow = [
  name: string,
  lastSeen: string,
  days: number,
  blockDue: string,
  warnings: string,
  /** 0 = fine, 1 = due to block, 2 = already blocked. */
  level: 0 | 1 | 2,
  workerId?: string,
];

/** `LV` — one row of Leavers. */
export type TcLeaverRow = [
  name: string,
  lastDay: string,
  reason: string,
  card: string,
  hours: string,
  status: string,
  /** 0 = settled, 1 = action due, 2 = blocking. */
  level: 0 | 1 | 2,
  meta: string,
  leaverId?: string,
  workerId?: string,
];

/** `VR` — one Visitor request. An ask, not a grant. */
export type TcVisitorRow = [
  kind: string,
  company: string,
  purpose: string,
  window: string,
  host: string,
  status: string,
  colour: string,
  note: string,
  /** 1 when this contractor raised it. */
  mine: 0 | 1,
  requestId?: string,
];

/** `AWSTEPS` — the Add-a-worker wizard's five steps. */
export type TcWizardStep = [label: string, sub: string];

/** `AWFIELDS` entries — label, current value, placeholder. A value or a placeholder, not both. */
export type TcWizardField = [label: string, value: string, placeholder: string];

/**
 * Everything the console needs for one contractor on one project.
 *
 * Deliberately the same shapes the design uses, so `GET /api/v1/tc/bootstrap` can be
 * dropped in where the fixtures were without touching a view-model or a screen.
 */
export interface TcData {
  projects: TcProjectRow[];
  workers: TcWorkerRow[];
  docQueue: TcDocRow[];
  trainingColumns: string[];
  training: TcTrainingRow[];
  inductionSessions: TcInductionSession[];
  hours: TcHoursRow[];
  inactive: TcInactiveRow[];
  leavers: TcLeaverRow[];
  visitorRequests: TcVisitorRow[];
}

/** Extras the console reads that are not part of the design's own data shapes. */
export interface TcMeta {
  /** The signed-in contractor's company, shown at the top of the sidebar. */
  company: string;
  /** The active project code, e.g. `"EMB1A"`. */
  project: string;
  /** Badge on the topbar's notification bell. */
  notifications: number;
  /** Register and on-site counts for the sidebar badge and the Home tiles. */
  onRegister: number;
  onSite: number;
  /** Which of this contractor's actions the rights grid actually permits. */
  permissions: Record<string, boolean>;
}
