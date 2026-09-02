import { NAV, TITLES } from "@/lib/gc/fixtures";
import type { Screen } from "@/lib/gc/types";
import type { GcCtx } from "./ctx";
import { workers } from "./data";

/**
 * Port of `renderVals()` (design lines 2217–2326): the app shell — screen flags,
 * title bar, project switcher, sidebar nav, command palette — plus the dashboard
 * and reception-board tiles, which the design also builds here.
 */
export function shell(ctx: GcCtx) {
  const { s, set, go, toast, role, auth } = ctx;
  const {
    alerts: ALERTS,
    contractorLoad: CO,
    hours: HOURS,
    moves: MOVES,
    projects: PROJECTS,
    workers: workerRows,
  } = ctx.data;

  const screens: Screen[] = [
    "dashboard", "alerts", "tvboard", "workers", "worker", "validation", "inductions",
    "violations", "blocks", "companies", "zones", "plan", "gates", "rules", "devices",
    "vrequests", "vtoday", "vrecord", "vblocked", "vpolicy", "log", "reports", "reportout",
    "audit", "users", "tcaccounts", "refdata", "notifications", "tiles", "signin",
  ];
  const is = Object.fromEntries(screens.map((k) => ["is_" + k, s.screen === k])) as Record<
    `is_${Screen}`,
    boolean
  >;

  const ti = TITLES[s.screen] || ["", ""];
  const cur = PROJECTS.find((p) => p[0] === s.proj) || PROJECTS[0];

  /* ---- sidebar nav ---- */
  // A GC user does not get the administration screens or the rule editor.
  const barred: Screen[] = role === "GC administrator" ? [] : ["users", "tcaccounts", "refdata", "notifications", "rules"];
  const owns = (item: Screen) =>
    item === s.screen ||
    (item === "workers" && s.screen === "worker") ||
    (item === "vtoday" && s.screen === "vrecord") ||
    (item === "reports" && s.screen === "reportout") ||
    (item === "dashboard" && s.screen === "tiles");
  const activeGroup = (
    NAV.find((g) => g[1].some((it) => owns(it[0]) || (it[0] === "dashboard" && s.screen === "tvboard"))) || NAV[0]
  )[0];
  const openGroup = s.openGroup === "none" ? null : s.openGroup || activeGroup;

  const navGroups = NAV.map((g) => {
    const isStatic = g[3] === true;
    const open = isStatic || openGroup === g[0];
    const items = g[1].filter((it) => !barred.includes(it[0]));
    return {
      label: g[0],
      gicon: g[2],
      isStatic,
      isGroup: !isStatic,
      wrapBg: !isStatic && openGroup === g[0] ? "#F3EDF7" : "transparent",
      railC: !isStatic && openGroup === g[0] ? "#CAC4D0" : "transparent",
      kidMargin: isStatic ? "0" : "0 8px 2px 26px",
      kidPad: isStatic ? "0" : "10px",
      open,
      chev: isStatic ? "" : openGroup === g[0] ? "expand_less" : "expand_more",
      cursor: isStatic ? "default" : "pointer",
      headC: activeGroup === g[0] ? "#6750A4" : "#49454F",
      headW: activeGroup === g[0] ? 700 : 500,
      n: isStatic ? "" : String(items.length),
      toggle: () => {
        if (isStatic) return;
        set({ openGroup: openGroup === g[0] ? "none" : g[0] });
      },
      items: items.map((it) => {
        const on = owns(it[0]);
        return {
          label: it[1],
          badge: it[2],
          icon: it[3],
          go: () => go(it[0]),
          bg: on ? "#E8DEF8" : "transparent",
          fg: on ? "#1D192B" : "#49454F",
          fw: on ? 700 : 500,
          bar: "none",
          iconC: on ? "#1D192B" : "#49454F",
          fill: on ? 1 : 0,
          badgeFg: it[2] && on ? "#1D192B" : "#49454F",
          badgeBg: "transparent",
        };
      }),
    };
  });

  /* ---- command palette ---- */
  const pq = s.pq.toLowerCase();
  const navFlat = NAV.flatMap((g) =>
    g[1].map((it) => ({ kind: "Screen", label: it[1], hint: g[0], go: () => go(it[0]) })),
  );
  const workerHits = workers(workerRows)
    .filter((w) => pq && (w.n.toLowerCase().includes(pq) || w.id.toLowerCase().includes(pq)))
    .map((w) => ({
      kind: "Worker",
      label: w.n,
      hint: w.id,
      go: () => go("worker", { workerId: w.i, wtab: "overview" }),
    }));
  const pResults = (pq ? navFlat.filter((n) => n.label.toLowerCase().includes(pq)).concat(workerHits) : navFlat).slice(0, 8);

  /* ---- dashboard + reception board ---- */
  const moves = (s.moves || MOVES.map((m) => ({ t: m[0], n: m[1], g: m[2], d: m[3] }))).map((m) => ({
    ...m,
    c: m.d === "in" ? "#146C2E" : "#79747E",
  }));
  const maxH = 412;

  const submitSignIn = async () => {
    if (s.siBusy) return;
    set({ siBusy: true, siError: null });
    try {
      await auth.signIn(s.siEmail, s.siPassword);
      set({ siBusy: false, siPassword: "" });
      go("dashboard");
    } catch (err) {
      set({ siBusy: false, siError: err instanceof Error ? err.message : "Sign-in failed" });
    }
  };

  return {
    ...is,
    inApp: s.screen !== "signin" && s.screen !== "tvboard",
    title: ti[0],
    subtitle: ti[1],
    hasSubtitle: !!ti[1],
    alertCount: String(ALERTS.length),
    toast: s.toast,
    paletteOpen: s.palette,
    pq: s.pq,
    setPq: (e: React.ChangeEvent<HTMLInputElement>) => set({ pq: e.target.value }),
    openPalette: () => set({ palette: true, pq: "" }),
    closeAll: () => set({ palette: false, modal: null, drawer: null }),
    stop: (e: React.SyntheticEvent) => e.stopPropagation(),
    /* ---- sign in ---- */
    siEmail: s.siEmail,
    siPassword: s.siPassword,
    siBusy: s.siBusy,
    siError: s.siError,
    siSetEmail: (e: React.ChangeEvent<HTMLInputElement>) => set({ siEmail: e.target.value, siError: null }),
    siSetPassword: (e: React.ChangeEvent<HTMLInputElement>) => set({ siPassword: e.target.value, siError: null }),
    siKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") void submitSignIn();
    },
    signIn: () => void submitSignIn(),
    signOut: () => {
      auth.signOut();
      go("signin");
    },
    goTv: () => go("tvboard"),
    exitTv: () => go("dashboard"),
    goTiles: () => go("tiles"),
    goAlerts: () => go("alerts"),
    goLog: () => go("log"),
    clock: s.clock,
    roleLabel: role,

    projName: cur[1],
    projCode: cur[0],
    projBadge: cur[2],
    projOpen: s.projOpen,
    projChev: s.projOpen ? "▴" : "▾",
    openProjects: () => set({ projOpen: !s.projOpen }),
    closeProjects: () => set({ projOpen: false }),
    projItems: PROJECTS.map((p) => ({
      code: p[0],
      name: p[1],
      badge: p[2],
      meta: p[3],
      tick: p[0] === s.proj ? "check" : "",
      bg: p[0] === s.proj ? "#E8DEF8" : "transparent",
      badgeBg: p[0] === s.proj ? "#6750A4" : "#E8DEF8",
      badgeFg: p[0] === s.proj ? "#FFFFFF" : "#1D192B",
      fw: p[0] === s.proj ? 500 : 400,
      go: () => {
        if (p[0] === s.proj) {
          set({ projOpen: false });
          return;
        }
        set({ projOpen: false, screen: "dashboard", proj: p[0], sel: [], drawer: null, modal: null });
        toast("Switched to " + p[1] + " · " + p[0] + " — register, zones and gates reloaded");
      },
    })),

    navGroups,
    pResults,

    agoLabel: s.tick % 4 === 0 ? "just now" : (s.tick % 4) * 3 + "s ago",
    tiles: [
      { k: "Workers on site", v: String(s.onSite), delta: "+18 this hour", dc: "#146C2E", c: "#1D1B20", pct: "62%", sub: "of 2,418 on the register" },
      { k: "GC staff on site", v: "142", delta: "stable", dc: "#79747E", c: "#1D1B20", pct: "76%", sub: "of 186 Emerald Builders staff" },
      { k: "Inducted workers", v: "2,266", delta: "+34 this week", dc: "#146C2E", c: "#1D1B20", pct: "94%", sub: "152 awaiting an induction slot" },
      { k: "Documents at risk", v: "24", delta: "6 already expired", dc: "#B3261E", c: "#7A5900", pct: "18%", sub: "expiring inside 14 days" },
    ],
    tvTiles: [
      { k: "On site now", v: String(s.onSite), c: "#E6E0E9", sub: "workers and staff through the turnstiles" },
      { k: "GC staff", v: "142", c: "#E6E0E9", sub: "Emerald Builders" },
      { k: "Inducted", v: "2,266", c: "#E6E0E9", sub: "of 2,418 on the register" },
      { k: "Visitors", v: "6", c: "#D0BCFF", sub: "escorted, 1 overstayed" },
    ],
    hourBars: HOURS.map((h) => ({
      l: h[0],
      pct: Math.round((h[1] / maxH) * 100) + "%",
      c: h[1] > 250 ? "#6750A4" : "#CAC4D0",
    })),
    coBars: CO.map((c) => ({
      n: c[0],
      on: String(c[2]),
      ratio: c[2] + " / " + c[1],
      pct: Math.round((c[2] / c[1]) * 100) + "%",
      c: c[3] === "ok" ? "#6750A4" : "#7A5900",
      flag: c[3] === "ok" ? "" : c[3],
      flagC: c[3].includes("expired") || c[3].includes("blocked") ? "#B3261E" : "#7A5900",
      go: () => go("workers", { q: c[0] }),
    })),
    dashAlerts: ALERTS.slice(0, 5).map((a) => ({ t: a[1], s: a[2], n: a[3], c: a[4], go: () => go(a[5]) })),
    moves,
    tvMoves: moves.slice(0, 6),
  };
}
