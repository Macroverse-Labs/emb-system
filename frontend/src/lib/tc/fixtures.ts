/**
 * Seed data for the TC (trade contractor) console, transcribed verbatim from the
 * class fields of `TC Console HiFi M3.dc.html`.
 *
 * Phase 1 renders straight from these. Phase 2 replaces them with the payload of
 * `GET /api/v1/tc/bootstrap`, and this module becomes the seed the backend loads —
 * so the values must stay faithful to the design rather than being "tidied up".
 */
import type {
  AccessState,
  AccessStyle,
  DocState,
  DocStyle,
  TcDocRow,
  TcHoursRow,
  TcInactiveRow,
  TcLeaverRow,
  TcInductionSession,
  TcNavGroup,
  TcProjectRow,
  TcScreen,
  TcTrainingRow,
  TcVisitorRow,
  TcWizardField,
  TcWizardStep,
  TcWorkerRow,
} from "./types";

export const W: TcWorkerRow[] = [
  ['Ravi Kumaran','EMB-03918','Electrician','Direct','onsite','valid','07:12 today'],
  ['Ahmad Zulkifli','EMB-04099','Electrician','Direct','onsite','valid','07:31 today'],
  ['Nabin Thapa','EMB-04061','Pipefitter','Agency B','allowed','valid','Yesterday'],
  ['Bilal Ahmed','EMB-04490','Scaffolder','Direct','blocked','rejected','11 Aug'],
  ['Md Shahin Alam','EMB-04407','Labourer','Agency B','pending','valid','Never'],
  ['Deepak Rai','EMB-04455','Welder','Direct','onsite','expiring','06:54 today'],
  ['Sunil Gurung','EMB-04466','Labourer','Sub-sub C','inactive','valid','22 Jul'],
  ['Rajesh Naidu','EMB-04277','Foreman','Direct','allowed','valid','2 days ago'],
  ['Lokesh Pillai','EMB-04188','Cable puller','Agency B','onsite','valid','06:47 today'],
  ['Hafiz Rahman','EMB-04501','Scaffolder','Direct','pending','awaiting','Never'],
  ['Krishna Bahadur','EMB-04121','Scaffolder','Direct','onsite','valid','06:39 today'],
  ['Rahmat Santoso','EMB-04338','Labourer','Agency B','allowed','valid','3 days ago'],
  ['Mohd Faizal bin Osman','EMB-04203','Chargehand','Direct','onsite','valid','06:30 today'],
  ['Arun Selvam','EMB-04512','Labourer','Agency B','left','archived','03 Aug']
];

export const ACC: Record<AccessState, AccessStyle> = {
  onsite:{l:'On site',fg:'#146C2E',bg:'#E3F0E6'},
  allowed:{l:'Allowed',fg:'#1D192B',bg:'#E8DEF8'},
  blocked:{l:'Blocked',fg:'#B3261E',bg:'#F9DEDC'},
  pending:{l:'Awaiting induction',fg:'#49454F',bg:'#ECE6F0'},
  inactive:{l:'Inactive 34 d',fg:'#B3261E',bg:'#F9DEDC'},
  left:{l:'Left project',fg:'#79747E',bg:'#ECE6F0'}
};

export const DOC: Record<DocState, DocStyle> = {
  valid:{l:'Valid',c:'#146C2E'}, rejected:{l:'Visa rejected',c:'#B3261E'},
  expiring:{l:'Expires 18 d',c:'#7A5900'}, awaiting:{l:'Awaiting GC',c:'#49454F'},
  archived:{l:'Archived',c:'#79747E'}
};

export const PROJECTS: TcProjectRow[] = [
  ['EMB1A','Emerald Bay Block A','1A','128 workers · 84 on site'],
  ['EMB1A-RFP2','Emerald Bay Block A — RFP2','R2','24 workers · electrical fit-out'],
  ['EMB2A','Emerald Bay Block B','2B','61 workers · mobilising']
];

export const NAV: TcNavGroup[] = [
  ['Overview',[['home','Home','','home']]],
  ['My workers',[['workers','Worker register','128','groups'],['add','Add a worker','','person_add'],['inactive','Inactive workers','4','running_with_errors'],['leavers','Leavers','4','logout']]],
  ['Compliance',[['docs','Documents','6','fact_check'],['training','Training records','2','school'],['hours','Hours & days','3','schedule']]],
  ['Inductions',[['inductions','Induction booking','6','event_available']]],
  ['Visitors',[['visitors','Visitor requests','2','how_to_reg']]]
];

