import { tcApi } from "@/lib/tc/api";
import type { TcDocRow } from "@/lib/tc/types";
import { withId, type TcCtx } from "./ctx";

/**
 * Stands in for the open card when the queue is empty — a brand-new contractor has
 * no documents in it. The detail pane is hidden behind `dqEmpty`, so this is never
 * rendered; it exists so the view-model builds. No `submissionId` and no `workerId`,
 * so `dqSubmit` degrades through `withId` rather than firing.
 */
const NO_DOC: TcDocRow = {
  id: "", n: "", doc: "", d: "", when: "", grp: "rej",
  no: "", exp: "", file: "", reason: "", head: "", st: "", days: "", pct: "0%",
};

/**
 * Opens the file dialog and resolves with the chosen scan, or null.
 *
 * The design draws its drop zones as buttons, so there is no `<input type="file">` in
 * the markup to bind to; one is made for the click and thrown away. Both document
 * endpoints take the file as a required multipart part, so without this the Documents
 * queue has nothing to send.
 */
function pickFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/jpeg,image/png";
    input.addEventListener("change", () => resolve(input.files?.[0] ?? null));
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}

/** Port of `toggle(list, v)` (design line 943). */
function toggle(list: number[], v: number): number[] {
  const a = list.slice();
  const i = a.indexOf(v);
  if (i >= 0) a.splice(i, 1);
  else a.push(v);
  return a;
}

/**
 * Port of the next four `renderVals()` slices of `TC Console HiFi M3.dc.html`
 * (design lines 1123–1213): the Documents queue, the training matrix, Hours & days
 * and Inductions.
 *
 * Where the design stands a `this.toast(...)` in for a real action — resubmitting a
 * rejected scan, uploading a certificate, planning rest days, booking an induction —
 * the call goes through `actions.run`, with the design's own sentence kept as the
 * offline message so the fixtures build still reads exactly as the canvas does.
 * Dropping a scan onto the re-upload target is not one of those: in the design it
 * only attaches the file, and `dqSubmit` is what sends it.
 */
