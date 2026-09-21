/**
 * Run with:
 *   JITI_ALIAS="{\"@\":\"$PWD/src\"}" pnpm exec jiti src/components/tc/vm/empty.test.ts
 *
 * No test framework — one assert-based check, as `src/components/gc/style.test.ts`.
 * That sibling is run with `tsx`, but `tsx` is not a dependency here and the
 * view-models import through the `@/` alias, which plain `node --experimental-
 * strip-types` cannot resolve; `jiti` already ships with Next and does, given the
 * alias above.
 *
 * A brand-new contractor's register is empty: the GC issues the account, the
 * contractor signs in, and every collection in `TcData` is `[]` until they add
 * somebody. This builds the whole view-model against exactly that and fails loudly
 * if a screen's slice ever indexes an empty list again.
 */
import assert from "node:assert/strict";
import type { TcData } from "../../../lib/tc/data.ts";
import { buildVM } from "./index.ts";
import { INITIAL_STATE, type TcCtx, type TcState } from "./ctx.ts";

const EMPTY: TcData = {
  projects: [],
  workers: [],
  docQueue: [],
  trainingColumns: [],
  training: [],
  inductionSessions: [],
  hours: [],
  inactive: [],
  leavers: [],
  visitorRequests: [],
};

function ctxFor(state: TcState): TcCtx {
  return {
    s: state,
    set: () => {},
    go: () => {},
    toast: () => {},
    data: EMPTY,
    meta: null,
    auth: { signIn: async () => {}, signOut: () => {} },
    actions: { run: () => {}, live: false },
  };
}

// Every screen, including the ones whose state keys point at rows that do not exist.
const SCREENS = [
  "home", "workers", "worker", "add", "docs", "training", "hours",
  "inductions", "inactive", "leavers", "visitors", "signin",
] as const;

for (const screen of SCREENS) {
  const vm = buildVM(ctxFor({ ...INITIAL_STATE, screen }));
  // The design's own state points at rows the empty register does not have —
  // workerId 0, dqId "d1", lvId 1 — which is exactly what used to throw.
  assert.equal(vm.wkRows.length, 0, screen);
  assert.equal(vm.wkEmpty, true, screen);
  assert.equal(vm.dqEmpty, true, screen);
  assert.equal(vm.lvEmpty, true, screen);
  assert.ok(vm.wkEmptyCopy.length > 0, screen);
  // The shell still names a project even with no project rows.
  assert.ok(typeof vm.projName === "string", screen);
}

// Wizard steps index a design constant, not the contractor's data — all five build.
for (const awStep of [1, 2, 3, 4, 5]) {
  const vm = buildVM(ctxFor({ ...INITIAL_STATE, screen: "add", awStep }));
  assert.ok(vm.awStepTitle.length > 0, "step " + awStep);
}

// Out-of-range selections are the other half of the same bug: state survives a
// reload while the data behind it does not.
buildVM(ctxFor({ ...INITIAL_STATE, workerId: 99, lvId: 99, lvWorkerId: 99, dqId: "nope" }));

// Actions that walk a list must not be the thing that throws either.
const vm = buildVM(ctxFor(INITIAL_STATE));
vm.dqSkip();
vm.dqSubmit();
vm.lvMark();
vm.lvConfirm();
vm.vrSend();
vm.wpWithdraw();
vm.wkBulkWithdraw();
vm.hrPlan();

console.log("tc/vm: builds and acts on an empty register without throwing");
