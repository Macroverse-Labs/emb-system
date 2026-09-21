import type { TcData } from "@/lib/tc/data";
import type { TcMeta, TcScreen } from "@/lib/tc/types";

/**
 * The console's whole state bag — a port of the `state = {...}` initialiser in
 * `TC Console HiFi M3.dc.html`, plus the sign-in form the canvas does not draw.
 *
 * One flat object, exactly as the prototype has it: every screen reads and writes
 * the same bag, and cross-screen jumps like `go('workers', {q: name})` depend on it.
 */
export interface TcState {
  screen: TcScreen;
  q: string;
  filter: string;
  sort: string;
  dir: 1 | -1;
  sel: number[];
  workerId: number;
  wtab: string;
  awStep: number;
  /**
   * The Add-a-worker wizard's own values, keyed by `AWKEYS` in `vm1.ts` — the design's
   * `AWFIELDS` is display data, this is what is actually typed and submitted.
   */
  awFields: Record<string, string>;
  /** The draft those values are saved in. Null until the first save creates one. */
  awDraftId: string | null;
  dqId: string;
  dqTab: string;
  /** The replacement scan picked on the Documents queue, awaiting `dqSubmit`. */
  dqScan: File | null;
  indSel: number[];
  indSlot: string;
  iaSel: number[];
  iaChoice: number;
  lvTab: string;
  lvId: number;
  /**
   * Index into `data.workers` of the worker being off-boarded, or null when the panel
   * is showing an existing leaver row. `POST /tc/leavers` needs a worker who is not
   * off-boarding yet, so marking a leaver reads this, never `lvId`.
   */
  lvWorkerId: number | null;
  /** The typed last day. Null means "follow whatever the panel is showing". */
  lvDay: string | null;
  lvReason: string;
  /** Four 0/1 flags on the leaver checklist. */
  lvChecks: number[];
  vrTab: string;
  vrZones: number[];
  /** The visitor request form. `RequestPayload` takes these six and forbids extras. */
  vrName: string;
  vrCompany: string;
  vrPurpose: string;
  vrDay: string;
  vrWindow: string;
  vrHost: string;
  proj: string;
  projOpen: boolean;
  toast: string | null;
  /** Sign-in form. The design has no door; here it drives a real login. */
  siEmail: string;
  siPassword: string;
  siBusy: boolean;
  siError: string | null;
}

/**
 * What every view-model is handed. Mirrors the prototype's `this` — state, the
 * setState/go/toast helpers, and the contractor's own data.
 */
export interface TcCtx {
  s: TcState;
  set: (patch: Partial<TcState>) => void;
  go: (screen: TcScreen, extra?: Partial<TcState>) => void;
  toast: (msg: string) => void;
  /** This project's data — the fixtures until `/tc/bootstrap` answers, then the API's. */
  data: TcData;
  /** Extras the API adds on top of the design's own shapes. Null on fixtures. */
  meta: TcMeta | null;
  /** Real authentication behind the sign-in screen and the sign-out button. */
  auth: {
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
  };
  /** How a mutation reaches the API. */
  actions: TcActions;
}

export interface TcActions {
  /**
   * Runs a console mutation, shows whatever the server says it did, and refreshes.
   *
   * The design writes each toast as a statement of fact, so the server owns the
   * wording: `offlineMessage` is only used when the console is running on the
   * bundled fixtures with no API behind it.
   */
  run: (call: () => Promise<{ message: string }>, offlineMessage: string) => void;
  /** False when the console is running on fixtures, so mutations are simulated. */
  live: boolean;
}

/**
 * Fire `call` only when the row it addresses actually carries a database id.
 *
 * On the bundled fixtures there is none, so the mutation degrades to the design's own
 * sentence — the same thing `actions.run` does with no API behind it — rather than
 * sending a request that is certain to 404.
 */
export function withId<T>(
  ctx: TcCtx,
  id: T | null | undefined,
  call: (id: T) => Promise<{ message: string }>,
  offlineMessage: string,
): void {
  if (id === null || id === undefined || id === "") {
    ctx.toast(offlineMessage);
    return;
  }
  ctx.actions.run(() => call(id), offlineMessage);
}

export const INITIAL_STATE: TcState = {
  screen: "home",
  q: "",
  filter: "all",
  sort: "name",
  dir: 1,
  sel: [],
  workerId: 0,
  wtab: "documents",
  awStep: 3,
  awFields: {},
  awDraftId: null,
  dqId: "d1",
  dqTab: "rejected",
  dqScan: null,
  indSel: [0, 1, 2],
  // An InductionSession id once one is picked. The design seeds a grid coordinate
  // ("1-1"); real sessions are addressed by id, so nothing is selected until a click.
  indSlot: "",
  iaSel: [0, 1, 2],
  iaChoice: 0,
  lvTab: "todo",
  lvId: 1,
  lvWorkerId: null,
  lvDay: null,
  lvReason: "Resigned",
  lvChecks: [1, 0, 1, 1],
  vrTab: "mine",
  vrZones: [0],
  vrName: "",
  vrCompany: "",
  vrPurpose: "",
  vrDay: "Tue 25 Aug",
  vrWindow: "10:00–12:00",
  vrHost: "A. Whitmore",
  proj: "EMB1A",
  projOpen: false,
  toast: null,
  siEmail: "tc@mail.com",
  siPassword: "",
  siBusy: false,
  siError: null,
};
