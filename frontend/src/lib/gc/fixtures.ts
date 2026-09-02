/**
 * Seed data for the GC console, transcribed verbatim from the class fields of
 * `GC Console HiFi M3.dc.html`.
 *
 * Phase 1 renders straight from these. Phase 2 replaces them with the payload of
 * `GET /api/v1/gc/bootstrap`, and this module becomes the seed the backend loads —
 * so the values must stay faithful to the design rather than being "tidied up".
 */
import type {
  AlertRow,
  AuditRow,
  BlockRow,
  CompanyRow,
  ContractorLoad,
  DeviceRow,
  HourBucket,
  LogRow,
  MoveRow,
  NavGroup,
  NotifRow,
  ProjectRow,
  RefDataRow,
  Role,
  Screen,
  SessionRow,
  StatusStyle,
  SubmissionRow,
  TcAccountRow,
  UserRow,
  ViolationRow,
  VisitRequestRow,
  VisitorTodayRow,
  WorkerRow,
  WorkerStatus,
  ZoneRow,
} from "./types";

export const W: WorkerRow[] = [
  ['Muhammad Rizal bin Hamid','EMB-04122','Pantas Steelworks','Steel fixer','cleared','A1 Basement, A2 Podium',1,'06:42','Malaysia'],
  ['Anwar Hassan','EMB-04155','Pantas Steelworks','Steel fixer','expiring','A1 Basement, A2 Podium',1,'06:44','Bangladesh'],
  ['Ravi Kumaran','EMB-03918','Sinar Electrical','Electrician','cleared','A3 Electrical, A2 Podium',1,'06:51','Malaysia'],
  ['Md Shahin Alam','EMB-04407','Sinar Electrical','Electrician\u2019s mate','pending','\u2014',0,'\u2014','Bangladesh'],
  ['Nabin Thapa','EMB-04061','Kejora M&E','Pipefitter','cleared','B1 Basement, B2 Plant',1,'07:02','Nepal'],
  ['Joseph Lim','EMB-02240','Emerald Builders','Site engineer','cleared','All zones',1,'06:20','Malaysia'],
  ['Siti Nur Aisyah','EMB-02318','Emerald Builders','Document controller','cleared','Site office',1,'08:05','Malaysia'],
  ['Arun Selvam','EMB-04512','Titan Formwork','Carpenter','expired','A2 Podium',0,'3 d ago','India'],
  ['Rahmat Santoso','EMB-04338','Titan Formwork','Carpenter','cleared','A2 Podium',1,'06:58','Indonesia'],
  ['Bilal Ahmed','EMB-04490','Zenith Scaffold','Scaffolder','blocked','\u2014',0,'12 d ago','Pakistan'],
  ['Krishna Bahadur','EMB-04121','Zenith Scaffold','Scaffolder','cleared','A1, A2, B1',1,'06:39','Nepal'],
  ['Tan Wei Ming','EMB-02501','Emerald Builders','Safety officer','cleared','All zones',1,'06:15','Malaysia'],
  ['Mohd Faizal bin Osman','EMB-04203','Pantas Steelworks','Crane operator','expiring','A1 Basement, Laydown',1,'06:30','Malaysia'],
  ['Deepak Rai','EMB-04455','Kejora M&E','Welder','review','B2 Plant',0,'\u2014','Nepal'],
  ['Sunil Gurung','EMB-04466','Kejora M&E','Welder','draft','\u2014',0,'\u2014','Nepal'],
  ['Ahmad Zulkifli','EMB-04099','Sinar Electrical','Electrician','cleared','A3 Electrical',1,'07:10','Malaysia'],
  ['Rajesh Naidu','EMB-04277','Titan Formwork','Foreman','cleared','A1, A2, A3',1,'06:25','India'],
  ['Hafiz Rahman','EMB-04501','Zenith Scaffold','Scaffolder','pending','\u2014',0,'\u2014','Bangladesh'],
  ['Wong Kah Meng','EMB-02377','Emerald Builders','Package manager','cleared','All zones',0,'Yest 18:40','Malaysia'],
  ['Lokesh Pillai','EMB-04188','Sinar Electrical','Cable puller','expiring','A3 Electrical',1,'06:47','India']
];