export const TITLES: Record<TcScreen, [string, string]> = {
  home:['Home','A queue with deadlines — not a dashboard'],
  workers:['My workers','128 on the register — access state and document state are the only two things that stop a worker at the gate'],
  worker:['Worker record','You own the uploads; zones, training records and violations are GC-owned'],
  add:['Add a worker','Stepped and resumable — every step saves as a draft'],
  docs:['Documents','Grouped by consequence: rejected first, then expiring, then already blocked'],
  training:['Training records','A matrix, because the question is always “who can go where”'],
  hours:['Hours & days','The same numbers and thresholds the auto-block uses'],
  inductions:['Induction booking','Only GC-validated workers can be booked — capacity shown per slot'],
  inactive:['Inactive workers','The 31-day clock, before it fires'],
  leavers:['Leavers','A last day, not a delete — the record stays for audit'],
  visitors:['Visitor requests','An ask, not a grant — the only visitor screen a trade contractor gets'],
  // Not from the canvas: the design has no sign-in screen.
  signin:['Sign in','The contractor door — one account per company, one project at a time']
};

export const DOCQ: TcDocRow[] = [
  {id:'d1',n:'Bilal Ahmed',doc:'Work visa',d:'WORK VISA · UNREADABLE SCAN',when:'2 d',grp:'rej',no:'WV-2291884',exp:'2028-06-30',file:'VISA-SCAN.PDF · 1 PAGE',
   reason:'“Passport photo page is cut off at the bottom — the expiry date is not readable. Re-upload the full page, flat, no glare.”',
   head:'REJECTED BY THE GC — 24 AUG 11:40 · A. WHITMORE', st:'Rejected 24 Aug', days:'5 DAYS LEFT TO PRODUCE THIS DOCUMENT', pct:'64%'},
  {id:'d2',n:'Hafiz Rahman',doc:'CIDB accreditation',d:'CIDB · WRONG TRADE CATEGORY',when:'4 d',grp:'rej',no:'GC-8842019',exp:'2027-01-11',file:'CIDB-CARD.JPG · 1 PAGE',
   reason:'“The card is for general construction, not scaffolding — the declared role needs a scaffolder category card.”',
   head:'REJECTED BY THE GC — 22 AUG 09:12 · GC COMPLIANCE', st:'Rejected 22 Aug', days:'3 DAYS LEFT TO PRODUCE THIS DOCUMENT', pct:'42%'},
  {id:'d3',n:'Deepak Rai',doc:'CIDB accreditation',d:'CIDB ACCREDITATION',when:'18 d',grp:'exp',no:'GC-8840771',exp:'2026-09-12',file:'CIDB-CARD.PDF · 1 PAGE',
   reason:'Not rejected — it expires in 18 days. Upload the renewal before 12 Sep and the worker never notices.',
   head:'EXPIRING — RENEWAL NOT YET UPLOADED', st:'Expires 18 d', days:'18 DAYS UNTIL ACCESS STOPS', pct:'22%'},
  {id:'d4',n:'Krishna Bahadur',doc:'Working at height',d:'WORKING AT HEIGHT CERT.',when:'21 d',grp:'exp',no:'WAH-44120',exp:'2026-09-15',file:'WAH-CERT.PDF · 2 PAGES',
   reason:'Not rejected — it expires in 21 days. Scaffold decks require it, so access to those zones stops on expiry.',
   head:'EXPIRING — BLOCKS SCAFFOLD DECKS ON EXPIRY', st:'Expires 21 d', days:'21 DAYS UNTIL ACCESS STOPS', pct:'18%'},
  {id:'d5',n:'Ravi Kumaran',doc:'Passport',d:'PASSPORT',when:'28 d',grp:'exp',no:'A4128866',exp:'2026-09-22',file:'PASSPORT.PDF · 1 PAGE',
   reason:'Not rejected — it expires in 28 days. A renewed passport also needs the visa re-linked by the GC.',
   head:'EXPIRING — VISA MUST BE RE-LINKED AFTER RENEWAL', st:'Expires 28 d', days:'28 DAYS UNTIL ACCESS STOPS', pct:'12%'},
  {id:'d6',n:'Sunil Gurung',doc:'Work visa',d:'WORK VISA · BLOCKED 3 DAYS AGO',when:'—',grp:'gone',no:'WV-2288010',exp:'2026-08-18',file:'VISA-SCAN-OLD.PDF · 1 PAGE',
   reason:'Expired on 18 Aug. Access was withdrawn automatically at 23:59 that day — only the GC can reinstate it once a valid visa is validated.',
   head:'EXPIRED — ACCESS ALREADY STOPPED', st:'Blocked 21 Aug', days:'CLOCK EXPIRED — WORKER IS BLOCKED', pct:'100%'}
];

