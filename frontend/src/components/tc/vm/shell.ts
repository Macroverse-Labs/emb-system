import { NAV, TITLES } from "@/lib/tc/fixtures";
import type { TcProjectRow, TcScreen } from "@/lib/tc/types";
import type { TcCtx } from "./ctx";

/**
 * Port of the shell slice of `renderVals()` in `TC Console HiFi M3.dc.html` — the
 * title bar, the screen flags, the project switcher, the sidebar nav, the GC-owned
 * guardrail box and the toast.
 *
 * The design's `showGuardrails` / `showGcNotices` props are prototype switches with
 * no UI behind them here; both default to on, as the canvas does.
 */
export function shell(ctx: TcCtx) {
  const { s, set, go, data, meta, auth } = ctx;
  const PROJECTS = data.projects;

  const screens: TcScreen[] = [
    "home", "workers", "worker", "add", "docs", "training", "hours",
    "inductions", "inactive", "leavers", "visitors", "signin",
  ];
  const is = Object.fromEntries(screens.map((k) => ["is_" + k, s.screen === k])) as Record<
    `is_${TcScreen}`,
    boolean
  >;

  const t = TITLES[s.screen] || TITLES.home;
  // A contractor the GC has not put on a project yet has no rows here; the switcher
  // still has to name something, so it falls back to whatever the session says.
  const cur =
    PROJECTS.find((p) => p[0] === s.proj) ||
    PROJECTS[0] || ([meta?.project ?? s.proj, "No project yet", "", ""] as TcProjectRow);

  const submitSignIn = async () => {
    if (s.siBusy) return;
    set({ siBusy: true, siError: null });
    try {
      await auth.signIn(s.siEmail, s.siPassword);
      set({ siBusy: false, siPassword: "" });
      go("home");
    } catch (err) {
      set({ siBusy: false, siError: err instanceof Error ? err.message : "Sign-in failed" });
    }
  };

  return {
    ...is,
    inApp: s.screen !== "signin",
    title: t[0],
    subtitle: t[1],

    /* ---- prototype switches ---- */
    showGuard: true,
    showNotices: true,
    guardItems: [
      ["Granting a zone"], ["Issuing a pass or card"], ["Validating a document"],
      ["Setting hour thresholds"], ["Recording a violation"],
    ].map((g) => ({ t: g[0] })),

    /* ---- topbar / sidebar chrome ---- */
    company: meta?.company ?? "Sinar Electrical",
    notifCount: String(meta?.notifications ?? 6),

    /* ---- cross-screen jumps the shell markup binds ---- */
    goHome: () => go("home"),
    goWorkers: () => go("workers"),
    goAdd: () => go("add"),
    goDocs: () => go("docs"),
    goInductions: () => go("inductions"),
    goInactive: () => go("inactive"),
    goLeavers: () => go("leavers"),
    goTraining: () => go("training"),
    goHours: () => go("hours"),
    goVisitors: () => go("visitors"),

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

    /* ---- toast ---- */
    toast: s.toast,
    hasToast: !!s.toast,
    closeToast: () => set({ toast: null }),

    /* ---- project switcher ---- */
    projName: cur[1],
    projCode: cur[0],
    projBadge: cur[2],
    projOpen: s.projOpen,
    projChev: s.projOpen ? "▲" : "▼",
    openProjects: () => set({ projOpen: !s.projOpen }),
    closeProjects: () => set({ projOpen: false }),
    projItems: PROJECTS.map((p) => {
      const on = p[0] === s.proj;
      return {
        name: p[1],
        code: p[0],
        meta: p[3],
        badge: p[2],
        tick: on ? "check" : "",
        bg: on ? "#E8DEF8" : "transparent",
        badgeBg: on ? "#6750A4" : "#E6E0E9",
        badgeFg: on ? "#FFFFFF" : "#49454F",
        fw: on ? 500 : 400,
        go: () => set({ proj: p[0], projOpen: false }),
      };
    }),

    /* ---- sidebar nav ---- */
    navGroups: NAV.map((g) => ({
      label: g[0],
      items: g[1].map((it) => {
        const on = s.screen === it[0] || (it[0] === "workers" && s.screen === "worker");
        return {
          label: it[1],
          badge: it[2],
          icon: it[3],
          go: () => go(it[0]),
          bg: on ? "#E8DEF8" : "transparent",
          fg: on ? "#1D192B" : "#49454F",
          iconC: on ? "#1D192B" : "#49454F",
          fill: on ? 1 : 0,
          fw: on ? 500 : 400,
          badgeFg: on ? "#1D192B" : "#49454F",
        };
      }),
    })),
  };
}