export const ST: Record<WorkerStatus, StatusStyle> = {
  cleared:{l:'Cleared',c:'#146C2E'}, expiring:{l:'Expiring',c:'#7A5900'},
  expired:{l:'Expired',c:'#B3261E'}, blocked:{l:'Blocked',c:'#B3261E'},
  pending:{l:'Awaiting induction',c:'#49454F'}, draft:{l:'Draft',c:'#79747E'},
  review:{l:'In review',c:'#7A5900'}
};

export const CO: ContractorLoad[] = [
  ['Pantas Steelworks',412,268,'2 expiring'],
  ['Sinar Electrical',388,241,'ok'],
  ['Kejora M&E',356,198,'1 expired'],
  ['Titan Formwork',298,187,'ok'],
  ['Zenith Scaffold',214,96,'1 blocked'],
  ['Emerald Builders',186,142,'ok']
];

export const ALERTS: AlertRow[] = [
  ['expiry','CIDB green card expires in 4 days','Anwar Hassan \u00b7 Pantas Steelworks \u00b7 EMB-04155','4 d','#7A5900','workers'],
  ['expiry','Work visa expired \u2014 access withdrawn','Arun Selvam \u00b7 Titan Formwork \u00b7 EMB-04512','Now','#B3261E','workers'],
  ['hours','7 consecutive days worked','Krishna Bahadur \u00b7 Zenith Scaffold \u00b7 threshold 6','7 d','#7A5900','workers'],
  ['device','Turnstile A-02 on 4G for 3 h 12 m','168 events buffered \u00b7 not yet uploaded','3 h','#7A5900','devices'],
  ['validation','18 documents waiting on validation','Oldest submitted 2 days ago','18','#7A5900','validation'],
  ['block','Auto-block fired \u2014 expired safety passport','Bilal Ahmed \u00b7 Zenith Scaffold','12 d','#B3261E','blocks'],
  ['expiry','Confined space certificate expires in 9 days','Nabin Thapa \u00b7 Kejora M&E','9 d','#7A5900','workers'],
  ['hours','Weekly hours exceeded \u2014 62 h','Rahmat Santoso \u00b7 Titan Formwork \u00b7 cap 60 h','62 h','#7A5900','workers'],
  ['device','Handheld reader H-3 battery 11%','Gate B pedestrian \u00b7 last sync 08:40','11%','#7A5900','devices'],
  ['inactive','31 days without a turnstile event','6 workers \u00b7 Zenith Scaffold, Kejora M&E','6','#49454F','workers'],
  ['visitor','Visitor overstayed pass window','Supplier rep \u00b7 host A. Whitmore \u00b7 out 14:12','1','#B3261E','vtoday'],
  ['validation','Passport rejected \u2014 re-upload not received','Sunil Gurung \u00b7 Kejora M&E \u00b7 4 days','4 d','#7A5900','validation']
];

export const MOVES: MoveRow[] = [
  ['08:41','Ahmad Zulkifli','Gate A pedestrian','in'],
  ['08:40','Siti Nur Aisyah','Site office','in'],
  ['08:38','Rajesh Naidu','A2 Podium','in'],
  ['08:37','Nabin Thapa','Gate B pedestrian','out'],
  ['08:36','Lokesh Pillai','A3 Electrical','in'],
  ['08:34','Krishna Bahadur','Gate A pedestrian','out'],
  ['08:33','Rahmat Santoso','A2 Podium','in']
];

export const NAMES: string[] = ['Ahmad Zulkifli','Rahmat Santoso','Ravi Kumaran','Nabin Thapa','Krishna Bahadur','Joseph Lim','Lokesh Pillai','Rajesh Naidu','Anwar Hassan','Mohd Faizal bin Osman'];

export const GATES: string[] = ['Gate A pedestrian','Gate B pedestrian','A2 Podium','A3 Electrical','Site office','Laydown vehicle'];

export const HOURS: HourBucket[] = [['05',88],['06',412],['07',286],['08',164],['09',72],['10',46],['11',38],['12',94],['13',88],['14',42],['15',36],['16',58],['17',186],['18',122]];

