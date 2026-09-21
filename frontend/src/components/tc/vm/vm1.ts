import { ACC, AWFIELDS, AWNOTES, AWSTEPS, DOC } from "@/lib/tc/fixtures";
import { tcApi, type WorkerIn } from "@/lib/tc/api";
import type { TcWorkerRow } from "@/lib/tc/types";
import { withId, type TcCtx } from "./ctx";

/**
 * Port of `workers()` (design line 942) — gives the positional tuples their names.
 *
 * `id` is the design's printed reference (`EMB-04099`), which the register shows and
 * no endpoint accepts; `wid` is the database id `/tc/bootstrap` appends, which every
 * `/tc/workers/{id}/…` call is addressed to. They are not interchangeable.
 */
function workers(rows: TcWorkerRow[]) {
  return rows.map((w, i) => ({ i, n: w[0], id: w[1], role: w[2], emp: w[3], acc: w[4], doc: w[5], seen: w[6], wid: w[7] }));
}

/**
 * Stands in for the selected worker when the register is empty — a brand-new
 * contractor has nobody on it. The worker record is only reachable from a register
 * row, so this is never rendered; it exists so the view-model builds. Its `acc` and
 * `doc` are real keys of `ACC` / `DOC`, and `wid` is absent, so a mutation fired
 * against it degrades through `withId`.
 */
const NO_WORKER: ReturnType<typeof workers>[number] = {
  i: 0, n: "", id: "", role: "", emp: "", acc: "pending", doc: "awaiting", seen: "", wid: undefined,
};

/**
 * Design label → the key the wizard holds that field's value under, which is also the
 * name it lands on in `WorkerIn`. This table is the whole label-to-payload mapping:
 * nothing else in the wizard matches on a label.
 *
 * A label absent from it keys off the label itself — the design's display-only extras
 * (the photo, the training already held, project, shift, zones) have no column behind
 * them and only ever reach the draft's `fields`. "Mobile" is on both step 1 and step 2
 * and is one number in both, so the two inputs share `telephone` deliberately.
 */
const AWKEYS: Record<string, string> = {
  "Full name as in passport": "name",
  Sex: "sex",
  "Date of birth": "date_of_birth",
  Nationality: "nationality",
  Mobile: "telephone",
  "Malaysia address": "address_local",
  "Home country address": "address_home",
  "Next of kin name": "nok_name",
  "Next of kin phone": "nok_phone",
  Relationship: "nok_relationship",
  "Job role": "job_role",
  "Direct employer": "direct_employer",
};

const keyOf = (label: string) => AWKEYS[label] ?? label;

/** The design's own prefilled values, under those same keys. What is typed wins. */
const AWSEED: Record<string, string> = Object.fromEntries(
  Object.values(AWFIELDS)
    .flat()
    .filter((f) => f[1])
    .map((f) => [keyOf(f[0]), f[1]]),
);

/** Port of `toggle(list, v)` (design line 943). */
function toggle(list: number[], v: number): number[] {
  const a = list.slice();
  const i = a.indexOf(v);
  if (i >= 0) a.splice(i, 1);
  else a.push(v);
  return a;
}

/**
 * Port of the first four `renderVals()` slices of `TC Console HiFi M3.dc.html`
 * (design lines 987–1122): Home, the worker register, the worker record and the
 * Add-a-worker wizard.
 *
 * Where the design stands a `this.toast(...)` in for a real action — export, bulk
 * withdrawal, withdrawing one worker, saving the draft, submitting the worker — the
 * call goes through `actions.run`, with the design's own sentence kept as the
 * offline message so the fixtures build still reads exactly as the canvas does.
 */
