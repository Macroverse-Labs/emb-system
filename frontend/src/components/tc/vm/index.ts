import type { TcCtx } from "./ctx";
import { shell } from "./shell";
import { vm1 } from "./vm1";
import { vm2 } from "./vm2";
import { vm3 } from "./vm3";

/**
 * Everything the screens render from, in one flat bag — the same shape the design
 * canvas builds in `renderVals()`.
 *
 * Split by region of `TC Console HiFi M3.dc.html`: `shell` is the app chrome and
 * sign-in, `vm1` home/workers/worker/add, `vm2` docs/training/hours/inductions,
 * `vm3` inactive/leavers/visitors.
 */
export function buildVM(ctx: TcCtx) {
  return { ...shell(ctx), ...vm1(ctx), ...vm2(ctx), ...vm3(ctx) };
}

export type VM = ReturnType<typeof buildVM>;
export { INITIAL_STATE } from "./ctx";
export type { TcActions, TcCtx, TcState } from "./ctx";