export const NAV: NavGroup[] = [
  ['Overview',[['dashboard','Dashboard','','space_dashboard'],['alerts','Alerts','12','notifications']],'insights',true],
  ['Workforce',[['workers','Worker register','2418','groups'],['validation','Validation queue','18','fact_check'],['inductions','Inductions','3','school'],['violations','Violations','','report'],['blocks','Blocks','6','block'],['companies','Companies','','domain']],'engineering'],
  ['Access control',[['zones','Zones','','account_tree'],['plan','Zone plan','','map'],['gates','Gate graph','','sensor_door'],['rules','Access rules','','rule'],['devices','Devices','2','router']],'security'],
  ['Visitors',[['vrequests','Requests','7','how_to_reg'],['vtoday','Today','11','badge'],['vblocked','Repeat & blocked','','person_off'],['vpolicy','Visitor policy','','policy']],'person_add'],
  ['Records',[['log','Access log','','history'],['reports','Reports','','assessment'],['audit','System audit','','manage_search']],'folder_open'],
  ['Administration',[['users','Users & rights','','admin_panel_settings'],['tcaccounts','Contractor accounts','','key'],['refdata','Reference data','','list_alt'],['notifications','Notifications','','campaign']],'settings']
];

export const TITLES: Partial<Record<Screen, [string, string]>> = {
  dashboard:['Live dashboard',''],
  alerts:['Alert centre','An inbox, not a wall of red \u2014 every row has one action that clears it'],
  workers:['Worker register','2,418 on the register across six contractors \u2014 search first, then narrow'],
  worker:['Worker profile','Everything recorded against one person, and what it permits today'],
  validation:['Validation queue','The document beside the decision \u2014 approve, or reject with a reason'],
  inductions:['Induction sessions','Attendance taken, then card and face enrolled in the same sitting'],
  violations:['Violations & warnings','A three-strike ladder, visible to the person recording the first one'],
  blocks:['Blocks & reinstatement','Automatic and manual, in one list, each with the way back'],
  companies:['Company profiles','The defaults every worker profile inherits from its contractor'],
  zones:['Zone builder','Master, sub and sub-sub zones \u2014 and what each one demands'],
  plan:['Zone plan','Draw the zone onto whatever drawing exists, level by level'],
  gates:['Gate graph','Generated from the devices that actually check people'],
  rules:['Access rules','Auto-block thresholds, and a zone \u00d7 requirement matrix'],
  devices:['Devices & connectivity','The buffered-events column, not the green dot'],
  vrequests:['Visitor requests','A contractor may ask; only a GC host grants \u2014 and trims'],
  vtoday:['Visitors today','Expected, arrived, and the one who has overstayed'],
  vrecord:['Visit record','One visit, end to end, auditable'],
  vblocked:['Repeat & blocked visitors','The consequence of an overstay, and the way back'],
  vpolicy:['Visitor policy','The settings that make the other visitor screens behave'],
  log:['Access log','One stream of events \u2014 filter by gate, by person, by verdict'],
  reports:['Reports','Scheduled and delivered, not hand-run at month end'],
  reportout:['Report output','The artifact a schedule sends'],
  audit:['System-change audit','Who changed the rules, when, and to what'],
  users:['Users & access rights','Four roles, one permission grid'],
  tcaccounts:['Contractor accounts','Issuing and revoking the trade contractor logins'],
  refdata:['Reference data','Every dropdown the worker form offers'],
  notifications:['Notifications','Who hears it, how early, and on what'],
  tiles:['Dashboard layout','The tile editor behind \u201cEdit layout\u201d']
};

export const PROJECTS: ProjectRow[] = [
  ['EMB1A','Emerald Bay Block A','1A','2,418 workers \u00b7 14 gates'],
  ['EMB1A-RFP2','Emerald Bay Block A \u2014 RFP2','R2','486 workers \u00b7 3 gates'],
  ['EMB2A','Emerald Bay Block B','2B','1,073 workers \u00b7 8 gates']
];

export const ZONES: ZoneRow[] = [
  ['site','Emerald Bay Block A','Master zone',0,2418,'2FA'],
  ['a-site','A Site','Sub zone',1,1284,'2FA'],
  ['a1','A1 Basement','Sub-sub zone',2,286,'1FA'],
  ['a2','A2 Podium','Sub-sub zone',2,612,'1FA'],
  ['a3','A3 Electrical rooms','Sub-sub zone',2,48,'2FA'],
  ['b-site','B Site','Sub zone',1,742,'2FA'],
  ['b1','B1 Basement','Sub-sub zone',2,318,'1FA'],
  ['b2','B2 Plant room','Sub-sub zone',2,96,'2FA'],
  ['laydown','Laydown & vehicle gate','Sub zone',1,204,'1FA'],
  ['office','Site office','Sub zone',1,186,'1FA']
];

export const REQS: string[] = ['CIDB green card','Site induction','Working at height','Confined space','Hot works','Electrical LV','Lifting & slinging'];

