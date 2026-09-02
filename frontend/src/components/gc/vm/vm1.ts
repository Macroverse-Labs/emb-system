import { ST } from "@/lib/gc/fixtures";
import { gcApi } from "@/lib/gc/api";
import type { GcCtx } from "./ctx";
import { docsFor, dst, trainingFor, workers } from "./data";

/**
 * Port of `vmScreens()` (design lines 1544–1677): the worker register, the
 * worker profile, the document validation queue and the alerts screen. The
 * design's `vq()` (lines 1497–1506) is `SUBMISSIONS` in the fixtures, and its
 * `decide(kind)` (lines 1508–1515) folds in here as a local.
 */
export function vm1(ctx: GcCtx) {
  const { s, set, go, toast, actions } = ctx;
  const { alerts: ALERTS, submissions: SUBMISSIONS, workers: W } = ctx.data;

  const decide = (kind: "approved" | "rejected") => {
    const items = SUBMISSIONS.filter((i) => !s.vqDone[i.id]);
    const c = items[Math.min(s.vqIdx, items.length - 1)];
    if (!c) return;
    set({ vqDone: { ...s.vqDone, [c.id]: kind }, vqIdx: 0, vqReason: "" });
    const reason = s.vqReason || "Scan illegible or cropped";
    actions.run(
      () =>
        kind === "approved"
          ? gcApi.approveDocument(c.id)
          : gcApi.rejectDocument(c.id, reason),
      kind === "approved"
        ? c.doc + " approved — " + c.w + " cleared to book an induction"
        : c.doc + " rejected — " + c.co + " notified with the reason",
    );
  };

  /* ---- worker register ---- */
  const fdef: [string, string][] = [
    ["all", "All"],
    ["onsite", "On site now"],
    ["expiring", "Expiring"],
    ["expired", "Expired & blocked"],
    ["pending", "Awaiting induction"],
    ["draft", "Drafts"],
  ];
  const wkFilters = fdef.map((f) => ({
    label: f[1],
    go: () => set({ filter: f[0] }),
    fg: s.filter === f[0] ? "#1D192B" : "#49454F",
    bd: s.filter === f[0] ? "#E8DEF8" : "#79747E",
    bg: s.filter === f[0] ? "#E8DEF8" : "transparent",
  }));
  const q = s.q.toLowerCase();
  const matched = workers(W).filter((w) => {
    if (q && !(w.n + w.id + w.co + w.role).toLowerCase().includes(q)) return false;
    if (s.filter === "onsite") return w.on === 1;
    if (s.filter === "expiring") return w.st === "expiring";
    if (s.filter === "expired") return w.st === "expired" || w.st === "blocked";
    if (s.filter === "pending") return w.st === "pending" || w.st === "review";
    if (s.filter === "draft") return w.st === "draft";
    return true;
  });
  const sortKeys: Record<string, "n" | "co" | "role" | "st" | "seen"> = {
    name: "n",
    co: "co",
    role: "role",
    status: "st",
    seen: "seen",
  };
  const key = sortKeys[s.sort] || "n";
  const rows = matched.slice().sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * s.dir);

  const cols: [string, string, string][] = [
    ["name", "Worker", "1.7fr"],
    ["co", "Contractor", "1.15fr"],
    ["role", "Trade", "1fr"],
    ["zones", "Zones permitted", "1.3fr"],
    ["status", "Status", ".9fr"],
    ["seen", "Last event", ".75fr"],
  ];

  /* ---- worker profile ---- */
  const w = workers(W)[s.workerId] || workers(W)[0];
  const wst = ST[w.st];
  const wtabs = ["overview", "documents", "training", "access", "hours", "violations", "timeline"] as const;
  const wt = Object.fromEntries(wtabs.map((t) => ["wt_" + t, s.wtab === t])) as Record<
    `wt_${(typeof wtabs)[number]}`,
    boolean
  >;
  const wpDays: [string, string, number][] = [
    ["Mon", "9h 10m", 92],
    ["Tue", "8h 40m", 86],
    ["Wed", "10h 05m", 100],
    ["Thu", "7h 15m", 72],
    ["Fri", "3h 10m", 32],
    ["Sat", "—", 0],
    ["Sun", "—", 0],
  ];

  /* ---- validation queue ---- */
  const all = SUBMISSIONS;
  const pend = all.filter((i) => !s.vqDone[i.id]);
  const cur = pend[Math.min(s.vqIdx, Math.max(0, pend.length - 1))];

  /* ---- alerts ---- */
  const atabs: [string, string][] = [
    ["all", "All"],
    ["expiry", "Documents"],
    ["hours", "Hours"],
    ["device", "Devices"],
    ["block", "Blocks"],
    ["validation", "Validation"],
    ["visitor", "Visitors"],
  ];

  return {
    /* ---- worker register ---- */
    wkFilters,
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
      const st = ST[r.st];
      const on = s.sel.indexOf(r.i) >= 0;
      return {
        n: r.n,
        id: r.id,
        co: r.co,
        role: r.role,
        zones: r.zones,
        seen: r.seen,
        stl: st.l,
        stc: st.c,
        onSite: r.on ? "On site" : "",
        onC: r.on ? "#146C2E" : "transparent",
        bg: on ? "#E8DEF8" : "transparent",
        box: on ? "#6750A4" : "transparent",
        bd: on ? "#6750A4" : "#79747E",
        tick: on ? "✓" : "",
        pick: (e: React.MouseEvent) => {
          e.stopPropagation();
          const sel = s.sel.slice();
          const i = sel.indexOf(r.i);
          if (i >= 0) sel.splice(i, 1);
          else sel.push(r.i);
          set({ sel });
        },
        go: () => go("worker", { workerId: r.i, wtab: "overview" }),
      };
    }),
    wkCount: rows.length + " of " + W.length + " shown",
    wkTotal: "2,418 on the register · sample of 20 loaded",
    wkSelN: s.sel.length,
    hasSel: s.sel.length > 0,
    wkSelLabel: s.sel.length + (s.sel.length === 1 ? " worker selected" : " workers selected"),
    wkSelAll: () => set({ sel: s.sel.length === rows.length ? [] : rows.map((r) => r.i) }),
    wkAllTick: s.sel.length > 0 && s.sel.length === rows.length ? "✓" : "",
    wkClearSel: () => set({ sel: [] }),
    wkBulkZones: () => {
      toast("Zone assignment applied to " + s.sel.length + " workers — logged against your account");
      set({ sel: [] });
    },
    wkBulkBlock: () => {
      toast(s.sel.length + " workers blocked at every gate — contractors notified");
      set({ sel: [] });
    },
    wkBulkExport: () => {
      toast("CSV of " + s.sel.length + " worker records queued — emailed when ready");
      set({ sel: [] });
    },
    wkAdd: () => toast("Workers are created by their trade contractor — GC validates what they upload"),

    /* ---- worker profile ---- */
    wpName: w.n,
    wpId: w.id,
    wpCo: w.co,
    wpRole: w.role,
    wpNat: w.nat,
    wpStL: wst.l,
    wpStC: wst.c,
    wpZones: w.zones,
    wpSeen: w.on ? "On site · in at " + w.seen : "Off site · last event " + w.seen,
    wpBack: () => go("workers"),
    wpTabs: (
      [
        ["overview", "Overview"],
        ["documents", "Documents"],
        ["training", "Training"],
        ["access", "Access & zones"],
        ["hours", "Hours"],
        ["violations", "Violations"],
        ["timeline", "Timeline"],
      ] as [string, string][]
    ).map((t) => ({
      label: t[1],
      go: () => set({ wtab: t[0] }),
      fg: s.wtab === t[0] ? "#1D1B20" : "#49454F",
      bd: s.wtab === t[0] ? "#6750A4" : "transparent",
    })),
    ...wt,
    wpDocs: docsFor(w).map((d) => {
      const st = dst(d.st);
      return { t: d.t, no: d.no, exp: d.exp, prov: d.prov, stl: st.l, stc: st.c, go: () => go("validation") };
    }),
    wpTraining: trainingFor(w).map((t) => {
      const st = dst(t.st);
      return { t: t.t, exp: t.exp, stl: st.l, stc: st.c, bd: t.st === "none" ? "#CAC4D0" : st.c };
    }),
    wpFacts: (
      [
        ["Date of birth", "14 Jun 1991"],
        ["Sex", "Male"],
        ["Nationality", w.nat],
        ["Telephone", "+60 12-448 9012"],
        ["Malaysia address", "Blk C, Jalan Kempas 4, Johor"],
        ["Home country address", "On file — uploaded by " + w.co],
        ["Direct employer", w.co === "Emerald Builders" ? "Emerald Builders" : w.co + " (direct)"],
        ["Project", "EMB1A"],
        ["Induction date", "12 Feb 2026"],
        ["Next of kin", "On file · +880 17-224 1180"],
      ] as [string, string][]
    ).map((f) => ({ k: f[0], v: f[1] })),
    wpCred: (
      [
        ["RFID card", "Card 8841 · issued 12 Feb 2026"],
        ["Face template", "Enrolled 12 Feb 2026 · quality 94%"],
        ["Second factor", "Required at A3 Electrical, Laydown"],
      ] as [string, string][]
    ).map((f) => ({ k: f[0], v: f[1] })),
    wpHours: (
      [
        ["This week", "38 h 20 m", "of 60 h cap", "#146C2E"],
        ["Last week", "52 h 05 m", "of 60 h cap", "#7A5900"],
        ["Consecutive days", "4", "of 6 allowed", "#7A5900"],
        ["Average start", "06:38", "last 14 days", "#79747E"],
      ] as [string, string, string, string][]
    ).map((h) => ({ k: h[0], v: h[1], sub: h[2], c: h[3] })),
    wpDays: wpDays.map((d) => ({ d: d[0], h: d[1], pct: d[2] + "%" })),
    wpViol: [
      {
        d: "18 Jun 2026",
        t: "No high-visibility vest in A2 Podium",
        by: "T. W. Ming · Safety officer",
        lvl: "Verbal warning",
        c: "#7A5900",
      },
      {
        d: "02 Apr 2026",
        t: "Entered A3 Electrical without escort",
        by: "J. Lim · Site engineer",
        lvl: "Written warning",
        c: "#B3261E",
      },
    ],
    wpTimeline: (
      [
        ["Today 06:42", "Entry — Gate A pedestrian", "Card + face, 2FA"],
        ["Yesterday 18:12", "Exit — Gate A pedestrian", "Card only"],
        ["24 Aug 2026", "CIDB green card renewed", "Uploaded by " + w.co + ", validated by A. Whitmore"],
        ["12 Feb 2026", "Induction completed", "Session IND-84 · card and face enrolled"],
        ["09 Feb 2026", "Documents validated", "5 of 5 approved"],
        ["06 Feb 2026", "Worker profile created", w.co + " · draft submitted"],
      ] as [string, string, string][]
    ).map((t) => ({ t: t[0], e: t[1], m: t[2] })),
    wpBlock: () => set({ modal: "block" }),
    wpAddTraining: () => set({ modal: "training" }),
    wpPrint: () => toast("Worker record exported — PDF with document scans attached"),
    modalBlock: s.modal === "block",
    modalTraining: s.modal === "training",
    closeModal: () => set({ modal: null }),
    confirmBlock: () => {
      set({ modal: null });
      actions.run(
        () => gcApi.blockWorker(w.rowId ?? "", "Blocked from the worker profile"),
        w.n + " blocked at every gate · " + w.co + " notified",
      );
    },
    confirmTraining: () => {
      set({ modal: null });
      toast("Training record added — zone eligibility recalculated");
    },

    /* ---- validation queue ---- */
    vqList: all.map((i) => {
      const done = s.vqDone[i.id];
      const active = !!cur && cur.id === i.id;
      const ix = pend.findIndex((p) => p.id === i.id);
      return {
        w: i.w,
        co: i.co,
        doc: i.doc,
        sub: i.sub,
        bg: active ? "#E8DEF8" : "transparent",
        bar: active ? "inset 2px 0 0 #6750A4" : "none",
        stl: done ? (done === "approved" ? "Approved" : "Rejected") : i.sub,
        stc: done ? (done === "approved" ? "#146C2E" : "#B3261E") : "#79747E",
        op: done ? ".5" : "1",
        go: () => set({ vqIdx: ix >= 0 ? ix : s.vqIdx }),
      };
    }),
    vqHasCur: !!cur,
    vqDoneN: Object.keys(s.vqDone).length + " decided this session",
    vqRemaining: pend.length + " waiting · 18 in the full queue",
    vqW: cur ? cur.w : "",
    vqCo: cur ? cur.co : "",
    vqDoc: cur ? cur.doc : "",
    vqSub: cur ? "Submitted " + cur.sub : "",
    vqFields: cur ? cur.fields.map((f) => ({ k: f[0], v: f[1] })) : [],
    vqFlags: cur
      ? cur.flags.map((f) => ({ t: f, c: f.includes("missing") || f.includes("rejected") ? "#B3261E" : "#49454F" }))
      : [],
    vqApprove: () => decide("approved"),
    vqReject: () => decide("rejected"),
    vqReason: s.vqReason,
    vqSetReason: (e: React.ChangeEvent<HTMLSelectElement>) => set({ vqReason: e.target.value }),
    vqReasons: [
      "Scan illegible or cropped",
      "Expiry date already passed",
      "Name does not match the profile",
      "Wrong document type uploaded",
      "Trade does not match the job role",
    ],
    vqRotate: () => toast("Scan rotated — the original file is never altered"),
    vqZoom: () => toast("Opened at full size · press esc to return"),

    /* ---- alerts ---- */
    alTabs: atabs.map((t) => ({
      label: t[1],
      go: () => set({ alertTab: t[0] }),
      n: t[0] === "all" ? String(ALERTS.length) : String(ALERTS.filter((a) => a[0] === t[0]).length),
      fg: s.alertTab === t[0] ? "#1D1B20" : "#49454F",
      bd: s.alertTab === t[0] ? "#6750A4" : "transparent",
    })),
    alRows: ALERTS.filter((a) => s.alertTab === "all" || a[0] === s.alertTab).map((a) => ({
      t: a[1],
      s: a[2],
      n: a[3],
      c: a[4],
      kind: a[0].toUpperCase(),
      go: () => go(a[5]),
      snooze: (e: React.MouseEvent) => {
        e.stopPropagation();
        toast("Snoozed for 24 hours — it returns tomorrow at 07:00");
      },
      resolve: (e: React.MouseEvent) => {
        e.stopPropagation();
        toast("Marked handled · recorded against A. Whitmore");
      },
    })),
    alResolveAll: () => toast("Nothing was bulk-cleared — each row needs its own reason"),
  };
}
