import type { ReactNode } from "react";
import type { Screen } from "@/lib/gc/types";
import type { VM } from "../vm";

import Alerts from "./Alerts";
import Audit from "./Audit";
import Blocks from "./Blocks";
import Companies from "./Companies";
import Dashboard from "./Dashboard";
import Devices from "./Devices";
import Gates from "./Gates";
import Inductions from "./Inductions";
import Log from "./Log";
import Notifications from "./Notifications";
import Plan from "./Plan";
import RefData from "./RefData";
import ReportOut from "./ReportOut";
import Reports from "./Reports";
import Rules from "./Rules";
import SignIn from "./SignIn";
import TcAccounts from "./TcAccounts";
import Tiles from "./Tiles";
import TvBoard from "./TvBoard";
import Users from "./Users";
import VBlocked from "./VBlocked";
import VPolicy from "./VPolicy";
import VRecord from "./VRecord";
import VRequests from "./VRequests";
import VToday from "./VToday";
import Validation from "./Validation";
import Violations from "./Violations";
import Worker from "./Worker";
import Workers from "./Workers";
import Zones from "./Zones";

/**
 * The design switches screens with a chain of `<sc-if value="{{ is_* }}">` blocks
 * over `state.screen`. Here that is one lookup — same behaviour, one render.
 */
export const SCREENS: Record<Screen, (props: { v: VM }) => ReactNode> = {
  dashboard: Dashboard,
  alerts: Alerts,
  tvboard: TvBoard,
  workers: Workers,
  worker: Worker,
  validation: Validation,
  inductions: Inductions,
  violations: Violations,
  blocks: Blocks,
  companies: Companies,
  zones: Zones,
  plan: Plan,
  gates: Gates,
  rules: Rules,
  devices: Devices,
  vrequests: VRequests,
  vtoday: VToday,
  vrecord: VRecord,
  vblocked: VBlocked,
  vpolicy: VPolicy,
  log: Log,
  reports: Reports,
  reportout: ReportOut,
  audit: Audit,
  users: Users,
  tcaccounts: TcAccounts,
  refdata: RefData,
  notifications: Notifications,
  tiles: Tiles,
  signin: SignIn,
};