export const MZONES: string[] = ['A1 Basement','A2 Podium','A3 Electrical','B1 Basement','B2 Plant','Laydown','Site office'];

export const DEV: DeviceRow[] = [
  ['T-A01','Turnstile','Gate A pedestrian','A Site','online','Hard-wired','0','08:41','2FA'],
  ['T-A02','Turnstile','Gate A pedestrian','A Site','4g','4G fallback','168','05:29','2FA'],
  ['T-B01','Turnstile','Gate B pedestrian','B Site','online','Hard-wired','0','08:40','2FA'],
  ['T-B02','Turnstile','Gate B pedestrian','B Site','online','Hard-wired','0','08:39','2FA'],
  ['R-A31','Card reader','A3 Electrical rooms','A3','online','Hard-wired','0','08:36','2FA'],
  ['R-B21','Card reader','B2 Plant room','B2','online','Hard-wired','0','08:22','2FA'],
  ['V-L01','Vehicle barrier','Laydown gate','Laydown','online','4G','0','08:18','1FA'],
  ['H-3','Handheld reader','Roving \u00b7 Gate B','B Site','battery','4G','12','08:40','1FA'],
  ['TAB-2','Guard tablet','Gate A desk','A Site','online','Wi-Fi','0','08:41','\u2014']
];

export const COMPANIES: CompanyRow[] = [
  ['Pantas Steelworks','Steelwork & rebar',412,268,'Trade contractor','K. Sivanesan','12 Mar 2027','2 expiring'],
  ['Sinar Electrical','Electrical services',388,241,'Trade contractor','L. Chandran','30 Jun 2027','ok'],
  ['Kejora M&E','Mechanical & plumbing',356,198,'Trade contractor','A. Rahim','08 Nov 2026','1 expired'],
  ['Titan Formwork','Formwork & concrete',298,187,'Trade contractor','G. Marimuthu','22 Feb 2027','ok'],
  ['Zenith Scaffold','Scaffolding',214,96,'Trade contractor','S. Perera','19 Apr 2027','1 blocked'],
  ['Emerald Builders','General contractor',186,142,'GC','A. Whitmore','\u2014','ok'],
  ['Harta Labour Supply','Labour agency',164,88,'Sub-sub contractor','N. Ibrahim','03 Jan 2027','ok'],
  ['Bumi Piling','Piling & foundations',96,0,'Trade contractor \u00b7 demobilised','R. Tan','Expired','archive']
];

export const SESSIONS: SessionRow[] = [
  ['IND-92','Tomorrow 07:00','Site office \u2014 training room 1','A. Whitmore',24,24,'full'],
  ['IND-93','Tomorrow 13:00','Site office \u2014 training room 1','T. W. Ming',24,17,'open'],
  ['IND-94','Thu 07:00','Site office \u2014 training room 2','J. Lim',30,8,'open'],
  ['IND-91','Today 07:00','Site office \u2014 training room 1','A. Whitmore',24,22,'running']
];

export const VIOL: ViolationRow[] = [
  ['Today 08:12','Bilal Ahmed','Zenith Scaffold','Tailgating through Gate A','T. W. Ming','Third strike \u2014 blocked','#B3261E'],
  ['Yesterday 15:40','Arun Selvam','Titan Formwork','No harness above 2 m','J. Lim','Written warning','#B3261E'],
  ['22 Aug 2026','Rahmat Santoso','Titan Formwork','Smoking in A2 Podium','T. W. Ming','Verbal warning','#7A5900'],
  ['19 Aug 2026','Anwar Hassan','Pantas Steelworks','No high-visibility vest','A. Whitmore','Verbal warning','#7A5900'],
  ['14 Aug 2026','Deepak Rai','Kejora M&E','Hot works without a permit','J. Lim','Written warning','#B3261E'],
  ['09 Aug 2026','Krishna Bahadur','Zenith Scaffold','Unauthorised zone \u2014 A3 Electrical','T. W. Ming','Verbal warning','#7A5900']
];

