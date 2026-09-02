import * as fx from "./fixtures.ts";
import type {
  AlertRow, AuditRow, BlockRow, CompanyRow, ContractorLoad, DeviceRow, HourBucket,
  LogRow, MoveRow, NotifRow, ProjectRow, RefDataRow, SessionRow, SubmissionRow,
  Role, TcAccountRow, UserRow, ViolationRow, VisitRequestRow, VisitorTodayRow, WorkerRow, ZoneRow,
} from "./types";

/**
 * Everything the console needs for one project.
 *
 * Deliberately the same shapes the design uses, so `GET /api/v1/gc/bootstrap` can
 * be dropped in where the fixtures were without touching a view-model or a screen.
 */
export interface GcData {
  projects: ProjectRow[];
  workers: WorkerRow[];
  contractorLoad: ContractorLoad[];
  companies: CompanyRow[];
  alerts: AlertRow[];
  moves: MoveRow[];
  hours: HourBucket[];
  zones: ZoneRow[];
  requirements: string[];
  matrixZones: string[];
  devices: DeviceRow[];
  sessions: SessionRow[];
  violations: ViolationRow[];
  blocks: BlockRow[];
  visitRequests: VisitRequestRow[];
  visitorsToday: VisitorTodayRow[];
  log: LogRow[];
  audit: AuditRow[];
  users: UserRow[];
  capabilities: string[];
  roles: Role[];
  tcAccounts: TcAccountRow[];
  refData: RefDataRow[];
  notifications: NotifRow[];
  tiles: string[];
  submissions: SubmissionRow[];
  /** Names and gates the live ticker cycles through. */
  tickerNames: string[];
  tickerGates: string[];
}

/**
 * The design's own data, used until `/gc/bootstrap` answers — and as the seed the
 * backend loads, so the two never drift.
 */
export const FIXTURE_DATA: GcData = {
  projects: fx.PROJECTS,
  workers: fx.W,
  contractorLoad: fx.CO,
  companies: fx.COMPANIES,
  alerts: fx.ALERTS,
  moves: fx.MOVES,
  hours: fx.HOURS,
  zones: fx.ZONES,
  requirements: fx.REQS,
  matrixZones: fx.MZONES,
  devices: fx.DEV,
  sessions: fx.SESSIONS,
  violations: fx.VIOL,
  blocks: fx.BLOCKS,
  visitRequests: fx.VREQ,
  visitorsToday: fx.VTODAY,
  log: fx.LOG,
  audit: fx.AUDIT,
  users: fx.USERS,
  capabilities: fx.CAPS,
  roles: fx.ROLES,
  tcAccounts: fx.TCACC,
  refData: fx.REFDATA,
  notifications: fx.NOTIF,
  tiles: fx.TILES,
  submissions: fx.SUBMISSIONS,
  tickerNames: fx.NAMES,
  tickerGates: fx.GATES,
};
