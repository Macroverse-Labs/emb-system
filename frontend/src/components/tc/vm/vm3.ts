import { tcApi } from "@/lib/tc/api";
import type { TcLeaverRow } from "@/lib/tc/types";
import { withId, type TcCtx } from "./ctx";

/**
 * Stands in for the selected leaver when nobody is off-boarding — a brand-new
 * contractor has an empty list. The panel shows its empty state instead, so this is
 * never rendered; it exists so the view-model builds. Neither trailing id is set, so
 * a mutation fired against it degrades through `withId`.
 */
const NO_LEAVER: TcLeaverRow = ["", "", "", "", "", "", 0, ""];

/** Port of `toggle(list, v)` (design line 943). */
function toggle(list: number[], v: number): number[] {
  const a = list.slice();
  const i = a.indexOf(v);
  if (i >= 0) a.splice(i, 1);
  else a.push(v);
  return a;
}

/**
 * Port of the last three `renderVals()` slices of `TC Console HiFi M3.dc.html`
 * (design lines 1214–1287): Inactive workers and the 31-day clock, Leavers and the
 * off-boarding checklist, and Visitor requests.
 *
 * Where the design stands a `this.toast(...)` in for a real action — marking a
 * leaver, confirming an off-boarding, sending a visitor request — the call goes
 * through `actions.run`, with the design's own sentence kept as the offline message
 * so the fixtures build still reads exactly as the canvas does. Everything else here
 * is selection, tabs and checkbox state, which never leaves the browser.
 */