export const BLOCKS: BlockRow[] = [
  ['Bilal Ahmed','Zenith Scaffold','Automatic','Third recorded violation','12 d ago','GC administrator','#B3261E'],
  ['Arun Selvam','Titan Formwork','Automatic','Work visa expired','3 d ago','Valid visa upload','#B3261E'],
  ['Sunil Gurung','Kejora M&E','Automatic','Documents rejected \u00b7 not re-supplied','4 d ago','Document validation','#7A5900'],
  ['Ismail Karim','Harta Labour Supply','Manual','Left the project \u2014 card retained','8 d ago','Not expected to return','#49454F'],
  ['Prakash Limbu','Kejora M&E','Automatic','31 days without a turnstile event','1 d ago','Contractor confirms active','#7A5900'],
  ['Chong Wei Lun','Titan Formwork','Manual','Under investigation \u2014 incident 4412','5 d ago','Investigation closed','#7A5900']
];

export const VREQ: VisitRequestRow[] = [
  ['Steelwork supplier rep','Supplier','Contractor C \u2014 Pantas Steelworks','Rebar sample review','A Site, Laydown','Tue 10:00\u201312:00','4 h ago','me'],
  ['Facade consultant','Consultant','Contractor A \u2014 Sinar Electrical','Facade survey','A Site','Wed 08:00\u201317:00','6 h ago','me'],
  ['DOSH inspector','Inspector','GC \u2014 J. Menon','Statutory check','A3 Electrical rooms','Tue 11:00\u201312:30','1 d ago','me'],
  ['Client representative','Client','GC \u2014 A. Foo','Progress walk','A Site','2 d ago','2 d ago','other'],
  ['CIDB auditor','Auditor','GC \u2014 J. Menon','Records audit','Site office','Fri 09:00\u201313:00','2 d ago','other'],
  ['Crane inspector','Inspector','Contractor B \u2014 Titan Formwork','Thorough examination','Laydown','Thu 07:00\u201310:00','3 d ago','other'],
  ['Insurance surveyor','Surveyor','GC \u2014 A. Whitmore','Annual survey','A Site, B Site','3 d ago','3 d ago','other']
];

export const VTODAY: VisitorTodayRow[] = [
  ['Nur Hidayah','Client rep','A. Whitmore','A Site','09:00\u201311:00','expected','\u2014'],
  ['R. Balakrishnan','DOSH inspector','J. Menon','A3 Electrical','11:00\u201312:30','expected','\u2014'],
  ['Kenneth Ooi','Supplier','A. Whitmore','Laydown','10:00\u201312:00','onsite','in 09:58'],
  ['Melissa Tan','Consultant','J. Lim','A Site','08:00\u201317:00','onsite','in 08:12'],
  ['Hafizul Anwar','Surveyor','A. Foo','A Site, B Site','09:30\u201311:30','onsite','in 09:22'],
  ['Gopal Krishnan','Auditor','J. Menon','Site office','09:00\u201313:00','onsite','in 08:54'],
  ['Sarah Whitfield','Client rep','A. Whitmore','A Site','13:00\u201315:00','expected','\u2014'],
  ['Zulhilmi Aziz','Supplier','T. W. Ming','Laydown','07:00\u201309:00','overstay','in 07:04'],
  ['Priya Menon','Consultant','J. Lim','A Site','14:00\u201316:00','expected','\u2014'],
  ['Chua Boon Hock','Inspector','A. Foo','B2 Plant','15:00\u201316:00','expected','\u2014'],
  ['Daniel Reyes','Supplier','A. Whitmore','Laydown','08:00\u201308:45','left','out 08:41']
];

export const LOG: LogRow[] = [
  ['08:41:22','Ahmad Zulkifli','Sinar Electrical','T-A01 \u00b7 Gate A','in','pass','Card + face'],
  ['08:40:58','Siti Nur Aisyah','Emerald Builders','R-OF1 \u00b7 Site office','in','pass','Card'],
  ['08:39:14','Bilal Ahmed','Zenith Scaffold','T-A01 \u00b7 Gate A','in','deny','Blocked \u2014 third violation'],
  ['08:38:40','Rajesh Naidu','Titan Formwork','R-A21 \u00b7 A2 Podium','in','pass','Card'],
  ['08:37:02','Nabin Thapa','Kejora M&E','T-B01 \u00b7 Gate B','out','pass','Card'],
  ['08:36:31','Lokesh Pillai','Sinar Electrical','R-A31 \u00b7 A3 Electrical','in','deny','Electrical LV not held'],
  ['08:35:49','Kenneth Ooi (visitor)','Visitor \u00b7 host A. Whitmore','V-L01 \u00b7 Laydown','in','pass','QR pass \u00b7 escorted'],
  ['08:34:12','Krishna Bahadur','Zenith Scaffold','T-A02 \u00b7 Gate A','out','pass','Card + face'],
  ['08:33:55','Rahmat Santoso','Titan Formwork','R-A21 \u00b7 A2 Podium','in','pass','Card'],
  ['08:32:10','Arun Selvam','Titan Formwork','T-A01 \u00b7 Gate A','in','deny','Work visa expired'],
  ['08:31:44','Mohd Faizal bin Osman','Pantas Steelworks','V-L01 \u00b7 Laydown','in','pass','Card'],
  ['08:30:08','Deepak Rai','Kejora M&E','R-B21 \u00b7 B2 Plant','in','deny','Face not matched \u2014 retry passed 08:30:41'],
  ['08:29:37','Tan Wei Ming','Emerald Builders','T-A01 \u00b7 Gate A','in','pass','Card + face'],
  ['08:28:52','Joseph Lim','Emerald Builders','T-A01 \u00b7 Gate A','in','pass','Card + face']
];

