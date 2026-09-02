import type { GcCtx } from "./ctx";
import { shell } from "./shell";
import { vm1 } from "./vm1";
import { vm2 } from "./vm2";
import { vm3 } from "./vm3";

/**
 * Everything the screens render from, in one flat bag — the same shape the design
 * canvas builds in `renderVals()` by merging `vmScreens()`, `vmScreens2()` and
 * `vmScreens3()` onto the shell values.
 */
export function buildVM(ctx: GcCtx) {
  return { ...shell(ctx), ...vm1(ctx), ...vm2(ctx), ...vm3(ctx) };
}

export type VM = ReturnType<typeof buildVM>;
export { INITIAL_STATE } from "./ctx";
export type { GcActions, GcCtx, GcState, ZoneCfg } from "./ctx";