export function vm2(ctx: TcCtx) {
  const { s, set, toast } = ctx;
  const DOCQ = ctx.data.docQueue;
  const TRCOLS = ctx.data.trainingColumns;
  const TRROWS = ctx.data.training;
  const HR = ctx.data.hours;
  const WK = ctx.data.workers;
  const SESSIONS = ctx.data.inductionSessions;

  /* ---- documents queue ---- */
  const gdef: [string, string, string, string][] = [
    ["rej", "REJECTED BY GC — 2", "#B3261E", "#F9DEDC"],
    ["exp", "EXPIRING WITHIN 30 DAYS — 3", "#7A5900", "#F7F2FA"],
    ["gone", "EXPIRED — ACCESS ALREADY STOPPED — 1", "#49454F", "#F7F2FA"],
  ];
  const dqGroups = gdef.map((g) => ({
    label: g[1],
    c: g[2],
    bg: g[3],
    items: DOCQ.filter((d) => d.grp === g[0]).map((d) => {
      const on = d.id === s.dqId;
      return {
        n: d.n,
        d: d.d,
        when: d.when,
        c: g[0] === "rej" ? "#B3261E" : "#49454F",
        bg: on ? "#E8DEF8" : "transparent",
        rail: on ? "#6750A4" : "transparent",
        go: () => set({ dqId: d.id }),
      };
    }),
  }));
  const dq = DOCQ.find((d) => d.id === s.dqId) || DOCQ[0] || NO_DOC;
  const rej = dq.grp === "rej";
  const dqOffline =
    dq.doc + " resubmitted for " + dq.n + " — re-validation is usually within one working day";

  /* ---- inductions ---- */
  // The design hard-codes both the cleared list and a Mon–Fri slot grid. Both are real
  // data now: only a GC-validated worker who has not been inducted can be booked, and
  // every slot is an `InductionSession` whose id is what the booking is made against.
  // `POST /tc/inductions/book` refuses anyone whose `Worker.status` is not "cleared",
  // and the bootstrap renders that status as access `allowed` (validated, not yet on
  // site) or `onsite`. So those are the bookable ones; `pending` is the design's
  // "cannot be booked" row — still listed, greyed, because the contractor needs to see
  // who is stuck with the GC. Anyone blocked or gone is not a candidate at all.
  const BOOKABLE = ["allowed", "onsite"];
  const cleared = WK.filter((w) => BOOKABLE.includes(w[4]) || w[4] === "pending").map((w) => {
    const bookable = BOOKABLE.includes(w[4]);
    return {
      name: w[0],
      sub: (w[2] + " · " + (bookable ? "VALIDATED" : "AWAITING GC VALIDATION")).toUpperCase(),
      bookable,
      wid: w[7],
    };
  });

  // `when` reads "Tue 25 Aug, 09:00" offline and "Tomorrow 13:00" live; split the time
  // off the end and treat what is left as the day, so both shapes lay out the same.
  const split = (when: string): [day: string, time: string] => {
    const m = /(\d{1,2}:\d{2})\s*$/.exec(when);
    if (!m) return [when, ""];
    return [when.slice(0, m.index).replace(/[,\s]+$/, ""), m[1]];
  };
  const times: string[] = [];
  const days: string[] = [];
  for (const sess of SESSIONS) {
    const [day, time] = split(sess.when);
    if (!times.includes(time)) times.push(time);
    if (!days.includes(day)) days.push(day);
  }
  const cols = days.slice(0, 5);
  const at = (time: string, day: string) =>
    SESSIONS.find((x) => {
      const [d, t] = split(x.when);
      return t === time && d === day;
    });

  const chosen = SESSIONS.find((x) => x.id === s.indSlot);
  const slotName = chosen ? chosen.when : "no slot picked";


  return {
    /* ---- documents queue ---- */
    dqGroups,
    dqEmpty: DOCQ.length === 0,
    dqEmptyCopy: "Nothing needs a document today — rejections and expiries land here as the GC works through your uploads.",
    dqName: dq.n + " · " + dq.doc,
    dqSt: dq.st,
    dqStFg: rej ? "#410E0B" : "#1D192B",
    dqStBg: rej ? "#F9DEDC" : "#E8DEF8",
    dqMeta: "ATTEMPT 1 · UPLOADED BY R. IDRIS",
    dqReasonHead: dq.head,
    dqReason: dq.reason,
    dqTags: ([["Illegible", 1], ["Wrong document", 0], ["Expired already", 0], ["Name mismatch", 0]] as [string, 0 | 1][]).map((x) => ({
      t: x[0],
      fg: x[1] ? "#410E0B" : "#49454F",
      bg: x[1] ? "#FFFFFF" : "transparent",
      bd: x[1] ? "#B3261E" : "#CAC4D0",
    })),
    dqFile: dq.file,
    dqNo: dq.no,
    dqExp: dq.exp,
    dqClockHead: dq.days,
    dqClockPct: dq.pct,
    dqBlocks: ([
      ["Induction booking — cannot book", "#B3261E", "#1D1B20"],
      ["Site access — not yet issued", "#CAC4D0", "#49454F"],
    ] as [string, string, string][]).map((b) => ({ t: b[0], c: b[1], fg: b[2] })),
    dqHistory: ([
      ["Rejected — illegible", "24 AUG 11:40 · GC", "#B3261E"],
      ["Submitted attempt 1", "22 AUG 16:02 · R. IDRIS", "#6750A4"],
      ["Profile created", "22 AUG 15:48 · R. IDRIS", "#CAC4D0"],
    ] as [string, string, string][]).map((h) => ({ t: h[0], m: h[1], c: h[2] })),
    dqDrop: () => {
      void pickFile().then((file) => {
        if (!file) return;
        set({ dqScan: file });
        toast("Replacement scan attached — review the fields, then resubmit");
      });
    },
    dqSubmit: () => {
      const scan = s.dqScan;
      if (!scan) {
        toast("Attach the replacement scan first — PDF or JPG, max 10 MB");
        return;
      }
      set({ dqScan: null });
      // A rejected card is a submission and is replaced through /resubmit. An
      // expiring or expired one is a WorkerDocument with no submission behind it, so
      // it takes a fresh upload — /resubmit would 404 on it.
      if (dq.submissionId) {
        withId(
          ctx,
          dq.submissionId,
          (id) => tcApi.resubmitDocument(id, scan, { doc_number: dq.no, expiry: dq.exp }),
          dqOffline,
        );
        return;
      }
      withId(
        ctx,
        dq.workerId,
        (id) =>
          tcApi.uploadDocument(scan, {
            worker_id: id,
            doc_type: dq.doc,
            doc_number: dq.no,
            expiry: dq.exp,
          }),
        dqOffline,
      );
    },
    dqSkip: () => {
      if (!DOCQ.length) return;
      const i = DOCQ.findIndex((d) => d.id === s.dqId);
      set({ dqId: DOCQ[(i + 1) % DOCQ.length].id });
    },
    dqBulk: () => toast("Bulk upload — drop a folder of scans and match them to workers"),

    /* ---- training matrix ---- */
    trEmpty: TRROWS.length === 0,
    trEmptyCopy: "No training to show yet — a worker appears here once they are on your register.",
    trCols: TRCOLS.map((c) => ({ t: c })),
    trRows: TRROWS.map((r) => ({
      n: r[0],
      role: r[1],
      cells: r[2].map((v) => {
        if (v === "—") return { v: "—", fg: "#CAC4D0", bg: "transparent", dot: "#CAC4D0" };
        if (v.indexOf("exp:") === 0) return { v: v.slice(4).toUpperCase(), fg: "#B3261E", bg: "#F9DEDC", dot: "#B3261E" };
        return { v: v.toUpperCase(), fg: "#49454F", bg: "transparent", dot: "#146C2E" };
      }),
    })),
    trZones: ([
      ["Electrical room · RFP2", "LV ELECTRICAL · SITE INDUCTION", "1 of your workers short", "#B3261E"],
      ["Scaffold decks", "WORKING AT HEIGHT", "1 expired — access stopped", "#B3261E"],
      ["Tank farm · confined", "CONFINED SPACE · FIRST AID", "No gaps", "#146C2E"],
    ] as [string, string, string, string][]).map((z) => ({ n: z[0], req: z[1], gap: z[2], c: z[3] })),
    trExport: () => toast("Training matrix exported — one row per worker, one column per requirement"),
    // `POST /tc/documents` needs the worker the certificate belongs to, and the
    // training matrix rows carry no id — `/tc/bootstrap`'s TcTrainingRow is
    // [name, role, cells] with nothing to address. Until a row is selectable this
    // stays the design's sentence rather than an upload with nobody to attach it to.
    trUpload: () => toast("Certificate upload opened — the GC validates it before it counts"),

    /* ---- hours ---- */
    hrEmpty: HR.length === 0,
    hrEmptyCopy: "No hours this week — a day counts once the worker badges in at the gate.",
    hrRows: HR.map((r) => ({
      n: r[0],
      role: r[1],
      pct: r[2] + "%",
      ratio: r[3],
      days: r[4],
      barC: r[5] ? "#B3261E" : "#6750A4",
      notified: r[6],
      bg: r[5] ? "#FEF7FF" : "transparent",
      dayFg: r[5] ? "#410E0B" : "#49454F",
      dayBg: r[5] ? "#F9DEDC" : "#ECE6F0",
    })),
    hrThresholds: ([["Maximum hours per week", "60"], ["Maximum consecutive days", "12"], ["Warn at", "90%"]] as [string, string][]).map((x) => ({ k: x[0], v: x[1] })),
    hrExport: () => toast("Hours exported for the week of 24 Aug — badge events, not timesheets"),
    hrPlan: () => {
      const ids = HR.filter((r) => r[5])
        .map((r) => r[7])
        .filter((id): id is string => !!id);
      withId(
        ctx,
        ids.length ? ids : null,
        (list) => tcApi.setRestDays(list, "Fri 28 Aug"),
        "Rest-day planner opened — the GC sees the plan against the threshold",
      );
    },

    /* ---- inductions ---- */
    indCleared: cleared.map((c, i) => {
      const on = s.indSel.indexOf(i) >= 0 && c.bookable;
      return {
        n: c.name,
        sub: c.sub,
        tick: on ? "✓" : "",
        box: on ? "#6750A4" : "transparent",
        bd: on ? "#6750A4" : "#79747E",
        bg: on ? "#E8DEF8" : "transparent",
        op: c.bookable ? "1" : ".5",
        cursor: c.bookable ? "pointer" : "not-allowed",
        pick: () => {
          if (c.bookable) set({ indSel: toggle(s.indSel, i) });
          else toast("Documents are still with the GC — this worker cannot be booked yet");
        },
      };
    }),
    indEmpty: cleared.length === 0,
    indEmptyCopy:
      "Nobody is waiting on an induction — a worker appears here once the GC validates their documents.",
    indSelLabel: s.indSel.length + " selected",
    // The canvas heads its columns "MON 24", not "MON 24 AUG" — the month is already
    // in the selected-slot line. A one-word day ("Tomorrow") is left whole.
    indDays: cols.map((d) => ({ t: d.split(" ").slice(0, 2).join(" ").toUpperCase() })),
    indRows: times.map((time) => ({
      time,
      cells: cols.map((day) => {
        const sess = at(time, day);
        const open = !!sess && sess.remaining > 0 && sess.state === "open";
        const on = !!sess && sess.id !== "" && s.indSlot === sess.id;
        return {
          label: !sess ? "NO SESSION" : sess.remaining === 0 ? "FULL" : sess.remaining + " LEFT",
          sub: sess ? sess.booked + " / " + sess.capacity : "",
          go: () => {
            if (!sess) return;
            if (!open) toast("No places in that session — pick another slot");
            else set({ indSlot: sess.id });
          },
          cursor: open ? "pointer" : "not-allowed",
          bd: on ? "#6750A4" : open ? "#CAC4D0" : "#E6E0E9",
          bg: on ? "#E8DEF8" : open ? "#FEF7FF" : "#F3EDF7",
          fg: on ? "#1D192B" : open ? "#1D1B20" : "#79747E",
          subC: on ? "#1D192B" : "#79747E",
        };
      }),
    })),
    indSlotLabel: slotName + " — " + s.indSel.length + " workers",
    indBook: () => {
      const picked = s.indSel.map((i) => cleared[i]).filter(Boolean);
      if (!chosen) return toast("Pick a slot first — the GC runs one session at a time");
      if (!picked.length) return toast("Pick at least one worker to book");
      const ids = picked.map((c) => c.wid).filter((x): x is string => !!x);
      withId(
        ctx,
        chosen.id && ids.length === picked.length ? chosen.id : undefined,
        (sessionId) => tcApi.bookInductions(sessionId, ids),
        picked.length + " workers booked into " + slotName + " — cards issued at the end of the session",
      );
    },
  };
}