export const TRCOLS: string[] = ['SITE INDUCTION','WORKING AT HEIGHT','LV ELECTRICAL','CONFINED SPACE','FIRST AID'];

export const TRROWS: TcTrainingRow[] = [
  ['Ravi Kumaran','Electrician',['12 Aug 26','2028','exp:21 d','—','2027']],
  ['Ahmad Zulkifli','Electrician',['04 Jul 26','2029','—','2027','—']],
  ['Bilal Ahmed','Scaffolder',['—','2028','—','—','—']],
  ['Nabin Thapa','Pipefitter',['19 Jun 26','—','—','—','2027']],
  ['Krishna Bahadur','Scaffolder',['12 Aug 26','2027','2029','2028','2028']],
  ['Deepak Rai','Welder',['22 May 26','exp:expired','—','—','—']],
  ['Lokesh Pillai','Cable puller',['08 Aug 26','2028','2027','—','2029']]
];

/**
 * The design draws its induction slots as a fictional Mon–Fri × 09:00/14:00 grid
 * (markup lines 569–616). Transcribed here as sessions so the offline console still
 * shows the canvas; `GET /tc/bootstrap` replaces them with the project's real ones,
 * whose ids are what a booking is actually made against.
 *
 * The grid's two "NO SESSION" cells are simply absent — there is no session to model.
 */
export const INDUCTIONS: TcInductionSession[] = [
  ['Mon 24 Aug, 09:00', 30, 30], ['Tue 25 Aug, 09:00', 30, 27], ['Wed 26 Aug, 09:00', 30, 12], ['Thu 27 Aug, 09:00', 30, 6],
  ['Mon 24 Aug, 14:00', 30, 21], ['Tue 25 Aug, 14:00', 30, 0], ['Thu 27 Aug, 14:00', 30, 0], ['Fri 28 Aug, 14:00', 30, 0]
].map(([when, capacity, booked], i) => ({
  // No database behind the fixtures, so no real id: `withId` degrades the booking to
  // the design's own toast rather than firing a request that cannot resolve.
  id: '',
  ref: 'IND-' + (91 + i),
  when: when as string,
  where: 'Site office — training room 1',
  runBy: 'T. W. Ming',
  capacity: capacity as number,
  booked: booked as number,
  remaining: (capacity as number) - (booked as number),
  state: (capacity as number) - (booked as number) > 0 ? 'open' : 'full',
  attendance: []
}));

export const HR: TcHoursRow[] = [
  ['Ravi Kumaran','Electrician',97,'58 / 60','Day 11 of 12',1,'WARNED'],
  ['Krishna Bahadur','Scaffolder',90,'54 / 60','Day 12 of 12',1,'WARNED'],
  ['Nabin Thapa','Pipefitter',100,'61 / 60','Day 6 of 12',1,'WARNED'],
  ['Deepak Rai','Welder',73,'44 / 60','Day 5 of 12',0,'—'],
  ['Rahmat Santoso','Labourer',63,'38 / 60','Day 3 of 12',0,'—'],
  ['Ahmad Zulkifli','Electrician',52,'31 / 60','Day 2 of 12',0,'—'],
  ['Rajesh Naidu','Foreman',78,'47 / 60','Day 8 of 12',0,'—']
];

export const IA: TcInactiveRow[] = [
  ['Sunil Gurung','26 Jul',30,'Tonight','Warned twice',1],
  ['Hafiz Rahman','27 Jul',29,'Tomorrow','Warned twice',1],
  ['Rahmat Santoso','28 Jul',28,'30 Aug','Warned once',1],
  ['Md Shahin Alam','01 Aug',24,'03 Sep','—',0],
  ['Arun Selvam','03 Aug',22,'05 Sep','—',0],
  ['Bilal Ahmed','20 Jul',36,'—','Blocked 25 Aug',2],
  ['Lokesh Pillai','18 Jul',38,'—','Blocked 23 Aug',2]
];