export function vm1(ctx: TcCtx) {
  const { s, set, go, toast, actions } = ctx;
  const W = ctx.data.workers;
  const all = workers(W);

  /* ---- worker register ---- */
  const fdef: [string, string][] = [
    ["all", "All"],
    ["onsite", "On site now"],
    ["pending", "Awaiting induction"],
    ["blocked", "Blocked"],
    ["inactive", "Inactive"],
    ["left", "Left project"],
  ];
  const q = s.q.toLowerCase();
  const matched = all.filter((w) => {
    if (q && !(w.n + w.id + w.role).toLowerCase().includes(q)) return false;
    if (s.filter === "all") return true;
    return w.acc === s.filter;
  });
  const sortKeys: Record<string, "n" | "role" | "emp" | "acc" | "doc" | "seen"> = {
    name: "n",
    role: "role",
    emp: "emp",
    acc: "acc",
    doc: "doc",
    seen: "seen",
  };
  const key = sortKeys[s.sort] || "n";
  const rows = matched.slice().sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * s.dir);

  const cols: [string, string][] = [
    ["name", "WORKER"],
    ["role", "TRADE"],
    ["emp", "EMPLOYER"],
    ["acc", "ACCESS"],
    ["doc", "DOCUMENTS"],
    ["seen", "LAST BADGE"],
  ];

  /* ---- worker record ---- */
  const w = all[s.workerId] || all[0] || NO_WORKER;
  const wacc = ACC[w.acc];
  const wtabs = ["documents", "training", "hours", "history"] as const;
  const wt = Object.fromEntries(wtabs.map((t) => ["wt_" + t, s.wtab === t])) as Record<
    `wt_${(typeof wtabs)[number]}`,
    boolean
  >;

  /* ---- add a worker ---- */
  const st = s.awStep;
  const fields = { ...AWSEED, ...s.awFields };
  const val = (k: string) => fields[k]?.trim() || undefined;
  const draftMsg = "Draft saved — resume from Home or the worker register";

  /**
   * One save of the wizard: the first creates the draft, every later one updates it.
   * The id comes back in `DraftOut` and is kept in state, which is what makes the
   * design's "every step saves as a draft … resume any time" true.
   *
   * ponytail: two Continues inside one round trip would open two drafts. Disable the
   * button while a save is in flight if that ever shows up in the data.
   */
  const saveDraft = async (step: number) => {
    const body = { step, fields };
    const out = s.awDraftId
      ? await tcApi.saveDraft(s.awDraftId, body)
      : await tcApi.createDraft(body);
    set({ awDraftId: out.id });
    return { message: draftMsg };
  };

  return {
    /* ---- home ---- */
    hmTiles: (
      [
        ["MY WORKERS ON SITE", "84", "of 128 on the register", "#1D1B20", "66%"],
        ["CLEARED TO BOOK", "6", "documents validated by the GC", "#146C2E", "48%"],
        ["DOCUMENTS NEED ACTION", "6", "2 rejected · 3 expiring · 1 expired", "#7A5900", "40%"],
        ["HOURS & DAYS WARNINGS", "3", "2 auto-block on Friday", "#B3261E", "25%"],
      ] as [string, string, string, string, string][]
    ).map((x) => ({ k: x[0], v: x[1], sub: x[2], c: x[3], pct: x[4] })),
    hmQueue: (
      [
        ["Work visa rejected — scan unreadable", "1 worker · blocks induction booking", "Re-upload", "TODAY", "#B3261E", "docs"],
        ["Consecutive days limit reached", "2 workers · auto-block on day 12", "View hours", "1 DAY", "#B3261E", "hours"],
        ["CIDB accreditation expires", "3 workers · renew before expiry", "Upload", "18 DAYS", "#7A5900", "docs"],
        ["Cards unused for 31 days", "4 workers · access will be withdrawn", "Review", "4 DAYS", "#7A5900", "inactive"],
        ["Six workers cleared — not booked", "induction slots this week are filling", "Book", "3 DAYS", "#49454F", "inductions"],
        ["Draft worker profile incomplete", "step 3 of 5 · saved 2 days ago", "Resume", "—", "#79747E", "add"],
      ] as [string, string, string, string, string, "docs" | "hours" | "inactive" | "inductions" | "add"][]
    ).map((x) => ({ t: x[0], s: x[1], a: x[2], w: x[3], c: x[4], go: () => go(x[5]) })),
    hmGc: (
      [
        ["5 documents validated", "VALIDATOR · GC COMPLIANCE", "2 h"],
        ["Induction confirmed — Tue 09:00", "3 OF YOUR WORKERS", "1 d"],
        ["Zone A3 now needs LV training", "2 OF YOUR WORKERS AFFECTED", "2 d"],
        ["Worker marked as left project", "ACCESS WITHDRAWN BY GC", "3 d"],
        ["Violation recorded — warning 1 of 3", "NO PPE · ZONE B", "5 d"],
      ] as [string, string, string][]
    ).map((x) => ({ t: x[0], s: x[1], ago: x[2] })),

    /* ---- worker register ---- */
    wkFilters: fdef.map((f) => ({
      label: f[1],
      go: () => set({ filter: f[0] }),
      fg: s.filter === f[0] ? "#1D192B" : "#49454F",
      bd: s.filter === f[0] ? "#E8DEF8" : "#79747E",
      bg: s.filter === f[0] ? "#E8DEF8" : "transparent",
    })),
    wkQ: s.q,
    wkSetQ: (e: React.ChangeEvent<HTMLInputElement>) => set({ q: e.target.value }),
    wkClear: () => set({ q: "", filter: "all" }),
    wkCols: cols.map((c) => ({
      label: c[1],
      go: () => set({ sort: c[0], dir: s.sort === c[0] ? ((-s.dir) as 1 | -1) : 1 }),
      caret: s.sort === c[0] ? (s.dir === 1 ? "▴" : "▾") : "",
      fg: s.sort === c[0] ? "#1D1B20" : "#49454F",
    })),
    wkRows: rows.map((r) => {
      const acc = ACC[r.acc];
      const doc = DOC[r.doc];
      const on = s.sel.indexOf(r.i) >= 0;
      return {
        n: r.n,
        id: r.id,
        role: r.role,
        emp: r.emp,
        seen: r.seen,
        acc: acc.l,
        accFg: acc.fg,
        accBg: acc.bg,
        doc: doc.l,
        docC: doc.c,
        op: r.acc === "left" ? ".55" : "1",
        bg: on ? "#E8DEF8" : "transparent",
        box: on ? "#6750A4" : "transparent",
        bd: on ? "#6750A4" : "#79747E",
        tick: on ? "✓" : "",
        pick: (e: React.MouseEvent) => {
          e.stopPropagation();
          set({ sel: toggle(s.sel, r.i) });
        },
        go: () => go("worker", { workerId: r.i, wtab: "documents" }),
      };
    }),
    wkEmpty: rows.length === 0,
    wkEmptyCopy: W.length
      ? "No workers match that search — reset the filters to see the whole register."
      : "Nobody on your register yet — add a worker and the GC validates their documents before an induction can be booked.",
    wkCount: rows.length + " of " + W.length + " shown",
    wkFoot: "1–" + rows.length + " OF 128 · SAMPLE LOADED",
    hasSel: s.sel.length > 0,
    wkSelLabel: s.sel.length + (s.sel.length === 1 ? " worker selected" : " workers selected"),
    wkSelAll: () => set({ sel: s.sel.length === rows.length ? [] : rows.map((r) => r.i) }),
    wkAllTick: s.sel.length > 0 && s.sel.length === rows.length ? "✓" : "",
    wkClearSel: () => set({ sel: [] }),
    wkExport: () =>
      actions.run(async () => {
        // The endpoint answers with the CSV itself, not a sentence, so the toast is
        // written here and the bytes are handed to the browser to save.
        const blob = await tcApi.exportWorkers();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "worker-register.csv";
        a.click();
        URL.revokeObjectURL(url);
        return { message: "Register exported — the CSV is in your downloads" };
      }, "CSV of your register queued — emailed to r.idris@sinarelectrical.com"),
    wkBulkBook: () => {
      toast(s.sel.length + " workers added to the induction basket — only validated ones can be booked");
      go("inductions");
    },
    wkBulkUpload: () => {
      toast("Bulk upload opened for " + s.sel.length + " workers");
      set({ sel: [] });
    },
    wkBulkWithdraw: () => {
      const ids = s.sel.map((i) => all[i]?.wid).filter((id): id is string => !!id);
      const offline =
        "Access withdrawal requested for " + s.sel.length + " workers — the GC is notified";
      set({ sel: [] });
      withId(
        ctx,
        ids.length ? ids : null,
        async (list) => {
          const res = await Promise.all(
            list.map((id) => tcApi.withdrawWorker(id, "Requested from the worker register")),
          );
          return res[res.length - 1] ?? { message: offline };
        },
        offline,
      );
    },

    /* ---- worker record ---- */
    wpEmpty: all.length === 0,
    wpEmptyCopy: "No worker to show — add a worker, then open them from the register.",
    wpName: w.n,
    wpId: w.id,
    wpRole: w.role,
    wpEmp: "Employer: " + w.emp,
    wpProj: "EMB1A",
    wpStL: wacc.l,
    wpStC: wacc.fg,
    wpSeen: "Last badge " + w.seen,
    wpZones: (
      [
        ["Site", 1],
        ["Welfare", 1],
        ["RFP2", 1],
        ["Electrical room", 0],
      ] as [string, number][]
    ).map((z) => ({
      t: z[0],
      fg: z[1] ? "#1D192B" : "#79747E",
      bg: z[1] ? "#E8DEF8" : "transparent",
      bd: z[1] ? "#E8DEF8" : "#CAC4D0",
    })),
    wpFacts: (
      [
        ["Worker ID", "8812-44-0192"],
        ["Sex · age", "Male · 34"],
        ["Employer", w.emp],
        ["Project", "EMB1A"],
        ["Inducted", "12 Aug 2026"],
        ["Credential", "RFID card + face"],
        ["Uploaded by", "R. Idris"],
      ] as [string, string][]
    ).map((f) => ({ k: f[0], v: f[1] })),
    wpTabs: (
      [
        ["documents", "Documents"],
        ["training", "Training"],
        ["hours", "Hours"],
        ["history", "Access history"],
      ] as [string, string][]
    ).map((x) => ({
      label: x[1],
      go: () => set({ wtab: x[0] }),
      fg: s.wtab === x[0] ? "#1D1B20" : "#49454F",
      bd: s.wtab === x[0] ? "#6750A4" : "transparent",
    })),
    ...wt,
    wpDocs: (
      [
        ["Passport / ID", "A4128866", "2031-04-12", "Validated", "#146C2E", "Replace", 0],
        ["Work visa", "WV-2291884", "2028-06-30", "Rejected", "#B3261E", "Re-upload", 1],
        ["CIDB accreditation", "GC-8842019", "2026-09-12", "Expires 18 d", "#7A5900", "Renew", 0],
        ["Malaysia address proof", "—", "—", "Validated", "#146C2E", "Replace", 0],
        ["Next of kin details", "—", "—", "Awaiting GC", "#49454F", "Edit", 0],
      ] as [string, string, string, string, string, string, number][]
    ).map((d) => ({
      t: d[0],
      no: d[1],
      exp: d[2],
      stl: d[3],
      stc: d[4],
      action: d[5],
      bg: d[6] ? "#F9DEDC" : "transparent",
      tc: d[6] ? "#410E0B" : "#1D1B20",
      btnFg: d[6] ? "#B3261E" : "#6750A4",
      btnBd: d[6] ? "#B3261E" : "#79747E",
      go: () => go("docs", { dqId: "d1" }),
    })),
    wpTraining: (
      [
        ["Site induction", "Valid", "12 Aug 2026", "#146C2E", "Required everywhere"],
        ["Working at height", "Valid", "expires 2028", "#146C2E", "Scaffold decks"],
        ["LV electrical", "Expiring", "21 days", "#7A5900", "Electrical room · RFP2"],
        ["Confined space", "Not held", "—", "#79747E", "Tank farm — no access"],
        ["First aid", "Valid", "expires 2027", "#146C2E", "Not zone-gating"],
      ] as [string, string, string, string, string][]
    ).map((x) => ({ t: x[0], stl: x[1], exp: x[2], stc: x[3], bd: x[3], zone: x[4] })),
    wpWeek: "58 h / 60 h",
    wpDays: (
      [
        ["Mon", "9h 10m", 92, "#6750A4"],
        ["Tue", "8h 40m", 86, "#6750A4"],
        ["Wed", "10h 05m", 100, "#7A5900"],
        ["Thu", "9h 15m", 92, "#6750A4"],
        ["Fri", "8h 10m", 82, "#6750A4"],
        ["Sat", "12h 40m", 100, "#B3261E"],
        ["Sun", "—", 4, "#CAC4D0"],
      ] as [string, string, number, string][]
    ).map((d) => ({ d: d[0], h: d[1], pct: d[2] + "%", c: d[3] })),
    wpHourFacts: (
      [
        ["CONSECUTIVE DAYS", "11", "of 12 allowed", "#7A5900"],
        ["AVERAGE START", "06:42", "last 14 days", "#1D1B20"],
        ["AUTO-BLOCK", "Fri 28 Aug", "unless a rest day is taken", "#B3261E"],
      ] as [string, string, string, string][]
    ).map((h) => ({ k: h[0], v: h[1], sub: h[2], c: h[3] })),
    wpTimeline: (
      [
        ["Today 07:12", "Entry — Gate A pedestrian", "Card + face"],
        ["Yesterday 18:04", "Exit — Gate A pedestrian", "Card only"],
        ["24 Aug 11:40", "Work visa rejected by the GC", "A. Whitmore · illegible scan"],
        ["22 Aug 16:02", "Work visa submitted", "R. Idris · attempt 1"],
        ["12 Aug 09:40", "Induction completed", "Session IND-84 · card and face enrolled"],
        ["09 Aug 15:48", "Profile created", "R. Idris · draft submitted"],
      ] as [string, string, string][]
    ).map((x) => ({ t: x[0], e: x[1], m: x[2] })),
    wpWithdraw: () =>
      withId(
        ctx,
        w.wid,
        (id) => tcApi.withdrawWorker(id, "Requested from the worker record"),
        "Access withdrawal requested for " + w.n + " — the GC decides, you are notified",
      ),
    wpLeaver: () => {
      toast("Set a last day for " + w.n + " — off-boarding opened");
      // Carry the worker across: the Leavers panel off-boards `lvWorkerId`, and a
      // blank last day is what the contractor is being asked for.
      go("leavers", { lvWorkerId: w.i, lvDay: "" });
    },

    /* ---- add a worker ---- */
    awStepLabel: "Step " + st + " of 5 · " + AWSTEPS[st - 1][0],
    awSteps: AWSTEPS.map((x, i) => {
      const n = i + 1;
      const done = n < st;
      const on = n === st;
      return {
        label: x[0],
        sub: x[1],
        num: done ? "✓" : String(n),
        bg: on ? "#E8DEF8" : "transparent",
        fg: on ? "#1D192B" : done ? "#1D1B20" : "#79747E",
        fw: on ? 500 : 400,
        dotBg: done ? "#6750A4" : on ? "#FFFFFF" : "transparent",
        dotFg: done ? "#FFFFFF" : on ? "#6750A4" : "#79747E",
        dotBd: done ? "#6750A4" : on ? "#6750A4" : "#CAC4D0",
        go: () => set({ awStep: n }),
      };
    }),
    awDocsStep: st === 3,
    awFormStep: st !== 3,
    awStepTitle: AWSTEPS[st - 1][0],
    awStepNote: AWNOTES[st] || "",
    awFields: (AWFIELDS[st] || []).map((f) => {
      const key = keyOf(f[0]);
      return {
        k: f[0],
        v: fields[key] ?? "",
        ph: f[2],
        set: (e: React.ChangeEvent<HTMLInputElement>) =>
          set({ awFields: { ...s.awFields, [key]: e.target.value } }),
      };
    }),
    awFoot:
      st === 3
        ? "2 of 3 uploaded — induction booking unlocks after GC validation"
        : "Saved as a draft as you type — close and resume any time",
    awNextLabel: st === 5 ? "Submit to the GC" : "Continue",
    awBack: () => set({ awStep: Math.max(1, st - 1) }),
    awNext: () => {
      if (st !== 5) {
        set({ awStep: st + 1 });
        actions.run(() => saveDraft(st + 1), draftMsg);
        return;
      }
      const name = val("name");
      if (!name) {
        // `WorkerIn.name` has min_length 1: without it the submit is a 422 the
        // contractor cannot act on, so say which step is missing instead.
        set({ awStep: 1 });
        toast("Add the full name as it appears in the passport — step 1, Identity");
        return;
      }
      const body: WorkerIn = {
        name,
        draft_id: s.awDraftId,
        job_role: val("job_role"),
        date_of_birth: val("date_of_birth"),
        sex: val("sex"),
        nationality: val("nationality"),
        telephone: val("telephone"),
        address_local: val("address_local"),
        address_home: val("address_home"),
        // One column, three inputs — the model holds next of kin as a single line.
        next_of_kin:
          [val("nok_name"), val("nok_relationship"), val("nok_phone")]
            .filter(Boolean)
            .join(" · ") || undefined,
        direct_employer: val("direct_employer"),
      };
      go("workers");
      set({ awStep: 1, awFields: {}, awDraftId: null });
      actions.run(
        () => tcApi.addWorker(body),
        "Worker submitted — the GC validates the documents, then you can book an induction",
      );
    },
    awSave: () => {
      go("workers");
      actions.run(() => saveDraft(st), draftMsg);
    },
    awDrop: () => toast("File picker opened — PDF or JPG, max 10 MB"),
    awRemove: () => toast("visa-scan.pdf removed from the draft"),
  };
}
