import type { GcData } from "@/lib/gc/data";
import type { PlanShape, Role, RuleValue, Screen } from "@/lib/gc/types";

/**
 * The console's whole state bag — a port of the `state = {...}` initialiser in
 * `GC Console HiFi M3.dc.html` (line 1439), plus the keys the design adds lazily
 * via `setState` further down (zoneCfg, coSel, visDrop, pol, perm, chan, ...).
 *
 * One flat object, exactly as the prototype has it: every screen reads and writes
 * the same bag, and cross-screen jumps like `go('workers', {q: name})` depend on it.
 */
export interface GcState {
  screen: Screen;
  q: string;
  filter: string;
  sort: string;
  dir: 1 | -1;
  sel: number[];
  workerId: number;
  wtab: string;
  vqIdx: number;
  vqDone: Record<string, "approved" | "rejected">;
  vqReason: string;
  palette: boolean;
  pq: string;
  toast: string | null;
  modal: string | null;
  drawer: string | null;
  tick: number;
  onSite: number;
  clock: string;
  moves: { t: string; n: string; g: string; d: "in" | "out" }[] | null;
  rules: Record<string, RuleValue> | null;
  zoneSel: string;
  shapes: PlanShape[] | null;
  draw: { x0: number; y0: number; x1: number; y1: number } | null;
  logQ: string;
  logFilter: string;
  alertTab: string;
  visSel: number;
  visApproved: Record<string, boolean>;
  form: string | null;
  tileOrder: string[] | null;
  matrixSel: string | null;
  planLevel: string;
  keyBuf: string;
  proj: string;
  projOpen: boolean;
  /** Sign-in form. The design hardcodes these; here they drive a real login. */
  siEmail: string;
  siPassword: string;
  siBusy: boolean;
  siError: string | null;
  /** Added by later setState calls in the design. */
  zoneCfg?: Record<string, ZoneCfg>;
  shapeSel?: number | null;
  coSel?: number;
  vtTab?: string;
  visDrop?: Record<string, boolean>;
  pol?: Record<string, boolean>;
  perm?: Record<string, boolean>;
  chan?: Record<string, boolean>;
  tileHidden?: Record<string, boolean>;
  openGroup?: string | null;
}

/** Per-zone overrides made in the zone builder. */
export interface ZoneCfg {
  fa: string;
  cap: string;
  escort: boolean;
  reqs: string[];
}

/**
 * What every view-model is handed. Mirrors the prototype's `this` — state, the
 * setState/go/toast helpers, and the signed-in role that gates the nav.
 */
export interface GcCtx {
  s: GcState;
  set: (patch: Partial<GcState>) => void;
  go: (screen: Screen, extra?: Partial<GcState>) => void;
  toast: (msg: string) => void;
  role: Role;
  /** This project's data — the fixtures until `/gc/bootstrap` answers, then the API's. */
  data: GcData;
  /** Real authentication behind the design's sign-in screen and sign-out button. */
  auth: {
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
  };
  /** How a mutation reaches the API. */
  actions: GcActions;
}

export interface GcActions {
  /**
   * Runs a console mutation, shows whatever the server says it did, and refreshes.
   *
   * The design writes each toast as a statement of fact ("… — contractors notified"),
   * so the server owns the wording: `offlineMessage` is only used when the console is
   * running on the bundled fixtures with no API behind it.
   */
  run: (call: () => Promise<{ message: string }>, offlineMessage: string) => void;
  /** False when the console is running on fixtures, so mutations are simulated. */
  live: boolean;
}

export const INITIAL_STATE: GcState = {
  screen: "dashboard",
  q: "",
  filter: "all",
  sort: "name",
  dir: 1,
  sel: [],
  workerId: 0,
  wtab: "overview",
  vqIdx: 0,
  vqDone: {},
  vqReason: "",
  palette: false,
  pq: "",
  toast: null,
  modal: null,
  drawer: null,
  tick: 0,
  onSite: 1132,
  clock: "08:41",
  moves: null,
  rules: null,
  zoneSel: "a3",
  shapes: null,
  draw: null,
  logQ: "",
  logFilter: "all",
  alertTab: "all",
  visSel: 0,
  visApproved: {},
  form: null,
  tileOrder: null,
  matrixSel: null,
  planLevel: "L1",
  keyBuf: "",
  proj: "EMB1A",
  projOpen: false,
  siEmail: "gc@mail.com",
  siPassword: "",
  siBusy: false,
  siError: null,
};