export const LV: TcLeaverRow[] = [
  ['Arun Selvam','26 Aug','Contract ended','Returned','412 h','Access ends 23:59',1,'Labourer · EMB1A · 9 months'],
  ['Sunil Gurung','27 Aug','Resigned','Not returned','388 h','Card not returned',2,'Labourer · EMB1A · 14 months'],
  ['Nabin Thapa','31 Aug','Transferred to Contractor D','Kept — transfer','1,204 h','Awaiting D’s request',0,'Pipefitter · EMB1A · 2 years'],
  ['Bilal Ahmed','22 Aug','Dismissed — warning 3','Returned','96 h','Access removed',0,'Scaffolder · EMB1A · 4 months'],
  ['Md Shahin Alam','15 Aug','Contract ended','Returned','2,088 h','Completed',0,'Labourer · EMB1A · 3 years'],
  ['Hafiz Rahman','09 Aug','Resigned','Returned','744 h','Completed',0,'Scaffolder · EMB1A · 1 year']
];

export const VR: TcVisitorRow[] = [
  ['Supplier rep','Steelforce Sdn Bhd','Rebar sample','Tue 10:00–12:00','A. Whitmore','Waiting · 4 h','#7A5900','ASKED 4 HOURS AGO',1],
  ['Crane engineer','Lifting Services Asia','Annual inspection','Wed 08:00–11:00','J. Menon','Waiting · 1 h','#7A5900','ASKED 1 HOUR AGO',1],
  ['Formwork supplier','Titan Formwork','Site measure','Mon 09:00–12:00','A. Whitmore','Approved — A Site only','#146C2E','LAYDOWN DECLINED · WINDOW CUT TO 90 MIN',0],
  ['Sales rep','Voltix Cables','Product demo','Thu 14:00–16:00','A. Foo','Declined','#B3261E','“NOT DURING THE POUR — ASK AGAIN NEXT WEEK”',0],
  ['Consultant','WeldCheck','Weld inspection','Fri 09:00–13:00','J. Menon','Approved — pass sent','#146C2E','THE VISITOR HAS THE QR · YOU DO NOT',0]
];

export const AWSTEPS: TcWizardStep[] = [
  ['Identity','NAME, SEX, DOB, PHOTO'],
  ['Contact & kin','ADDRESSES, PHONE, NEXT OF KIN'],
  ['Statutory documents','ID, VISA, ACCREDITATION'],
  ['Training records','CERTIFICATES YOU ALREADY HOLD'],
  ['Employment & zones','ROLE, EMPLOYER, PROJECT']
];

/** Step 3 is deliberately absent in the design — it is an upload step, not a form. */
export const AWFIELDS: Record<number, TcWizardField[]> = {
  1:[['Full name as in passport','','Md Shahin Alam'],['Sex','Male',''],['Date of birth','','1994-08-02'],['Nationality','Bangladesh',''],['Passport photo','','Drop or take a photograph'],['Mobile','','+60']],
  2:[['Mobile','+60 12-448 9012',''],['Malaysia address','','Blk C, Jalan Kempas 4, Johor'],['Home country address','','Village, district, country'],['Next of kin name','',''],['Next of kin phone','','+880'],['Relationship','Brother','']],
  4:[['Working at height','Held — expires 2028',''],['Confined space','Not held',''],['LV electrical','Held — expires 2027',''],['First aid','Not held',''],['Manual handling','Held — expires 2029',''],['Certificate to upload','','Drop a certificate']],
  5:[['Job role','Electrician’s mate',''],['Direct employer','Sinar Electrical',''],['Project','EMB1A',''],['Start date','','2026-09-08'],['Shift pattern','Day',''],['Zones requested','Set by the GC after induction','']]
};

export const AWNOTES: Record<number, string> = {
  1:'The name here must match the passport scan exactly — a mismatch is the most common rejection reason.',
  2:'Next of kin is mandatory on this project. The GC reads it only in an incident.',
  4:'Certificates you hold now are validated by the GC before they count towards a zone.',
  5:'You choose the role and the employer. Zone access is granted by the GC once the worker has been inducted.'
};