export function vm3(ctx: TcCtx) {
  const { s, set, go, toast } = ctx;
  const IA = ctx.data.inactive;
  const LV = ctx.data.leavers;
  const VR = ctx.data.visitorRequests;
  const W = ctx.data.workers;

  /* ---- leavers ---- */
  const lv = LV[s.lvId] || LV[0] || NO_LEAVER;
  /**
   * Who can still be off-boarded: everyone on the register who has not left and is
   * not already a leaver row. `POST /tc/leavers` answers 409 for anyone else, so the
   * picker never offers them.
   */
  const offboarding = new Set(LV.map((r) => r[9]).filter(Boolean));
  const candidates = W.map((r, i) => ({ i, n: r[0], role: r[2], emp: r[3], acc: r[4], wid: r[7] })).filter(
    (c) => c.acc !== "left" && !offboarding.has(c.wid),
  );
  /** The worker the panel is off-boarding, or null when it is showing a leaver row. */
  const picked = s.lvWorkerId === null ? null : (candidates.find((c) => c.i === s.lvWorkerId) ?? null);
  const lvDay = s.lvDay ?? (lv[1] ? lv[1] + " 2026" : "");
  // A worker who is not off-boarding yet has no final hours to quote.
  const checkLabels = [picked || !lv[4] ? "Final hours confirmed" : "Final hours confirmed — " + lv[4], "RFID card returned", "PPE returned", "Accommodation vacated"];
  const transferring = s.lvReason === "Transferred";

  /* ---- visitors ---- */
  const zoneNames = ["A Site", "Laydown", "Welfare"];

  return {
    /* ---- inactive ---- */
    iaStats: (
      [
        ["NOT BADGED 25–30 DAYS", "9", "warning sent", "#1D1B20", "#CAC4D0"],
        ["BLOCKS TONIGHT", "3", "31 days reached at 23:59", "#B3261E", "#B3261E"],
        ["ALREADY BLOCKED", "2", "only the GC can reinstate", "#49454F", "#CAC4D0"],
      ] as [string, string, string, string, string][]
    ).map((x) => ({ k: x[0], v: x[1], sub: x[2], c: x[3], bd: x[4] })),
    iaEmpty: IA.length === 0,
    iaEmptyCopy: "No cards are running down the 31-day clock — a worker appears here once theirs goes unused.",
    iaRows: IA.map((r, i) => {
      const on = s.iaSel.indexOf(i) >= 0;
      const warn = r[5];
      return {
        n: r[0],
        last: r[1],
        days: r[2],
        blocks: r[3],
        st: r[4],
        dc: warn === 1 ? "#B3261E" : warn === 2 ? "#79747E" : "#49454F",
        stFg: warn === 2 ? "#410E0B" : "#49454F",
        stBg: warn === 2 ? "#F9DEDC" : "#ECE6F0",
        bg: on ? "#E8DEF8" : "transparent",
        box: on ? "#6750A4" : "transparent",
        bd: on ? "#6750A4" : "#79747E",
        tick: on ? "✓" : "",
        pick: () => set({ iaSel: toggle(s.iaSel, i) }),
      };
    }),
    iaSelLabel: s.iaSel.length + " selected",
    iaChoices: (
      [
        ["Still employed — keep active", "RESETS THE CLOCK, LOGGED AGAINST YOU"],
        ["On leave until a date", "PAUSES THE CLOCK, NEEDS GC APPROVAL"],
        ["Has left the project", "GOES TO OFF-BOARDING"],
      ] as [string, string][]
    ).map((c, i) => {
      const on = s.iaChoice === i;
      return {
        t: c[0],
        s: c[1],
        go: () => set({ iaChoice: i }),
        bd: on ? "#6750A4" : "#CAC4D0",
        bg: on ? "#E8DEF8" : "transparent",
        ring: on ? "#6750A4" : "#79747E",
        dot: on ? "#6750A4" : "transparent",
      };
    }),
    iaApplyLabel: "Apply to " + s.iaSel.length + " workers",
    iaApply: () => {
      if (s.iaChoice === 2) {
        toast("Off-boarding started for " + s.iaSel.length + " workers");
        go("leavers");
        return;
      }
      toast(
        s.iaChoice === 0
          ? s.iaSel.length + " workers confirmed still employed — the 31-day clock is reset and logged against you"
          : "Leave request sent for " + s.iaSel.length + " workers — the clock pauses once the GC approves",
      );
    },

    /* ---- leavers ---- */
    lvTabs: (
      [
        ["todo", "To off-board · 4"],
        ["done", "Completed"],
      ] as [string, string][]
    ).map((x) => ({
      label: x[1],
      go: () => set({ lvTab: x[0] }),
      fg: s.lvTab === x[0] ? "#1D1B20" : "#49454F",
      bd: s.lvTab === x[0] ? "#6750A4" : "transparent",
    })),
    lvEmpty: LV.length === 0,
    lvEmptyCopy: "Nobody is off-boarding — pick a worker on the right and set their last day.",
    lvRows: LV.map((r, i) => {
      const on = s.lvId === i && s.lvWorkerId === null;
      const urgent = r[6];
      return {
        n: r[0],
        day: r[1],
        reason: r[2],
        card: r[3],
        hours: r[4],
        st: r[5],
        cardC: urgent === 2 ? "#B3261E" : "#49454F",
        stFg: urgent ? "#410E0B" : "#49454F",
        stBg: urgent ? "#F9DEDC" : "#ECE6F0",
        bg: on ? "#E8DEF8" : "transparent",
        // Selecting a row leaves the picker: the row's own last day comes back.
        go: () => set({ lvId: i, lvWorkerId: null, lvDay: null }),
      };
    }),
    /**
     * The register, as pickable chips — the same chip the reason list uses.
     *
     * ponytail: one chip per worker. A search field once a register outgrows the
     * panel; the design has no list control here to reuse.
     */
    lvPick: candidates.map((c) => {
      const on = s.lvWorkerId === c.i;
      return {
        t: c.n,
        // A worker being off-boarded has no last day yet — the contractor types it.
        go: () => set({ lvWorkerId: c.i, lvDay: "" }),
        fg: on ? "#1D192B" : "#49454F",
        bd: on ? "#E8DEF8" : "#79747E",
        bg: on ? "#E8DEF8" : "transparent",
      };
    }),
    lvPickEmpty: candidates.length === 0,
    lvPickEmptyCopy: W.length
      ? "Everyone on your register is already off-boarding or gone."
      : "Nobody to off-board — add a worker to your register first.",
    lvName: picked ? picked.n : lv[0] || "Nobody selected",
    lvMeta: picked
      ? picked.role + " · " + picked.emp
      : lv[7] || "Pick who is leaving, set their last day, and the GC is notified.",
    lvDay,
    lvSetDay: (e: React.ChangeEvent<HTMLInputElement>) => set({ lvDay: e.target.value }),
    lvReasons: ["Contract ended", "Resigned", "Dismissed", "Transferred"].map((r) => {
      const on = s.lvReason === r;
      return {
        t: r,
        go: () => set({ lvReason: r }),
        fg: on ? "#1D192B" : "#49454F",
        bd: on ? "#E8DEF8" : "#79747E",
        bg: on ? "#E8DEF8" : "transparent",
      };
    }),
    lvChecks: checkLabels.map((t, i) => {
      const on = !!s.lvChecks[i];
      return {
        t,
        go: () => {
          const a = s.lvChecks.slice();
          a[i] = on ? 0 : 1;
          set({ lvChecks: a });
        },
        tick: on ? "✓" : "",
        box: on ? "#6750A4" : "transparent",
        bd: on ? "#6750A4" : "#79747E",
        fg: on ? "#1D1B20" : "#B3261E",
      };
    }),
    lvWarnHead: transferring ? "IF TRANSFERRING" : "CARD NOT RETURNED",
    lvWarn: transferring
      ? "Documents and training follow the worker — the receiving contractor requests the profile and the GC approves it once."
      : "The card is voided at 23:59 either way — but an unreturned card is reported to the GC and to security.",
    // `worker_id`, not the name: `MarkPayload` forbids extras and looks the worker up
    // by id. It must be a worker who is not off-boarding yet — an existing leaver row
    // answers 409 — so this reads the picker, never the selected row.
    lvMark: () => {
      if (!picked) {
        toast("Pick the worker who is leaving — the list on the right is who can still be off-boarded");
        return;
      }
      if (!lvDay.trim()) {
        toast("Set a last day on site — the GC is notified the moment you save it");
        return;
      }
      withId(
        ctx,
        picked.wid,
        (id) => tcApi.recordLeaver({ worker_id: id, last_day: lvDay.trim(), reason: s.lvReason }),
        picked.n + " marked as leaving on " + lvDay.trim() + " — the GC is notified",
      );
    },
    // The leaver's own id addresses the confirm, and the checklist goes as the four
    // named booleans `ConfirmPayload` declares — a dict of labels is a 422.
    lvConfirm: () =>
      withId(
        ctx,
        lv[8],
        (id) =>
          tcApi.confirmLeaver(id, {
            final_hours_confirmed: !!s.lvChecks[0],
            card_returned: !!s.lvChecks[1],
            ppe_returned: !!s.lvChecks[2],
            accommodation_vacated: !!s.lvChecks[3],
          }),
        "Off-boarding confirmed for " + lv[0] + " — card voided at 23:59, record kept for audit",
      ),

    /* ---- visitors ---- */
    vrTabs: (
      [
        ["mine", "Mine · 6"],
        ["history", "History"],
      ] as [string, string][]
    ).map((x) => ({
      label: x[1],
      go: () => set({ vrTab: x[0] }),
      fg: s.vrTab === x[0] ? "#1D1B20" : "#49454F",
      bd: s.vrTab === x[0] ? "#6750A4" : "transparent",
    })),
    vrEmpty: VR.length === 0,
    vrEmptyCopy: "You have not asked for a visitor yet — fill the form and a GC host decides.",
    vrRows: VR.map((r) => ({
      n: r[0],
      co: r[1].toUpperCase(),
      purpose: r[2],
      when: r[3],
      host: r[4],
      out: r[5],
      outC: r[6],
      note: r[7],
      bg: r[8] ? "#FEF7FF" : "transparent",
    })),
    vrZones: zoneNames.map((z, i) => {
      const on = s.vrZones.indexOf(i) >= 0;
      return {
        t: z,
        go: () => set({ vrZones: toggle(s.vrZones, i) }),
        fg: on ? "#1D192B" : "#49454F",
        bd: on ? "#E8DEF8" : "#79747E",
        bg: on ? "#E8DEF8" : "transparent",
      };
    }),
    vrName: s.vrName,
    vrCompany: s.vrCompany,
    vrPurpose: s.vrPurpose,
    vrDay: s.vrDay,
    vrWindow: s.vrWindow,
    vrHost: s.vrHost,
    vrSetName: (e: React.ChangeEvent<HTMLInputElement>) => set({ vrName: e.target.value }),
    vrSetCompany: (e: React.ChangeEvent<HTMLInputElement>) => set({ vrCompany: e.target.value }),
    vrSetPurpose: (e: React.ChangeEvent<HTMLTextAreaElement>) => set({ vrPurpose: e.target.value }),
    vrSetDay: (e: React.ChangeEvent<HTMLInputElement>) => set({ vrDay: e.target.value }),
    vrSetWindow: (e: React.ChangeEvent<HTMLInputElement>) => set({ vrWindow: e.target.value }),
    vrSetHost: (e: React.ChangeEvent<HTMLInputElement>) => set({ vrHost: e.target.value }),
    // `RequestPayload` forbids extras: no `day` and no mobile, and `zones` is the one
    // line the host reads, not a list. The design's two date/time inputs are joined
    // into the single `window` the model holds.
    vrSend: () => {
      const name = s.vrName.trim();
      if (!name) {
        // `visitor_name` has min_length 1 — say so here rather than take the 400 back.
        toast("Name the visitor — the GC host cannot issue a pass to nobody");
        return;
      }
      ctx.actions.run(
        () =>
          tcApi.requestVisit({
            visitor_name: name,
            visitor_company: s.vrCompany.trim(),
            purpose: s.vrPurpose.trim(),
            zones: s.vrZones.map((i) => zoneNames[i]).join(", "),
            window: [s.vrDay.trim(), s.vrWindow.trim()].filter(Boolean).join(" · "),
            host_name: s.vrHost.trim(),
          }),
        "Request sent to " + (s.vrHost.trim() || "the GC") + " — they may cut the zones or the hours before approving",
      );
    },
  };
}
