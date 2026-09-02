import type { Role, StatusStyle, VisitorState } from "@/lib/gc/types";
import { gcApi } from "@/lib/gc/api";
import type { GcCtx } from "./ctx";

/**
 * Port of `vmScreens3()` (design lines 2016–2214): the visitor screens, the
 * access log, reports and report output, the system audit, the administration
 * screens (users & rights, contractor accounts, reference data, notifications)
 * and the dashboard tile editor.
 */
export function vm3(ctx: GcCtx) {
  const { s, set, go, toast, actions } = ctx;
  const { audit: AUDIT, capabilities: CAPS, log: LOG, notifications: NOTIF, refData: REFDATA, roles: ROLES, tcAccounts: TCACC, tiles: TILES, users: USERS, visitRequests: VREQ, visitorsToday: VTODAY } = ctx.data;

  /* ---- visitor requests ---- */
  const mine = VREQ.filter((v) => v[7] === "me");
  const others = VREQ.filter((v) => v[7] !== "me");
  const mapReq = (v: (typeof VREQ)[number], i: number, off: number) => ({
    vt: v[0],
    kind: v[1],
    by: v[2],
    why: v[3],
    zones: v[4],
    win: v[5],
    age: v[6],
    bg: s.visSel === i + off ? "#E8DEF8" : "transparent",
    go: () => set({ visSel: i + off }),
  });
  const vrMine = mine.map((v, i) => mapReq(v, i, 0));
  const vrOthers = others.map((v, i) => mapReq(v, i, 100));
  const cur = mine[Math.min(s.visSel || 0, mine.length - 1)];
  const asked = cur[4].split(", ");

  /* ---- visitors today ---- */
  const vst: Record<VisitorState, StatusStyle> = {
    expected: { l: "Expected", c: "#49454F" },
    onsite: { l: "On site", c: "#146C2E" },
    overstay: { l: "Overstayed", c: "#B3261E" },
    left: { l: "Signed out", c: "#79747E" },
  };
  const vtabs = [
    ["all", "All"],
    ["expected", "Expected"],
    ["onsite", "On site"],
    ["overstay", "Overstayed"],
    ["left", "Signed out"],
  ];

  /* ---- repeat & blocked visitors ---- */
  const vb: [string, string, string, number | string, string, string, string][] = [
    ["Zulhilmi Aziz", "Supplier", "Pantas Steelworks", 14, "Overstayed 25 Aug", "Blocked — needs a fresh grant", "#B3261E"],
    ["Melissa Tan", "Consultant", "Facade consultancy", 38, "—", "Repeat visitor — fast grant", "#146C2E"],
    ["Gopal Krishnan", "Auditor", "CIDB", 6, "—", "Repeat visitor — fast grant", "#146C2E"],
    ["Ivan Petrov", "Delivery driver", "Logistics", "2", "Refused twice — no host", "Watchlist", "#7A5900"],
    ["Kenneth Ooi", "Supplier", "Steel supplier", 22, "—", "Repeat visitor — fast grant", "#146C2E"],
    ["Unknown · card 4471", "—", "—", 1, "Pass shared with a second person", "Blocked — investigation", "#B3261E"],
  ];

  /* ---- visitor policy ---- */
  const pol: Record<string, boolean> = s.pol || {
    escort: true,
    sms: true,
    photo: false,
    autoExpire: true,
    reentry: true,
    hostGrant: true,
  };

  /* ---- access log ---- */
  const ltabs = [
    ["all", "Everything"],
    ["deny", "Refusals"],
    ["visitor", "Visitors"],
    ["out", "Exits"],
  ];
  const lq = (s.logQ || "").toLowerCase();

  /* ---- report output ---- */
  const ro: [string, number, number, string, string, string, string, string][] = [
    ["Pantas Steelworks", 412, 268, "268", "2", "0", "06:31", "18:12"],
    ["Sinar Electrical", 388, 241, "241", "0", "0", "06:28", "18:02"],
    ["Kejora M&E", 356, 198, "198", "1", "1", "06:34", "17:48"],
    ["Titan Formwork", 298, 187, "187", "0", "1", "06:22", "18:20"],
    ["Zenith Scaffold", 214, 96, "96", "1", "1", "06:40", "17:30"],
    ["Emerald Builders", 186, 142, "142", "0", "0", "06:12", "19:04"],
  ];

  /* ---- users & rights ---- */
  const perm: Record<string, boolean> = s.perm || {};
  const defPerm = (cap: string, role: Role): boolean => {
    if (role === "GC administrator") return true;
    if (role === "GC user")
      return ["Create zones", "Change access rules", "Issue TC logins", "Change system settings"].indexOf(cap) < 0;
    if (role === "Security") return ["Roll call", "Record violations"].indexOf(cap) >= 0;
    return cap === "Run reports";
  };

  /* ---- notifications ---- */
  const ch: Record<string, boolean> = s.chan || {};

  /* ---- dashboard tile editor ---- */
  const order = s.tileOrder || TILES.slice();
  const hidden: Record<string, boolean> = s.tileHidden || {};

  return {
    /* ---- visitor requests ---- */
    vrMine,
    vrOthers,
    vrMineN: mine.length + " waiting on me as host",
    vrOthersN: others.length + " with other hosts — visible, not mine to grant",
    vrCurName: cur[0],
    vrCurBy: cur[2],
    vrCurWhy: cur[3],
    vrCurAge: cur[6],
    vrZones: asked.map((z) => {
      const on = !(s.visDrop || {})[z];
      return {
        z,
        tick: on ? "✓" : "",
        bg: on ? "#6750A4" : "transparent",
        bd: on ? "#6750A4" : "#CAC4D0",
        fg: on ? "#1D1B20" : "#79747E",
        note: on ? "Escorted" : "Declined",
        noteC: on ? "#79747E" : "#B3261E",
        go: () => {
          const d = Object.assign({}, s.visDrop || {});
          d[z] = !d[z];
          set({ visDrop: d });
        },
      };
    }),
    vrWin: cur[5],
    vrFrom: cur[5].split("–")[0].split(" ").pop(),
    vrTo: cur[5].split("–")[1] || "",
    vrApprove: () => {
      actions.run(
        () => gcApi.grantVisit(cur[8] ?? "", cur[4], cur[5]),
        "Pass granted — QR texted to the visitor, escort and Gate A notified",
      );
      set({ visSel: 0, visDrop: {} });
    },
    vrDecline: () => {
      actions.run(
        () => gcApi.declineVisit(cur[8] ?? "", "Declined by the host"),
        "Request declined — " + cur[2] + " notified with your reason",
      );
      set({ visSel: 0 });
    },
    vrRaise: () => set({ modal: "raise" }),
    vrModal: s.modal === "raise",
    vrConfirmRaise: () => {
      set({ modal: null });
      toast("Visit created — QR pass sent, expires at the end of the window");
    },

    /* ---- visitors today ---- */
    vtTabs: vtabs.map((t) => ({
      label: t[1],
      go: () => set({ vtTab: t[0] }),
      n: t[0] === "all" ? String(VTODAY.length) : String(VTODAY.filter((v) => v[5] === t[0]).length),
      fg: (s.vtTab || "all") === t[0] ? "#1D1B20" : "#49454F",
      bd: (s.vtTab || "all") === t[0] ? "#6750A4" : "transparent",
    })),
    vtRows: VTODAY.filter((v) => (s.vtTab || "all") === "all" || v[5] === (s.vtTab || "all")).map((v) => ({
      n: v[0],
      kind: v[1],
      host: v[2],
      zones: v[3],
      win: v[4],
      seen: v[6],
      stl: vst[v[5]].l,
      stc: vst[v[5]].c,
      act: v[5] === "onsite" || v[5] === "overstay" ? "Badge out" : v[5] === "expected" ? "Resend pass" : "",
      go: () => go("vrecord"),
      doAct: (e: React.MouseEvent) => {
        e.stopPropagation();
        toast(
          v[5] === "expected"
            ? "QR pass re-sent by SMS to " + v[0]
            : v[0] + " signed out — pass closed at " + s.clock,
        );
      },
    })),
    vtCounts: [
      { k: "Expected today", v: "11", c: "#1D1B20" },
      { k: "On site now", v: "4", c: "#146C2E" },
      { k: "Overstayed", v: "1", c: "#B3261E" },
      { k: "Refused at the gate", v: "2", c: "#7A5900" },
    ],

    /* ---- visit record ---- */
    vrecBack: () => go("vtoday"),
    vrecFacts: [
      ["Visitor", "Zulhilmi Aziz · supplier"],
      ["Company", "Pantas Steelworks (supplier of)"],
      ["Requested by", "Contractor C · 07:41 yesterday"],
      ["Granted by", "A. Whitmore · GC host"],
      ["Zones granted", "Laydown — A Site declined at grant"],
      ["Window", "07:00–09:00 · trimmed from 07:00–12:00"],
      ["Escort", "T. W. Ming · named, required"],
      ["Credential", "QR pass by SMS · expires with the window"],
    ].map((f) => ({ k: f[0], v: f[1] })),
    vrecEvents: [
      ["Yesterday 07:41", "Visit requested by Contractor C", "A Site and Laydown asked for"],
      ["Yesterday 09:12", "Granted by A. Whitmore", "A Site declined · window trimmed to 2 h"],
      ["Yesterday 09:13", "QR pass sent by SMS", "+60 12-••• 4471"],
      ["Today 07:04", "Signed in at Laydown vehicle gate", "Escort T. W. Ming present"],
      ["Today 09:00", "Pass expired", "Still on site — host and security notified"],
      ["Today 09:15", "Marked as overstayed", "Re-entry blocked until a fresh grant"],
    ].map((e) => ({ t: e[0], e: e[1], m: e[2] })),
    vrecClose: () => toast("Visit closed manually — reason recorded against your account"),

    /* ---- repeat & blocked visitors ---- */
    vbRows: vb.map((v) => ({
      n: v[0],
      kind: v[1],
      co: v[2],
      visits: String(v[3]),
      last: v[4],
      st: v[5],
      c: v[6],
      act: v[5].indexOf("Blocked") === 0 ? "Lift block" : "Grant a visit",
      doAct: (e: React.MouseEvent) => {
        e.stopPropagation();
        toast(
          v[5].indexOf("Blocked") === 0
            ? v[0] + " — block lifted, reason recorded"
            : "Visit form opened for " + v[0] + " — previous details pre-filled",
        );
      },
    })),

    /* ---- visitor policy ---- */
    vpToggles: [
      { k: "escort", l: "Every visit needs a named GC escort", s: "A visit cannot be created without one — the escort carries the duty" },
      { k: "sms", l: "Credential is a QR pass sent by SMS", s: "No card to issue, no reader to enrol, nothing to hand back" },
      { k: "photo", l: "Capture a photograph at first sign-in", s: "Held for the duration of the visit, then deleted" },
      { k: "autoExpire", l: "Pass dies at the end of its window", s: "The visitor can still walk out, but cannot come back in" },
      { k: "reentry", l: "An overstay blocks re-entry", s: "A fresh grant is required, from a host, with a reason" },
      { k: "hostGrant", l: "Only a GC user may grant a visit", s: "A trade contractor may ask; granting is where zones get cut back" },
    ].map((t) => ({
      l: t.l,
      s: t.s,
      on: pol[t.k] ? "On" : "Off",
      bg: pol[t.k] ? "#6750A4" : "#79747E",
      dot: pol[t.k] ? "calc(100% - 15px)" : "2px",
      go: () => {
        const p = Object.assign({}, pol);
        p[t.k] = !p[t.k];
        set({ pol: p });
      },
    })),
    vpLimits: [
      { k: "Maximum window length", v: "8 hours", sub: "A longer visit needs an administrator" },
      { k: "Notice required", v: "2 hours", sub: "Below this the request needs a phone call as well" },
      { k: "Visitors per host at once", v: "6", sub: "One escort cannot hold more than six" },
      { k: "Overstay grace", v: "15 minutes", sub: "Then the host and security are notified" },
    ],
    vpSave: () =>
      actions.run(
        () => gcApi.saveVisitorPolicy(pol, {}),
        "Visitor policy saved — it governs requests, grants and the guard tablet",
      ),

    /* ---- access log ---- */
    lgTabs: ltabs.map((t) => ({
      label: t[1],
      go: () => set({ logFilter: t[0] }),
      fg: s.logFilter === t[0] ? "#1D1B20" : "#49454F",
      bd: s.logFilter === t[0] ? "#6750A4" : "transparent",
    })),
    lgQ: s.logQ,
    lgSetQ: (e: React.ChangeEvent<HTMLInputElement>) => set({ logQ: e.target.value }),
    lgRows: LOG.filter((l) => {
      if (lq && !(l[1] + l[2] + l[3] + l[6]).toLowerCase().includes(lq)) return false;
      if (s.logFilter === "deny") return l[5] === "deny";
      if (s.logFilter === "visitor") return l[2].indexOf("Visitor") === 0;
      if (s.logFilter === "out") return l[4] === "out";
      return true;
    }).map((l) => ({
      t: l[0],
      n: l[1],
      co: l[2],
      dev: l[3],
      dir: l[4] === "in" ? "Entry" : "Exit",
      note: l[6],
      res: l[5] === "pass" ? "Admitted" : "Refused",
      c: l[5] === "pass" ? "#146C2E" : "#B3261E",
      bg: l[5] === "pass" ? "transparent" : "#FCEEEE",
    })),
    lgExport: () => toast("CSV of the filtered stream queued — emailed when ready"),
    lgCounts: [
      { k: "Events today", v: "3,412", c: "#1D1B20" },
      { k: "Refusals", v: "38", c: "#B3261E" },
      { k: "Second-factor retries", v: "112", c: "#7A5900" },
      { k: "Visitor events", v: "26", c: "#49454F" },
    ],

    /* ---- reports ---- */
    rpSchedules: [
      ["Daily attendance", "Every day 06:30", "CSV + PDF", "Project director, 4 package managers", "Sent today 06:30"],
      ["Weekly hours and consecutive days", "Mondays 07:00", "CSV", "HSE manager, 6 contractors", "Sent Mon 07:00"],
      ["Monthly access audit", "1st of the month 08:00", "PDF", "Client, GC administrator", "Sent 01 Aug 08:00"],
      ["Expiring documents", "Every day 06:00", "CSV", "Each contractor — own workers only", "Sent today 06:00"],
      ["Refused entries", "Fridays 17:00", "PDF", "Security manager", "Sent Fri 17:00"],
    ].map((r) => ({
      n: r[0],
      when: r[1],
      fmt: r[2],
      to: r[3],
      last: r[4],
      go: () => go("reportout"),
      run: (e: React.MouseEvent) => {
        e.stopPropagation();
        toast(r[0] + " — run now, delivered to " + r[3].split(",")[0]);
      },
    })),
    rpNew: () => toast("New schedule — pick the report, the day, the format and who receives it"),

    /* ---- report output ---- */
    roBack: () => go("reports"),
    roRows: ro.map((r) => ({
      co: r[0],
      reg: String(r[1]),
      on: String(r[2]),
      att: r[3],
      exp: r[4],
      blk: r[5],
      first: r[6],
      last: r[7],
      expC: r[4] === "0" ? "#79747E" : "#7A5900",
      blkC: r[5] === "0" ? "#79747E" : "#B3261E",
    })),
    roDownload: () => toast("Downloaded as CSV — the PDF version carries the same figures"),

    /* ---- system audit ---- */
    auRows: AUDIT.map((a) => ({
      t: a[0],
      who: a[1],
      role: a[2],
      what: a[3],
      obj: a[4],
      from: a[5],
      to: a[6],
      whoC: a[1] === "System" ? "#79747E" : "#1D1B20",
    })),
    auExport: () => toast("Audit extract queued — immutable, signed, retained seven years"),

    /* ---- users & rights ---- */
    usRows: USERS.map((u) => ({
      n: u[0],
      role: u[1],
      co: u[2],
      seen: u[3],
      roleC: u[1] === "GC administrator" ? "#7A5900" : u[1] === "Trade contractor" ? "#49454F" : "#1D1B20",
      go: () => toast(u[0] + " — rights are set by role; exceptions are recorded individually"),
    })),
    usRoles: ROLES,
    usGrid: CAPS.map((cap) => ({
      cap,
      cells: ROLES.map((role) => {
        const k = cap + "|" + role;
        const on = perm[k] === undefined ? defPerm(cap, role) : perm[k];
        return {
          mark: on ? "●" : "·",
          c: on ? "#6750A4" : "#CAC4D0",
          bg: on ? "#E8DEF8" : "transparent",
          go: () => {
            const p = Object.assign({}, perm);
            p[k] = !on;
            set({ perm: p });
          },
        };
      }),
    })),
    usSave: () =>
      actions.run(
        () => gcApi.savePermissions(perm),
        "Permissions saved — affected users see the change at their next sign-in",
      ),
    usInvite: () => toast("Invitation sent — the account is inert until they set a password"),

    /* ---- contractor accounts ---- */
    tcRows: TCACC.map((t) => ({
      co: t[0],
      who: t[1],
      email: t[2],
      st: t[3],
      seen: t[4],
      users: String(t[5]),
      c:
        t[3].indexOf("Active") === 0
          ? "#146C2E"
          : t[3].indexOf("Locked") === 0
            ? "#B3261E"
            : t[3].indexOf("Invited") === 0
              ? "#7A5900"
              : "#79747E",
      act:
        t[3].indexOf("Locked") === 0
          ? "Unlock"
          : t[3].indexOf("Invited") === 0
            ? "Resend"
            : t[3].indexOf("Suspended") === 0
              ? "Reinstate"
              : "Suspend",
      doAct: (e: React.MouseEvent) => {
        e.stopPropagation();
        toast(
          t[0] +
            " — account " +
            (t[3].indexOf("Locked") === 0
              ? "unlocked, password reset sent"
              : t[3].indexOf("Invited") === 0
                ? "invitation re-sent"
                : t[3].indexOf("Suspended") === 0
                  ? "reinstated"
                  : "suspended — its workers stay on the register"),
        );
      },
    })),
    tcNew: () => toast("Login issued — the contractor can add workers but cannot validate them"),

    /* ---- reference data ---- */
    rdRows: REFDATA.map((r) => ({
      k: r[0],
      v: r[1],
      n: String(r[2]),
      go: () =>
        toast(
          r[0] +
            " — editing a list changes what the worker form offers from now on, not retrospectively",
        ),
    })),

    /* ---- notifications ---- */
    nfChannels: ["Email", "SMS", "In-app"],
    nfRows: NOTIF.map((n) => ({
      ev: n[0],
      when: n[1],
      who: n[2],
      cells: ["Email", "SMS", "In-app"].map((c) => {
        const k = n[0] + "|" + c;
        const on =
          ch[k] === undefined
            ? c === "Email" ||
              (c === "In-app" && n[0].indexOf("Visitor") !== 0) ||
              (c === "SMS" && (n[0].indexOf("Worker blocked") === 0 || n[0].indexOf("Visitor") === 0))
            : ch[k];
        return {
          mark: on ? "●" : "·",
          c: on ? "#6750A4" : "#CAC4D0",
          bg: on ? "#E8DEF8" : "transparent",
          go: () => {
            const p = Object.assign({}, ch);
            p[k] = !on;
            set({ chan: p });
          },
        };
      }),
    })),
    nfSave: () => actions.run(() => gcApi.saveNotifications(ch), "Notification matrix saved"),

    /* ---- dashboard tile editor ---- */
    tlRows: order.map((t, i) => ({
      n: t,
      on: hidden[t] ? "Hidden" : "Shown",
      c: hidden[t] ? "#79747E" : "#146C2E",
      up: () => {
        if (i === 0) return;
        const o = order.slice();
        const x = o[i - 1];
        o[i - 1] = o[i];
        o[i] = x;
        set({ tileOrder: o });
      },
      down: () => {
        if (i === order.length - 1) return;
        const o = order.slice();
        const x = o[i + 1];
        o[i + 1] = o[i];
        o[i] = x;
        set({ tileOrder: o });
      },
      toggle: () => {
        const h = Object.assign({}, hidden);
        h[t] = !h[t];
        set({ tileHidden: h });
      },
    })),
    tlSave: () => {
      actions.run(
        () => gcApi.saveTiles(order, Object.keys(hidden).filter((k) => hidden[k])),
        "Layout saved — the reception board follows the same order",
      );
      go("dashboard");
    },
    tlBack: () => go("dashboard"),
  };
}
