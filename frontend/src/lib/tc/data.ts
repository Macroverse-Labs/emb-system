import * as fx from "./fixtures.ts";
import type { TcData } from "./types";

export type { TcData } from "./types";

/**
 * The design's own data, used until `/tc/bootstrap` answers — and as the seed the
 * backend loads, so the two never drift.
 */
export const FIXTURE_DATA: TcData = {
  projects: fx.PROJECTS,
  workers: fx.W,
  docQueue: fx.DOCQ,
  trainingColumns: fx.TRCOLS,
  training: fx.TRROWS,
  inductionSessions: fx.INDUCTIONS,
  hours: fx.HR,
  inactive: fx.IA,
  leavers: fx.LV,
  visitorRequests: fx.VR,
};