export const AUDIT: AuditRow[] = [
  ['Today 08:12','A. Whitmore','GC administrator','Access rule changed','B2 Plant \u00b7 Confined space','Advisory','Required'],
  ['Today 07:44','A. Whitmore','GC administrator','Zone identity changed','A3 Electrical rooms','Card only','Card + face'],
  ['Yesterday 16:20','J. Menon','GC user','Document approved','Hafiz Rahman \u00b7 CIDB green card','Pending','Approved'],
  ['Yesterday 14:02','System','Automatic','Worker blocked','Bilal Ahmed','Cleared','Blocked'],
  ['Yesterday 11:38','A. Foo','GC user','Visitor pass granted','Kenneth Ooi \u00b7 Laydown','\u2014','Granted 10:00\u201312:00'],
  ['23 Aug 2026','A. Whitmore','GC administrator','User rights changed','T. W. Ming','Security','GC user'],
  ['23 Aug 2026','A. Whitmore','GC administrator','Threshold changed','Consecutive days','7 days','6 days'],
  ['22 Aug 2026','System','Automatic','Contractor account suspended','Bumi Piling','Active','Suspended \u2014 demobilised']
];

export const USERS: UserRow[] = [
  ['A. Whitmore','GC administrator','Emerald Builders','Today 06:58','all'],
  ['J. Menon','GC user','Emerald Builders','Today 07:40','most'],
  ['A. Foo','GC user','Emerald Builders','Yesterday 17:10','most'],
  ['T. W. Ming','GC user','Emerald Builders','Today 06:15','most'],
  ['S. Kumar','Security','Guardforce (sub)','Today 06:00','gate'],
  ['M. Yusof','Security','Guardforce (sub)','Today 18:00','gate'],
  ['K. Sivanesan','Trade contractor','Pantas Steelworks','Today 08:22','own']
];

export const CAPS: string[] = ['Validate documents','Create zones','Change access rules','Block & reinstate','Record violations','Grant visitor passes','Issue TC logins','Run reports','Roll call','Change system settings'];

export const ROLES: Role[] = ['GC administrator','GC user','Security','Trade contractor'];

export const TCACC: TcAccountRow[] = [
  ['Pantas Steelworks','K. Sivanesan','k.siva@pantas.com','Active','Today 08:22',3],
  ['Sinar Electrical','L. Chandran','l.chandran@sinar.my','Active','Today 07:55',2],
  ['Kejora M&E','A. Rahim','a.rahim@kejora.my','Active','Yesterday 16:40',4],
  ['Titan Formwork','G. Marimuthu','g.mari@titanfw.com','Active','Today 06:48',2],
  ['Zenith Scaffold','S. Perera','s.perera@zenith.my','Locked \u2014 4 failed sign-ins','2 d ago',1],
  ['Harta Labour Supply','N. Ibrahim','n.ibrahim@harta.my','Invited \u2014 not yet accepted','\u2014',0],
  ['Bumi Piling','R. Tan','r.tan@bumipiling.my','Suspended \u2014 demobilised','12 d ago',0]
];

