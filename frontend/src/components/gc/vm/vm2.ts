import { gcApi } from "@/lib/gc/api";
import type { DeviceStatus, PlanShape, RuleValue, StatusStyle } from "@/lib/gc/types";
import type { GcCtx, ZoneCfg } from "./ctx";
import { cfgFor, ruleKey, ruleVal } from "./data";

/**
 * Port of `vmScreens2()` (design lines 1755–1922): the zone builder, the zone
 * plan layer, the gate graph, the access-rule matrix, devices, companies,
 * inductions, violations and blocks.
 */
export function vm2(ctx: GcCtx) {
  const { s, set, go, toast, actions } = ctx;
  const { blocks: BLOCKS, companies: COMPANIES, devices: DEV, matrixZones: MZONES, requirements: REQS, sessions: SESSIONS, violations: VIOL, zones: ZONES } = ctx.data;

  /* ---- zone builder ---- */
  const znTree = ZONES.map((z) => {
    const on = s.zoneSel === z[0];
    return {
      n: z[1],
      kind: z[2],
      pad: 14 + z[3] * 20 + "px",
      pop: String(z[4]),
      fa: z[5],
      bg: on ? "#E8DEF8" : "transparent",
      bar: "none",
      fw: z[3] === 0 ? "600" : "400",
      fs: z[3] === 0 ? "14px" : "13px",
      faC: z[5] === "2FA" ? "#7A5900" : "#79747E",
      go: () => set({ zoneSel: z[0] }),
    };
  });
  const zsel = ZONES.find((z) => z[0] === s.zoneSel) || ZONES[0];
  const cfg = cfgFor(s, ZONES, zsel[0]);

  /* ---- zone plan ---- */
  const shapes: PlanShape[] = s.shapes || [
    { x: 8, y: 12, w: 38, h: 34, n: "A1 Basement", c: "#6750A4" },
    { x: 52, y: 12, w: 34, h: 22, n: "A2 Podium", c: "#6750A4" },
    { x: 52, y: 40, w: 20, h: 18, n: "A3 Electrical", c: "#B3261E" },
    { x: 8, y: 54, w: 26, h: 22, n: "Laydown", c: "#49454F" },
  ];
  const d = s.draw;
  const pt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  /* ---- devices ---- */
  const dst: Record<DeviceStatus, StatusStyle> = {
    online: { l: "Online", c: "#146C2E" },
    "4g": { l: "On 4G fallback", c: "#7A5900" },
    battery: { l: "Battery low", c: "#7A5900" },
    offline: { l: "Offline", c: "#B3261E" },
  };

  /* ---- companies ---- */
  const co = COMPANIES[s.coSel || 0];

  return {
    /* ---- zone builder ---- */
    znTree,
    znName: zsel[1],
    znKind: zsel[2],
    znPop: String(zsel[4]),
    znCap: cfg.cap,
    znFa: cfg.fa,
    znFaOpts: ["1FA", "2FA"].map((f) => ({
      label: f === "1FA" ? "Card only" : "Card + face",
      sub: f,
      fg: cfg.fa === f ? "#6750A4" : "#49454F",
      bd: cfg.fa === f ? "#6750A4" : "#CAC4D0",
      bg: cfg.fa === f ? "#E8DEF8" : "transparent",
      go: () => {
        const zc: Record<string, ZoneCfg> = { ...s.zoneCfg };
        zc[zsel[0]] = { ...cfg, fa: f };
        set({ zoneCfg: zc });
        toast(zsel[1] + " now requires " + (f === "2FA" ? "card and face" : "card only") + " — readers updated");
      },
    })),
    znReqs: REQS.map((r) => {
      const on = cfg.reqs.indexOf(r) >= 0;
      return {
        label: r,
        tick: on ? "✓" : "",
        bd: on ? "#6750A4" : "#CAC4D0",
        bg: on ? "#6750A4" : "transparent",
        fg: on ? "#1D1B20" : "#49454F",
        go: () => {
          const reqs = cfg.reqs.slice();
          const i = reqs.indexOf(r);
          if (i >= 0) reqs.splice(i, 1);
          else reqs.push(r);
          const zc: Record<string, ZoneCfg> = { ...s.zoneCfg };
          zc[zsel[0]] = { ...cfg, reqs };
          set({ zoneCfg: zc });
        },
      };
    }),
    znEscort: cfg.escort ? "Escort required for visitors" : "Visitors may enter unescorted",
    znEscortTick: cfg.escort ? "✓" : "",
    znEscortBg: cfg.escort ? "#6750A4" : "transparent",
    znEscortBd: cfg.escort ? "#6750A4" : "#CAC4D0",
    znToggleEscort: () => {
      const zc: Record<string, ZoneCfg> = { ...s.zoneCfg };
      zc[zsel[0]] = { ...cfg, escort: !cfg.escort };
      set({ zoneCfg: zc });
    },
    znSave: () =>
      actions.run(
        () =>
          gcApi.saveZone(zsel[6] ?? "", {
            factor: cfg.fa,
            capacity: cfg.cap,
            escort_required: cfg.escort,
            requirements: cfg.reqs,
          }),
        zsel[1] + " saved — change recorded in the system audit",
      ),
    znAdd: () => toast("New sub-sub zone added under " + zsel[1] + " — name it, then set its criteria"),
    znPlan: () => go("plan"),

    /* ---- zone plan ---- */
    plShapes: shapes.map((sh, i) => ({
      n: sh.n,
      c: sh.c,
      left: sh.x + "%",
      top: sh.y + "%",
      w: sh.w + "%",
      h: sh.h + "%",
      bg: "color-mix(in srgb, " + sh.c + " 12%, transparent)",
      go: (e: React.MouseEvent) => {
        e.stopPropagation();
        set({ shapeSel: i });
      },
    })),
    plDrawing: !!d,
    plDx: d ? Math.min(d.x0, d.x1) + "%" : "",
    plDy: d ? Math.min(d.y0, d.y1) + "%" : "",
    plDw: d ? Math.abs(d.x1 - d.x0) + "%" : "",
    plDh: d ? Math.abs(d.y1 - d.y0) + "%" : "",
    plDown: (e: React.MouseEvent<HTMLDivElement>) => {
      const p = pt(e);
      set({ draw: { x0: p.x, y0: p.y, x1: p.x, y1: p.y } });
    },
    plMove: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!s.draw) return;
      const p = pt(e);
      const dr = s.draw;
      set({ draw: { x0: dr.x0, y0: dr.y0, x1: p.x, y1: p.y } });
    },
    plUp: () => {
      const dr = s.draw;
      if (!dr) return;
      const w = Math.abs(dr.x1 - dr.x0),
        h = Math.abs(dr.y1 - dr.y0);
      if (w < 3 || h < 3) {
        set({ draw: null });
        return;
      }
      const next = shapes.concat([
        {
          x: Math.round(Math.min(dr.x0, dr.x1)),
          y: Math.round(Math.min(dr.y0, dr.y1)),
          w: Math.round(w),
          h: Math.round(h),
          n: "Zone " + (shapes.length + 1) + " — unnamed",
          c: "#6750A4",
        },
      ]);
      set({ shapes: next, draw: null, shapeSel: next.length - 1 });
      toast("Shape drawn — name it and bind it to a zone in the panel");
    },
    plLevels: ["B1", "L1", "L2", "Roof"].map((l) => ({
      label: l,
      go: () => set({ planLevel: l }),
      fg: s.planLevel === l ? "#6750A4" : "#49454F",
      bd: s.planLevel === l ? "#6750A4" : "#CAC4D0",
      bg: s.planLevel === l ? "#E8DEF8" : "transparent",
    })),
    plLevel: s.planLevel,
    plList: shapes.map((sh, i) => ({
      n: sh.n,
      c: sh.c,
      area: Math.round(sh.w * sh.h * 3.4) + " m²",
      bg: s.shapeSel === i ? "#E8DEF8" : "transparent",
      go: () => set({ shapeSel: i }),
      del: (e: React.MouseEvent) => {
        e.stopPropagation();
        const n2 = shapes.slice();
        n2.splice(i, 1);
        set({ shapes: n2, shapeSel: null });
        toast("Shape removed — the zone itself is untouched");
      },
    })),
    plReset: () => {
      set({ shapes: null, shapeSel: null });
      toast("Reverted to the last saved layer");
    },
    plSave: () =>
      actions.run(
        () => gcApi.savePlan(s.planLevel, shapes),
        "Plan layer saved for level " + s.planLevel,
      ),
    plUpload: () => toast("Drop a PDF or DWG — the layer scales to the drawing, not the reverse"),

    /* ---- gate graph ---- */
    ggGates: [
      { n: "Gate A pedestrian", dev: "T-A01, T-A02", fa: "Card + face", in: "842", zone: "A Site", st: "1 device on 4G", c: "#7A5900" },
      { n: "Gate B pedestrian", dev: "T-B01, T-B02", fa: "Card + face", in: "486", zone: "B Site", st: "All devices online", c: "#146C2E" },
      { n: "Laydown vehicle", dev: "V-L01", fa: "Card only", in: "64", zone: "Laydown", st: "All devices online", c: "#146C2E" },
      { n: "Site office", dev: "R-OF1", fa: "Card only", in: "142", zone: "Site office", st: "All devices online", c: "#146C2E" },
    ].map((g) => ({ ...g, go: () => go("devices") })),
    ggInner: [
      { n: "A1 Basement", from: "Gate A", fa: "Card only", pop: "286" },
      { n: "A2 Podium", from: "Gate A", fa: "Card only", pop: "612" },
      { n: "A3 Electrical rooms", from: "A2 Podium", fa: "Card + face", pop: "48" },
      { n: "B1 Basement", from: "Gate B", fa: "Card only", pop: "318" },
      { n: "B2 Plant room", from: "B1 Basement", fa: "Card + face", pop: "96" },
    ],

    /* ---- access rules ---- */
    arThresholds: [
      { k: "Maximum hours per week", v: "60 h", sub: "Warning at 54 h · auto-block above cap" },
      { k: "Maximum consecutive days", v: "6 days", sub: "Warning on day 6 · auto-block on day 7" },
      { k: "Inactivity before withdrawal", v: "31 days", sub: "No turnstile event · contractor notified on day 24" },
      { k: "Violations before block", v: "3 strikes", sub: "Verbal, written, then automatic block" },
      { k: "Document grace period", v: "0 days", sub: "Expiry withdraws access the same night" },
      { k: "Offline buffer retained", v: "72 h", sub: "Device holds events, then refuses new entries" },
    ],
    arMatrixCols: REQS,
    arRows: MZONES.map((z) => ({
      z,
      cells: REQS.map((r) => {
        const v = ruleVal(s, z, r);
        const m = {
          req: { l: "Required", c: "#6750A4", bg: "#EADDFF" },
          opt: { l: "Advisory", c: "#49454F", bg: "#F7F2FA" },
          na: { l: "", c: "#CAC4D0", bg: "transparent" },
        }[v];
        return {
          l: v === "req" ? "●" : v === "opt" ? "○" : "·",
          title: m.l,
          c: m.c,
          bg: m.bg,
          go: () => {
            const rl: Record<string, RuleValue> = { ...s.rules };
            const nx = ({ req: "opt", opt: "na", na: "req" } as const)[v];
            rl[ruleKey(z, r)] = nx;
            set({ rules: rl });
          },
        };
      }),
    })),
    arSave: () =>
      actions.run(
        () => gcApi.saveMatrix(s.rules ?? {}),
        "Access rules published — gates pick them up on the next sync",
      ),
    arReset: () => {
      set({ rules: null });
      toast("Matrix reverted to the published version");
    },

    /* ---- devices ---- */
    dvRows: DEV.map((dv) => ({
      id: dv[0],
      kind: dv[1],
      loc: dv[2],
      zone: dv[3],
      link: dv[5],
      buf: dv[6],
      sync: dv[7],
      fa: dv[8],
      stl: dst[dv[4]].l,
      stc: dst[dv[4]].c,
      bufC: dv[6] === "0" ? "#79747E" : "#7A5900",
      sync2: (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.run(
          () => gcApi.syncDevice(dv[9] ?? ""),
          dv[0] + " — forced sync requested, " + dv[6] + " buffered events uploading",
        );
      },
    })),
    dvSummary: [
      { k: "Devices reporting", v: "9 of 9", c: "#1D1B20" },
      { k: "On 4G fallback", v: "1", c: "#7A5900" },
      { k: "Events buffered", v: "180", c: "#7A5900" },
      { k: "Oldest unsynced", v: "3 h 12 m", c: "#7A5900" },
    ],

    /* ---- companies ---- */
    coRows: COMPANIES.map((c, i) => ({
      n: c[0],
      trade: c[1],
      reg: String(c[2]),
      on: String(c[3]),
      kind: c[4],
      contact: c[5],
      ins: c[6],
      flag: c[7] === "ok" ? "" : c[7],
      flagC:
        c[7] === "archive"
          ? "#79747E"
          : c[7].includes("expired") || c[7].includes("blocked")
            ? "#B3261E"
            : "#7A5900",
      bg: s.coSel === i ? "#E8DEF8" : "transparent",
      go: () => set({ coSel: i, drawer: "company" }),
    })),
    coName: co[0],
    coTrade: co[1],
    coKind: co[4],
    coContact: co[5],
    coIns: co[6],
    coReg: String(co[2]),
    coOn: String(co[3]),
    coDrawer: s.drawer === "company",
    coClose: () => set({ drawer: null }),
    coDefaults: (
      [
        ["Default job roles", "Steel fixer, Rebar bender, Foreman"],
        ["Default zones", "A1 Basement, A2 Podium"],
        ["Mandatory documents", "Passport, CIDB green card, Medical fitness"],
        ["Insurance expiry", co[6]],
        ["Contract reference", "PKG-" + (210 + (s.coSel || 0))],
        ["Workers on register", String(co[2])],
      ] as [string, string][]
    ).map((x) => ({ k: x[0], v: x[1] })),
    coNew: () => toast("New company profile — its defaults pre-fill every worker the contractor adds"),

    /* ---- inductions ---- */
    inSessions: SESSIONS.map((x) => ({
      id: x[0],
      when: x[1],
      where: x[2],
      by: x[3],
      cap: String(x[4]),
      booked: String(x[5]),
      pct: Math.round((x[5] / x[4]) * 100) + "%",
      stl: x[6] === "full" ? "Full" : x[6] === "running" ? "In progress" : "Places open",
      stc: x[6] === "full" ? "#7A5900" : x[6] === "running" ? "#146C2E" : "#49454F",
      go: () => toast(x[0] + " — attendance sheet open, card and face enrolment follows"),
    })),
    inAttend: [
      { n: "Md Shahin Alam", co: "Sinar Electrical", st: "Present · card 8912 issued", c: "#146C2E" },
      { n: "Hafiz Rahman", co: "Zenith Scaffold", st: "Present · face enrolled", c: "#146C2E" },
      { n: "Sunil Gurung", co: "Kejora M&E", st: "No show — slot released", c: "#B3261E" },
      { n: "Deepak Rai", co: "Kejora M&E", st: "Present · awaiting card stock", c: "#7A5900" },
      { n: "Prakash Limbu", co: "Kejora M&E", st: "Present · card 8913 issued", c: "#146C2E" },
    ],
    inNew: () => toast("Session created — contractors can book cleared workers into it"),

    /* ---- violations ---- */
    vlRows: VIOL.map((v) => ({
      d: v[0],
      n: v[1],
      co: v[2],
      t: v[3],
      by: v[4],
      lvl: v[5],
      c: v[6],
      go: () => go("workers", { q: v[1] }),
    })),
    vlNew: () => set({ modal: "violation" }),
    vlModal: s.modal === "violation",
    vlConfirm: () => {
      set({ modal: null });
      toast("Violation recorded — worker and contractor notified, strike count updated");
    },
    vlLadder: [
      { n: "1", l: "Verbal warning", s: "Recorded, worker notified", c: "#7A5900" },
      { n: "2", l: "Written warning", s: "Contractor notified, toolbox talk required", c: "#7A5900" },
      { n: "3", l: "Automatic block", s: "Access withdrawn at every gate", c: "#B3261E" },
    ],

    /* ---- blocks ---- */
    blRows: BLOCKS.map((b) => ({
      n: b[0],
      co: b[1],
      kind: b[2],
      why: b[3],
      when: b[4],
      route: b[5],
      c: b[6],
      kindBd: b[2] === "Automatic" ? "#7A5900" : "#CAC4D0",
      lift: (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.run(
          () => gcApi.liftBlock(b[7] ?? "", "Reinstated from the blocks screen"),
          b[0] + " reinstated — reason and your name recorded in the audit",
        );
      },
      go: () => go("workers", { q: b[0] }),
    })),
    blCounts: [
      { k: "Blocked now", v: "6", c: "#B3261E" },
      { k: "Automatic", v: "4", c: "#7A5900" },
      { k: "Manual", v: "2", c: "#49454F" },
      { k: "Lifted this month", v: "11", c: "#146C2E" },
    ],
  };
}