export const REFDATA: RefDataRow[] = [
  ['Job roles','Steel fixer, Rebar bender, Carpenter, Electrician, Pipefitter, Welder, Scaffolder, Crane operator, Foreman, Site engineer, Safety officer, Document controller',12],
  ['Trades / packages','Steelwork, Electrical, Mechanical, Formwork, Scaffolding, Piling, Facade, Fit-out',8],
  ['Document types','Passport / ID, CIDB green card, Work visa, Medical fitness, Safety induction, Insurance',6],
  ['Training courses','Working at height, Confined space, Hot works, Electrical LV, Manual handling, Lifting & slinging',6],
  ['Nationalities','Malaysia, Bangladesh, Nepal, Indonesia, India, Pakistan, Myanmar, Philippines',8],
  ['Violation categories','PPE not worn, Unauthorised zone, Tailgating, Work without a permit, Smoking on site',5],
  ['Visitor types','Client, Consultant, Inspector, Auditor, Supplier, Surveyor, Delivery driver',7],
  ['Projects','EMB1A, EMB1A-RFP2, EMB2A',3]
];

export const NOTIF: NotifRow[] = [
  ['Document expiring','30, 14 and 7 days before','Contractor, GC validator'],
  ['Document expired','On the night it expires','Contractor, GC validator, worker'],
  ['Training expiring','30 and 7 days before','Contractor'],
  ['Weekly hours approaching cap','At 90% of the cap','Contractor, GC user'],
  ['Consecutive days approaching','On day 6','Contractor, GC user'],
  ['Worker inactive 24 days','Once, then on day 31','Contractor'],
  ['Worker blocked','Immediately','Contractor, worker, security'],
  ['Device offline over 1 h','Immediately','GC administrator'],
  ['Visitor pass granted','Immediately','Host, security at the named gate'],
  ['Visitor overstayed','15 minutes after the window','Host, security']
];

export const TILES: string[] = ['Workers on site','GC staff on site','Inducted workers','Documents at risk','Turnstile traffic today','On site by contractor','Needs a decision','Live movements','Visitors on site','Blocked workers'];

export const SUBMISSIONS: SubmissionRow[] = [
  {id:'v1',w:'Md Shahin Alam',co:'Sinar Electrical',doc:'Passport',no:'EK0428193',exp:'14 Mar 2029',iss:'Bangladesh',sub:'2 days ago',fields:[['Document number','EK0428193'],['Expiry','14 Mar 2029'],['Country of issue','Bangladesh'],['Name on document','MD SHAHIN ALAM'],['Date of birth','02 Aug 1994']],flags:['Name matches the worker profile','Work visa required \u2014 passport is not Malaysian']},
  {id:'v2',w:'Md Shahin Alam',co:'Sinar Electrical',doc:'Work visa',no:'WV-2291884',exp:'30 Sep 2027',iss:'Malaysia',sub:'2 days ago',fields:[['Visa number','WV-2291884'],['Expiry','30 Sep 2027'],['Sponsor','Sinar Electrical Sdn Bhd'],['Category','Temporary employment']],flags:['Sponsor matches the trade contractor']},
  {id:'v3',w:'Hafiz Rahman',co:'Zenith Scaffold',doc:'CIDB green card',no:'GC-8842019',exp:'11 Jan 2027',iss:'CIDB',sub:'yesterday',fields:[['Card number','GC-8842019'],['Expiry','11 Jan 2027'],['Trade','Scaffolder'],['Level','Skilled']],flags:['Trade matches the declared job role']},
  {id:'v4',w:'Deepak Rai',co:'Kejora M&E',doc:'Hot works certificate',no:'HW-5510',exp:'22 Nov 2026',iss:'Training provider',sub:'yesterday',fields:[['Certificate number','HW-5510'],['Expiry','22 Nov 2026'],['Provider','Safe Arc Training'],['Assessed','22 Nov 2024']],flags:['Required for B2 Plant \u2014 zone requests hot works']},
  {id:'v5',w:'Sunil Gurung',co:'Kejora M&E',doc:'Passport',no:'\u2014',exp:'\u2014',iss:'Nepal',sub:'4 days ago',fields:[['Document number','not legible'],['Expiry','not legible'],['Country of issue','Nepal']],flags:['Scan is cropped \u2014 machine-readable zone missing','Previously rejected once']},
  {id:'v6',w:'Mohd Faizal bin Osman',co:'Pantas Steelworks',doc:'Crane operator licence',no:'CO-11924',exp:'08 Sep 2026',iss:'DOSH',sub:'3 hours ago',fields:[['Licence number','CO-11924'],['Expiry','08 Sep 2026'],['Class','Mobile crane \u2014 up to 50 t'],['Medical','Valid to 08 Sep 2026']],flags:['Expires in 14 days \u2014 renewal reminder will fire']}
];
